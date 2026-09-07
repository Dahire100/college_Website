const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { inquiryLimiter } = require('../middleware/rateLimit');

// GET /api/v1/public/config
// Returns site settings, navigation menus, and homepage sections order/visibility
router.get('/config', async (req, res) => {
  try {
    const rawSettings = await db.SiteSetting.find({});
    const settings = {};
    for (const s of rawSettings) {
      settings[s.key] = s.value;
    }

    const navigation = await db.Navigation.find({ isActive: true });
    navigation.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const sections = await db.HomepageSection.find({ isVisible: true });
    sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const pages = await db.Page.find({ isActive: true });
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
    const banners = await db.Banner.find({ isActive: true });
    banners.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: banners });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load banners' });
  }
});

// GET /api/v1/public/notices
router.get('/notices', async (req, res) => {
  try {
    const { category, search, pinned } = req.query;
    let notices = await db.Notice.find({ status: 'published' });

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

    return res.json({ success: true, data: notices });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load notices' });
  }
});

// GET /api/v1/public/events
router.get('/events', async (req, res) => {
  try {
    const events = await db.Event.find({ status: 'published' });
    events.sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));
    return res.json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
});

// GET /api/v1/public/news
router.get('/news', async (req, res) => {
  try {
    const news = await db.News.find({ status: 'published' });
    news.sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));
    return res.json({ success: true, data: news });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load news' });
  }
});

// GET /api/v1/public/departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await db.Department.find({ isActive: true });
    departments.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load departments' });
  }
});

// GET /api/v1/public/departments/:code
router.get('/departments/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const department = await db.Department.findOne({ code });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const courses = await db.Course.find({ departmentCode: code, isActive: true });
    const faculty = await db.Faculty.find({ departmentCode: code, isActive: true });
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

// GET /api/v1/public/courses
router.get('/courses', async (req, res) => {
  try {
    const { degree, department } = req.query;
    let courses = await db.Course.find({ isActive: true });

    if (degree && degree !== 'All') {
      courses = courses.filter(c => c.degree && c.degree.toLowerCase().includes(degree.toLowerCase()));
    }

    if (department && department !== 'All') {
      courses = courses.filter(c => c.departmentCode && c.departmentCode.toLowerCase() === department.toLowerCase());
    }

    return res.json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load courses' });
  }
});

// GET /api/v1/public/faculty
router.get('/faculty', async (req, res) => {
  try {
    const { department, search } = req.query;
    let faculty = await db.Faculty.find({ isActive: true });

    if (department && department !== 'All') {
      faculty = faculty.filter(f => f.departmentCode && f.departmentCode.toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      faculty = faculty.filter(f => (f.name && f.name.toLowerCase().includes(q)) || (f.researchAreas && f.researchAreas.toLowerCase().includes(q)));
    }

    faculty.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load faculty directory' });
  }
});

// GET /api/v1/public/admissions
router.get('/admissions', async (req, res) => {
  try {
    const admissions = await db.Admission.find({ status: 'published' });
    admissions.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: admissions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load admissions information' });
  }
});

// GET /api/v1/public/placements
router.get('/placements', async (req, res) => {
  try {
    const records = await db.Placement.find({ isActive: true });
    records.sort((a, b) => (b.academicYear || '').localeCompare(a.academicYear || ''));

    const recruiters = await db.Recruiter.find({});
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
router.get('/recruiters', async (req, res) => {
  try {
    const recruiters = await db.Recruiter.find({});
    recruiters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: recruiters });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load recruiters' });
  }
});

// GET /api/v1/public/facilities
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await db.Facility.find({ isActive: true });
    facilities.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: facilities });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load campus facilities' });
  }
});

// GET /api/v1/public/testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await db.Testimonial.find({ isActive: true });
    testimonials.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

// GET /api/v1/public/leadership
router.get('/leadership', async (req, res) => {
  try {
    const leadership = await db.Leadership.find({ isActive: true });
    leadership.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: leadership });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load leadership messages' });
  }
});

// GET /api/v1/public/research
router.get('/research', async (req, res) => {
  try {
    const research = await db.Research.find({});
    return res.json({ success: true, data: research });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load research information' });
  }
});

// GET /api/v1/public/gallery
router.get('/gallery', async (req, res) => {
  try {
    const gallery = await db.Gallery.find({ isActive: true });
    gallery.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: gallery });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load gallery' });
  }
});

// POST /api/v1/public/inquiries (Submit Contact / Admission Inquiry with Rate Limiting)
router.post('/inquiries', inquiryLimiter, async (req, res) => {
  try {
    const name = req.body.fullName || req.body.name;
    const { email, phone, courseInterested, departmentCode, message, source, subject } = req.body;
    const fullName = name;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and inquiry message are required fields.'
      });
    }

    const newInquiry = await db.Inquiry.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      source: String(source || 'inquiry').trim().toLowerCase(),
      subject: String(subject || courseInterested || departmentCode || '').trim(),
      courseInterested: courseInterested || '',
      departmentCode: departmentCode || '',
      message: message.trim(),
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
      inquiryId: newInquiry._id || newInquiry.id
    });
  } catch (err) {
    console.error('Inquiry submission error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record inquiry. Please try again or call our admissions helpline.'
    });
  }
});

// GET /api/v1/public/pages
router.get('/pages', async (req, res) => {
  try {
    const pages = await db.Page.find({ isActive: true });
    pages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: pages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load pages' });
  }
});

// GET /api/v1/public/pages/:slug
router.get('/pages/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const page = await db.Page.findOne({ slug, isActive: true });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    const subsections = await db.Subsection.find({ pageSlug: slug, isVisible: true });
    subsections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    let parentPage = null;
    let siblings = [];
    if (page.parentSlug) {
      parentPage = await db.Page.findOne({ slug: page.parentSlug, isActive: true });
      siblings = await db.Page.find({ parentSlug: page.parentSlug, isActive: true });
      siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } else {
      // Find subpages of this parent
      const subpages = await db.Page.find({ parentSlug: page.slug, isActive: true });
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
});

// GET /api/v1/public/subsections
router.get('/subsections', async (req, res) => {
  try {
    const { pageSlug } = req.query;
    const filter = { isVisible: true };
    if (pageSlug) filter.pageSlug = pageSlug;
    const subsections = await db.Subsection.find(filter);
    subsections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: subsections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load subsections' });
  }
});

// GET /api/v1/public/sub-institutions
router.get('/sub-institutions', async (req, res) => {
  try {
    const items = await db.SubInstitution.find({ isActive: true });
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load sub-institutions' });
  }
});

module.exports = router;

