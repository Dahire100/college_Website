const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { inquiryLimiter } = require('../middleware/rateLimit');

// GET /api/v1/public/config
// Returns site settings, navigation menus, and homepage sections order/visibility
router.get('/config', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const rawSettings = await db.SiteSetting.find({ tenantId });
    const settings = {};
    for (const s of rawSettings) {
      settings[s.key] = s.value;
    }

    const navigation = await db.Navigation.find({ tenantId, isActive: true });
    navigation.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const sections = await db.HomepageSection.find({ tenantId, isVisible: true });
    sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const pages = await db.Page.find({ tenantId });
    pages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return res.json({
      success: true,
      data: {
        settings,
        navigation,
        sections,
        pages
      }
    });
  } catch (err) {
    console.error('Config fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load site configuration' });
  }
});

// GET /api/v1/public/banners
router.get('/banners', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const banners = await db.Banner.find({ tenantId, isActive: true });
    banners.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: banners });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load banners' });
  }
});

// GET /api/v1/public/notices
router.get(['/notices', '/notices/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { category, search, pinned } = req.query;
    let notices = await db.Notice.find({ tenantId, status: 'published' });

    if (category && category !== 'All') {
      notices = notices.filter(n => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    if (pinned === 'true') {
      notices = notices.filter(n => n.isPinned === true);
    }

    if (search) {
      const q = search.toLowerCase();
      notices = notices.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q)));
    }

    // Sort: pinned first, then by publishedDate descending
    notices.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
    });

    return res.json({ success: true, data: notices, notices });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load notices' });
  }
});

// GET /api/v1/public/events
router.get('/events', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const events = await db.Event.find({ tenantId, status: 'published' });
    events.sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));
    return res.json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
});

// GET /api/v1/public/news
router.get('/news', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const news = await db.News.find({ tenantId, status: 'published' });
    news.sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));
    return res.json({ success: true, data: news });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load news' });
  }
});

// GET /api/v1/public/departments
router.get(['/departments', '/departments/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const departments = await db.Department.find({ tenantId, isActive: true });
    departments.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: departments, departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load departments' });
  }
});

// GET /api/v1/public/departments/:code
router.get(['/departments/:code', '/departments/:code/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const code = req.params.code.toUpperCase();
    const department = await db.Department.findOne({ tenantId, code });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const courses = await db.Course.find({ tenantId, departmentCode: code, isActive: true });
    const faculty = await db.Faculty.find({ tenantId, departmentCode: code, isActive: true });
    faculty.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return res.json({
      success: true,
      data: {
        department,
        courses,
        faculty
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load department details' });
  }
});

// GET /api/v1/public/courses and /api/v1/public/course-catalog
const handleCourses = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { degree, department } = req.query;
    let courses = await db.Course.find({ tenantId, isActive: true });

    if (degree && degree !== 'All') {
      courses = courses.filter(c => c.degree && c.degree.toLowerCase().includes(degree.toLowerCase()));
    }

    if (department && department !== 'All') {
      courses = courses.filter(c => c.departmentCode && c.departmentCode.toLowerCase() === department.toLowerCase());
    }

    return res.json({ success: true, data: courses, courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load courses' });
  }
};
router.get(['/courses', '/courses/', '/course-catalog', '/course-catalog/'], handleCourses);

// GET /api/v1/public/faculty
router.get(['/faculty', '/faculty/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { department, search } = req.query;
    let faculty = await db.Faculty.find({ tenantId, isActive: true });

    if (department && department !== 'All') {
      faculty = faculty.filter(f => f.departmentCode && f.departmentCode.toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      faculty = faculty.filter(f => (f.name && f.name.toLowerCase().includes(q)) || (f.researchAreas && f.researchAreas.toLowerCase().includes(q)));
    }

    faculty.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: faculty, faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load faculty directory' });
  }
});

// GET /api/v1/public/admissions
router.get('/admissions', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const admissions = await db.Admission.find({ tenantId, status: 'published' });
    admissions.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: admissions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load admissions information' });
  }
});

// GET /api/v1/public/placements
router.get('/placements', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const records = await db.Placement.find({ tenantId, isActive: true });
    records.sort((a, b) => (b.academicYear || '').localeCompare(a.academicYear || ''));

    const recruiters = await db.Recruiter.find({ tenantId });
    recruiters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return res.json({
      success: true,
      data: {
        records,
        recruiters
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load placement records' });
  }
});

// GET /api/v1/public/recruiters
router.get(['/recruiters', '/recruiters/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const recruiters = await db.Recruiter.find({ tenantId });
    recruiters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: recruiters, recruiters });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load recruiters' });
  }
});

// GET /api/v1/public/facilities
router.get(['/facilities', '/facilities/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const facilities = await db.Facility.find({ tenantId, isActive: true });
    facilities.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: facilities, facilities });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load campus facilities' });
  }
});

// GET /api/v1/public/testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const testimonials = await db.Testimonial.find({ tenantId, isActive: true });
    testimonials.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

// GET /api/v1/public/leadership
router.get('/leadership', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const leadership = await db.Leadership.find({ tenantId, isActive: true });
    leadership.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: leadership });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load leadership messages' });
  }
});

// GET /api/v1/public/research
router.get('/research', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const research = await db.Research.find({ tenantId });
    return res.json({ success: true, data: research });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load research information' });
  }
});

// GET /api/v1/public/gallery
router.get('/gallery', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const gallery = await db.Gallery.find({ tenantId, isActive: true });
    gallery.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: gallery });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load gallery' });
  }
});

// POST /api/v1/public/inquiries (Submit Contact / Admission Inquiry Lead)
const handleInquirySubmission = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const body = req.body || {};
    const name = body.fullName || body.name || body.studentName || 'Prospective Student';
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const phone = body.phone || body.phoneNumber || body.contact || 'N/A';
    const message = body.message || body.query || body.notes || body.subject || 'Public inquiry lead';
    const { courseInterested, departmentCode, source, subject } = body;
    const fullName = String(name).trim();

    if (!fullName || (!email && (!phone || phone === 'N/A'))) {
      return res.status(400).json({
        success: false,
        message: 'Name and either an email or phone number are required.'
      });
    }

    const newInquiry = await db.Inquiry.create({
      tenantId,
      fullName: fullName.trim(),
      email: email || 'inquiry@portal.local',
      phone: String(phone).trim(),
      source: String(source || 'public_inquiry').trim().toLowerCase(),
      subject: String(subject || courseInterested || departmentCode || 'Admission Lead').trim(),
      courseInterested: courseInterested || '',
      departmentCode: departmentCode || '',
      message: String(message).trim(),
      status: 'new',
      notes: '',
      adminReply: '',
      repliedBy: '',
      repliedAt: null,
      readAt: null
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! Our Admissions Counseling Cell will connect with you shortly.',
      inquiryId: newInquiry._id || newInquiry.id,
      data: newInquiry
    });
  } catch (err) {
    console.error('Inquiry submission error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record inquiry. Please try again or call our admissions helpline.'
    });
  }
};

router.post(
  ['/inquiries', '/inquiries/', '/inquiry', '/inquiry/', '/leads', '/leads/', '/lead', '/lead/'],
  inquiryLimiter,
  handleInquirySubmission
);

// GET /api/v1/public/pages
router.get(['/pages', '/pages/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const pages = await db.Page.find({ tenantId, isActive: true });
    pages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: pages, pages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load pages' });
  }
});

// GET /api/v1/public/pages/:slug and /public/page/:slug
const handlePageBySlug = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const slug = (req.params.slug || '').toLowerCase().trim();
    const page = await db.Page.findOne({ tenantId, slug, isActive: true });
    if (!page) {
      return res.status(404).json({ success: false, message: `Page with slug '${slug}' not found` });
    }
    const subsections = await db.Subsection.find({ tenantId, pageSlug: slug, isVisible: true });
    subsections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    let parentPage = null;
    let siblings = [];
    if (page.parentSlug) {
      parentPage = await db.Page.findOne({ tenantId, slug: page.parentSlug, isActive: true });
      siblings = await db.Page.find({ tenantId, parentSlug: page.parentSlug, isActive: true });
      siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } else {
      const subpages = await db.Page.find({ tenantId, parentSlug: page.slug, isActive: true });
      subpages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      siblings = subpages;
    }

    return res.json({
      success: true,
      data: {
        page,
        subsections,
        parentPage,
        siblings
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load page content' });
  }
};

router.get(['/pages/:slug', '/pages/:slug/', '/page/:slug', '/page/:slug/'], handlePageBySlug);

// GET /api/v1/public/subsections
router.get(['/subsections', '/subsections/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { pageSlug } = req.query;
    const filter = { tenantId, isVisible: true };
    if (pageSlug) filter.pageSlug = pageSlug;
    const subsections = await db.Subsection.find(filter);
    subsections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: subsections, subsections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load subsections' });
  }
});

// GET /api/v1/public/sub-institutions
router.get(['/sub-institutions', '/sub-institutions/'], async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const items = await db.SubInstitution.find({ tenantId, isActive: true });
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: items, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load sub-institutions' });
  }
});

// Fallback lookup by slug for /public/:slug
router.get('/:slug', handlePageBySlug);

// Catch-all 404 for unmatched public API routes to guarantee JSON response instead of SPA HTML shell
router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Public endpoint not found: ${req.method} ${req.originalUrl || req.path}`
  });
});

module.exports = router;
