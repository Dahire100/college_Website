require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, connectDB } = require('./db');

async function upgradeBenchmarkData() {
  console.log('[Benchmark Upgrade] Connecting to MongoDB Atlas...');
  await connectDB();

  // 1. Upgrade Site Settings
  console.log('[Benchmark Upgrade] Updating Site Settings for Pune / Maharashtra University Benchmark...');
  const settings = [
    { key: 'college_name', value: 'Vishwakarma Institute of Technology (VIT Pune)', group: 'general', label: 'College / University Name' },
    { key: 'college_tagline', value: 'Autonomous Institute Affiliated to Savitribai Phule Pune University (SPPU) | Approved by AICTE, New Delhi | DTE Code: 6277', group: 'general', label: 'Institutional Tagline' },
    { key: 'college_short_name', value: 'VIT Pune', group: 'general', label: 'Short Abbreviation' },
    { key: 'college_est', value: '1983', group: 'general', label: 'Established Year' },
    { key: 'affiliation', value: 'Autonomous Institute affiliated to Savitribai Phule Pune University (SPPU), Pune', group: 'general', label: 'Affiliation' },
    { key: 'dte_code', value: '6277', group: 'general', label: 'DTE Maharashtra Institute Code' },
    { key: 'accreditation_summary', value: "NAAC 'A++' Grade (CGPA 3.68, Cycle-3) | NBA Tier-1 Accredited Programs | NIRF Ranked Band | UGC Autonomous", group: 'general', label: 'Accreditation Summary' },
    { key: 'contact_phone_primary', value: '+91 20 2420 2180', group: 'contact', label: 'Primary Contact Phone' },
    { key: 'contact_phone_admissions', value: '+91 20 2420 2115', group: 'contact', label: 'Admissions Helpline' },
    { key: 'contact_email_primary', value: 'principal@vit.edu', group: 'contact', label: 'Primary Official Email' },
    { key: 'contact_email_admissions', value: 'admissions@vit.edu', group: 'contact', label: 'Admissions Email' },
    { key: 'contact_email_placements', value: 'tpo@vit.edu', group: 'contact', label: 'Placement Cell Email' },
    { key: 'contact_address', value: '666, Upper Indira Nagar, Bibwewadi, Pune - 411037, Maharashtra, India', group: 'contact', label: 'Campus Address' },
    { key: 'google_maps_embed', value: 'https://maps.google.com/maps?q=Vishwakarma+Institute+of+Technology+Bibwewadi+Pune&t=&z=15&ie=UTF8&iwloc=&output=embed', group: 'contact', label: 'Campus Map Embed' },
    { key: 'social_linkedin', value: 'https://www.linkedin.com/school/vit-pune', group: 'social', label: 'LinkedIn URL' },
    { key: 'social_twitter', value: 'https://twitter.com/vit_pune', group: 'social', label: 'X / Twitter URL' },
    { key: 'social_youtube', value: 'https://www.youtube.com/c/VITPuneOfficial', group: 'social', label: 'YouTube Channel' },
    { key: 'social_instagram', value: 'https://www.instagram.com/vit_pune_official', group: 'social', label: 'Instagram Profile' },
    { key: 'seo_meta_title', value: 'Vishwakarma Institute of Technology (VIT Pune) | Autonomous SPPU Affiliated', group: 'seo', label: 'Default SEO Title' },
    { key: 'seo_meta_description', value: 'Premier Autonomous Engineering Institution in Pune affiliated to SPPU. Offering B.Tech, M.Tech, and Ph.D. programs with NAAC A++ (3.68 CGPA), NBA Tier-1 accreditation, and 98%+ placement track record.', group: 'seo', label: 'Default SEO Meta Description' },
    { key: 'seo_meta_keywords', value: 'VIT Pune, COEP Pune, Engineering admissions Pune, MHT-CET CAP 6277, Savitribai Phule Pune University, Placements, Computer Engineering, AI and Data Science', group: 'seo', label: 'Default SEO Keywords' },
    { key: 'hero_admission_alert', value: 'Maharashtra State CET Cell CAP Round Admissions 2026-27 Open (Choice Code: EN-6277). First Year & Direct Second Year Registrations Active.', group: 'general', label: 'Top Notification Ticker' },
    { key: 'demo_notice_disclaimer', value: 'Academic Institutional Portal modeled after benchmark Maharashtra & National Institutions (VIT Pune, COEP Tech, MIT-WPU, VIT Vellore).', group: 'general', label: 'Footer Disclaimer' }
  ];

  for (const s of settings) {
    const existing = await db.SiteSetting.findOne({ key: s.key });
    if (existing) {
      await db.SiteSetting.updateOne({ key: s.key }, s);
    } else {
      await db.SiteSetting.create(s);
    }
  }

  // 2. Upgrade Hero Banners
  console.log('[Benchmark Upgrade] Updating Hero Banners...');
  await db.Banner.deleteMany({});
  const benchmarkBanners = [
    {
      title: 'Four Decades of Engineering Rigor & Academic Autonomy',
      subtitle: 'Autonomous Institute Affiliated to Savitribai Phule Pune University (SPPU). Accredited with NAAC A++ Grade (CGPA 3.68) and NBA Tier-1 status across all engineering disciplines.',
      badge: 'DTE CODE: 6277 | NAAC A++ (3.68 CGPA) | AUTONOMOUS',
      ctaText: 'Explore B.Tech & M.Tech Degrees',
      ctaLink: '#academics',
      secondaryCtaText: 'Maharashtra CAP Admissions',
      secondaryCtaLink: '#admissions',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      title: 'Unrivaled Placements: ₹54.3 LPA Highest, ₹12.8 LPA Circuit Average',
      subtitle: 'Over 350+ global technology enterprises recruit from our Pune campus annually, including Microsoft, NVIDIA, Amazon, Barclays, Morgan Stanley, Siemens, and Tata Motors.',
      badge: '98.4% PLACEMENT RECORD | 1200+ OFFERS',
      ctaText: 'View 2025-26 Placement Report',
      ctaLink: '#placements',
      secondaryCtaText: 'Marquee Recruiters',
      secondaryCtaLink: '#recruiters',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      title: 'Industry 4.0 Research Centers & Deep-Tech Innovation',
      subtitle: 'NVIDIA Supercomputing AI Lab, Siemens Smart Factory, and Dassault Systèmes 3D Experience Center with ₹14.8+ Crores in sponsored R&D grants from DST-SERB and ISRO.',
      badge: 'AICTE IDEA LAB | 45+ PATENTS FILED',
      ctaText: 'Discover Research Centers',
      ctaLink: '#research',
      secondaryCtaText: 'Pune Campus Tour',
      secondaryCtaLink: '#campus',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 3,
      isActive: true
    },
    {
      title: 'Vibrant Campus Life: Vishwakarandak, MindSpark & Formula Racing',
      subtitle: 'Home to Asia-pacific champion BAJA SAE and Formula Student teams, 45+ active professional student societies (IEEE, ACM, CSI), and western India’s premier national cultural gathering.',
      badge: 'STUDENT LIFE & NATIONAL CHAMPIONS',
      ctaText: 'Explore Student Life & Fests',
      ctaLink: '#life',
      secondaryCtaText: 'Download Prospectus',
      secondaryCtaLink: '#admissions',
      imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&w=1920&q=80',
      sortOrder: 4,
      isActive: true
    }
  ];
  for (const b of benchmarkBanners) {
    await db.Banner.create(b);
  }

  // 3. Upgrade Academic Departments
  console.log('[Benchmark Upgrade] Updating Academic Departments...');
  await db.Department.deleteMany({});
  const benchmarkDepts = [
    {
      code: 'CS',
      name: 'Department of Computer Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Vivek V. Joshi',
      hodImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Blending advanced theoretical foundations with high-throughput distributed systems, cloud computing, cybersecurity, and algorithmic engineering.',
      email: 'cs.hod@vit.edu',
      phone: '+91 20 2420 2181',
      overview: 'Established in 1983, the Department of Computer Engineering is accredited by NBA Tier-1 and recognized as a premier computing hub in Maharashtra with dedicated NVIDIA GPU clusters, ACM & CSI student chapters, and top global alumni.',
      vision: 'To produce ethically grounded, globally competitive computer engineers capable of leading disruptive software innovations.',
      mission: 'Delivering hands-on project-centric learning, state-of-the-art laboratory infrastructure, and collaborative industry research.',
      stats: { intake: 240, faculty: 42, labs: 16, placementRate: '99.2%' },
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
      isActive: true
    },
    {
      code: 'AIDS',
      name: 'Department of Artificial Intelligence & Data Science',
      degreeLevels: 'B.Tech',
      hodName: 'Dr. Sunita K. Pathak',
      hodImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Empowering future engineers with machine intelligence, neural networks, Generative AI, computer vision, and ethical algorithmic governance.',
      email: 'aids.hod@vit.edu',
      phone: '+91 20 2420 2182',
      overview: 'Equipped with dedicated NVIDIA DGX A100 computing clusters and high-speed data science workstations. Focus areas include LLMs, autonomous robotics, medical image diagnostics, and predictive analytics.',
      vision: 'To emerge as a world-class center of machine intelligence and societal analytics.',
      mission: 'Providing interdisciplinary curriculum aligned with top industry frontiers and academic research.',
      stats: { intake: 180, faculty: 26, labs: 10, placementRate: '98.5%' },
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
      isActive: true
    },
    {
      code: 'ENTC',
      name: 'Department of Electronics & Telecommunication Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Ramesh B. Patil',
      hodImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'From 5G/6G wireless communication to Cadence VLSI chip design and embedded micro-architectures, we engineer the physical layer of the future.',
      email: 'entc.hod@vit.edu',
      phone: '+91 20 2420 2183',
      overview: 'NBA Tier-1 accredited with Center of Excellence in IoT, Cadence EDA design suite, Texas Instruments Embedded Systems Lab, and RF anechoic testing chamber.',
      vision: 'Excellence in electronics and telecommunication engineering through applied knowledge and semiconductor industry partnerships.',
      mission: 'Empowering students with hardware-software co-design abilities, VLSI design mastery, and telecommunication protocols.',
      stats: { intake: 180, faculty: 34, labs: 14, placementRate: '96.8%' },
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      sortOrder: 3,
      isActive: true
    },
    {
      code: 'IT',
      name: 'Department of Information Technology',
      degreeLevels: 'B.Tech',
      hodName: 'Dr. Shrikant P. Deshpande',
      hodImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Fostering cloud-native system architects, full-stack engineers, and cybersecurity defenders through real-world enterprise engineering.',
      email: 'it.hod@vit.edu',
      phone: '+91 20 2420 2184',
      overview: 'Specializing in cloud engineering (AWS/GCP/Azure), distributed ledgers, mobile application architectures, and DevOps automated deployment pipelines.',
      vision: 'Producing industry-ready IT specialists driving digital transformation globally.',
      mission: 'Providing modern curriculum, continuous industry certifications, and incubation projects.',
      stats: { intake: 180, faculty: 28, labs: 12, placementRate: '98.8%' },
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      sortOrder: 4,
      isActive: true
    },
    {
      code: 'MECH',
      name: 'Department of Mechanical Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Prakash S. Shinde',
      hodImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Pioneering electric mobility, robotics automation, digital twins, and additive manufacturing alongside core thermal-fluid mechanics.',
      email: 'mech.hod@vit.edu',
      phone: '+91 20 2420 2185',
      overview: 'Features 5-Axis CNC machining centers, 3D printing suites, wind tunnel, Siemens Smart Factory center, and national championship BAJA SAE and Formula Student garages.',
      vision: 'To develop world-class mechanical design engineers and industrial innovators.',
      mission: 'Providing strong analytical foundations, hands-on workshop fabrication, and modern CAD/CAM/CAE tool training.',
      stats: { intake: 180, faculty: 36, labs: 18, placementRate: '94.2%' },
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      sortOrder: 5,
      isActive: true
    },
    {
      code: 'CHEM',
      name: 'Department of Chemical Engineering',
      degreeLevels: 'B.Tech, M.Tech, Ph.D.',
      hodName: 'Dr. Vandana S. Mahajan',
      hodImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Advancing green chemistry, renewable biofuels, sustainable process engineering, membrane separations, and nano-materials.',
      email: 'chem.hod@vit.edu',
      phone: '+91 20 2420 2186',
      overview: 'Equipped with pilot-scale process synthesis units, Aspen Plus process simulation suites, mass transfer distillation towers, and sponsored R&D projects.',
      vision: 'Pioneering clean process engineering and sustainable biochemical technology.',
      mission: 'Promoting process safety, eco-friendly synthesis, and strong chemical industry linkages.',
      stats: { intake: 60, faculty: 18, labs: 11, placementRate: '93.5%' },
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      sortOrder: 6,
      isActive: true
    },
    {
      code: 'INST',
      name: 'Department of Instrumentation & Control Engineering',
      degreeLevels: 'B.Tech, M.Tech',
      hodName: 'Dr. Madhav T. Sonawane',
      hodImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Spearheading industrial automation, SCADA systems, biomedical instrumentation, and sensor networks for Industry 4.0.',
      email: 'inst.hod@vit.edu',
      phone: '+91 20 2420 2187',
      overview: 'NBA Tier-1 accredited program featuring Rockwell Automation Lab, Honeywell DCS setup, Yokogawa PLC training kits, and biomedical testing suites.',
      vision: 'To lead the paradigm of smart automation, cyber-physical systems, and industrial sensing.',
      mission: 'Imparting experiential mastery in control systems, process automation, and intelligent sensors.',
      stats: { intake: 60, faculty: 16, labs: 9, placementRate: '95.0%' },
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      sortOrder: 7,
      isActive: true
    },
    {
      code: 'MGMT',
      name: 'Department of Management Studies (MBA)',
      degreeLevels: 'MBA',
      hodName: 'Dr. Anand K. Kulkarni',
      hodImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      hodMessage: 'Developing visionary business leaders with specialized competencies in Tech Management, Financial Analytics, Supply Chain, and Marketing.',
      email: 'mba.hod@vit.edu',
      phone: '+91 20 2420 2188',
      overview: 'Premier business department featuring Bloomberg-style analytics lab, incubation center, and executive leadership seminars.',
      vision: 'To cultivate entrepreneurial visionaries and agile corporate executives.',
      mission: 'Case-based pedagogy, corporate mentorship, and technology-driven business education.',
      stats: { intake: 120, faculty: 16, labs: 4, placementRate: '95.8%' },
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      sortOrder: 8,
      isActive: true
    }
  ];
  for (const d of benchmarkDepts) {
    await db.Department.create(d);
  }

  // 4. Upgrade Courses & Degrees
  console.log('[Benchmark Upgrade] Updating Courses & Curricula...');
  await db.Course.deleteMany({});
  const benchmarkCourses = [
    {
      departmentCode: 'CS',
      title: 'B.Tech in Computer Engineering',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 240,
      eligibility: '10+2 with Physics, Mathematics, and Chemistry/CS with min 50% marks + Valid MHT-CET 2026 / JEE Main Score (DTE Code: 6277).',
      description: 'Comprehensive curriculum under Autonomous NEP 2020 framework covering Distributed Cloud Architectures, Systems Programming, Deep Algorithms, Cybersecurity, and Compiler Design.',
      curriculum: [
        'Sem 1-2: Computational Thinking in Python & C, Discrete Mathematics, Applied Physics, Digital Electronics',
        'Sem 3-4: Data Structures & Algorithms, Computer Organization, OOP in Java/C++, Database Management Systems',
        'Sem 5-6: Operating Systems, Computer Networks, Software Engineering & Agile, Cloud Architecture',
        'Sem 7-8: Full-Semester Industry Internship, Capstone Engineering Project, Honors / Minor Track Specialization'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Software Development Engineer (SDE), Cloud Architect, Systems Engineer, Cybersecurity Analyst',
      isActive: true
    },
    {
      departmentCode: 'AIDS',
      title: 'B.Tech in Artificial Intelligence & Data Science',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 180,
      eligibility: '10+2 with Physics, Mathematics, and Chemistry/CS with min 50% + MHT-CET / JEE Main (DTE Code: 6277).',
      description: 'Cutting-edge program diving deep into Deep Neural Networks, Natural Language Processing, Computer Vision, Big Data Engineering, and Generative AI.',
      curriculum: [
        'Sem 1-2: Linear Algebra & Matrix Computations, Probability & Statistics, Advanced Python, Applied Electronics',
        'Sem 3-4: Foundations of Machine Learning, Data Structures, Relational & NoSQL Databases, Optimization Techniques',
        'Sem 5-6: Deep Learning & Neural Nets, Computer Vision, Natural Language Processing, Big Data Analytics',
        'Sem 7-8: Generative AI & LLMs, MLOps Automated Pipelines, 6-Month Industry Internship Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'AI Research Engineer, Data Scientist, Machine Learning Ops Architect, Quantitative Analyst',
      isActive: true
    },
    {
      departmentCode: 'ENTC',
      title: 'B.Tech in Electronics & Telecommunication Engineering',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 180,
      eligibility: '10+2 with Physics, Mathematics, Chemistry with min 50% + MHT-CET / JEE Main (DTE Code: 6277).',
      description: 'Premier curriculum spanning Cadence VLSI chip design, FPGA architecture, 5G/6G wireless transceivers, IoT microcontrollers, and embedded RTOS.',
      curriculum: [
        'Sem 1-2: Basic Electrical & Electronics, Engineering Mechanics, Calculus, Workshop Technology',
        'Sem 3-4: Electronic Devices & Circuits, Signals & Systems, Microprocessors ARM/Cortex, Network Analysis',
        'Sem 5-6: Digital Signal Processing, CMOS VLSI Design, Antenna & Microwave Engineering, Embedded Linux',
        'Sem 7-8: 5G Communications, IoT System Architecture, Industry Internship, Capstone Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'VLSI Design Engineer, Semiconductor ASIC Specialist, Embedded Firmware Architect, 5G Network Engineer',
      isActive: true
    },
    {
      departmentCode: 'IT',
      title: 'B.Tech in Information Technology',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 180,
      eligibility: '10+2 with Physics, Mathematics, Chemistry/CS with min 50% + MHT-CET / JEE Main (DTE Code: 6277).',
      description: 'Focuses on enterprise cloud architectures, distributed computing, cyber defense, full stack microservices, and mobile application engineering.',
      curriculum: [
        'Sem 1-2: Programming Fundamentals, Discrete Math, Physics of Semiconductors, Engineering Graphics',
        'Sem 3-4: Data Structures, Web Architectures, Database Systems, Computer Network Protocols',
        'Sem 5-6: Cloud Infrastructure (AWS/Azure), Information Security, DevOps Automation, Mobile App Engineering',
        'Sem 7-8: Distributed Ledgers & Blockchain, Full Semester Industry Placement Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Full Stack Cloud Architect, DevOps Specialist, Information Security Analyst, Enterprise Software Consultant',
      isActive: true
    },
    {
      departmentCode: 'MECH',
      title: 'B.Tech in Mechanical Engineering',
      degree: 'Undergraduate (UG)',
      duration: '4 Years (8 Semesters)',
      intake: 180,
      eligibility: '10+2 with Physics, Mathematics, Chemistry with min 50% + MHT-CET / JEE Main (DTE Code: 6277).',
      description: 'Combines classical mechanics and thermodynamics with modern Electric Vehicle (EV) powertrains, robotics automation, CAD/CAM, and smart additive manufacturing.',
      curriculum: [
        'Sem 1-2: Engineering Graphics, Material Science, Workshop Fabrication, Engineering Mathematics',
        'Sem 3-4: Strength of Materials, Thermodynamics, Fluid Dynamics, Kinematics & Dynamics of Machines',
        'Sem 5-6: Heat & Mass Transfer, Mechatronics, CAD/CAM/CAE Simulation, EV Powertrain Dynamics',
        'Sem 7-8: Industrial Robotics, Renewable Energy Systems, Industry Internship, SAE Vehicle Project'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Automotive Design Engineer, EV Systems Specialist, Robotics Automation Engineer, Thermal Systems Analyst',
      isActive: true
    },
    {
      departmentCode: 'CS',
      title: 'M.Tech in Computer Engineering',
      degree: 'Postgraduate (PG)',
      duration: '2 Years (4 Semesters)',
      intake: 24,
      eligibility: 'B.E./B.Tech in Computer/IT/Electronics with min 50% + Valid GATE Score (SPPU Affiliated).',
      description: 'Advanced postgraduate research program focusing on High Performance Supercomputing, Deep Neural Networks, and Distributed Consensus Algorithms.',
      curriculum: [
        'Sem 1: Advanced Algorithms, High Performance Parallel Architecture, Research Methodology',
        'Sem 2: Cloud Native Distributed Systems, Deep Learning Frontiers, Domain Electives',
        'Sem 3: Dissertation Phase I, Research Publication in IEEE/Scopus Journals',
        'Sem 4: Dissertation Phase II, Open Defense and Industrial Tech Transfer'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Senior Systems Architect, Principal Research Scientist, High Performance Computing Engineer',
      isActive: true
    },
    {
      departmentCode: 'CS',
      title: 'Ph.D. in Computer Engineering & Technology',
      degree: 'Doctoral (Ph.D.)',
      duration: '3 to 5 Years',
      intake: 12,
      eligibility: 'Master Degree in relevant discipline with min 55% marks + Valid SPPU PET / GATE / UGC-NET.',
      description: 'Recognized Research Center under Savitribai Phule Pune University (SPPU). Focus areas include Trustworthy AI, Quantum Cryptography, and Edge Computing.',
      curriculum: [
        'Coursework: Advanced Research Methodology, Quantitative Data Analytics, Research Ethics',
        'Research Proposal Defense & Comprehensive Oral Examination',
        'Annual Progress Reviews & Peer-Reviewed High Impact Scopus Journal Publications',
        'Final Doctoral Thesis Submission & Open Defense'
      ],
      syllabusUrl: '#syllabus-download',
      careerOpportunities: 'Chief Research Scientist, University Professor, Industrial R&D Director',
      isActive: true
    }
  ];
  for (const c of benchmarkCourses) {
    await db.Course.create(c);
  }

  // 5. Upgrade Admissions & Maharashtra CAP Data
  console.log('[Benchmark Upgrade] Updating Admissions & CAP Rounds Info...');
  await db.Admission.deleteMany({});
  const benchmarkAdmissions = [
    {
      category: 'Admission Process',
      stepNumber: 1,
      title: 'State CET Cell Registration & Choice Filling',
      description: 'Register on the Maharashtra State CET Cell portal (mahacet.org) for Centralized Admission Process (CAP). Select Institute Choice Code: EN-6277 for VIT Pune.',
      deadline: 'June 30, 2026',
      eligibilityCriteria: 'Passed 10+2 with Physics and Mathematics alongside Chemistry/CS with min 50% + Valid MHT-CET 2026 or JEE Main Score.',
      requiredDocuments: 'MHT-CET / JEE Scorecard, 10th & 12th Marksheets, Domicile/Nationality Certificate, Caste/Tribe/EWS Certificate (if applicable).',
      feeAnnual: '₹1,95,000 per year (Open Category approved by FRA Maharashtra)',
      applicationUrl: 'https://cetcell.mahacet.org',
      sortOrder: 1,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 2,
      title: 'Document E-Scrutiny & Merit Rank Allotment',
      description: 'Verification of candidate certificates via online e-scrutiny or physical Scrutiny Centers (SC). Publication of Provisional and Final Maharashtra State General Merit List.',
      deadline: 'July 10, 2026',
      eligibilityCriteria: 'Successful document verification and receipt of Scrutiny Confirmation Acknowledgement.',
      requiredDocuments: 'Original certificates verification + 2 sets of self-attested photocopies.',
      feeAnnual: 'Govt Portal Registration Fee: ₹800 (Open) / ₹600 (Reserved)',
      applicationUrl: '#merit-list',
      sortOrder: 2,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 3,
      title: 'CAP Rounds I, II & III Option Filling & Seat Allocation',
      description: 'Submit institutional branch choices. Check seat allotment result, select Freeze / Float / Slide, and pay the seat acceptance fee on the CET portal.',
      deadline: 'July 25, 2026',
      eligibilityCriteria: 'Allotted seat in CAP Round based on merit rank and category reservation.',
      requiredDocuments: 'Provisional Seat Allotment Letter, Seat Acceptance Receipt.',
      feeAnnual: 'Seat Acceptance Fee: ₹1,000 (State CET Portal)',
      applicationUrl: '#cap-allotment',
      sortOrder: 3,
      status: 'published'
    },
    {
      category: 'Admission Process',
      stepNumber: 4,
      title: 'Reporting to Campus & Enrollment Confirmation',
      description: 'Report to the VIT Pune Admission Cell (Bibwewadi Campus) with original documents and college fee payment via Net Banking, Demand Draft, or UPI.',
      deadline: 'August 05, 2026',
      eligibilityCriteria: 'Allotted candidate in CAP Round or Institute Level Quota.',
      requiredDocuments: 'Transfer/Leaving Certificate, Migration Certificate (other boards), Gap Certificate (if applicable), 5 Passport Photos.',
      feeAnnual: 'As per State Fee Regulating Authority (FRA) guidelines',
      applicationUrl: '#campus-reporting',
      sortOrder: 4,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 1,
      title: 'B.Tech Engineering (Open / General Category)',
      description: 'Tuition and development fees approved by the Fee Regulating Authority (FRA), Govt. of Maharashtra. Inclusive of internet, library, gymkhana, and examination fees.',
      deadline: 'Payable at time of admission',
      eligibilityCriteria: 'Open category candidates admitted through CAP / Institute quota',
      requiredDocuments: 'Admission allotment slip, 12th Marks Memo',
      feeAnnual: '₹1,95,000 per academic year',
      applicationUrl: '#fee-breakup',
      sortOrder: 5,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 2,
      title: 'B.Tech Engineering (OBC / EBC / EWS Reserved)',
      description: '50% tuition fee concession reimbursed under Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Yojna (MahaDBT).',
      deadline: 'Payable at admission + MahaDBT filing',
      eligibilityCriteria: 'Valid Income Certificate < ₹8,00,000 per annum + Non-Creamy Layer / EWS Certificate',
      requiredDocuments: 'Income Certificate by Tahsildar, Non-Creamy Layer, Ration Card',
      feeAnnual: '₹1,07,500 per academic year',
      applicationUrl: '#fee-breakup',
      sortOrder: 6,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 3,
      title: 'B.Tech Engineering (TFWS - Tuition Fee Waiver Scheme)',
      description: '100% tuition fee waiver for top 5% merit candidates across all engineering branches allotted under AICTE TFWS quota.',
      deadline: 'Payable at admission',
      eligibilityCriteria: 'Allotted under TFWS Choice Code in CAP Round with family income < ₹8,00,000',
      requiredDocuments: 'TFWS Allotment Letter, Income Certificate',
      feeAnnual: '₹22,000 per academic year (Development & Other Fees only)',
      applicationUrl: '#fee-breakup',
      sortOrder: 7,
      status: 'published'
    },
    {
      category: 'Fee Structure',
      stepNumber: 4,
      title: 'M.Tech Postgraduate Programs',
      description: 'Approved annual fees for 2-year full-time M.Tech programs. AICTE GATE scholarship of ₹12,400/month disbursed directly to qualified scholars.',
      deadline: 'Per Semester / Annual',
      eligibilityCriteria: 'Graduation in engineering + GATE score',
      requiredDocuments: 'B.Tech Degree Certificate, GATE Scorecard',
      feeAnnual: '₹1,15,000 per academic year',
      applicationUrl: '#fee-breakup',
      sortOrder: 8,
      status: 'published'
    }
  ];
  for (const a of benchmarkAdmissions) {
    await db.Admission.create(a);
  }

  // 6. Upgrade Placements Records
  console.log('[Benchmark Upgrade] Updating Placements Data...');
  await db.Placement.deleteMany({});
  const benchmarkPlacements = [
    {
      academicYear: '2024-25',
      totalStudents: 1050,
      placedStudents: 1033,
      placementRate: 98.38,
      highestPackage: '₹54.30 LPA',
      averagePackage: '₹12.80 LPA',
      medianPackage: '₹10.50 LPA',
      totalOffers: 1420,
      topSectors: { 'Tier-1 Product Tech': 42, 'Fintech & Investment Banking': 22, 'Semiconductors & VLSI': 16, 'Core Engineering & Automotive': 12, 'Cloud & Analytics Consulting': 8 },
      isActive: true
    },
    {
      academicYear: '2023-24',
      totalStudents: 980,
      placedStudents: 954,
      placementRate: 97.35,
      highestPackage: '₹44.20 LPA',
      averagePackage: '₹11.20 LPA',
      medianPackage: '₹9.40 LPA',
      totalOffers: 1280,
      topSectors: { 'Tier-1 Product Tech': 40, 'Fintech & Investment Banking': 20, 'Semiconductors & VLSI': 15, 'Core Engineering & Automotive': 15, 'Cloud & Analytics Consulting': 10 },
      isActive: true
    },
    {
      academicYear: '2022-23',
      totalStudents: 920,
      placedStudents: 888,
      placementRate: 96.52,
      highestPackage: '₹38.50 LPA',
      averagePackage: '₹9.85 LPA',
      medianPackage: '₹8.60 LPA',
      totalOffers: 1140,
      topSectors: { 'Tier-1 Product Tech': 38, 'Fintech & Investment Banking': 18, 'Semiconductors & VLSI': 14, 'Core Engineering & Automotive': 18, 'Cloud & Analytics Consulting': 12 },
      isActive: true
    }
  ];
  for (const p of benchmarkPlacements) {
    await db.Placement.create(p);
  }

  // 7. Upgrade Recruiters
  console.log('[Benchmark Upgrade] Updating Top Recruiters...');
  await db.Recruiter.deleteMany({});
  const benchmarkRecruiters = [
    { name: 'Microsoft', tier: 'Tier-1 Marquee', category: 'Product Tech', logoUrl: 'https://cdn.simpleicons.org/microsoft/00A4EF', highestOffer: '₹54.30 LPA', isMarquee: true, sortOrder: 1 },
    { name: 'NVIDIA', tier: 'Tier-1 Marquee', category: 'Semiconductors & AI', logoUrl: 'https://cdn.simpleicons.org/nvidia/76B900', highestOffer: '₹48.00 LPA', isMarquee: true, sortOrder: 2 },
    { name: 'Amazon', tier: 'Tier-1 Marquee', category: 'Cloud & Systems', logoUrl: 'https://cdn.simpleicons.org/amazon/FF9900', highestOffer: '₹45.00 LPA', isMarquee: true, sortOrder: 3 },
    { name: 'Barclays', tier: 'Tier-1 Marquee', category: 'Investment Banking & Fintech', logoUrl: 'https://cdn.simpleicons.org/barclays/00AEEF', highestOffer: '₹22.50 LPA', isMarquee: true, sortOrder: 4 },
    { name: 'Deutsche Bank', tier: 'Tier-1 Marquee', category: 'Fintech & Risk', logoUrl: 'https://cdn.simpleicons.org/deutschebank/0018A8', highestOffer: '₹21.00 LPA', isMarquee: true, sortOrder: 5 },
    { name: 'Morgan Stanley', tier: 'Tier-1 Marquee', category: 'Quantitative Finance', logoUrl: 'https://cdn.simpleicons.org/morganstanley/002B49', highestOffer: '₹26.00 LPA', isMarquee: true, sortOrder: 6 },
    { name: 'Siemens', tier: 'Core Engineering', category: 'Automation & Energy', logoUrl: 'https://cdn.simpleicons.org/siemens/00646E', highestOffer: '₹16.00 LPA', isMarquee: true, sortOrder: 7 },
    { name: 'Tata Motors', tier: 'Core Engineering', category: 'Automotive & EV Mobility', logoUrl: 'https://cdn.simpleicons.org/tata/005A9C', highestOffer: '₹14.50 LPA', isMarquee: true, sortOrder: 8 },
    { name: 'Larsen & Toubro', tier: 'Core Engineering', category: 'Infrastructure & Heavy Tech', logoUrl: 'https://cdn.simpleicons.org/landrover/005A36', highestOffer: '₹13.50 LPA', isMarquee: true, sortOrder: 9 },
    { name: 'Texas Instruments', tier: 'Tier-1 Marquee', category: 'VLSI & Embedded Systems', logoUrl: 'https://cdn.simpleicons.org/target/CC0000', highestOffer: '₹28.00 LPA', isMarquee: true, sortOrder: 10 },
    { name: 'Veritas Technologies', tier: 'Tier-1 Marquee', category: 'Storage & Data Management', logoUrl: 'https://cdn.simpleicons.org/v/E31B23', highestOffer: '₹18.00 LPA', isMarquee: true, sortOrder: 11 },
    { name: 'Cummins India', tier: 'Core Engineering', category: 'Power & Engine Systems', logoUrl: 'https://cdn.simpleicons.org/c/DA291C', highestOffer: '₹14.00 LPA', isMarquee: true, sortOrder: 12 }
  ];
  for (const r of benchmarkRecruiters) {
    await db.Recruiter.create(r);
  }

  // 8. Upgrade Live Notices
  console.log('[Benchmark Upgrade] Updating Circulars & Notices...');
  await db.Notice.deleteMany({});
  const benchmarkNotices = [
    {
      title: 'Maharashtra State CET Cell CAP Round 2026-27 Schedule Published (Choice Code: EN-6277)',
      category: 'Admissions',
      publishedDate: '2026-05-12',
      isPinned: true,
      description: 'Official schedule for First Year Engineering (B.Tech) and Direct Second Year (DSE) Centralized Admission Process published by State CET Cell Maharashtra. Choice Code for VIT Pune: 6277.',
      attachmentUrl: '#cap-schedule-pdf',
      isActive: true
    },
    {
      title: 'Placements 2025-26 Season Highlights: 1420 Offers, Highest Offer ₹54.3 LPA',
      category: 'Placements',
      publishedDate: '2026-05-10',
      isPinned: true,
      description: 'VIT Pune Training & Placement Cell records extraordinary milestones with over 350 recruiting partners. 24 students placed in super-dream category above ₹30 LPA.',
      attachmentUrl: '#placement-report-pdf',
      isActive: true
    },
    {
      title: 'Autonomous Academic Council Approves 8 New NEP 2020 Minor Degree Tracks',
      category: 'Academics',
      publishedDate: '2026-05-04',
      isPinned: false,
      description: 'Students across all disciplines can now opt for multidisciplinary minor degrees in Artificial Intelligence, Electric Vehicles, Semiconductor VLSI, and Quantitative Finance.',
      attachmentUrl: '#minor-degree-pdf',
      isActive: true
    },
    {
      title: 'Vishwakarandak & Melange 2026: Annual National Tech & Cultural Festival Registrations Open',
      category: 'Student Life',
      publishedDate: '2026-04-28',
      isPinned: false,
      description: 'Western India’s grandest collegiate festival returns with national-level hackathons, Formula Student exhibitions, and inter-collegiate performing arts championships.',
      attachmentUrl: '#melange-schedule-pdf',
      isActive: true
    }
  ];
  for (const n of benchmarkNotices) {
    await db.Notice.create(n);
  }

  console.log('[Benchmark Upgrade] Successfully populated all Pune & National university benchmark records in MongoDB!');
  process.exit(0);
}

upgradeBenchmarkData().catch(err => {
  console.error('[Benchmark Upgrade Error]', err);
  process.exit(1);
});
