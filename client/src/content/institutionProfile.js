const DEFAULT_DEGREES = ['All', 'UG', 'PG', 'Research'];

const PROFILE_PRESETS = {
  college: {
    key: 'college',
    displayName: 'Higher Education Portal',
    shortName: 'College Portal',
    tagline: 'A flexible institutional website for schools, colleges, and professional programs.',
    heroTitle: 'Institutional Portal for Admissions, Academics, and Campus Life',
    heroSubtitle: 'A reusable campus website structure for engineering, pharmacy, school, and multi-college environments.',
    aboutTitle: 'About the Institution',
    aboutSummary: 'A configurable academic portal built for multi-domain institutions, with CMS-managed content and profile-based copy.',
    academicUnitsLabel: 'Schools, Departments, and Cells',
    programsLabel: 'Programs',
    admissionsLabel: 'Admissions',
    placementsLabel: 'Career Support',
    researchLabel: 'Research and Innovation',
    studentLifeLabel: 'Student Life',
    campusLabel: 'Campus and Facilities',
    noticeLabel: 'Notices and Events',
    degreeTabs: DEFAULT_DEGREES,
    inquiryOptions: ['Undergraduate Program', 'Postgraduate Program', 'Research Program', 'Campus Visit'],
    admissionsNote: 'Admissions guidance, eligibility, document flow, and counseling support.',
    stats: {
      breadth: 'Multi-Track',
      support: 'CMS Ready',
      outcomes: 'Student Focused'
    }
  },
  engineering: {
    key: 'engineering',
    displayName: 'Engineering Institute',
    shortName: 'Engineering',
    tagline: 'Technical education, industry readiness, and applied research in a flexible CMS-driven structure.',
    heroTitle: 'Engineering Portal for Admissions, Academics, and Career Outcomes',
    heroSubtitle: 'Built for institutes that need strong departments, placements, research, student life, and admissions content.',
    aboutTitle: 'About the Engineering Institute',
    aboutSummary: 'A campus portal designed for engineering colleges with program pages, department structures, and research content.',
    academicUnitsLabel: 'Departments and Schools',
    programsLabel: 'Engineering Programs',
    admissionsLabel: 'Engineering Admissions',
    placementsLabel: 'Placements',
    researchLabel: 'Research and Innovation',
    studentLifeLabel: 'Student Life',
    campusLabel: 'Campus and Facilities',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'UG', 'PG', 'Research'],
    inquiryOptions: ['B.Tech / UG Program', 'M.Tech / PG Program', 'Research Program', 'Campus Visit'],
    admissionsNote: 'Admission counseling, entrance routes, scholarships, and document verification.',
    stats: {
      breadth: 'Technical',
      support: 'Academics + Research',
      outcomes: 'Industry Ready'
    }
  },
  pharmacy: {
    key: 'pharmacy',
    displayName: 'Pharmacy Institute',
    shortName: 'Pharmacy',
    tagline: 'A clean pharmacy-first portal with programs, admissions, labs, training, and institutional updates.',
    heroTitle: 'Pharmacy Portal for Admissions, Academics, Labs, and Career Paths',
    heroSubtitle: 'Ideal for D.Pharm, B.Pharm, M.Pharm, pharmacy research, and training-focused institutions.',
    aboutTitle: 'About the Pharmacy Institute',
    aboutSummary: 'A CMS-driven website structure suited to pharmacy colleges and health sciences institutions.',
    academicUnitsLabel: 'Schools, Departments, and Units',
    programsLabel: 'Pharmacy Programs',
    admissionsLabel: 'Pharmacy Admissions',
    placementsLabel: 'Training and Placements',
    researchLabel: 'Research and Practice',
    studentLifeLabel: 'Student Activities',
    campusLabel: 'Campus and Laboratories',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'D.Pharm', 'B.Pharm', 'M.Pharm', 'Ph.D.'],
    inquiryOptions: ['D.Pharm Program', 'B.Pharm Program', 'M.Pharm Program', 'Campus Visit'],
    admissionsNote: 'Merit routes, entrance guidance, document flow, and fee support for pharmacy admissions.',
    stats: {
      breadth: 'Pharma Focused',
      support: 'Practice Oriented',
      outcomes: 'Careers and Training'
    }
  },
  school: {
    key: 'school',
    displayName: 'School Portal',
    shortName: 'School',
    tagline: 'A school and junior college portal with admissions, academics, activities, and parent communication.',
    heroTitle: 'School Portal for Admissions, Academics, Activities, and Communication',
    heroSubtitle: 'Designed for school, junior college, and multi-campus education groups with one editable interface.',
    aboutTitle: 'About the School',
    aboutSummary: 'A friendly and flexible institutional website structure for school and junior college environments.',
    academicUnitsLabel: 'Academic Divisions',
    programsLabel: 'Courses and Streams',
    admissionsLabel: 'Admissions',
    placementsLabel: 'Student Progress',
    researchLabel: 'Pedagogy and Innovation',
    studentLifeLabel: 'Student Activities',
    campusLabel: 'Campus and Facilities',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'School', 'Junior College', 'Activities'],
    inquiryOptions: ['Primary School', 'Secondary School', 'Junior College', 'Campus Visit'],
    admissionsNote: 'Age-appropriate admissions, class sections, transport, and academic year planning.',
    stats: {
      breadth: 'School and Junior College',
      support: 'Parent Friendly',
      outcomes: 'Learning First'
    }
  },
  polytechnic: {
    key: 'polytechnic',
    displayName: 'Polytechnic Institute',
    shortName: 'Polytechnic',
    tagline: 'Diploma-level technical education with hands-on training, industry partnerships, and skill development.',
    heroTitle: 'Polytechnic Portal for Diploma Programs, Skills, and Career Development',
    heroSubtitle: 'Comprehensive portal for Diploma in Engineering, Pharmacy, and other technical diploma programs.',
    aboutTitle: 'About the Polytechnic Institute',
    aboutSummary: 'A focused institute offering diploma-level technical education with practical training and industry readiness.',
    academicUnitsLabel: 'Departments and Workshops',
    programsLabel: 'Diploma Programs',
    admissionsLabel: 'Polytechnic Admissions',
    placementsLabel: 'Training and Placements',
    researchLabel: 'Projects and Innovation',
    studentLifeLabel: 'Student Activities',
    campusLabel: 'Campus and Labs',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'Diploma', 'Certificate', 'Short-term'],
    inquiryOptions: ['Diploma in Engineering', 'Diploma in Pharmacy', 'Diploma in IT', 'Campus Visit'],
    admissionsNote: 'Post-SSC admissions, lateral entry guidance, fee structure, and counseling support.',
    stats: {
      breadth: 'Technical Diplomas',
      support: 'Hands-on Training',
      outcomes: 'Skill Development'
    }
  },
  management: {
    key: 'management',
    displayName: 'Management Institute',
    shortName: 'Management',
    tagline: 'Premier management education with MBA, BBA, MCA programs and strong corporate connections.',
    heroTitle: 'Management Portal for MBA, BBA, MCA, and Professional Programs',
    heroSubtitle: 'Business education that combines academic rigor with industry exposure and leadership development.',
    aboutTitle: 'About the Management Institute',
    aboutSummary: 'A professional management school offering MBA, BBA, MCA and executive programs with industry partnerships.',
    academicUnitsLabel: 'Schools and Departments',
    programsLabel: 'Management Programs',
    admissionsLabel: 'MBA/MCA Admissions',
    placementsLabel: 'Corporate Placements',
    researchLabel: 'Research and Consulting',
    studentLifeLabel: 'Student Activities',
    campusLabel: 'Campus and Facilities',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'MBA', 'BBA', 'MCA', 'Executive'],
    inquiryOptions: ['MBA Program', 'BBA Program', 'MCA Program', 'Executive Program', 'Campus Visit'],
    admissionsNote: 'CAT/MAT/CET based admissions, scholarship opportunities, and placement support.',
    stats: {
      breadth: 'Business Education',
      support: 'Industry Connected',
      outcomes: 'Leadership Ready'
    }
  },
  law: {
    key: 'law',
    displayName: 'Law College',
    shortName: 'Law',
    tagline: 'Legal education with strong moot court culture, internships, and judicial training programs.',
    heroTitle: 'Law College Portal for LLB, LLM, and Legal Studies',
    heroSubtitle: 'Comprehensive legal education with practical training, moot courts, and judicial internships.',
    aboutTitle: 'About the Law College',
    aboutSummary: 'A premier law institution offering undergraduate and postgraduate legal education with practical exposure.',
    academicUnitsLabel: 'Legal Departments',
    programsLabel: 'Law Programs',
    admissionsLabel: 'Law Admissions',
    placementsLabel: 'Career and Internships',
    researchLabel: 'Legal Research',
    studentLifeLabel: 'Moot Courts and Activities',
    campusLabel: 'Campus and Library',
    noticeLabel: 'Notices and Circulars',
    degreeTabs: ['All', 'BA LLB', 'LLB', 'LLM', 'Ph.D.'],
    inquiryOptions: ['BA LLB (5 Year)', 'LLB (3 Year)', 'LLM Program', 'Campus Visit'],
    admissionsNote: 'CLAT/MH-CET Law based admissions, merit scholarships, and career counseling.',
    stats: {
      breadth: 'Legal Education',
      support: 'Moot Court Culture',
      outcomes: 'Judicial Readiness'
    }
  },
  arts_science: {
    key: 'arts_science',
    displayName: 'Arts, Science & Commerce College',
    shortName: 'Arts & Science',
    tagline: 'Comprehensive liberal education covering Arts, Science, Commerce, and Humanities streams.',
    heroTitle: 'Arts, Science & Commerce Portal for Academic Excellence',
    heroSubtitle: 'Diverse undergraduate and postgraduate programs in humanities, sciences, and commerce.',
    aboutTitle: 'About the College',
    aboutSummary: 'A multi-disciplinary institution offering BA, BSc, BCom, MA, MSc, MCom and research programs.',
    academicUnitsLabel: 'Faculties and Departments',
    programsLabel: 'Academic Programs',
    admissionsLabel: 'Admissions',
    placementsLabel: 'Career Guidance',
    researchLabel: 'Research and Publications',
    studentLifeLabel: 'Student Life',
    campusLabel: 'Campus and Resources',
    noticeLabel: 'Notices and Events',
    degreeTabs: ['All', 'BA', 'BSc', 'BCom', 'MA', 'MSc', 'MCom'],
    inquiryOptions: ['BA Program', 'BSc Program', 'BCom Program', 'MA/MSc/MCom', 'Campus Visit'],
    admissionsNote: 'Merit-based admissions, university affiliation, scholarships, and student support services.',
    stats: {
      breadth: 'Multi-Disciplinary',
      support: 'Academic Excellence',
      outcomes: 'Holistic Growth'
    }
  },
  group: {
    key: 'group',
    displayName: 'Group of Institutions',
    shortName: 'Group',
    tagline: 'A comprehensive educational group offering multiple streams across engineering, pharmacy, management, and more.',
    heroTitle: 'Group of Institutions — Excellence Across Multiple Disciplines',
    heroSubtitle: 'From Engineering to Pharmacy, Management to Law, School to Research — discover our complete educational ecosystem.',
    aboutTitle: 'About Our Group of Institutions',
    aboutSummary: 'A leading multi-institutional educational group with a legacy of excellence across diverse academic streams and campuses.',
    academicUnitsLabel: 'Our Institutions',
    programsLabel: 'Programs Across Institutions',
    admissionsLabel: 'Admissions',
    placementsLabel: 'Placements',
    researchLabel: 'Research and Innovation',
    studentLifeLabel: 'Student Life',
    campusLabel: 'Our Campuses',
    noticeLabel: 'Group News and Events',
    degreeTabs: ['All', 'Engineering', 'Pharmacy', 'Management', 'Diploma', 'School'],
    inquiryOptions: ['Engineering Programs', 'Pharmacy Programs', 'Management Programs', 'Polytechnic/Diploma', 'School/Junior College', 'Campus Visit'],
    admissionsNote: 'Centralized admissions support across all institutions. Contact our facilitation centres for guidance.',
    stats: {
      breadth: 'Multi-Institution Group',
      support: 'Comprehensive Education',
      outcomes: 'Diverse Pathways'
    }
  }
};

function normalizeProfileKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s/]+/g, '_');
}

export function getInstitutionProfile(settings = {}) {
  const profileKey = normalizeProfileKey(
    settings.institution_profile || settings.institution_type || settings.site_profile || settings.college_type || 'college'
  );

  const preset = PROFILE_PRESETS[profileKey] || PROFILE_PRESETS.college;

  return {
    ...preset,
    profileKey,
    collegeName: settings.college_name || preset.displayName,
    shortName: settings.college_short_name || preset.shortName,
    tagline: settings.college_tagline || preset.tagline,
    affiliation: settings.affiliation || '',
    accreditationSummary: settings.accreditation_summary || '',
    admissionAlert: settings.hero_admission_alert || '',
    announcementText: settings.announcement_text || '',
    academicUnitsLabel: settings.academic_units_label || preset.academicUnitsLabel,
    programsLabel: settings.programs_label || preset.programsLabel,
    admissionsLabel: settings.admissions_label || preset.admissionsLabel,
    placementsLabel: settings.placements_label || preset.placementsLabel,
    researchLabel: settings.research_label || preset.researchLabel,
    studentLifeLabel: settings.student_life_label || preset.studentLifeLabel,
    campusLabel: settings.campus_label || preset.campusLabel,
    noticeLabel: settings.notice_label || preset.noticeLabel,
    aboutTitle: settings.about_title || preset.aboutTitle,
    aboutSummary: settings.about_summary || preset.aboutSummary,
    admissionsNote: settings.admission_note || preset.admissionsNote,
    heroTitle: settings.hero_title || preset.heroTitle,
    heroSubtitle: settings.hero_subtitle || preset.heroSubtitle,
    degreeTabs: preset.degreeTabs,
    inquiryOptions: preset.inquiryOptions
  };
}

export function getProgramTabs(courses = [], profile = PROFILE_PRESETS.college) {
  const source = Array.isArray(courses) ? courses : [];
  const detected = source
    .map(course => course?.degree)
    .filter(Boolean)
    .reduce((list, degree) => {
      if (!list.includes(degree)) list.push(degree);
      return list;
    }, []);

  const tabs = detected.length > 0 ? detected : profile.degreeTabs || DEFAULT_DEGREES;
  return ['All', ...tabs.filter(Boolean).filter(tab => tab !== 'All')];
}

export function getInquiryOptions(courses = [], profile = PROFILE_PRESETS.college) {
  const detected = (Array.isArray(courses) ? courses : [])
    .map(course => course?.title)
    .filter(Boolean)
    .slice(0, 6);

  return detected.length > 0 ? detected : profile.inquiryOptions || [];
}

export const INSTITUTION_PROFILES = PROFILE_PRESETS;
