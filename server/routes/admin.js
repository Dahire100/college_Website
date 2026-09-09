const express = require('express');
const router = express.Router();
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { verifyTenantAccess } = require('../middleware/tenant');

// Protect all admin endpoints with requireAdmin and verifyTenantAccess middleware
router.use(requireAdmin);
router.use(verifyTenantAccess);

// Force tenantId on all request bodies to guarantee strict multi-tenant isolation
router.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && req.tenantId) {
    req.body.tenantId = req.tenantId;
  }
  next();
});

// Multer Storage Configuration (Partitioned by Tenant ID)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tenantId = req.tenantId || 'default';
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', tenantId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only safe images, PDFs, and documents are permitted.'), false);
    }
  }
});

// Helper for audit logging
async function logAction(req, action, entityType, entityId, details) {
  try {
    await db.AuditLog.create({
      tenantId: req.tenantId,
      username: req.admin ? req.admin.username : 'admin',
      action,
      entityType,
      entityId: String(entityId || ''),
      details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      ipAddress: req.ip || '127.0.0.1'
    });
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
}

// ----------------------------------------------------
// 1. DASHBOARD OVERVIEW & ANALYTICS
// ----------------------------------------------------
router.get('/analytics', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const totalDepartments = await db.Department.countDocuments({ tenantId });
    const totalCourses = await db.Course.countDocuments({ tenantId });
    const totalFaculty = await db.Faculty.countDocuments({ tenantId });
    const totalNotices = await db.Notice.countDocuments({ tenantId });
    const publishedNotices = await db.Notice.countDocuments({ tenantId, status: 'published' });
    const draftNotices = await db.Notice.countDocuments({ tenantId, status: 'draft' });
    const totalEvents = await db.Event.countDocuments({ tenantId });
    const totalNews = await db.News.countDocuments({ tenantId });
    const totalInquiries = await db.Inquiry.countDocuments({ tenantId });
    const newInquiries = await db.Inquiry.countDocuments({ tenantId, status: 'new' });
    const totalRecruiters = await db.Recruiter.countDocuments({ tenantId });

    // Recent Inquiries (Scoped to Tenant)
    let recentInquiries = await db.Inquiry.find({ tenantId });
    recentInquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    recentInquiries = recentInquiries.slice(0, 5);

    // Recent Audit Logs (Scoped to Tenant)
    let recentLogs = await db.AuditLog.find({ tenantId });
    recentLogs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    recentLogs = recentLogs.slice(0, 6);

    return res.json({
      success: true,
      data: {
        stats: {
          totalDepartments,
          totalCourses,
          totalFaculty,
          totalNotices,
          publishedNotices,
          draftNotices,
          totalEvents,
          totalNews,
          totalInquiries,
          newInquiries,
          totalRecruiters
        },
        recentInquiries,
        recentLogs
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate analytics' });
  }
});

// ----------------------------------------------------
// 2. SITE SETTINGS
// ----------------------------------------------------
router.get('/settings', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const settings = await db.SiteSetting.find({ tenantId });
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { settings } = req.body; // array or key-value object
    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (!item || !item.key) continue;
        const valStr = String(item.value ?? '');
        const existing = await db.SiteSetting.findOne({ tenantId, key: item.key });
        if (existing) {
          await db.SiteSetting.findByIdAndUpdate(existing._id || existing.id, { value: valStr, updatedAt: new Date() });
        } else {
          await db.SiteSetting.create({ tenantId, key: item.key, value: valStr, group: 'general' });
        }
      }
    } else if (typeof settings === 'object' && settings !== null) {
      for (const [key, value] of Object.entries(settings)) {
        if (!key) continue;
        const valStr = String(value ?? '');
        const existing = await db.SiteSetting.findOne({ tenantId, key });
        if (existing) {
          await db.SiteSetting.findByIdAndUpdate(existing._id || existing.id, { value: valStr, updatedAt: new Date() });
        } else {
          await db.SiteSetting.create({ tenantId, key, value: valStr, group: 'general' });
        }
      }
    }
    await logAction(req, 'UPDATE_SETTINGS', 'site_settings', 'all', 'Updated general site settings');
    return res.json({ success: true, message: 'Settings successfully updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// ----------------------------------------------------
// 3. HOMEPAGE SECTIONS MANAGER
// ----------------------------------------------------
router.get('/homepage-sections', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const sections = await db.HomepageSection.find({ tenantId });
    sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: sections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load sections' });
  }
});

router.put('/homepage-sections/:id', async (req, res) => {
  try {
    const updated = await db.HomepageSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_HOMEPAGE_SECTION', 'homepage_sections', req.params.id, req.body);
    return res.json({ success: true, message: 'Section updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update section' });
  }
});

router.post('/homepage-sections', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sectionKey, title, subtitle, badge, isVisible, ctaText, ctaLink, imageUrl, layoutType, content } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Section title is required' });
    }
    const finalKey = sectionKey || `custom_${Date.now()}`;
    const count = await db.HomepageSection.countDocuments({ tenantId });
    const newSection = await db.HomepageSection.create({
      tenantId,
      sectionKey: finalKey,
      title,
      subtitle: subtitle || '',
      badge: badge || '',
      isVisible: isVisible !== false,
      sortOrder: count + 1,
      ctaText: ctaText || '',
      ctaLink: ctaLink || '',
      imageUrl: imageUrl || '',
      layoutType: layoutType || 'image_banner',
      content: content || ''
    });
    await logAction(req, 'CREATE_HOMEPAGE_SECTION', 'homepage_sections', newSection._id || newSection.id, newSection.title);
    return res.status(201).json({ success: true, message: 'Section added successfully', data: newSection });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create section' });
  }
});

router.patch('/homepage-sections/:id/toggle', async (req, res) => {
  try {
    const section = await db.HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    const newStatus = !section.isVisible;
    const updated = await db.HomepageSection.findByIdAndUpdate(req.params.id, { isVisible: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_HOMEPAGE_SECTION', 'homepage_sections', req.params.id, `Visible: ${newStatus}`);
    return res.json({ success: true, message: `Section is now ${newStatus ? 'Visible' : 'Hidden'} on homepage`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle section visibility' });
  }
});

router.delete('/homepage-sections/:id', async (req, res) => {
  try {
    await db.HomepageSection.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_HOMEPAGE_SECTION', 'homepage_sections', req.params.id, 'Deleted section');
    return res.json({ success: true, message: 'Section removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
});

router.post('/homepage-sections/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array of IDs in new order
    if (Array.isArray(orderedIds)) {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.HomepageSection.findByIdAndUpdate(orderedIds[i], { sortOrder: i + 1 });
      }
    }
    await logAction(req, 'REORDER_HOMEPAGE_SECTIONS', 'homepage_sections', 'bulk', 'Updated section order');
    return res.json({ success: true, message: 'Sections reordered successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reorder sections' });
  }
});

// ----------------------------------------------------
// 4. HERO BANNERS CRUD
// ----------------------------------------------------
router.get('/banners', async (req, res) => {
  try {
    const banners = await db.Banner.find({});
    banners.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: banners });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load banners' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const banner = await db.Banner.create(req.body);
    await logAction(req, 'CREATE_BANNER', 'banners', banner._id || banner.id, banner.title);
    return res.status(201).json({ success: true, message: 'Banner created', data: banner });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create banner' });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const updated = await db.Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_BANNER', 'banners', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Banner updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update banner' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await db.Banner.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_BANNER', 'banners', req.params.id, 'Deleted banner');
    return res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
});

// ----------------------------------------------------
// 5. NOTICES & CIRCULARS CRUD
// ----------------------------------------------------
router.get('/notices', async (req, res) => {
  try {
    const notices = await db.Notice.find({});
    notices.sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));
    return res.json({ success: true, data: notices });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load notices' });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const notice = await db.Notice.create(req.body);
    await logAction(req, 'CREATE_NOTICE', 'notices', notice._id || notice.id, notice.title);
    return res.status(201).json({ success: true, message: 'Notice published', data: notice });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create notice' });
  }
});

router.put('/notices/:id', async (req, res) => {
  try {
    const updated = await db.Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_NOTICE', 'notices', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Notice updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notice' });
  }
});

router.delete('/notices/:id', async (req, res) => {
  try {
    await db.Notice.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_NOTICE', 'notices', req.params.id, 'Deleted notice');
    return res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete notice' });
  }
});

// ----------------------------------------------------
// 6. EVENTS CRUD
// ----------------------------------------------------
router.get('/events', async (req, res) => {
  try {
    const events = await db.Event.find({});
    events.sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));
    return res.json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const event = await db.Event.create(req.body);
    await logAction(req, 'CREATE_EVENT', 'events', event._id || event.id, event.title);
    return res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const updated = await db.Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_EVENT', 'events', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Event updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await db.Event.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_EVENT', 'events', req.params.id, 'Deleted event');
    return res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// ----------------------------------------------------
// 7. NEWS & ARTICLES CRUD
// ----------------------------------------------------
router.get('/news', async (req, res) => {
  try {
    const news = await db.News.find({});
    news.sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));
    return res.json({ success: true, data: news });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load news' });
  }
});

router.post('/news', async (req, res) => {
  try {
    const news = await db.News.create(req.body);
    await logAction(req, 'CREATE_NEWS', 'news', news._id || news.id, news.title);
    return res.status(201).json({ success: true, message: 'Article created', data: news });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create news' });
  }
});

router.put('/news/:id', async (req, res) => {
  try {
    const updated = await db.News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_NEWS', 'news', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Article updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update news' });
  }
});

router.delete('/news/:id', async (req, res) => {
  try {
    await db.News.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_NEWS', 'news', req.params.id, 'Deleted article');
    return res.json({ success: true, message: 'News deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete news' });
  }
});

// ----------------------------------------------------
// 8. DEPARTMENTS & COURSES CRUD
// ----------------------------------------------------
router.get('/departments', async (req, res) => {
  try {
    const departments = await db.Department.find({});
    departments.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load departments' });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const department = await db.Department.create(req.body);
    await logAction(req, 'CREATE_DEPARTMENT', 'departments', department._id || department.id, department.name);
    return res.status(201).json({ success: true, message: 'Department created', data: department });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create department' });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const updated = await db.Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_DEPARTMENT', 'departments', req.params.id, req.body.name);
    return res.json({ success: true, message: 'Department updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update department' });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await db.Department.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_DEPARTMENT', 'departments', req.params.id, 'Deleted department');
    return res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete department' });
  }
});

// Courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await db.Course.find({});
    return res.json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = await db.Course.create(req.body);
    await logAction(req, 'CREATE_COURSE', 'courses', course._id || course.id, course.title);
    return res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const updated = await db.Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_COURSE', 'courses', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Course updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await db.Course.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_COURSE', 'courses', req.params.id, 'Deleted course');
    return res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

// ----------------------------------------------------
// 9. FACULTY DIRECTORY CRUD
// ----------------------------------------------------
router.get('/faculty', async (req, res) => {
  try {
    const faculty = await db.Faculty.find({});
    faculty.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load faculty' });
  }
});

router.post('/faculty', async (req, res) => {
  try {
    const member = await db.Faculty.create(req.body);
    await logAction(req, 'CREATE_FACULTY', 'faculty', member._id || member.id, member.name);
    return res.status(201).json({ success: true, message: 'Faculty profile created', data: member });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create faculty' });
  }
});

router.put('/faculty/:id', async (req, res) => {
  try {
    const updated = await db.Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_FACULTY', 'faculty', req.params.id, req.body.name);
    return res.json({ success: true, message: 'Faculty profile updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update faculty' });
  }
});

router.delete('/faculty/:id', async (req, res) => {
  try {
    await db.Faculty.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_FACULTY', 'faculty', req.params.id, 'Deleted faculty');
    return res.json({ success: true, message: 'Faculty deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete faculty' });
  }
});

// ----------------------------------------------------
// 10. ADMISSIONS & FEES CRUD
// ----------------------------------------------------
router.get('/admissions', async (req, res) => {
  try {
    const items = await db.Admission.find({});
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load admissions' });
  }
});

router.post('/admissions', async (req, res) => {
  try {
    const item = await db.Admission.create(req.body);
    await logAction(req, 'CREATE_ADMISSION', 'admissions', item._id || item.id, item.title);
    return res.status(201).json({ success: true, message: 'Admission item created', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create admission item' });
  }
});

router.put('/admissions/:id', async (req, res) => {
  try {
    const updated = await db.Admission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_ADMISSION', 'admissions', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Admission item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update admission item' });
  }
});

router.delete('/admissions/:id', async (req, res) => {
  try {
    await db.Admission.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_ADMISSION', 'admissions', req.params.id, 'Deleted admission item');
    return res.json({ success: true, message: 'Admission item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete admission item' });
  }
});

// ----------------------------------------------------
// 11. PLACEMENTS & RECRUITERS CRUD
// ----------------------------------------------------
router.get('/placements', async (req, res) => {
  try {
    const placements = await db.Placement.find({});
    placements.sort((a, b) => (b.academicYear || '').localeCompare(a.academicYear || ''));
    return res.json({ success: true, data: placements });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load placements' });
  }
});

router.post('/placements', async (req, res) => {
  try {
    const placement = await db.Placement.create(req.body);
    await logAction(req, 'CREATE_PLACEMENT', 'placements', placement._id || placement.id, placement.academicYear);
    return res.status(201).json({ success: true, message: 'Placement record created', data: placement });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create placement record' });
  }
});

router.put('/placements/:id', async (req, res) => {
  try {
    const updated = await db.Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_PLACEMENT', 'placements', req.params.id, req.body.academicYear);
    return res.json({ success: true, message: 'Placement record updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update placement record' });
  }
});

router.delete('/placements/:id', async (req, res) => {
  try {
    await db.Placement.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_PLACEMENT', 'placements', req.params.id, 'Deleted placement record');
    return res.json({ success: true, message: 'Placement record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete placement record' });
  }
});

// Recruiters
router.get('/recruiters', async (req, res) => {
  try {
    const recruiters = await db.Recruiter.find({});
    recruiters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: recruiters });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load recruiters' });
  }
});

router.post('/recruiters', async (req, res) => {
  try {
    const recruiter = await db.Recruiter.create(req.body);
    await logAction(req, 'CREATE_RECRUITER', 'recruiters', recruiter._id || recruiter.id, recruiter.name);
    return res.status(201).json({ success: true, message: 'Recruiter added', data: recruiter });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create recruiter' });
  }
});

router.put('/recruiters/:id', async (req, res) => {
  try {
    const updated = await db.Recruiter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_RECRUITER', 'recruiters', req.params.id, req.body.name);
    return res.json({ success: true, message: 'Recruiter updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update recruiter' });
  }
});

router.delete('/recruiters/:id', async (req, res) => {
  try {
    await db.Recruiter.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_RECRUITER', 'recruiters', req.params.id, 'Deleted recruiter');
    return res.json({ success: true, message: 'Recruiter deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete recruiter' });
  }
});

// ----------------------------------------------------
// 12. CAMPUS FACILITIES CRUD
// ----------------------------------------------------
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await db.Facility.find({});
    facilities.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: facilities });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load facilities' });
  }
});

router.post('/facilities', async (req, res) => {
  try {
    const facility = await db.Facility.create(req.body);
    await logAction(req, 'CREATE_FACILITY', 'facilities', facility._id || facility.id, facility.name);
    return res.status(201).json({ success: true, message: 'Facility created', data: facility });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create facility' });
  }
});

router.put('/facilities/:id', async (req, res) => {
  try {
    const updated = await db.Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_FACILITY', 'facilities', req.params.id, req.body.name);
    return res.json({ success: true, message: 'Facility updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update facility' });
  }
});

router.delete('/facilities/:id', async (req, res) => {
  try {
    await db.Facility.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_FACILITY', 'facilities', req.params.id, 'Deleted facility');
    return res.json({ success: true, message: 'Facility deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete facility' });
  }
});

// ----------------------------------------------------
// 13. TESTIMONIALS & LEADERSHIP CRUD
// ----------------------------------------------------
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await db.Testimonial.find({});
    return res.json({ success: true, data: testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const t = await db.Testimonial.create(req.body);
    await logAction(req, 'CREATE_TESTIMONIAL', 'testimonials', t._id || t.id, t.studentName);
    return res.status(201).json({ success: true, message: 'Testimonial created', data: t });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const updated = await db.Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Testimonial updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    await db.Testimonial.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

// ----------------------------------------------------
// 14. INQUIRIES INBOX
// ----------------------------------------------------
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await db.Inquiry.find({});
    inquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json({ success: true, data: inquiries });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load inquiries' });
  }
});

router.put('/inquiries/:id', async (req, res) => {
  try {
    const { status, notes, readAt } = req.body;
    const updateData = { status, notes };
    if (readAt !== undefined) updateData.readAt = readAt;
    const updated = await db.Inquiry.findByIdAndUpdate(req.params.id, updateData, { new: true });
    await logAction(req, 'UPDATE_INQUIRY', 'inquiries', req.params.id, `Status updated to ${status}`);
    return res.json({ success: true, message: 'Inquiry updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update inquiry' });
  }
});

router.post('/inquiries/:id/reply', async (req, res) => {
  try {
    const { replyMessage, status = 'contacted' } = req.body;
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const updated = await db.Inquiry.findByIdAndUpdate(req.params.id, {
      adminReply: replyMessage.trim(),
      repliedBy: req.admin.username,
      repliedAt: new Date(),
      readAt: new Date(),
      status,
      notes: req.body.notes || ''
    }, { new: true });

    await logAction(req, 'REPLY_INQUIRY', 'inquiries', req.params.id, `Replied by ${req.admin.username}`);
    return res.json({ success: true, message: 'Reply saved', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save reply' });
  }
});

router.delete('/inquiries/:id', async (req, res) => {
  try {
    await db.Inquiry.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_INQUIRY', 'inquiries', req.params.id, 'Deleted inquiry lead');
    return res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete inquiry' });
  }
});

// ----------------------------------------------------
// 15. AUDIT LOGS
// ----------------------------------------------------
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.AuditLog.find({});
    logs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load audit logs' });
  }
});

// ----------------------------------------------------
// 16. MEDIA & FILE UPLOADS
// ----------------------------------------------------
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const publicUrl = `/uploads/${req.tenantId}/${req.file.filename}`;

    const mediaDoc = await db.Media.create({
      tenantId: req.tenantId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      filePath: publicUrl,
      category: req.body.category || 'general'
    });

    await logAction(req, 'UPLOAD_FILE', 'media', mediaDoc._id || mediaDoc.id, req.file.originalname);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: publicUrl,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

router.get('/media', async (req, res) => {
  try {
    const media = await db.Media.find({});
    media.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json({ success: true, data: media });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load media library' });
  }
});

// ----------------------------------------------------
// 17. GALLERY & IMAGE SECTIONS CRUD
// ----------------------------------------------------
router.get('/gallery', async (req, res) => {
  try {
    const items = await db.Gallery.find({});
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load gallery items' });
  }
});

router.post('/gallery', async (req, res) => {
  try {
    const { title, category, imageUrl, caption, sortOrder, isActive, featuredOnHome } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Image title and Image URL are required' });
    }
    const count = await db.Gallery.countDocuments();
    const item = await db.Gallery.create({
      title,
      category: category || 'Campus',
      imageUrl,
      caption: caption || '',
      sortOrder: sortOrder || count + 1,
      isActive: isActive !== false,
      featuredOnHome: featuredOnHome !== false
    });
    await logAction(req, 'CREATE_GALLERY_IMAGE', 'gallery', item._id || item.id, item.title);
    return res.status(201).json({ success: true, message: 'Image added to gallery', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add image to gallery' });
  }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const updated = await db.Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_GALLERY_IMAGE', 'gallery', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Image details updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update image' });
  }
});

router.patch('/gallery/:id/toggle', async (req, res) => {
  try {
    const item = await db.Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    const newStatus = !item.isActive;
    const updated = await db.Gallery.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_GALLERY_IMAGE', 'gallery', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Image is now ${newStatus ? 'Visible' : 'Hidden'} on website`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle visibility' });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    await db.Gallery.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_GALLERY_IMAGE', 'gallery', req.params.id, 'Deleted image');
    return res.json({ success: true, message: 'Image removed from gallery' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// ----------------------------------------------------
// 18. QUICK SHOW/HIDE TOGGLE FOR ANY ENTITY
// ----------------------------------------------------
router.patch('/banners/:id/toggle', async (req, res) => {
  try {
    const banner = await db.Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    const newStatus = !banner.isActive;
    const updated = await db.Banner.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_BANNER', 'banners', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Banner is now ${newStatus ? 'Active' : 'Hidden'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle banner' });
  }
});

router.patch('/notices/:id/toggle', async (req, res) => {
  try {
    const notice = await db.Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    const newStatus = notice.status === 'published' ? 'draft' : 'published';
    const updated = await db.Notice.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_NOTICE', 'notices', req.params.id, `Status: ${newStatus}`);
    return res.json({ success: true, message: `Notice is now ${newStatus === 'published' ? 'Published' : 'Hidden (Draft)'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle notice' });
  }
});

router.patch('/events/:id/toggle', async (req, res) => {
  try {
    const event = await db.Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    const updated = await db.Event.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_EVENT', 'events', req.params.id, `Status: ${newStatus}`);
    return res.json({ success: true, message: `Event is now ${newStatus === 'published' ? 'Published' : 'Hidden (Draft)'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle event' });
  }
});

router.patch('/courses/:id/toggle', async (req, res) => {
  try {
    const course = await db.Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const newStatus = !course.isActive;
    const updated = await db.Course.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_COURSE', 'courses', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Course is now ${newStatus ? 'Active' : 'Hidden'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle course' });
  }
});

router.patch('/departments/:id/toggle', async (req, res) => {
  try {
    const dept = await db.Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    const newStatus = !dept.isActive;
    const updated = await db.Department.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_DEPARTMENT', 'departments', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Department is now ${newStatus ? 'Active' : 'Hidden'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle department' });
  }
});

router.patch('/facilities/:id/toggle', async (req, res) => {
  try {
    const facility = await db.Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
    const newStatus = !facility.isActive;
    const updated = await db.Facility.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_FACILITY', 'facilities', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Facility is now ${newStatus ? 'Active' : 'Hidden'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle facility' });
  }
});

// ----------------------------------------------------
// 19. NAVIGATION MENUS (PAGE LINKS) CRUD & TOGGLE
// ----------------------------------------------------
router.get('/navigation', async (req, res) => {
  try {
    const items = await db.Navigation.find({});
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load navigation' });
  }
});

router.post('/navigation', async (req, res) => {
  try {
    const count = await db.Navigation.countDocuments();
    const item = await db.Navigation.create({
      ...req.body,
      sortOrder: req.body.sortOrder || count + 1,
      isActive: req.body.isActive !== false
    });
    await logAction(req, 'CREATE_NAVIGATION', 'navigation', item._id || item.id, item.title);
    return res.status(201).json({ success: true, message: 'Navigation item added', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create navigation item' });
  }
});

router.put('/navigation/:id', async (req, res) => {
  try {
    const updated = await db.Navigation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_NAVIGATION', 'navigation', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Navigation updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update navigation' });
  }
});

router.patch('/navigation/:id/toggle', async (req, res) => {
  try {
    const item = await db.Navigation.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Navigation item not found' });
    const newStatus = !item.isActive;
    const updated = await db.Navigation.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_NAVIGATION', 'navigation', req.params.id, `Active: ${newStatus}`);
    return res.json({ success: true, message: `Menu link is now ${newStatus ? 'Shown in Header' : 'Hidden from Header'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle navigation item' });
  }
});

router.delete('/navigation/:id', async (req, res) => {
  try {
    await db.Navigation.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_NAVIGATION', 'navigation', req.params.id, 'Deleted navigation item');
    return res.json({ success: true, message: 'Navigation item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete navigation item' });
  }
});

// ----------------------------------------------------
// 20. PAGES MANAGER (ALL PAGES & ADD PAGE)
// ----------------------------------------------------
router.get('/pages', async (req, res) => {
  try {
    const pages = await db.Page.find({});
    pages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    // Attach subsection count to each page
    const subsections = await db.Subsection.find({});
    const enriched = pages.map(p => {
      const subs = subsections.filter(s => s.pageSlug === p.slug);
      return { ...p, subsectionCount: subs.length, subsections: subs };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load pages' });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const { slug, title, navLabel, parentSlug, heroTitle, heroSubtitle, heroBadge, heroImageUrl, content, pdfUrl, pdfName, showInHeader, showInFooter, isActive } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Page title is required' });
    }
    const cleanSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
    const count = await db.Page.countDocuments();

    const newPage = await db.Page.create({
      slug: cleanSlug,
      title,
      navLabel: navLabel || title,
      parentSlug: parentSlug || '',
      heroTitle: heroTitle || title,
      heroSubtitle: heroSubtitle || '',
      heroBadge: heroBadge || (parentSlug ? 'SUBPAGE' : 'NEW PAGE'),
      heroImageUrl: heroImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      content: content || '',
      pdfUrl: pdfUrl || '',
      pdfName: pdfName || '',
      showInHeader: showInHeader !== false,
      showInFooter: showInFooter !== false,
      isActive: isActive !== false,
      isSystem: false,
      sortOrder: count + 1
    });

    // Also add to Navigation so it appears in navbar
    const existingNav = await db.Navigation.findOne({ path: `#${cleanSlug}` });
    let parentNavId = '0';
    if (parentSlug) {
      const parentNav = await db.Navigation.findOne({ path: `#${parentSlug}` });
      if (parentNav) {
        parentNavId = String(parentNav._id || parentNav.id);
      } else {
        parentNavId = parentSlug;
      }
    }

    if (!existingNav) {
      await db.Navigation.create({
        title: navLabel || title,
        path: `#${cleanSlug}`,
        parentId: parentNavId,
        sortOrder: count + 1,
        isActive: isActive !== false
      });
    }

    await logAction(req, 'CREATE_PAGE', 'pages', newPage._id || newPage.id, newPage.title);
    return res.status(201).json({ success: true, message: 'Page created successfully', data: newPage });
  } catch (err) {
    console.error('Page creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create page' });
  }
});

const updatePageHandler = async (req, res) => {
  try {
    const updated = await db.Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) {
      let parentNavId = '0';
      if (updated.parentSlug) {
        const parentNav = await db.Navigation.findOne({ path: `#${updated.parentSlug}` });
        if (parentNav) parentNavId = String(parentNav._id || parentNav.id);
        else parentNavId = updated.parentSlug;
      }

      const navFilter = { path: { $in: [`#${updated.slug}`, `/${updated.slug}`] } };
      const navItem = await db.Navigation.findOne(navFilter);
      if (navItem) {
        await db.Navigation.updateOne(
          navFilter,
          { 
            title: updated.navLabel || updated.title, 
            isActive: updated.isActive,
            parentId: parentNavId
          }
        );
      } else {
        await db.Navigation.create({
          title: updated.navLabel || updated.title,
          path: `#${updated.slug}`,
          parentId: parentNavId,
          sortOrder: 99,
          isActive: updated.isActive !== false
        });
      }
    }
    await logAction(req, 'UPDATE_PAGE', 'pages', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Page updated successfully', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update page' });
  }
};

router.put('/pages/:id', updatePageHandler);
router.patch('/pages/:id', updatePageHandler);

router.patch('/pages/:id/toggle', async (req, res) => {
  try {
    const page = await db.Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const newStatus = !page.isActive;
    const updated = await db.Page.findByIdAndUpdate(req.params.id, { isActive: newStatus }, { new: true });
    await db.Navigation.updateOne({ path: `#${page.slug}` }, { isActive: newStatus });
    await logAction(req, 'TOGGLE_PAGE', 'pages', req.params.id, `Status: ${newStatus}`);
    return res.json({ success: true, message: `Page is now ${newStatus ? 'Published' : 'Draft'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle page visibility' });
  }
});

router.delete('/pages/:id', async (req, res) => {
  try {
    const page = await db.Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    if (page.slug === 'home') {
      return res.status(400).json({ success: false, message: 'The Homepage is the primary root landing page and cannot be deleted. You can edit its contents or banner slides.' });
    }
    await db.Page.findByIdAndDelete(req.params.id);
    await db.Navigation.deleteMany({ path: { $in: [`#${page.slug}`, `/${page.slug}`] } });
    await db.Subsection.deleteMany({ pageSlug: page.slug });

    // Also delete any child subpages under this parent
    const childPages = await db.Page.find({ parentSlug: page.slug });
    for (const cp of childPages) {
      await db.Page.findByIdAndDelete(cp._id || cp.id);
      await db.Navigation.deleteMany({ path: { $in: [`#${cp.slug}`, `/${cp.slug}`] } });
      await db.Subsection.deleteMany({ pageSlug: cp.slug });
    }

    await logAction(req, 'DELETE_PAGE', 'pages', req.params.id, `Deleted page: ${page.title} (${page.slug})`);
    return res.json({ success: true, message: `Page "${page.title}" and associated subpages deleted successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete page' });
  }
});

// ----------------------------------------------------
// 21. SUBSECTIONS MANAGER
// ----------------------------------------------------
router.get('/subsections', async (req, res) => {
  try {
    const filter = {};
    if (req.query.pageSlug) filter.pageSlug = req.query.pageSlug;
    const subsections = await db.Subsection.find(filter);
    subsections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: subsections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load subsections' });
  }
});

router.post('/subsections', async (req, res) => {
  try {
    const { pageSlug, title, subtitle, badge, layoutType, imageUrl, pdfUrl, pdfName, content, ctaText, ctaLink, isVisible } = req.body;
    if (!pageSlug || !title) {
      return res.status(400).json({ success: false, message: 'Parent Page and Subsection Title are required' });
    }
    const count = await db.Subsection.countDocuments({ pageSlug });
    const newSub = await db.Subsection.create({
      pageSlug,
      title,
      subtitle: subtitle || '',
      badge: badge || '',
      layoutType: layoutType || 'split_content',
      imageUrl: imageUrl || '',
      pdfUrl: pdfUrl || '',
      pdfName: pdfName || '',
      content: content || '',
      ctaText: ctaText || '',
      ctaLink: ctaLink || '',
      isVisible: isVisible !== false,
      sortOrder: count + 1
    });
    await logAction(req, 'CREATE_SUBSECTION', 'subsections', newSub._id || newSub.id, newSub.title);
    return res.status(201).json({ success: true, message: 'Subsection created successfully', data: newSub });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create subsection' });
  }
});

router.put('/subsections/:id', async (req, res) => {
  try {
    const updated = await db.Subsection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction(req, 'UPDATE_SUBSECTION', 'subsections', req.params.id, req.body.title);
    return res.json({ success: true, message: 'Subsection updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update subsection' });
  }
});

router.patch('/subsections/:id/toggle', async (req, res) => {
  try {
    const sub = await db.Subsection.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subsection not found' });
    const newStatus = !sub.isVisible;
    const updated = await db.Subsection.findByIdAndUpdate(req.params.id, { isVisible: newStatus }, { new: true });
    await logAction(req, 'TOGGLE_SUBSECTION', 'subsections', req.params.id, `Visible: ${newStatus}`);
    return res.json({ success: true, message: `Subsection is now ${newStatus ? 'Visible' : 'Hidden'}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle subsection visibility' });
  }
});

router.delete('/subsections/:id', async (req, res) => {
  try {
    await db.Subsection.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_SUBSECTION', 'subsections', req.params.id, 'Deleted subsection');
    return res.json({ success: true, message: 'Subsection deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete subsection' });
  }
});

// ----------------------------------------------------
// SUB-INSTITUTIONS (Group of Institutions)
// ----------------------------------------------------
router.get('/sub-institutions', async (req, res) => {
  try {
    const items = await db.SubInstitution.find({}, { sortOrder: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sub-institutions' });
  }
});

router.post('/sub-institutions', async (req, res) => {
  try {
    const { name, shortName, slug, description, iconEmoji, websiteUrl, imageUrl, programs, sortOrder, isActive } = req.body;
    const created = await db.SubInstitution.create({
      name, shortName, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description, iconEmoji, websiteUrl, imageUrl,
      programs: Array.isArray(programs) ? programs : (programs || '').split(',').map(p => p.trim()).filter(Boolean),
      sortOrder: sortOrder || 0, isActive: isActive !== false
    });
    await logAction(req, 'CREATE_SUB_INSTITUTION', 'sub-institutions', created._id, `Created: ${name}`);
    return res.json({ success: true, data: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create sub-institution' });
  }
});

router.put('/sub-institutions/:id', async (req, res) => {
  try {
    const { name, shortName, slug, description, iconEmoji, websiteUrl, imageUrl, programs, sortOrder, isActive } = req.body;
    const updated = await db.SubInstitution.findByIdAndUpdate(req.params.id, {
      $set: {
        name, shortName, slug, description, iconEmoji, websiteUrl, imageUrl,
        programs: Array.isArray(programs) ? programs : (programs || '').split(',').map(p => p.trim()).filter(Boolean),
        sortOrder, isActive
      }
    }, { new: true });
    await logAction(req, 'UPDATE_SUB_INSTITUTION', 'sub-institutions', req.params.id, `Updated: ${name}`);
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update sub-institution' });
  }
});

router.delete('/sub-institutions/:id', async (req, res) => {
  try {
    await db.SubInstitution.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_SUB_INSTITUTION', 'sub-institutions', req.params.id, 'Deleted sub-institution');
    return res.json({ success: true, message: 'Sub-institution deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete sub-institution' });
  }
});

module.exports = router;
