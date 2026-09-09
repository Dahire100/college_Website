require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, connectDB, getTenantDb, tenantStorage } = require('./db');

async function seed(targetTenantId = null) {
  console.log('[Seed] Starting database population with institutional data...');
  await connectDB();

  // 0a. SuperAdmin Account (Global)
  const superAdminCount = await db.SuperAdmin.countDocuments();
  if (superAdminCount === 0) {
    const superPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123';
    const passwordHash = bcrypt.hashSync(superPassword, 10);
    await db.SuperAdmin.create({
      username: process.env.SUPERADMIN_USERNAME || 'superadmin',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@apex-inst.edu',
      passwordHash,
      role: 'superadmin',
      lastLogin: new Date()
    });
    console.log(`[Seed] Created SuperAdmin account: ${process.env.SUPERADMIN_USERNAME || 'superadmin'} / ${superPassword}`);
  }

  // 0b. Default Tenant (Global)
  let tenant = null;
  if (targetTenantId) {
    tenant = await db.Tenant.findById(targetTenantId);
  } else {
    tenant = await db.Tenant.findOne({ domain: 'localhost' });
    if (!tenant) {
      tenant = await db.Tenant.create({
        name: 'Apex Institute of Engineering & Technology',
        domain: 'localhost',
        subdomain: 'apex',
        status: 'active',
        plan: 'enterprise',
        branding: {
          collegeName: 'Apex Institute of Engineering & Technology',
          logoUrl: '',
          primaryColor: '#0f172a',
          storageLimitBytes: 524288000
        }
      });
      console.log('[Seed] Created default tenant: localhost (Apex Institute)');
    }
  }

  const tenantId = String(tenant._id || tenant.id);
  const tenantDb = getTenantDb(tenantId);

  // Drop legacy non-compound indexes if connected to MongoDB Atlas
  const { mongoose, Models } = require('./db');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await Models.Admin.collection.dropIndex('username_1').catch(() => {});
      await Models.Page.collection.dropIndex('slug_1').catch(() => {});
      await Models.Department.collection.dropIndex('code_1').catch(() => {});
      await Models.Placement.collection.dropIndex('academicYear_1').catch(() => {});
      await Models.SubInstitution.collection.dropIndex('slug_1').catch(() => {});
      await Models.SiteSetting.collection.dropIndex('key_1').catch(() => {});
      await Models.HomepageSection.collection.dropIndex('sectionKey_1').catch(() => {});
    } catch (e) {}

    // Backfill legacy documents without tenantId
    const collectionsToBackfill = ['admins', 'sitesettings', 'navigations', 'pages', 'notices', 'events', 'departments', 'courses', 'faculties', 'admissions', 'placements', 'recruiters', 'facilities', 'testimonials', 'leaderships', 'researches', 'galleries', 'subinstitutions', 'homepagesections', 'banners', 'media', 'auditlogs'];
    for (const colName of collectionsToBackfill) {
      try {
        await mongoose.connection.collection(colName).updateMany(
          { tenantId: { $exists: false } },
          { $set: { tenantId } }
        );
      } catch (e) {}
    }
  }

  return await tenantStorage.run({ tenantId, tenant, tenantDb }, async () => {
    // 1. Single Admin User for Tenant
    const adminCount = await db.Admin.countDocuments();
    if (adminCount === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const passwordHash = bcrypt.hashSync(defaultPassword, 10);
      await db.Admin.create({
        tenantId,
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@apex-inst.edu',
        passwordHash,
        fullName: process.env.ADMIN_NAME || 'Chief Institutional Administrator',
        lastLogin: new Date()
      });
      console.log(`[Seed] Created Single Admin account: ${process.env.ADMIN_USERNAME || 'admin'} / ${defaultPassword}`);
    }

  // 2. Site Settings
  const settings = [
    { key: 'college_name', value: 'Apex Institute of Engineering & Technology', group: 'general', label: 'College / University Name' },
    { key: 'college_tagline', value: 'Autonomous Institution of Excellence | Approved by AICTE, New Delhi', group: 'general', label: 'Institutional Tagline' },
    { key: 'college_short_name', value: 'Apex Institute', group: 'general', label: 'Short Abbreviation' },
    { key: 'college_est', value: '1984', group: 'general', label: 'Established Year' },
    { key: 'affiliation', value: 'Autonomous College affiliated to State Technological University', group: 'general', label: 'Affiliation' },
    { key: 'accreditation_summary', value: 'NAAC A++ Grade (CGPA 3.65) | NBA Accredited Programs | NIRF Top 150 Band', group: 'general', label: 'Accreditation Summary' },
    { key: 'contact_phone_primary', value: '+91 253 251 2876', group: 'contact', label: 'Primary Contact Phone' },
    { key: 'contact_phone_admissions', value: '+91 253 251 2867', group: 'contact', label: 'Admissions Helpline' },
    { key: 'contact_email_primary', value: 'principal@apex-inst.edu', group: 'contact', label: 'Primary Official Email' },
    { key: 'contact_email_admissions', value: 'admissions@apex-inst.edu', group: 'contact', label: 'Admissions Email' },
    { key: 'contact_email_placements', value: 'tpo@apex-inst.edu', group: 'contact', label: 'Placement Cell Email' },
    { key: 'contact_address', value: 'Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India', group: 'contact', label: 'Campus Address' },
    { key: 'google_maps_embed', value: 'https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed', group: 'contact', label: 'Campus Map Embed' },
    { key: 'social_linkedin', value: 'https://linkedin.com', group: 'social', label: 'LinkedIn URL' },
    { key: 'social_twitter', value: 'https://x.com', group: 'social', label: 'X / Twitter URL' },
    { key: 'social_youtube', value: 'https://youtube.com', group: 'social', label: 'YouTube Channel' },
    { key: 'social_instagram', value: 'https://instagram.com', group: 'social', label: 'Instagram Profile' },
    { key: 'seo_meta_title', value: 'Apex Institute of Engineering & Technology | Autonomous College', group: 'seo', label: 'Default SEO Title' },
    { key: 'seo_meta_description', value: 'Premier autonomous engineering institution offering world-class UG, PG, and PhD programs, industry-driven curriculum, NAAC A++ accreditation, and 95%+ placement record.', group: 'seo', label: 'Default SEO Meta Description' },
    { key: 'seo_meta_keywords', value: 'Engineering college, Computer Science, AI, Mechanical, Autonomous, Admissions, Placements, Top engineering college', group: 'seo', label: 'Default SEO Keywords' },
    { key: 'hero_admission_alert', value: 'Admissions Open 2026-27 for B.Tech, M.Tech, MBA & MCA Programs. Online Applications Closing Soon.', group: 'general', label: 'Top Notification Ticker' },
    { key: 'demo_notice_disclaimer', value: 'Demo Institutional Portal. Data presented is for illustrative demonstration purposes inspired by academic benchmarks.', group: 'general', label: 'Footer Disclaimer' }
  ];

  for (const s of settings) {
    const existing = await db.SiteSetting.findOne({ key: s.key });
    if (!existing) {
      await db.SiteSetting.create(s);
    }
  }

  // 3. Navigation
  const navItems = [
    { title: 'Home', path: '/', parentId: '0', sortOrder: 1 },
    { title: 'About Us', path: '/about', parentId: '0', sortOrder: 2 },
    { title: 'Leadership', path: '/leadership', parentId: '0', sortOrder: 3 },
    { title: 'Academics', path: '/academics', parentId: '0', sortOrder: 4 },
    { title: 'Departments', path: '/departments', parentId: '0', sortOrder: 5 },
    { title: 'Admissions', path: '/admissions', parentId: '0', sortOrder: 6 },
    { title: 'Placements', path: '/placements', parentId: '0', sortOrder: 7 },
    { title: 'Campus & Facilities', path: '/campus', parentId: '0', sortOrder: 8 },
    { title: 'Student Life', path: '/life', parentId: '0', sortOrder: 9 },
    { title: 'Research', path: '/research', parentId: '0', sortOrder: 10 },
    { title: 'News & Notices', path: '/news', parentId: '0', sortOrder: 11 },
    { title: 'Contact Us', path: '/contact', parentId: '0', sortOrder: 12 }
  ];

  for (const n of navItems) {
    const existing = await db.Navigation.findOne({ path: n.path });
    if (!existing) {
      await db.Navigation.create(n);
    }
  }

  // Automatic Migration: Sanitize any existing legacy '#' navigation paths in DB and deduplicate by path
  const existingNavs = await db.Navigation.find({});
  const seenNavKeys = new Set();
  for (const n of existingNavs) {
    let cleanPath = n.path;
    if (cleanPath && cleanPath.startsWith('#')) {
      const clean = cleanPath.replace(/^#\/?/, '').trim();
      cleanPath = clean === 'home' || !clean ? '/' : `/${clean}`;
      await db.Navigation.updateOne({ _id: n._id }, { $set: { path: cleanPath } });
    }
    const navKey = `${n.tenantId || ''}:::${(cleanPath || '').toLowerCase().trim()}`;
    if (seenNavKeys.has(navKey)) {
      await db.Navigation.deleteOne({ _id: n._id });
    } else {
      seenNavKeys.add(navKey);
    }
  }

  // 4. Homepage Sections (Order, Visibility, Title customization)
  const sections = [
    { sectionKey: 'hero_carousel', title: 'Campus Hero Showcase', subtitle: 'Leading Engineering & Technology Institution', isVisible: true, sortOrder: 1 },
    { sectionKey: 'accreditation_bar', title: 'Accreditations & Recognitions', subtitle: 'National Recognition of Educational Excellence', isVisible: true, sortOrder: 2 },
    { sectionKey: 'notice_ticker', title: 'Important Circulars & Announcements', subtitle: 'Real-time updates from examination and academic council', isVisible: true, sortOrder: 3 },
    { sectionKey: 'stats_counter', title: 'Institutional Key Figures', subtitle: 'Four decades of legacy in engineering education', isVisible: true, sortOrder: 4 },
    { sectionKey: 'admissions_cta', title: 'Admissions 2026-27 Open', subtitle: 'Take the first step toward high-impact engineering leadership', isVisible: true, sortOrder: 5 },
    { sectionKey: 'programs_showcase', title: 'Academic Programs & Degrees', subtitle: 'Undergraduate, Postgraduate & Doctoral specializations', isVisible: true, sortOrder: 6 },
    { sectionKey: 'departments_overview', title: 'Academic Departments', subtitle: 'State-of-the-art departments with dedicated centers of excellence', isVisible: true, sortOrder: 7 },
    { sectionKey: 'director_message', title: 'Message from the Director', subtitle: 'Shaping ethical innovators for global challenges', isVisible: true, sortOrder: 8 },
    { sectionKey: 'placement_highlights', title: 'Placement Records & Packages', subtitle: 'Consistent 95%+ campus placements across Fortune 500 tech leaders', isVisible: true, sortOrder: 9 },
    { sectionKey: 'recruiter_marquee', title: 'Marquee Corporate Partners', subtitle: 'Top global technology enterprises hiring our graduates', isVisible: true, sortOrder: 10 },
    { sectionKey: 'campus_highlights', title: 'World-Class Infrastructure', subtitle: 'Designed for experiential learning, research, and recreation', isVisible: true, sortOrder: 11 },
    { sectionKey: 'student_achievements', title: 'Student Innovations & Fests', subtitle: 'Triumph in national hackathons, Formula Student, and robotics', isVisible: true, sortOrder: 12 },
    { sectionKey: 'news_events', title: 'Campus Events & Announcements', subtitle: 'Conferences, technical symposiums, and cultural milestones', isVisible: true, sortOrder: 13 },
    { sectionKey: 'testimonials', title: 'Student & Alumni Stories', subtitle: 'Hear from our alumni thriving at global tech hubs', isVisible: true, sortOrder: 14 },
    { sectionKey: 'gallery_preview', title: 'Life at Apex Campus', subtitle: 'A vibrant, collaborative, and transformative student journey', isVisible: true, sortOrder: 15 },
    { sectionKey: 'contact_cta', title: 'Connect with Campus Admissions', subtitle: 'Visit us or reach out for counseling and guided campus tours', isVisible: true, sortOrder: 16 }
  ];

  for (const s of sections) {
    const existing = await db.HomepageSection.findOne({ sectionKey: s.sectionKey });
    if (!existing) {
      await db.HomepageSection.create(s);
    }
  }

  // 5. Hero Banners
  const banners = [
    {
      title: 'Four Decades of Academic Rigor & Engineering Excellence',
      subtitle: 'Autonomous Institute accredited with NAAC A++ Grade (CGPA 3.65). Fostering critical thinking, engineering research, and ethical leadership.',
      badge: 'NAAC A++ ACCREDITED | AUTONOMOUS',
      ctaText: 'Explore Academic Programs',
      ctaLink: '/academics',
      secondaryCtaText: 'Apply for Admission',
      secondaryCtaLink: '/admissions',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      title: 'Industry-Integrated Learning & 95%+ Campus Placements',
      subtitle: 'Highest package ₹44.2 LPA, Average package ₹8.65 LPA. Over 350+ global recruitment partners including Google, Microsoft, NVIDIA, Siemens, and L&T.',
      badge: 'PLACEMENTS 2025-26 RECORD',
      ctaText: 'View Placement Report',
      ctaLink: '/placements',
      secondaryCtaText: 'Our Recruiters',
      secondaryCtaLink: '/placements',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      title: 'Pioneering Research Centers & Innovation Ecosystem',
      subtitle: 'Interdisciplinary research labs in Artificial Intelligence, Electric Vehicles, Internet of Things, and Smart Manufacturing with ₹12+ Crore in funded R&D grants.',
      badge: 'RESEARCH & INNOVATION EXCELLENCE',
      ctaText: 'Discover Research Centers',
      ctaLink: '/research',
      secondaryCtaText: 'Virtual Campus Tour',
      secondaryCtaLink: '/campus',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 3,
      isActive: true
    }
  ];

  if ((await db.Banner.countDocuments()) === 0) {
    for (const b of banners) await db.Banner.create(b);
  }

  // Automatic Migration: Sanitize any existing legacy '#' in banner CTA links in DB
  const existingBanners = await db.Banner.find({});
  for (const b of existingBanners) {
    let needsUpdate = false;
    const updates = {};
    if (b.ctaLink && b.ctaLink.startsWith('#')) {
      const clean = b.ctaLink.replace(/^#\/?/, '').trim();
      updates.ctaLink = clean === 'home' || !clean ? '/' : `/${clean}`;
      needsUpdate = true;
    }
    if (b.secondaryCtaLink && b.secondaryCtaLink.startsWith('#')) {
      const clean = b.secondaryCtaLink.replace(/^#\/?/, '').trim();
      updates.secondaryCtaLink = clean === 'home' || !clean ? '/' : `/${clean}`;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await db.Banner.updateOne({ _id: b._id }, { $set: updates });
    }
  }

  // 6. Departments
  const departments = [
    {
      code: 'CS',
      name: 'Department of Computer Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Vivek V. Joshi',
      hodImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Our focus is on blending computational theory with high-impact software engineering in Cloud Systems, Cyber Security, and Distributed Computing.',
      email: 'cs.hod@apex-inst.edu',
      phone: '+91 253 251 2801',
      overview: 'Established in 1993, the Department of Computer Engineering is accredited by the NBA and boasts state-of-the-art specialized computing labs, NVIDIA GPUs, and an active ACM student chapter.',
      vision: 'To produce ethically sound, globally competent computer engineering professionals capable of leading software innovation.',
      mission: 'Delivering hands-on curriculum, fostering collaborative research, and instilling entrepreneurial aptitude.',
      stats: { intake: 180, faculty: 32, labs: 12, placementRate: '98%' },
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      code: 'AIDS',
      name: 'Artificial Intelligence & Data Science',
      degreeLevels: 'B.Tech',
      hodName: 'Dr. Sunita K. Pathak',
      hodImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Empowering future engineers with machine intelligence, neural architectures, deep learning, and ethical data governance frameworks.',
      email: 'aids.hod@apex-inst.edu',
      phone: '+91 253 251 2802',
      overview: 'A pioneering interdisciplinary department equipped with high-performance computing clusters dedicated to computer vision, natural language processing, and big data analytics.',
      vision: 'To emerge as a premier center of intelligence engineering driving societal transformation.',
      mission: 'Providing interdisciplinary curriculum aligned with top industry frontiers and academic research.',
      stats: { intake: 120, faculty: 18, labs: 6, placementRate: '96%' },
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      code: 'ENTC',
      name: 'Electronics & Telecommunication',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Ramesh B. Patil',
      hodImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'From 5G communications to VLSI design and embedded systems, our department bridges hardware architecture with high-speed digital communications.',
      email: 'entc.hod@apex-inst.edu',
      phone: '+91 253 251 2803',
      overview: 'Accredited with NBA, featuring Center of Excellence in IoT, Cadence VLSI tools, and collaborative projects with Texas Instruments.',
      vision: 'Excellence in electronics and telecommunication engineering through applied knowledge and industry partnership.',
      mission: 'Empowering students with hardware-software co-design abilities and telecommunication fundamentals.',
      stats: { intake: 120, faculty: 24, labs: 10, placementRate: '92%' },
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      sortOrder: 3,
      isActive: true
    },
    {
      code: 'MECH',
      name: 'Mechanical Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Prakash S. Shinde',
      hodImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Combining classical thermodynamics and mechanics with modern CAD/CAM, robotics automation, and Electric Vehicle technology.',
      email: 'mech.hod@apex-inst.edu',
      phone: '+91 253 251 2804',
      overview: 'One of the founding branches of the institute with extensive workshop facilities, CNC machines, wind tunnel lab, and championship-winning SAE BAJA team.',
      vision: 'Developing world-class mechanical design engineers and industrial innovators.',
      mission: 'Providing strong analytical foundations, hands-on workshop training, and exposure to smart manufacturing.',
      stats: { intake: 120, faculty: 28, labs: 14, placementRate: '90%' },
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      sortOrder: 4,
      isActive: true
    },
    {
      code: 'CIVIL',
      name: 'Civil Engineering & Infrastructure',
      degreeLevels: 'B.Tech, M.Tech',
      hodName: 'Dr. Madhav T. Sonawane',
      hodImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Designing sustainable urban infrastructure, green buildings, resilient structural frameworks, and smart water management systems.',
      email: 'civil.hod@apex-inst.edu',
      phone: '+91 253 251 2805',
      overview: 'Renowned for industrial consultancy in geotechnical testing, structural audit, environmental impact assessment, and GIS surveying.',
      vision: 'Building sustainable and resilient infrastructure leaders for modern urban societies.',
      mission: 'Instilling expertise in structural design, environmental sustainability, and modern construction management.',
      stats: { intake: 60, faculty: 16, labs: 9, placementRate: '88%' },
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      sortOrder: 5,
      isActive: true
    },
    {
      code: 'CHEMICAL',
      name: 'Chemical Engineering',
      degreeLevels: 'B.Tech, M.Tech',
      hodName: 'Dr. Vandana S. Mahajan',
      hodImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Advancing green chemistry, renewable energy biofuels, sustainable process engineering, and nano-materials.',
      email: 'chem.hod@apex-inst.edu',
      phone: '+91 253 251 2806',
      overview: 'Equipped with pilot-scale process synthesis units, mass transfer distillation labs, and chemical reaction engineering simulation suites.',
      vision: 'Pioneering clean process engineering and sustainable biochemical technology.',
      mission: 'Promoting process safety, eco-friendly synthesis, and strong industry linkages.',
      stats: { intake: 60, faculty: 14, labs: 8, placementRate: '89%' },
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      sortOrder: 6,
      isActive: true
    },
    {
      code: 'MGMT',
      name: 'Department of Management Studies (MBA)',
      degreeLevels: 'MBA, Executive MDP',
      hodName: 'Dr. Anand K. Kulkarni',
      hodImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Developing visionary business leaders with specialized competencies in Tech Management, Finance, Marketing, and Operations.',
      email: 'mba.hod@apex-inst.edu',
      phone: '+91 253 251 2807',
      overview: 'Premier business school department with Bloomberg-style business analytics lab, incubation cell, and corporate mentorship program.',
      vision: 'To cultivate entrepreneurial visionaries and agile corporate managers.',
      mission: 'Case-based pedagogy, corporate executive interactions, and business analytics integration.',
      stats: { intake: 120, faculty: 15, labs: 3, placementRate: '94%' },
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      sortOrder: 7,
      isActive: true
    },
    {
      code: 'MCA',
      name: 'Department of Computer Applications (MCA)',
      degreeLevels: 'MCA',
      hodName: 'Prof. Varsha D. Bhamare',
      hodImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Fostering full-stack enterprise software architects, cloud engineers, and mobile application specialists.',
      email: 'mca.hod@apex-inst.edu',
      phone: '+91 253 251 2808',
      overview: 'Intensive 2-year professional degree focusing on enterprise Java/Python frameworks, DevOps, cloud deployment, and system architecture.',
      vision: 'Excellence in application development and modern enterprise software practices.',
      mission: 'Industry live projects, hackathons, and continuous technical certification tracks.',
      stats: { intake: 60, faculty: 10, labs: 4, placementRate: '95%' },
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      sortOrder: 8,
      isActive: true
    }
  ];

  if ((await db.Department.countDocuments()) === 0) {
    for (const d of departments) await db.Department.create(d);
  }

  // 7. Courses
  const courses = [
    {
      departmentCode: 'CS',
      title: 'B.Tech in Computer Engineering',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 180,
      eligibility: '10+2 with Physics, Mathematics, and Chemistry/CS with min 50% marks + Valid MHT-CET / JEE Main Score.',
      description: 'Comprehensive curriculum covering Data Structures, Algorithms, Distributed Systems, Cloud Computing, Compiler Design, and Cyber Security.',
      curriculum: [
        'Sem 1-2: Engineering Physics, Calculus, C Programming, Digital Electronics',
        'Sem 3-4: OOP Java, Data Structures, Discrete Math, Computer Organization',
        'Sem 5-6: Operating Systems, Database Management, Computer Networks, Software Engineering',
        'Sem 7-8: Cloud Computing, Machine Learning, Capstone Major Project, Industry Internship'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Software Engineer, Systems Architect, Cloud DevOps Engineer, Cyber Security Specialist',
      isActive: true
    },
    {
      departmentCode: 'AIDS',
      title: 'B.Tech in Artificial Intelligence & Data Science',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 120,
      eligibility: '10+2 with Physics, Mathematics, and Chemistry/CS with min 50% marks + Valid MHT-CET / JEE Main Score.',
      description: 'Specialized program diving deep into Neural Networks, Deep Learning, Big Data Frameworks, NLP, and Computer Vision.',
      curriculum: [
        'Sem 1-2: Linear Algebra, Statistics, Python Programming, Applied Electronics',
        'Sem 3-4: Foundations of AI, Data Analysis, Data Warehousing, Optimization Algorithms',
        'Sem 5-6: Machine Learning, Deep Neural Nets, Computer Vision, Big Data Analytics',
        'Sem 7-8: Reinforcement Learning, MLOps, Generative AI, Industrial Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'AI Engineer, Data Scientist, ML Ops Specialist, Business Intelligence Architect',
      isActive: true
    },
    {
      departmentCode: 'CS',
      title: 'M.Tech in Computer Engineering',
      degree: 'Postgraduate (PG)',
      duration: '2 Years (4 Semesters)',
      intake: 24,
      eligibility: 'B.E./B.Tech in Computer / IT / Electronics with min 50% marks + Valid GATE score.',
      description: 'Advanced master course focusing on high-performance computing, distributed ledger algorithms, and autonomous system research.',
      curriculum: [
        'Sem 1: Advanced Algorithms, Parallel Computing, Research Methodology',
        'Sem 2: Cloud Native Architectures, Deep Learning Frontiers, Elective I & II',
        'Sem 3: Dissertation Phase I, Research Publication',
        'Sem 4: Dissertation Phase II, Defense and Tech Transfer'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Principal Research Engineer, Senior Systems Architect, Academic Faculty',
      isActive: true
    },
    {
      departmentCode: 'ENTC',
      title: 'B.Tech in Electronics & Telecommunication',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 120,
      eligibility: '10+2 with Physics, Mathematics, Chemistry with min 50% + MHT-CET / JEE Main.',
      description: 'Modern electronics curriculum spanning RF design, 5G signal processing, embedded IoT microcontrollers, and FPGA programming.',
      curriculum: [
        'Sem 1-2: Basic Electrical & Electronics, Engineering Mechanics, Applied Chemistry',
        'Sem 3-4: Electronic Devices & Circuits, Signals & Systems, Microprocessors 8086/ARM',
        'Sem 5-6: Digital Signal Processing, Antenna & Wave Propagation, VLSI Design',
        'Sem 7-8: Wireless Communication, IoT Protocols, Embedded Robotics, Capstone Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'VLSI Design Engineer, Embedded Firmware Engineer, Telecom Network Architect',
      isActive: true
    },
    {
      departmentCode: 'MECH',
      title: 'B.Tech in Mechanical Engineering',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 120,
      eligibility: '10+2 with Physics, Mathematics, Chemistry with min 50% + MHT-CET / JEE Main.',
      description: 'Engineering excellence in thermodynamics, finite element analysis, robotics, mechatronics, and Electric Vehicle powertrains.',
      curriculum: [
        'Sem 1-2: Workshop Practice, Engineering Graphics, Material Science',
        'Sem 3-4: Strength of Materials, Thermodynamics, Fluid Mechanics, Kinematics',
        'Sem 5-6: Heat Transfer, Turbo Machinery, Mechatronics, CAD/CAM/CAE',
        'Sem 7-8: EV Powertrain Design, Industrial Automation, Renewable Energy, Major Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Automotive Design Engineer, Manufacturing Specialist, Thermal Analyst, EV Systems Engineer',
      isActive: true
    },
    {
      departmentCode: 'MGMT',
      title: 'Master of Business Administration (MBA)',
      degree: 'Postgraduate (PG)',
      duration: '2 Years (4 Semesters)',
      intake: 120,
      eligibility: 'Graduation in any discipline with min 50% marks + Valid MAH-MBA-CET / CAT / CMAT / MAT score.',
      description: 'Specializations in Financial Management, Marketing, Human Resource Management, Operations & Supply Chain, and Business Analytics.',
      curriculum: [
        'Sem 1: Management Principles, Financial Accounting, Managerial Economics, Org Behavior',
        'Sem 2: Marketing Management, Operations Research, Business Law, Analytics Lab',
        'Sem 3: Specialization Core & Electives, Summer Internship Project',
        'Sem 4: Strategic Management, Corporate Governance, Final Capstone Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Investment Banker, Product Manager, Marketing Strategist, Supply Chain Consultant',
      isActive: true
    },
    {
      departmentCode: 'MCA',
      title: 'Master of Computer Applications (MCA)',
      degree: 'Postgraduate (PG)',
      duration: '2 Years (4 Semesters)',
      intake: 60,
      eligibility: 'BCA / B.Sc (Computer Science / IT) or Bachelor degree with Mathematics at 10+2 or Graduate level + MAH-MCA-CET.',
      description: 'Industry-geared program focusing on Full Stack Web Architecture, Cloud Deployments, Microservices, and Mobile Apps.',
      curriculum: [
        'Sem 1: Advanced Java, Python & Web Technologies, RDBMS, Software Engineering',
        'Sem 2: Cloud Computing, DevOps & CI/CD, Enterprise Frameworks (Spring / React)',
        'Sem 3: AI & Machine Learning, Mobile Computing, Agile Project Management',
        'Sem 4: Full 6-Month Industry Live Internship & Project Defense'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Full Stack Developer, Cloud Solutions Architect, DevOps Engineer',
      isActive: true
    },
    {
      departmentCode: 'CS',
      title: 'Ph.D. in Computer Engineering & Technology',
      degree: 'Doctoral (Ph.D.)',
      duration: '3 to 5 Years',
      intake: 10,
      eligibility: 'Master Degree in relevant discipline with min 55% marks + Valid PET / GATE / NET qualification.',
      description: 'Doctoral research center affiliated with University research council. Focus areas include AI ethics, Quantum Cryptography, and Edge IoT.',
      curriculum: [
        'Coursework: Advanced Research Methodology, Quantitative Data Techniques, Domain Elective',
        'Comprehensive Viva & Research Proposal Defense',
        'Annual Progress Review Seminars and High-Impact IEEE/Scopus Journal Publications',
        'Final Thesis Submission & Open Defense'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Chief Scientist, University Professor, R&D Lab Director',
      isActive: true
    }
  ];

  if ((await db.Course.countDocuments()) === 0) {
    for (const c of courses) await db.Course.create(c);
  }

  // 8. Faculty
  const facultyList = [
    {
      departmentCode: 'CS',
      name: 'Dr. Vivek V. Joshi',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (IIT Bombay), M.Tech (Computer Engg)',
      experienceYears: 22,
      email: 'vvjoshi@apex-inst.edu',
      phone: '+91 253 251 2810',
      bio: 'Author of 48 international journal papers and 3 patents in Distributed Cloud Systems and Fault-Tolerant Computing.',
      researchAreas: 'Distributed Systems, Cloud Architecture, Fault Tolerance',
      publicationsCount: 48,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      departmentCode: 'CS',
      name: 'Prof. Anita S. Kulkarni',
      designation: 'Associate Professor',
      qualification: 'Ph.D. (Pursuing), M.E. (Computer Engg)',
      experienceYears: 17,
      email: 'askulkarni@apex-inst.edu',
      phone: '+91 253 251 2811',
      bio: 'Specialist in Software Engineering metrics, Object Oriented design patterns, and Agile pedagogies.',
      researchAreas: 'Software Architecture, Code Optimization, Agile Methods',
      publicationsCount: 24,
      imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      departmentCode: 'AIDS',
      name: 'Dr. Sunita K. Pathak',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (IISc Bangalore), M.Tech (AI & Robotics)',
      experienceYears: 19,
      email: 'skpathak@apex-inst.edu',
      phone: '+91 253 251 2812',
      bio: 'Recipient of IEEE Best Researcher Award for work in Deep Convolutional Networks for Medical Image Diagnostics.',
      researchAreas: 'Deep Learning, Medical Imaging, Generative Models',
      publicationsCount: 56,
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      departmentCode: 'AIDS',
      name: 'Dr. Anand M. Bapat',
      designation: 'Associate Professor',
      qualification: 'Ph.D. (SPPU Pune), M.Tech',
      experienceYears: 14,
      email: 'ambapat@apex-inst.edu',
      phone: '+91 253 251 2813',
      bio: 'Investigator on DST-funded Natural Language Processing project for regional Indian languages.',
      researchAreas: 'NLP, Large Language Models, Computational Linguistics',
      publicationsCount: 32,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      departmentCode: 'ENTC',
      name: 'Dr. Ramesh B. Patil',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (VNIT Nagpur), M.Tech (VLSI & Microelectronics)',
      experienceYears: 25,
      email: 'rbpatil@apex-inst.edu',
      phone: '+91 253 251 2814',
      bio: 'Consultant to leading semiconductor design houses on low-power CMOS and ASIC synthesis.',
      researchAreas: 'VLSI Systems, Embedded IoT, RF Transceivers',
      publicationsCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      departmentCode: 'MECH',
      name: 'Dr. Prakash S. Shinde',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (COEP Pune), M.E. (Automobile Engg)',
      experienceYears: 23,
      email: 'psshinde@apex-inst.edu',
      phone: '+91 253 251 2815',
      bio: 'Faculty mentor for the university national champion BAJA SAE vehicle team for 8 consecutive years.',
      researchAreas: 'Vehicle Dynamics, Thermal Engineering, Mechatronics',
      publicationsCount: 38,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true
    }
  ];

  if ((await db.Faculty.countDocuments()) === 0) {
    for (const f of facultyList) await db.Faculty.create(f);
  }

  // 9. Admissions & Fees Info
  const admissionsData = [
    {
      category: 'Admission Process',
      stepNumber: 1,
      title: 'Online Application & Registration',
      description: 'Register on the Central Admission Process (CAP) portal or the Institute Level Application portal. Upload academic transcripts, photo, and entrance scorecard.',
      deadline: 'May 31, 2026',
      eligibilityCriteria: 'Passed 10+2 with Physics and Mathematics as compulsory subjects alongside Chemistry/CS.',
      requiredDocuments: '10th & 12th Marksheets, Entrance Exam Scorecard (MHT-CET / JEE), Leaving Certificate, Domicile/Nationality Certificate.',
      feeAnnual: '₹1,25,000 per year (Tuition + Development)',
      applicationUrl: '#apply-online',
      sortOrder: 1,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 2,
      title: 'Document Verification & Merit List',
      description: 'Physical or e-scrutiny verification of uploaded credentials at the designated facilitation center. Publication of provisional and final state/institute merit lists.',
      deadline: 'June 15, 2026',
      eligibilityCriteria: 'Clear verification of caste/category certificates if claiming reservations.',
      requiredDocuments: 'Original documents verification + 2 sets of attested photocopies.',
      feeAnnual: 'N/A',
      applicationUrl: '#merit-list',
      sortOrder: 2,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 3,
      title: 'Option Form Filling & Seat Allotment',
      description: 'Submit institutional preference choices during CAP Round I, II, and III. Check allotment status and freeze/float options.',
      deadline: 'June 30, 2026',
      eligibilityCriteria: 'Valid CAP enrollment pin and merit rank.',
      requiredDocuments: 'Seat Allotment Letter, Provisional Admission Receipt.',
      feeAnnual: 'Seat Acceptance Fee: ₹1,000 (Govt Portal)',
      applicationUrl: '#cap-rounds',
      sortOrder: 3,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 4,
      title: 'Reporting to Campus & Enrollment Confirmation',
      description: 'Report in person to the Apex Campus Admission Cell with original certificates and fee payment demand draft or net banking receipt.',
      deadline: 'July 15, 2026',
      eligibilityCriteria: 'Allotted seat in CAP or approved institutional quota selection.',
      requiredDocuments: 'Medical Fitness Certificate, Migration Certificate (if from outside state board), 5 Passport Photos.',
      feeAnnual: '₹1,25,000 (Open Category) / ₹15,000 (SC/ST Govt Scholarship)',
      applicationUrl: '#campus-reporting',
      sortOrder: 4,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 1,
      title: 'B.Tech Engineering (Open / General Category)',
      description: 'Approved by State Fee Regulating Authority (FRA). Inclusive of tuition, computer lab fees, gymkhana, library, and development fund.',
      deadline: 'Annual / Semester installments',
      eligibilityCriteria: 'Open category students',
      requiredDocuments: 'Income Certificate (for EBC concession eligibility)',
      feeAnnual: '₹1,25,000 per academic year',
      applicationUrl: '#fee-details',
      sortOrder: 5,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 2,
      title: 'B.Tech Engineering (OBC / EBC / EWS Reserved)',
      description: '50% tuition fee concession under Maharashtra State Rajarshi Shahu Maharaj Shikshan Shulk Yojna.',
      deadline: 'Annual / Semester installments',
      eligibilityCriteria: 'Family income < ₹8,00,000 with valid income certificate',
      requiredDocuments: 'Income Certificate issued by Tahsildar, Non-Creamy Layer Certificate',
      feeAnnual: '₹68,500 per academic year',
      applicationUrl: '#fee-details',
      sortOrder: 6,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 3,
      title: 'M.Tech / Post Graduate Courses',
      description: 'Approved annual fees for two-year master degree programs. GATE scholarship of ₹12,400/month applicable for qualified candidates.',
      deadline: 'Per Semester / Annual',
      eligibilityCriteria: 'Valid B.Tech degree with 50% aggregate',
      requiredDocuments: 'Degree Certificate, GATE Scorecard',
      feeAnnual: '₹95,000 per academic year',
      applicationUrl: '#fee-details',
      sortOrder: 7,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 4,
      title: 'Master of Business Administration (MBA)',
      description: 'Two-year management program fee covering case study licenses, enterprise software training, and industrial immersion.',
      deadline: 'Per Semester / Annual',
      eligibilityCriteria: 'Graduate in any discipline + MBA CET / CAT',
      requiredDocuments: 'Graduation Marksheets, CET Scorecard',
      feeAnnual: '₹1,10,000 per academic year',
      applicationUrl: '#fee-details',
      sortOrder: 8,
      status: 'published'
    }
  ];

  if ((await db.Admission.countDocuments()) === 0) {
    for (const a of admissionsData) await db.Admission.create(a);
  }

  // 10. Placements
  const placements = [
    {
      academicYear: '2024-25',
      totalStudents: 840,
      placedStudents: 806,
      placementRate: 95.95,
      highestPackage: '₹44.20 LPA',
      averagePackage: '₹8.65 LPA',
      medianPackage: '₹7.20 LPA',
      totalOffers: 1120,
      topSectors: { 'Cloud & IT Services': 45, 'Product Engineering': 25, 'Electronics & VLSI': 15, 'Core Manufacturing': 10, 'Fintech & Analytics': 5 },
      isActive: true
    },
    {
      academicYear: '2023-24',
      totalStudents: 810,
      placedStudents: 765,
      placementRate: 94.44,
      highestPackage: '₹38.50 LPA',
      averagePackage: '₹7.90 LPA',
      medianPackage: '₹6.80 LPA',
      totalOffers: 980,
      topSectors: { 'Cloud & IT Services': 48, 'Product Engineering': 22, 'Electronics & VLSI': 14, 'Core Manufacturing': 11, 'Fintech & Analytics': 5 },
      isActive: true
    },
    {
      academicYear: '2022-23',
      totalStudents: 760,
      placedStudents: 712,
      placementRate: 93.68,
      highestPackage: '₹32.00 LPA',
      averagePackage: '₹7.25 LPA',
      medianPackage: '₹6.20 LPA',
      totalOffers: 890,
      topSectors: { 'Cloud & IT Services': 50, 'Product Engineering': 20, 'Electronics & VLSI': 12, 'Core Manufacturing': 12, 'Fintech & Analytics': 6 },
      isActive: true
    }
  ];

  if ((await db.Placement.countDocuments()) === 0) {
    for (const p of placements) await db.Placement.create(p);
  }

  // 11. Recruiters
  const recruiters = [
    { name: 'Microsoft', tier: 'Tier-1 Marquee', category: 'Product Tech', logoUrl: 'https://cdn.simpleicons.org/microsoft/00A4EF', highestOffer: '₹44.20 LPA', isMarquee: true, sortOrder: 1 },
    { name: 'Amazon', tier: 'Tier-1 Marquee', category: 'E-commerce & Cloud', logoUrl: 'https://cdn.simpleicons.org/amazon/FF9900', highestOffer: '₹36.00 LPA', isMarquee: true, sortOrder: 2 },
    { name: 'NVIDIA', tier: 'Tier-1 Marquee', category: 'Semiconductors & AI', logoUrl: 'https://cdn.simpleicons.org/nvidia/76B900', highestOffer: '₹32.00 LPA', isMarquee: true, sortOrder: 3 },
    { name: 'Siemens', tier: 'Core Engineering', category: 'Automation & Energy', logoUrl: 'https://cdn.simpleicons.org/siemens/00646E', highestOffer: '₹14.50 LPA', isMarquee: true, sortOrder: 4 },
    { name: 'Larsen & Toubro (L&T)', tier: 'Core Engineering', category: 'Engineering & Construction', logoUrl: 'https://cdn.simpleicons.org/landrover/005A36', highestOffer: '₹12.00 LPA', isMarquee: true, sortOrder: 5 },
    { name: 'Tata Consultancy Services', tier: 'IT Consulting', category: 'IT Services & Digital', logoUrl: 'https://cdn.simpleicons.org/tata/005A9C', highestOffer: '₹9.00 LPA', isMarquee: true, sortOrder: 6 },
    { name: 'Infosys', tier: 'IT Consulting', category: 'IT Services & Cloud', logoUrl: 'https://cdn.simpleicons.org/infosys/007CC3', highestOffer: '₹9.50 LPA', isMarquee: true, sortOrder: 7 },
    { name: 'Capgemini', tier: 'IT Consulting', category: 'Technology Services', logoUrl: 'https://cdn.simpleicons.org/capgemini/0070AD', highestOffer: '₹8.50 LPA', isMarquee: true, sortOrder: 8 },
    { name: 'Bosch Global', tier: 'Automotive & IoT', category: 'Mobility & Engineering', logoUrl: 'https://cdn.simpleicons.org/bosch/EA001E', highestOffer: '₹14.00 LPA', isMarquee: true, sortOrder: 9 },
    { name: 'Cisco Systems', tier: 'Tier-1 Marquee', category: 'Networking & Security', logoUrl: 'https://cdn.simpleicons.org/cisco/1BA0D7', highestOffer: '₹28.00 LPA', isMarquee: true, sortOrder: 10 },
    { name: 'Barclays', tier: 'Fintech & Banking', category: 'Financial Tech', logoUrl: 'https://cdn.simpleicons.org/barclays/00AEEF', highestOffer: '₹15.50 LPA', isMarquee: true, sortOrder: 11 },
    { name: 'Persistent Systems', tier: 'Product Engineering', category: 'Digital Transformation', logoUrl: 'https://cdn.simpleicons.org/producthunt/DA552F', highestOffer: '₹10.50 LPA', isMarquee: true, sortOrder: 12 }
  ];

  if ((await db.Recruiter.countDocuments()) === 0) {
    for (const r of recruiters) await db.Recruiter.create(r);
  }

  // 12. Facilities
  const facilities = [
    {
      name: 'Dr. A.P.J. Abdul Kalam Central Knowledge Center (Library)',
      category: 'Academic Resource',
      shortDesc: 'Over 85,000 printed volumes, IEEE, Springer, ACM e-journals, and a 24x7 digital reading wing.',
      detailedDesc: 'Spanning across 25,000 sq.ft., the Central Library features RFID book circulation, air-conditioned multimedia learning carrels, automated plagiarism checking tools, and institutional repository access.',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      specifications: { volumes: '85,000+', eJournals: '12,000+', capacity: '650 Seats', wifi: 'Gigabit LAN & WiFi 6' },
      timings: 'Monday - Saturday: 07:30 AM to 11:00 PM (24x7 during exams)',
      location: 'Central Academic Block, 2nd Floor',
      sortOrder: 1,
      isActive: true
    },
    {
      name: 'High-Performance Supercomputing & AI Innovation Lab',
      category: 'Research & Labs',
      shortDesc: 'Equipped with NVIDIA DGX A100 GPU clusters and 10Gbps dedicated fiber backhaul for neural network training.',
      detailedDesc: 'Built in collaboration with leading technology partners, this laboratory supports complex simulations in computational fluid dynamics, deep neural networks, and autonomous robotics.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      specifications: { compute: 'NVIDIA DGX A100', nodes: '48 Nodes Cluster', storage: '200 TB High-speed NVMe' },
      timings: '08:00 AM to 08:00 PM',
      location: 'Technology Block B, Ground Floor',
      sortOrder: 2,
      isActive: true
    },
    {
      name: 'Sir Visvesvaraya Advanced Manufacturing Workshop',
      category: 'Workshops & Labs',
      shortDesc: '5-Axis CNC Milling machines, Wire-cut EDM, 3D additive printing suites, and automated laser cutting.',
      detailedDesc: 'Empowers student engineering teams (including Formula Student BAJA/SUPRA) to design, prototype, and manufacture custom mechanical components on-campus.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      specifications: { machines: '5-Axis CNC, Wire EDM, 3D Printers', area: '18,000 sq.ft.', certified: 'ISO 9001:2015' },
      timings: '08:30 AM to 06:30 PM',
      location: 'Mechanical Workshop Complex',
      sortOrder: 3,
      isActive: true
    },
    {
      name: 'Olympic-Standard Sports Complex & Gymnasium',
      category: 'Sports & Health',
      shortDesc: 'Floodlit 400m synthetic athletic track, football ground, basketball courts, and modern indoor gym.',
      detailedDesc: 'Apex Institute fosters all-round development with professional coaches for cricket, football, basketball, badminton, table tennis, and yoga.',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      specifications: { track: '400m 8-Lane Synthetic', gym: 'Fully Air-conditioned 4,000 sq.ft.', sports: 'Cricket, Football, Basketball, Tennis' },
      timings: '06:00 AM to 09:00 AM & 04:30 PM to 08:30 PM',
      location: 'South Campus Sports Arena',
      sortOrder: 4,
      isActive: true
    },
    {
      name: 'On-Campus Student Residential Hostels (Boys & Girls)',
      category: 'Residential Living',
      shortDesc: 'Modern twin & triple sharing furnished rooms, high-speed Wi-Fi, biometric security, and hygienic dining mess.',
      detailedDesc: 'Separate gated hostels for boys and girls with 24/7 CCTV surveillance, resident wardens, solar water heaters, study lounges, and medical clinic on call.',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      specifications: { capacity: '1,800 Residents', rooms: 'Furnished AC / Non-AC', mess: 'Hygienic Pure Veg & Multicuisine' },
      timings: '24 Hours (Gate curfew: 09:30 PM)',
      location: 'North Residential Campus',
      sortOrder: 5,
      isActive: true
    },
    {
      name: 'Rabindranath Tagore Multi-Purpose Auditorium',
      category: 'Cultural & Events',
      shortDesc: 'Acoustically engineered 1,200 seat auditorium with 4K digital projection and surround audio.',
      detailedDesc: 'The center stage for national conferences, university convocations, corporate leadership seminars, and annual cultural celebrations.',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      specifications: { seating: '1,200 Auditorium Seats', stage: 'Motorized Stage & Light Truss', av: 'Dolby Surround & 4K Projection' },
      timings: 'Event Based',
      location: 'Administrative Block A',
      sortOrder: 6,
      isActive: true
    }
  ];

  if ((await db.Facility.countDocuments()) === 0) {
    for (const f of facilities) await db.Facility.create(f);
  }

  // 13. Testimonials
  const testimonials = [
    {
      studentName: 'Priyanka N. Deshmukh',
      course: 'B.Tech in Computer Engineering',
      graduationYear: 'Class of 2024',
      currentRole: 'Software Development Engineer II',
      company: 'Microsoft, Redmond',
      quote: 'The rigorous algorithm labs, hackathon culture, and mentorship from professors at Apex gave me the technical confidence to clear competitive global software interviews seamlessly.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      studentName: 'Aditya S. Kulkarni',
      course: 'B.Tech in Mechanical Engineering',
      graduationYear: 'Class of 2023',
      currentRole: 'EV Powertrain Design Lead',
      company: 'Tata Motors EV Tech',
      quote: 'Working on the SAE BAJA buggy in the campus workshop until midnight taught me more about hands-on mechanics, team leadership, and design resilience than any textbook alone could.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      studentName: 'Sneha R. Patil',
      course: 'B.Tech in AI & Data Science',
      graduationYear: 'Class of 2025',
      currentRole: 'Machine Learning Engineer',
      company: 'NVIDIA AI Lab',
      quote: 'Apex provided direct access to NVIDIA DGX clusters and high-impact industry research projects from our third year. It transformed my engineering career completely.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      sortOrder: 3,
      isActive: true
    }
  ];

  if ((await db.Testimonial.countDocuments()) === 0) {
    for (const t of testimonials) await db.Testimonial.create(t);
  }

  // 14. Leadership
  const leadership = [
    {
      name: 'Hon. Balasaheb D. Wagh',
      roleTitle: 'President & Founder Visionary',
      designationBadge: 'Governing Council',
      message: 'Education is not merely the acquisition of degrees; it is the empowerment of human intellect to solve national challenges and uplift society with moral integrity.',
      quote: 'Dedication to truth, discipline, and technological innovation.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      qualifications: 'B.E., M.S., Philanthropist and Educationist',
      sortOrder: 1,
      isActive: true
    },
    {
      name: 'Dr. Keshav N. Nandurkar',
      roleTitle: 'Director & Principal',
      designationBadge: 'Executive Academic Head',
      message: 'Welcome to Apex Institute. For over forty years, we have nurtured engineering graduates who lead multinational technology firms, launch deep-tech startups, and advance fundamental research. Our autonomous status empowers us to continuously refresh our curriculum in consultation with world-leading industry partners.',
      quote: 'Excellence in engineering education through industry-led experiential learning.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      qualifications: 'Ph.D. (IIT Roorkee), M.Tech (Production Engg), Fellow IEI',
      sortOrder: 2,
      isActive: true
    },
    {
      name: 'Prof. Ajinkya B. Wagh',
      roleTitle: 'Trustee & Head of Strategic Initiatives',
      designationBadge: 'Board of Trustees',
      message: 'Our ongoing investments in high-performance computing, clean green campus infrastructure, and global university partnerships ensure our students compete at the highest international standards.',
      quote: 'Building world-class learning infrastructure for future generations.',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      qualifications: 'M.B.A. (USA), B.Tech (Electronics)',
      sortOrder: 3,
      isActive: true
    }
  ];

  if ((await db.Leadership.countDocuments()) === 0) {
    for (const l of leadership) await db.Leadership.create(l);
  }

  // 15. Notices
  const notices = [
    {
      title: 'First Year B.Tech & Direct Second Year Admission Notification 2026-27',
      category: 'Admissions',
      publishedDate: '2026-04-10',
      expiryDate: '2026-06-30',
      attachmentUrl: '#download-admission-brochure',
      isPinned: true,
      isNewNotice: true,
      status: 'published',
      content: 'Detailed schedule of Institute Level Quota counseling rounds, eligibility norms, and application link for academic year 2026-27.'
    },
    {
      title: 'End-Semester Theory & Practical Examination Time Table (Summer 2026)',
      category: 'Examinations',
      publishedDate: '2026-04-05',
      expiryDate: '2026-05-25',
      attachmentUrl: '#exam-timetable-summer-2026',
      isPinned: true,
      isNewNotice: true,
      status: 'published',
      content: 'Final schedule for Autonomous B.Tech (Sem IV, VI, VIII) and PG courses theory examinations commencing from May 12, 2026.'
    },
    {
      title: 'Campus Recruitment Drive by Microsoft & Cisco for Class of 2026',
      category: 'Placements',
      publishedDate: '2026-04-02',
      expiryDate: '2026-04-20',
      attachmentUrl: '#placement-registration-portal',
      isPinned: false,
      isNewNotice: true,
      status: 'published',
      content: 'Eligible 7th-semester students from Computer, AI&DS, and ENTC are instructed to register on the T&P portal before April 18, 2026.'
    },
    {
      title: 'Invitation for Proposals under Institute Seed Research Grant Scheme 2026',
      category: 'Research',
      publishedDate: '2026-03-28',
      expiryDate: '2026-04-30',
      attachmentUrl: '#seed-grant-guidelines',
      isPinned: false,
      isNewNotice: false,
      status: 'published',
      content: 'Faculty and student interdisciplinary research teams can apply for project funding up to ₹3,00,000 per approved prototype.'
    },
    {
      title: 'Hostel Re-Registration and Room Allocation Notice for AY 2026-27',
      category: 'Hostel',
      publishedDate: '2026-03-25',
      expiryDate: '2026-05-15',
      attachmentUrl: '#hostel-reallotment',
      isPinned: false,
      isNewNotice: false,
      status: 'published',
      content: 'Guidelines for hostel seat reservation and clearance of dues for existing senior hostelites.'
    },
    {
      title: 'Annual Alumni Global Conclave 2026 - Registration Open',
      category: 'Alumni',
      publishedDate: '2026-03-20',
      expiryDate: '2026-05-10',
      attachmentUrl: '#alumni-meet-2026',
      isPinned: false,
      isNewNotice: false,
      status: 'published',
      content: 'Welcoming alumni from all batches to reconnect and mentor graduating engineering students.'
    }
  ];

  if ((await db.Notice.countDocuments()) === 0) {
    for (const n of notices) await db.Notice.create(n);
  }

  // 16. Events
  const events = [
    {
      title: 'TECHNO-CREST 2026: National Level Technical Symposium & Hackathon',
      category: 'Technical Fest',
      eventDate: '2026-05-08',
      eventTime: '09:00 AM - 06:00 PM',
      venue: 'Main Campus & Supercomputing Center',
      speaker: 'Chief Technology Officers from Marquee Tech Firms',
      description: '36-hour non-stop hackathon with ₹5,00,000 in cash prizes, paper presentations, robot race competitions, and startup pitch rounds.',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
      registerLink: '#register-technocrest',
      status: 'published',
      isFeatured: true
    },
    {
      title: 'International Conference on AI, Robotics and Sustainable Systems (ICARSS-2026)',
      category: 'International Conference',
      eventDate: '2026-05-22',
      eventTime: '10:00 AM - 05:00 PM',
      venue: 'Rabindranath Tagore Auditorium',
      speaker: 'Prof. David Chen (MIT) & Dr. Radhika Singhania (IIT Delhi)',
      description: 'Scopus-indexed peer-reviewed conference bringing together international scholars to deliberate on AI governance and green manufacturing.',
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
      registerLink: '#register-conference',
      status: 'published',
      isFeatured: true
    },
    {
      title: 'Industry-Academia Leadership Round Table on Semiconductor Design',
      category: 'Industry Conclave',
      eventDate: '2026-06-04',
      eventTime: '11:00 AM - 03:00 PM',
      venue: 'Executive Seminar Hall A',
      speaker: 'Vice Presidents from Siemens EDA & Cadence Systems',
      description: 'Deliberation on indigenous chip design, RISC-V architectures, and curriculum synchronization for the National Semiconductor Mission.',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
      registerLink: '#register-roundtable',
      status: 'published',
      isFeatured: false
    }
  ];

  if ((await db.Event.countDocuments()) === 0) {
    for (const e of events) await db.Event.create(e);
  }

  // 17. News
  const news = [
    {
      title: 'Apex Institute Granted Autonomy Extension with Highest NAAC A++ Grade',
      category: 'Institutional Achievement',
      publishedDate: '2026-04-01',
      summary: 'Peer review committee praises the institute for world-class laboratory infrastructure, high placement ratio, and vibrant startup incubation ecosystem.',
      content: 'The National Assessment and Accreditation Council (NAAC) has awarded Apex Institute the prestigious A++ grade with a CGPA score of 3.65. The autonomous status empowers the college to implement industry 4.0 courses and flexible credit choice systems.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      author: 'Office of the Principal',
      isFeatured: true,
      status: 'published'
    },
    {
      title: 'Student Team "Apex Racing" Wins National SAE BAJA Championship 2026',
      category: 'Student Achievement',
      publishedDate: '2026-03-18',
      summary: 'The all-terrain electric buggy designed and fabricated by mechanical and electrical engineering students bagged 1st prize overall out of 110 national teams.',
      content: 'Demonstrating exceptional vehicle dynamics, endurance, and acceleration, Apex Racing secured first place in the all-India dynamic track trials held at the NATRAX testing facility.',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      author: 'SAE Student Chapter',
      isFeatured: true,
      status: 'published'
    },
    {
      title: 'Research Grant of ₹2.4 Crores Sanctioned by DST for AI in Smart Agriculture',
      category: 'Research Grant',
      publishedDate: '2026-03-05',
      summary: 'Interdisciplinary research team led by Department of AI & Computer Engineering bags major grant for drone-based crop disease diagnosis.',
      content: 'The Department of Science & Technology, Government of India has approved funding for a 3-year collaborative project deployable across rural farming belts.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      author: 'Dean R&D',
      isFeatured: false,
      status: 'published'
    }
  ];

  if ((await db.News.countDocuments()) === 0) {
    for (const n of news) await db.News.create(n);
  }

  // 18. Research & Innovations
  const research = [
    {
      title: 'Autonomous Edge AI System for Micro-Crack Detection in Railway Tracks',
      category: 'Funded Project',
      departmentCode: 'CS',
      investigator: 'Dr. Vivek V. Joshi & Team',
      fundingAgency: 'Ministry of Railways (CRIS)',
      grantAmount: '₹85,00,000',
      publicationDate: '2025-11-15',
      patentNumber: 'IN202521049281A',
      status: 'Active',
      linkUrl: '#research-link-1'
    },
    {
      title: 'High-Efficiency Dual-Rotor Regenerative Braking Architecture for Two-Wheeler EVs',
      category: 'Patent Granted',
      departmentCode: 'MECH',
      investigator: 'Dr. Prakash S. Shinde & Prof. S. R. Darekar',
      fundingAgency: 'Internal Innovation Cell',
      grantAmount: '₹12,00,000',
      publicationDate: '2025-08-20',
      patentNumber: 'PATENT-IN-492810',
      status: 'Granted',
      linkUrl: '#research-link-2'
    },
    {
      title: 'Bio-Derived Nano-Catalyst for Rapid Industrial Wastewater Detoxification',
      category: 'Journal Publication',
      departmentCode: 'CHEMICAL',
      investigator: 'Dr. Vandana S. Mahajan',
      fundingAgency: 'AICTE RPS Scheme',
      grantAmount: '₹18,50,000',
      publicationDate: '2026-01-10',
      patentNumber: 'N/A',
      status: 'Published in Elsevier Clean Tech',
      linkUrl: '#research-link-3'
    }
  ];

  if ((await db.Research.countDocuments()) === 0) {
    for (const r of research) await db.Research.create(r);
  }

  // 19. Gallery
  const gallery = [
    { title: 'Modern Academic Campus Main Facade', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', caption: 'State of the art autonomous engineering campus', sortOrder: 1, isActive: true },
    { title: 'Interactive Learning in Smart Classrooms', category: 'Academics', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', caption: 'Smart interactive digital boards and lecture recording', sortOrder: 2, isActive: true },
    { title: 'NVIDIA AI Supercomputing Lab', category: 'Labs', imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', caption: 'Students training deep neural networks', sortOrder: 3, isActive: true },
    { title: 'Annual Cultural Festival Equinox', category: 'Student Life', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', caption: 'Electrifying musical and dance performances', sortOrder: 4, isActive: true },
    { title: 'SAE BAJA Championship Buggy Testing', category: 'Innovations', imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', caption: 'Fabricated by student engineers in campus workshop', sortOrder: 5, isActive: true },
    { title: 'Central Knowledge Library Reading Wing', category: 'Facilities', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80', caption: '24/7 quiet study carrels and digital repository', sortOrder: 6, isActive: true }
  ];

  if ((await db.Gallery.countDocuments()) === 0) {
    for (const g of gallery) await db.Gallery.create(g);
  }

  // 20. Sample Inquiries
  const inquiries = [
    {
      fullName: 'Tanmay Rahul Joshi',
      email: 'tanmay.joshi@example.com',
      phone: '+91 98230 45812',
      courseInterested: 'B.Tech in Artificial Intelligence & Data Science',
      departmentCode: 'AIDS',
      message: 'I scored 96.4 percentile in MHT-CET 2026. What are the expected cutoff ranks for AI & DS in CAP Round 1?',
      status: 'new'
    },
    {
      fullName: 'Pooja Sanjay Kadam',
      email: 'pooja.kadam@example.com',
      phone: '+91 97654 11234',
      courseInterested: 'Master of Business Administration (MBA)',
      departmentCode: 'MGMT',
      message: 'Requesting information on hostel accommodation for girls and the MBA fee concession process for EBC candidates.',
      status: 'contacted',
      notes: 'Counselor called on April 12. Sent prospectus.'
    }
  ];

  // Only seed sample inquiries when college tenant is first initialized
  const tenantAlreadySeeded = (await db.SiteSetting.countDocuments()) > 0;
  if (!tenantAlreadySeeded && (await db.Inquiry.countDocuments()) === 0) {
    for (const inq of inquiries) await db.Inquiry.create(inq);
  }

  // 21. Core Institutional Pages
  const defaultPages = [
    {
      slug: 'home',
      title: 'Homepage',
      navLabel: 'Home',
      heroTitle: 'Excellence in Engineering & Technological Leadership',
      heroSubtitle: 'Autonomous institution fostering global innovators, cutting-edge research, and top tier career opportunities.',
      heroBadge: 'ESTD 1984',
      heroImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
      content: 'Apex Institute of Engineering & Technology has established itself as one of the premier autonomous educational institutions.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 1
    },
    {
      slug: 'about',
      title: 'About Us',
      navLabel: 'About Us',
      heroTitle: 'Empowering Minds, Advancing Global Innovation',
      heroSubtitle: 'Four decades of academic excellence, multidisciplinary research, and transformative engineering leadership.',
      heroBadge: 'NAAC A++ ACCREDITED',
      heroImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      content: 'Apex Institute was founded with the vision of imparting value-based engineering education and technical proficiency.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 2
    },
    {
      slug: 'leadership',
      title: 'Leadership & Governance',
      navLabel: 'Leadership',
      heroTitle: 'Visionary Academic & Institutional Leadership',
      heroSubtitle: 'Governing board, directorate, and academic council driving institutional prestige and innovation.',
      heroBadge: 'GOVERNANCE',
      heroImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=80',
      content: 'Guided by eminent academicians, industry captains, and educational visionaries.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 3
    },
    {
      slug: 'academics',
      title: 'Academics & Curriculum',
      navLabel: 'Academics',
      heroTitle: 'Autonomous Academic Programs & Degrees',
      heroSubtitle: 'Choice-based credit system, flexible honors, industry minors, and research-integrated curriculum.',
      heroBadge: 'CURRICULUM 2026',
      heroImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      content: 'Undergraduate, Postgraduate and Doctoral programs accredited by NBA and recognized globally.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 4
    },
    {
      slug: 'departments',
      title: 'Academic Departments',
      navLabel: 'Departments',
      heroTitle: 'World-Class Engineering & Management Disciplines',
      heroSubtitle: 'Dedicated research laboratories, industry Centers of Excellence, and award-winning faculty.',
      heroBadge: 'DEPARTMENTS',
      heroImageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1920&q=80',
      content: 'Explore our 9 specialized departments spanning Computer Science, AI & DS, Electronics, Mechanical, Civil, and Management.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 5
    },
    {
      slug: 'programs',
      title: 'Programs & Degrees',
      navLabel: 'Programs',
      heroTitle: 'Degree Programs & Academic Specializations',
      heroSubtitle: 'Industry-aligned B.Tech, M.Tech, MBA, and Ph.D. programs with interdisciplinary tracks.',
      heroBadge: 'PROGRAMS CATALOG',
      heroImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      content: 'Autonomous curriculum designed with global corporate leaders offering minors, honors, and research projects.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 6
    },
    {
      slug: 'admissions',
      title: 'Admissions & Counseling',
      navLabel: 'Admissions',
      heroTitle: 'Admissions 2026-27 | Launch Your Career',
      heroSubtitle: 'Merit-based central admissions, scholarship assistance, and personalized academic counseling.',
      heroBadge: 'APPLICATIONS OPEN',
      heroImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
      content: 'Step-by-step admission guidelines, eligibility criteria, fee structures, and scholarship options.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 6
    },
    {
      slug: 'placements',
      title: 'Training & Placements',
      navLabel: 'Placements',
      heroTitle: 'Exceptional Placements & Corporate Ties',
      heroSubtitle: '95%+ campus placements, ₹44.5 LPA highest package, and partnerships with Fortune 500 tech leaders.',
      heroBadge: 'CAREER CELL',
      heroImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
      content: 'Dedicated training and placement cell providing pre-placement internships, coding bootcamps, and mock interviews.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 7
    },
    {
      slug: 'campus',
      title: 'Campus & Facilities',
      navLabel: 'Campus',
      heroTitle: 'State-of-the-Art 50-Acre Lush Green Campus',
      heroSubtitle: 'Smart classrooms, advanced innovation incubators, Olympic-size sports complex, and modern hostels.',
      heroBadge: 'CAMPUS LIFE',
      heroImageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1920&q=80',
      content: 'World-class infrastructure designed to foster intellectual curiosity, physical fitness, and holistic wellbeing.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 8
    },
    {
      slug: 'life',
      title: 'Student Life & Clubs',
      navLabel: 'Student Life',
      heroTitle: 'Vibrant Campus Culture & Student Societies',
      heroSubtitle: 'Technical clubs, national fests, Formula Student racing team, robotics, and social outreach chapters.',
      heroBadge: 'STUDENT CLUBS',
      heroImageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80',
      content: 'Over 30 student-led clubs nurturing leadership, teamwork, innovation, and creative arts.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 9
    },
    {
      slug: 'research',
      title: 'Research & Innovation',
      navLabel: 'Research',
      heroTitle: 'Pioneering Research, Patents & Startups',
      heroSubtitle: 'Funded R&D projects from DST, AICTE, ISRO, and industry-sponsored incubators.',
      heroBadge: 'INNOVATION HUB',
      heroImageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1920&q=80',
      content: 'Over ₹12.5 Cr in active research grants, 45+ published patents, and 18 student-led technology startups.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: false,
      sortOrder: 10
    },
    {
      slug: 'gallery',
      title: 'Campus Gallery & Media',
      navLabel: 'Gallery',
      heroTitle: 'Visual Tour of Apex Institutional Campus',
      heroSubtitle: 'Explore moments of academic celebration, campus fests, modern labs, and student achievements.',
      heroBadge: 'PHOTO ARCHIVE',
      heroImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
      content: 'High-resolution photo galleries capturing the essence of our vibrant university environment.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: false,
      sortOrder: 11
    },
    {
      slug: 'news',
      title: 'News, Circulars & Events',
      navLabel: 'News & Notices',
      heroTitle: 'Institutional Announcements & Upcoming Events',
      heroSubtitle: 'Real-time notifications from the Controller of Examinations and academic departments.',
      heroBadge: 'OFFICIAL NOTICES',
      heroImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1920&q=80',
      content: 'Stay updated with examination circulars, timetable schedules, conferences, and student achievements.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 12
    },
    {
      slug: 'contact',
      title: 'Contact Us & Campus Tour',
      navLabel: 'Contact',
      heroTitle: 'Connect with Campus Admissions & Administration',
      heroSubtitle: 'Plan your campus visit, reach academic counselors, or connect with our administrative offices.',
      heroBadge: 'CAMPUS HELPDESK',
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      content: 'Admissions counseling cell, principal office, placement cell, and official contact directories.',
      showInHeader: true,
      showInFooter: true,
      isActive: true,
      isSystem: true,
      sortOrder: 13
    }
  ];

  if ((await db.Page.countDocuments()) === 0) {
    for (const p of defaultPages) await db.Page.create(p);
  }

  // 22. Sample Subsections
  const sampleSubsections = [
    {
      pageSlug: 'about',
      title: 'Our Vision & Institutional Mission',
      subtitle: 'Guiding Principles for Academic & Ethical Distinction',
      badge: 'CORE VALUES',
      layoutType: 'split_content',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      content: 'To produce socially committed, technologically superior engineers equipped to address emergent challenges in artificial intelligence, sustainable energy, and digital infrastructure.',
      ctaText: 'View Institutional Bylaws',
      ctaLink: '#about',
      isVisible: true,
      sortOrder: 1
    },
    {
      pageSlug: 'about',
      title: 'Autonomous Academic Freedom & Accreditation',
      subtitle: 'Highest Grades by NAAC and NBA Accredited Streams',
      badge: 'ACCREDITATIONS',
      layoutType: 'card_grid',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      content: 'Granted autonomous status by UGC, enabling rapid curriculum modernization aligned directly with IEEE standards and industry feedback.',
      ctaText: 'Download NAAC Certificate',
      ctaLink: '#about',
      isVisible: true,
      sortOrder: 2
    },
    {
      pageSlug: 'research',
      title: 'Center for AI & Cyber-Physical Systems',
      subtitle: 'Multi-GPU Supercomputing Facility & IoT Testbed',
      badge: 'ADVANCED LAB',
      layoutType: 'split_content',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      content: 'Equipped with NVIDIA DGX systems, edge AI testbeds, and autonomous robotics platforms supported by state grants.',
      ctaText: 'Explore Funded Projects',
      ctaLink: '#research',
      isVisible: true,
      sortOrder: 1
    },
    {
      pageSlug: 'research',
      title: 'Intellectual Property & Patents Portfolio',
      subtitle: 'Transforming Academic Discoveries into Commercial Patents',
      badge: 'INNOVATION',
      layoutType: 'card_grid',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
      content: 'Over 45 patents published across renewable energy storage, deep learning diagnostic models, and composite materials.',
      ctaText: 'Browse Patent Directory',
      ctaLink: '#research',
      isVisible: true,
      sortOrder: 2
    },
    {
      pageSlug: 'admissions',
      title: 'Merit Scholarships & Financial Assistance',
      subtitle: 'Empowering Meritorious & Underprivileged Students',
      badge: 'FINANCIAL AID',
      layoutType: 'split_content',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      content: 'Over ₹2.5 Crore awarded annually in merit-cum-means scholarships, fee waivers for state toppers, and defense personnel wards.',
      ctaText: 'Check Eligibility Criteria',
      ctaLink: '#admissions',
      isVisible: true,
      sortOrder: 1
    },
    {
      pageSlug: 'life',
      title: 'Formula Student & Automotive Racing Club',
      subtitle: 'Design, Fabricate & Race Electric Prototype Cars',
      badge: 'STUDENT CLUB',
      layoutType: 'split_content',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      content: 'Our team Velocity Racing competes at Buddh International Circuit, consistently ranking in top 5 national electric prototype divisions.',
      ctaText: 'Join Velocity Racing',
      ctaLink: '#life',
      isVisible: true,
      sortOrder: 1
    }
  ];

  if ((await db.Subsection.countDocuments()) === 0) {
    for (const sub of sampleSubsections) await db.Subsection.create(sub);
  }

  // 21. Audit Log
  await db.AuditLog.create({
    username: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'database',
    entityId: 'all',
    details: 'System seeded with full institutional database structure',
    ipAddress: '127.0.0.1'
  });

    console.log('[Seed] Database populated successfully! All collections ready.');
    return { success: true, tenantId };
  });
}

if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
