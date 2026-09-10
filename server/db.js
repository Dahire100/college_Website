require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');

// Connection state tracking
let isConnectedToMongo = false;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_db';

// Fallback JSON-backed storage directory if Atlas is not reachable
const localStoreDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(localStoreDir)) {
  fs.mkdirSync(localStoreDir, { recursive: true });
}

// Custom Tenant Isolation Error
class TenantIsolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TenantIsolationError';
    this.status = 500;
  }
}

// AsyncLocalStorage for request-level tenant context
const tenantStorage = new AsyncLocalStorage();

function getCurrentTenantContext() {
  return tenantStorage.getStore() || null;
}

// ----------------------------------------------------
// MONGOOSE SCHEMAS
// ----------------------------------------------------

// 0a. Tenant Model (Global - Multi-tenant root)
const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subdomain: { type: String, unique: true, lowercase: true, trim: true, sparse: true },
  status: { type: String, enum: ['active', 'suspended', 'trial'], default: 'active', index: true },
  plan: { type: String, enum: ['starter', 'standard', 'enterprise'], default: 'standard' },
  branding: {
    collegeName: { type: String },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#0f172a' },
    storageLimitBytes: { type: Number, default: 524288000 } // 500 MB default
  },
  createdAt: { type: Date, default: Date.now }
});

// 0b. SuperAdmin Model (Global - Dedicated Platform Management)
const SuperAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: 'Platform Super Administrator' },
  role: { type: String, default: 'superadmin' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 0c. SuperAdmin Action Audit Log Model (Global Platform Audit Trail)
const SuperAdminAuditLogSchema = new mongoose.Schema({
  superAdminId: { type: String, required: true },
  action: {
    type: String,
    enum: ['tenant_created', 'tenant_suspended', 'tenant_activated', 'tenant_updated', 'tenant_deleted', 'superadmin_profile_updated', 'superadmin_emergency_access'],
    required: true
  },
  targetTenantId: { type: String, required: true, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

// 1. Single Admin Model (Tenant-scoped)
const AdminSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  username: { type: String, required: true, immutable: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: 'Administrator' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
AdminSchema.index({ tenantId: 1, username: 1 }, { unique: true });

// Prevent any update from altering admin username
AdminSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate ? this.getUpdate() : null;
  if (update) {
    if (update.username !== undefined) delete update.username;
    if (update.$set && update.$set.username !== undefined) delete update.$set.username;
  }
  next();
});

// 2. Site Settings
const SiteSettingSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  group: { type: String, default: 'general' },
  label: { type: String },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});
SiteSettingSchema.index({ tenantId: 1, key: 1 }, { unique: true });

// 3. Navigation
const NavigationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  path: { type: String, required: true },
  parentId: { type: String, default: '0' },
  badge: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  target: { type: String, default: '_self' }
});

// 4. Homepage Sections Manager
const HomepageSectionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  sectionKey: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  ctaText: { type: String },
  ctaLink: { type: String },
  imageUrl: { type: String },
  layoutType: { type: String, default: 'standard' },
  content: { type: String }
});
HomepageSectionSchema.index({ tenantId: 1, sectionKey: 1 }, { unique: true });

// 4b. Pages Manager
const PageSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  navLabel: { type: String },
  parentSlug: { type: String, default: '' },
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroBadge: { type: String },
  heroImageUrl: { type: String },
  content: { type: String },
  pdfUrl: { type: String },
  pdfName: { type: String },
  showInHeader: { type: Boolean, default: true },
  showInFooter: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
PageSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

// 4c. Subsections Manager
const SubsectionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  pageSlug: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String },
  layoutType: { type: String, default: 'split_content' },
  imageUrl: { type: String },
  pdfUrl: { type: String },
  pdfName: { type: String },
  content: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 5. Hero Banners
const BannerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  secondaryCtaText: { type: String },
  secondaryCtaLink: { type: String },
  imageUrl: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 6. Notices & Circulars
const NoticeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  publishedDate: { type: String, required: true },
  expiryDate: { type: String },
  attachmentUrl: { type: String },
  isPinned: { type: Boolean, default: false },
  isNewNotice: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  departmentCode: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 7. Events
const EventSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventTime: { type: String },
  venue: { type: String, required: true },
  speaker: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  registerLink: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 8. News & Articles
const NewsSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  publishedDate: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String },
  imageUrl: { type: String },
  author: { type: String, default: 'Institutional Office' },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdAt: { type: Date, default: Date.now }
});

// 9. Departments
const DepartmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  degreeLevels: { type: String, default: 'B.Tech, M.Tech, Ph.D.' },
  hodName: { type: String },
  hodImage: { type: String },
  hodMessage: { type: String },
  email: { type: String },
  phone: { type: String },
  overview: { type: String },
  vision: { type: String },
  mission: { type: String },
  stats: { type: Object, default: {} },
  imageUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
DepartmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

// 10. Courses / Programs
const CourseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  departmentCode: { type: String, required: true },
  title: { type: String, required: true },
  degree: { type: String, required: true },
  duration: { type: String, required: true },
  intake: { type: Number, required: true },
  eligibility: { type: String, required: true },
  description: { type: String },
  curriculum: [{ type: String }],
  syllabusUrl: { type: String },
  careerOpportunities: { type: String },
  annualFee: { type: String },
  isActive: { type: Boolean, default: true }
});

// 11. Faculty
const FacultySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  departmentCode: { type: String, required: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  qualification: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  email: { type: String },
  phone: { type: String },
  bio: { type: String },
  researchAreas: { type: String },
  publicationsCount: { type: Number, default: 0 },
  imageUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// 12. Admissions & Fees
const AdmissionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  category: { type: String, required: true },
  stepNumber: { type: Number },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: String },
  eligibilityCriteria: { type: String },
  requiredDocuments: { type: String },
  feeAnnual: { type: String },
  applicationUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
  status: { type: String, default: 'published' }
});

// 13. Placements
const PlacementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  academicYear: { type: String, required: true },
  totalStudents: { type: Number, required: true },
  placedStudents: { type: Number, required: true },
  placementRate: { type: Number, required: true },
  highestPackage: { type: String, required: true },
  averagePackage: { type: String, required: true },
  medianPackage: { type: String },
  totalOffers: { type: Number, required: true },
  topSectors: { type: Object, default: {} },
  isActive: { type: Boolean, default: true }
});
PlacementSchema.index({ tenantId: 1, academicYear: 1 }, { unique: true });

// 14. Recruiters
const RecruiterSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  tier: { type: String, default: 'Marquee' },
  category: { type: String, default: 'IT / Software' },
  logoUrl: { type: String },
  highestOffer: { type: String },
  website: { type: String },
  isMarquee: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
});

// 15. Campus Facilities
const FacilitySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  shortDesc: { type: String, required: true },
  detailedDesc: { type: String },
  imageUrl: { type: String },
  specifications: { type: Object, default: {} },
  timings: { type: String },
  location: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// 16. Testimonials
const TestimonialSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  graduationYear: { type: String, required: true },
  currentRole: { type: String, required: true },
  company: { type: String, required: true },
  quote: { type: String, required: true },
  avatarUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// 17. Leadership
const LeadershipSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  roleTitle: { type: String, required: true },
  designationBadge: { type: String },
  message: { type: String, required: true },
  quote: { type: String },
  imageUrl: { type: String },
  qualifications: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// 18. Research & Patents
const ResearchSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  departmentCode: { type: String },
  investigator: { type: String, required: true },
  fundingAgency: { type: String },
  grantAmount: { type: String },
  publicationDate: { type: String },
  patentNumber: { type: String },
  status: { type: String, default: 'Active' },
  linkUrl: { type: String }
});

// 19. Gallery
const GallerySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  featuredOnHome: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 20. Inquiries
const InquirySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  source: { type: String, default: 'inquiry' },
  subject: { type: String, default: '' },
  courseInterested: { type: String },
  departmentCode: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'in_progress', 'contacted', 'replied', 'resolved', 'closed'], default: 'new' },
  notes: { type: String, default: '' },
  adminReply: { type: String, default: '' },
  repliedBy: { type: String, default: '' },
  repliedAt: { type: Date },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 21. Audit Log
const AuditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  username: { type: String, default: 'admin' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 22. Media
const MediaSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  filePath: { type: String, required: true },
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

// 23. Sub-Institutions (for Group of Institutions mode)
const SubInstitutionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  shortName: { type: String },
  slug: { type: String, required: true },
  description: { type: String },
  iconEmoji: { type: String, default: '🏛️' },
  websiteUrl: { type: String },
  imageUrl: { type: String },
  programs: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
SubInstitutionSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

// ----------------------------------------------------
// MONGOOSE PRE-HOOKS & QUERY GUARDS
// ----------------------------------------------------
function attachTenantIsolationGuards(schema) {
  const queryOps = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'countDocuments'
  ];

  queryOps.forEach(op => {
    schema.pre(op, function (next) {
      const query = this.getQuery ? this.getQuery() : null;
      if (!query || query.tenantId === undefined || !Object.prototype.hasOwnProperty.call(query, 'tenantId')) {
        const err = new TenantIsolationError(
          `[TenantIsolationError] Operation '${op}' on '${this.model?.modelName || 'Unknown'}' blocked: missing required tenantId filter.`
        );
        return next(err);
      }
      next();
    });
  });

  const updateOps = ['findOneAndUpdate', 'updateOne', 'updateMany'];
  updateOps.forEach(op => {
    schema.pre(op, function (next) {
      const update = this.getUpdate ? this.getUpdate() : null;
      if (update) {
        if (update.tenantId !== undefined) {
          delete update.tenantId;
        }
        if (update.$set && update.$set.tenantId !== undefined) {
          delete update.$set.tenantId;
        }
        if (update.$unset && update.$unset.tenantId !== undefined) {
          delete update.$unset.tenantId;
        }
      }
      next();
    });
  });

  schema.pre('aggregate', function (next) {
    const pipeline = this.pipeline();
    const firstStage = pipeline && pipeline[0];
    const hasTenantMatch =
      firstStage &&
      firstStage.$match &&
      Object.prototype.hasOwnProperty.call(firstStage.$match, 'tenantId');

    if (!hasTenantMatch) {
      const err = new TenantIsolationError(
        `[TenantIsolationError] Aggregation on '${this._model?.modelName || 'Unknown'}' blocked: missing required tenantId $match as first stage.`
      );
      return next(err);
    }
    next();
  });

  schema.pre('insertMany', function (next, docs) {
    if (!docs || !Array.isArray(docs) || docs.length === 0) return next();
    const missing = docs.some(d => !d || d.tenantId === undefined);
    if (missing) {
      const err = new TenantIsolationError(
        `[TenantIsolationError] insertMany on '${this.modelName || 'Unknown'}' blocked: one or more documents missing tenantId.`
      );
      return next(err);
    }
    next();
  });

  schema.pre('save', function (next) {
    if (this.tenantId === undefined) {
      const err = new TenantIsolationError(
        `[TenantIsolationError] Document save on '${this.constructor?.modelName || 'Unknown'}' blocked: missing required tenantId.`
      );
      return next(err);
    }
    next();
  });
}

// Attach isolation guards to all tenant-scoped schemas
const tenantScopedSchemas = [
  AdminSchema,
  SiteSettingSchema,
  NavigationSchema,
  HomepageSectionSchema,
  PageSchema,
  SubsectionSchema,
  BannerSchema,
  NoticeSchema,
  EventSchema,
  NewsSchema,
  DepartmentSchema,
  CourseSchema,
  FacultySchema,
  AdmissionSchema,
  PlacementSchema,
  RecruiterSchema,
  FacilitySchema,
  TestimonialSchema,
  LeadershipSchema,
  ResearchSchema,
  GallerySchema,
  InquirySchema,
  AuditLogSchema,
  MediaSchema,
  SubInstitutionSchema
];

tenantScopedSchemas.forEach(attachTenantIsolationGuards);

// Mongoose Models
const Models = {
  Tenant: mongoose.model('Tenant', TenantSchema),
  SuperAdmin: mongoose.model('SuperAdmin', SuperAdminSchema),
  Admin: mongoose.model('Admin', AdminSchema),
  SiteSetting: mongoose.model('SiteSetting', SiteSettingSchema),
  Navigation: mongoose.model('Navigation', NavigationSchema),
  HomepageSection: mongoose.model('HomepageSection', HomepageSectionSchema),
  Page: mongoose.model('Page', PageSchema),
  Subsection: mongoose.model('Subsection', SubsectionSchema),
  Banner: mongoose.model('Banner', BannerSchema),
  Notice: mongoose.model('Notice', NoticeSchema),
  Event: mongoose.model('Event', EventSchema),
  News: mongoose.model('News', NewsSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  Course: mongoose.model('Course', CourseSchema),
  Faculty: mongoose.model('Faculty', FacultySchema),
  Admission: mongoose.model('Admission', AdmissionSchema),
  Placement: mongoose.model('Placement', PlacementSchema),
  Recruiter: mongoose.model('Recruiter', RecruiterSchema),
  Facility: mongoose.model('Facility', FacilitySchema),
  Testimonial: mongoose.model('Testimonial', TestimonialSchema),
  Leadership: mongoose.model('Leadership', LeadershipSchema),
  Research: mongoose.model('Research', ResearchSchema),
  Gallery: mongoose.model('Gallery', GallerySchema),
  Inquiry: mongoose.model('Inquiry', InquirySchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
  SuperAdminAuditLog: mongoose.model('SuperAdminAuditLog', SuperAdminAuditLogSchema),
  Media: mongoose.model('Media', MediaSchema),
  SubInstitution: mongoose.model('SubInstitution', SubInstitutionSchema)
};

// ----------------------------------------------------
// HYBRID DATA STORE ADAPTER
// ----------------------------------------------------
const jsonFilePath = path.join(localStoreDir, 'college_data.json');

function loadLocalStore() {
  try {
    if (fs.existsSync(jsonFilePath)) {
      const raw = fs.readFileSync(jsonFilePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load local fallback store:', e.message);
  }
  return {};
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write local fallback store:', e.message);
  }
}

let localStore = loadLocalStore();

function checkCompoundUniqueness(modelName, doc, items) {
  const uniqueKeysMap = {
    Page: 'slug',
    Department: 'code',
    Placement: 'academicYear',
    SubInstitution: 'slug',
    SiteSetting: 'key',
    HomepageSection: 'sectionKey',
    Admin: 'username'
  };

  const key = uniqueKeysMap[modelName];
  if (!key || !doc[key]) return;

  const duplicate = items.some(item => 
    String(item.tenantId) === String(doc.tenantId) &&
    String(item[key]).toLowerCase() === String(doc[key]).toLowerCase() &&
    String(item._id || item.id) !== String(doc._id || doc.id)
  );

  if (duplicate) {
    const err = new Error(`E11000 duplicate key error: ${key} '${doc[key]}' already exists for tenant '${doc.tenantId}'`);
    err.code = 11000;
    throw err;
  }
}

function sanitizeUpdatePayload(update) {
  if (!update || typeof update !== 'object') return update;
  const clone = { ...update };
  if ('tenantId' in clone) {
    delete clone.tenantId;
  }
  if (clone.$set && typeof clone.$set === 'object') {
    clone.$set = { ...clone.$set };
    delete clone.$set.tenantId;
  }
  if (clone.$unset && typeof clone.$unset === 'object') {
    clone.$unset = { ...clone.$unset };
    delete clone.$unset.tenantId;
  }
  return clone;
}

function createCollectionAdapter(modelName) {
  const Model = Models[modelName];
  const isTenantScoped = modelName !== 'Tenant' && modelName !== 'SuperAdmin' && modelName !== 'SuperAdminAuditLog';
  if (!localStore[modelName]) localStore[modelName] = [];

  function assertTenantFilter(filter, opName) {
    if (!isTenantScoped) return;
    if (!filter || !Object.prototype.hasOwnProperty.call(filter, 'tenantId') || filter.tenantId === undefined) {
      throw new TenantIsolationError(
        `[TenantIsolationError] Local adapter operation '${opName}' on '${modelName}' blocked: missing required tenantId filter.`
      );
    }
  }

  function assertTenantDoc(doc, opName) {
    if (!isTenantScoped) return;
    if (!doc || doc.tenantId === undefined) {
      throw new TenantIsolationError(
        `[TenantIsolationError] Local adapter operation '${opName}' on '${modelName}' blocked: missing required tenantId.`
      );
    }
  }

  return {
    async find(filter = {}, sort = null) {
      assertTenantFilter(filter, 'find');
      if (isConnectedToMongo) {
        let q = Model.find(filter);
        if (sort) q = q.sort(sort);
        return await q.lean().exec();
      }
      let items = localStore[modelName] || [];
      return items.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) !== String(v) && item[k] !== v) return false;
        }
        return true;
      });
    },

    async findOne(filter = {}) {
      assertTenantFilter(filter, 'findOne');
      if (isConnectedToMongo) {
        return await Model.findOne(filter).lean().exec();
      }
      const items = localStore[modelName] || [];
      return items.find(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) !== String(v) && item[k] !== v) return false;
        }
        return true;
      }) || null;
    },

    async findById(id, tenantId) {
      if (isTenantScoped) {
        if (!tenantId) {
          throw new TenantIsolationError(
            `[TenantIsolationError] findById on '${modelName}' blocked: tenantId must be provided.`
          );
        }
        return this.findOne({ _id: id, tenantId });
      }
      if (isConnectedToMongo) {
        return await Model.findById(id).lean().exec();
      }
      const items = localStore[modelName] || [];
      return items.find(item => String(item._id) === String(id) || String(item.id) === String(id)) || null;
    },

    async create(doc) {
      assertTenantDoc(doc, 'create');
      if (isTenantScoped) {
        checkCompoundUniqueness(modelName, doc, localStore[modelName] || []);
      }
      if (isConnectedToMongo) {
        const created = await Model.create(doc);
        return created.toObject();
      }
      const items = localStore[modelName] || [];
      const newDoc = {
        _id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString(),
        ...doc
      };
      items.push(newDoc);
      localStore[modelName] = items;
      saveLocalStore(localStore);
      return newDoc;
    },

    async updateOne(filter, update, options = {}) {
      assertTenantFilter(filter, 'updateOne');
      if (isConnectedToMongo) {
        return await Model.updateOne(filter, update, options).exec();
      }
      const items = localStore[modelName] || [];
      const item = items.find(i => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(i[k]) !== String(v) && i[k] !== v) return false;
        }
        return true;
      });
      if (item) {
        const rawUpdate = update.$set || update;
        const updateData = { ...rawUpdate };
        if (isTenantScoped) {
          delete updateData.tenantId;
          checkCompoundUniqueness(modelName, { ...item, ...updateData }, items);
        }
        Object.assign(item, updateData, { updatedAt: new Date().toISOString() });
        saveLocalStore(localStore);
        return { modifiedCount: 1 };
      }
      if (options && options.upsert) {
        const rawUpdate = update.$set || update;
        const updateData = { ...rawUpdate };
        if (isTenantScoped) {
          delete updateData.tenantId;
        }
        const newDoc = {
          _id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString(),
          ...filter,
          ...updateData
        };
        assertTenantDoc(newDoc, 'updateOne-upsert');
        if (isTenantScoped) {
          checkCompoundUniqueness(modelName, newDoc, items);
        }
        items.push(newDoc);
        localStore[modelName] = items;
        saveLocalStore(localStore);
        return { modifiedCount: 0, upsertedCount: 1, upsertedId: newDoc._id };
      }
      return { modifiedCount: 0 };
    },

    async updateMany(filter = {}, update, options = {}) {
      assertTenantFilter(filter, 'updateMany');
      if (isConnectedToMongo) {
        return await Model.updateMany(filter, update, options).exec();
      }
      const items = localStore[modelName] || [];
      let modifiedCount = 0;
      const rawUpdate = update.$set || update;
      const updateData = { ...rawUpdate };
      if (isTenantScoped) {
        delete updateData.tenantId;
      }
      items.forEach(item => {
        let match = true;
        for (const [k, v] of Object.entries(filter)) {
          if (v && typeof v === 'object' && Array.isArray(v.$in)) {
            if (!v.$in.includes(item[k])) { match = false; break; }
          } else if (String(item[k]) !== String(v) && item[k] !== v) {
            match = false;
            break;
          }
        }
        if (match) {
          Object.assign(item, updateData, { updatedAt: new Date().toISOString() });
          modifiedCount++;
        }
      });
      if (modifiedCount > 0) {
        saveLocalStore(localStore);
      }
      return { modifiedCount };
    },

    async findOneAndUpdate(filter, update, options = { new: true }) {
      assertTenantFilter(filter, 'findOneAndUpdate');
      if (isConnectedToMongo) {
        return await Model.findOneAndUpdate(filter, update, options).lean().exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(i => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(i[k]) !== String(v) && i[k] !== v) return false;
        }
        return true;
      });
      if (index !== -1) {
        const rawUpdate = update.$set || update;
        const updateData = { ...rawUpdate };
        if (isTenantScoped) {
          delete updateData.tenantId;
          checkCompoundUniqueness(modelName, { ...items[index], ...updateData }, items);
        }
        items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
        saveLocalStore(localStore);
        return items[index];
      }
      return null;
    },

    async findByIdAndUpdate(id, update, options = { new: true }, tenantId = null) {
      if (isTenantScoped) {
        if (!tenantId) {
          throw new TenantIsolationError(
            `[TenantIsolationError] findByIdAndUpdate on '${modelName}' blocked: tenantId must be provided.`
          );
        }
        return this.findOneAndUpdate({ _id: id, tenantId }, update, options);
      }
      if (isConnectedToMongo) {
        return await Model.findByIdAndUpdate(id, update, options).lean().exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
      if (index !== -1) {
        const rawUpdate = update.$set || update;
        const updateData = { ...rawUpdate };
        items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
        saveLocalStore(localStore);
        return items[index];
      }
      return null;
    },

    async findOneAndDelete(filter) {
      assertTenantFilter(filter, 'findOneAndDelete');
      if (isConnectedToMongo) {
        return await Model.findOneAndDelete(filter).lean().exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) !== String(v) && item[k] !== v) return false;
        }
        return true;
      });
      if (index !== -1) {
        const deleted = items.splice(index, 1)[0];
        saveLocalStore(localStore);
        return deleted;
      }
      return null;
    },

    async findByIdAndDelete(id, tenantId = null) {
      if (isTenantScoped) {
        if (!tenantId) {
          throw new TenantIsolationError(
            `[TenantIsolationError] findByIdAndDelete on '${modelName}' blocked: tenantId must be provided.`
          );
        }
        return this.findOneAndDelete({ _id: id, tenantId });
      }
      if (isConnectedToMongo) {
        return await Model.findByIdAndDelete(id).lean().exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
      if (index !== -1) {
        const deleted = items.splice(index, 1)[0];
        saveLocalStore(localStore);
        return deleted;
      }
      return null;
    },

    async deleteOne(filter = {}) {
      assertTenantFilter(filter, 'deleteOne');
      if (isConnectedToMongo) {
        return await Model.deleteOne(filter).exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) !== String(v) && item[k] !== v) return false;
        }
        return true;
      });
      if (index !== -1) {
        const deleted = items.splice(index, 1)[0];
        saveLocalStore(localStore);
        return { deletedCount: 1, deleted };
      }
      return { deletedCount: 0 };
    },

    async deleteMany(filter = {}) {
      assertTenantFilter(filter, 'deleteMany');
      if (isConnectedToMongo) {
        return await Model.deleteMany(filter).exec();
      }
      const items = localStore[modelName] || [];
      const kept = items.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) === String(v) || item[k] === v) return false;
        }
        return true;
      });
      const deletedCount = items.length - kept.length;
      localStore[modelName] = kept;
      saveLocalStore(localStore);
      return { deletedCount };
    },

    async countDocuments(filter = {}) {
      assertTenantFilter(filter, 'countDocuments');
      if (isConnectedToMongo) {
        return await Model.countDocuments(filter).exec();
      }
      const items = localStore[modelName] || [];
      return items.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (String(item[k]) !== String(v) && item[k] !== v) return false;
        }
        return true;
      }).length;
    },

    async insertMany(docs) {
      if (!Array.isArray(docs)) docs = [docs];
      if (isTenantScoped) {
        const missing = docs.some(d => !d || d.tenantId === undefined);
        if (missing) {
          throw new TenantIsolationError(
            `[TenantIsolationError] Local adapter insertMany on '${modelName}' blocked: one or more documents missing tenantId.`
          );
        }
        for (const doc of docs) {
          checkCompoundUniqueness(modelName, doc, localStore[modelName] || []);
        }
      }
      if (isConnectedToMongo) {
        return await Model.insertMany(docs);
      }
      const items = localStore[modelName] || [];
      const stamped = docs.map((d, idx) => ({
        _id: 'doc_' + (Date.now() + idx) + '_' + Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString(),
        ...d
      }));
      items.push(...stamped);
      localStore[modelName] = items;
      saveLocalStore(localStore);
      return stamped;
    },

    async aggregate(pipeline = []) {
      if (isTenantScoped) {
        const firstStage = pipeline && pipeline[0];
        const hasTenantMatch =
          firstStage &&
          firstStage.$match &&
          Object.prototype.hasOwnProperty.call(firstStage.$match, 'tenantId');

        if (!hasTenantMatch) {
          throw new TenantIsolationError(
            `[TenantIsolationError] Aggregation on '${modelName}' blocked: missing required tenantId $match as first stage.`
          );
        }
      }
      if (isConnectedToMongo) {
        return await Model.aggregate(pipeline).exec();
      }
      // In-memory basic aggregation simulation for local fallback
      let items = (localStore[modelName] || []).map(x => ({ ...x }));
      for (const stage of pipeline) {
        if (stage.$match) {
          items = items.filter(item => {
            for (const [k, v] of Object.entries(stage.$match)) {
              if (String(item[k]) !== String(v) && item[k] !== v) return false;
            }
            return true;
          });
        }
        if (stage.$count) {
          items = [{ [stage.$count]: items.length }];
        }
      }
      return items;
    }
  };
}

// Build raw db collection adapters
const rawDb = {};
for (const key of Object.keys(Models)) {
  rawDb[key] = createCollectionAdapter(key);
}

// Helper: Scoped Aggregation
const aggregateScoped = (ModelOrAdapter, tenantId, pipeline = []) => {
  if (!tenantId) {
    throw new TenantIsolationError('[TenantIsolationError] aggregateScoped requires a valid tenantId.');
  }
  const scopedPipeline = [{ $match: { tenantId } }, ...pipeline];
  if (typeof ModelOrAdapter.aggregate === 'function') {
    return ModelOrAdapter.aggregate(scopedPipeline);
  }
  throw new Error('Provided target does not support aggregation.');
};

// Helper: Get Tenant-Scoped DB interface
function getTenantDb(tenantId) {
  if (!tenantId) {
    throw new TenantIsolationError('[TenantIsolationError] getTenantDb requires a valid tenantId.');
  }
  const scoped = {};
  for (const modelName of Object.keys(Models)) {
    if (modelName === 'Tenant' || modelName === 'SuperAdmin' || modelName === 'SuperAdminAuditLog') {
      scoped[modelName] = rawDb[modelName];
      continue;
    }
    const base = rawDb[modelName];
    scoped[modelName] = {
      find(filter = {}, sort = null) {
        return base.find({ ...filter, tenantId }, sort);
      },
      findOne(filter = {}) {
        return base.findOne({ ...filter, tenantId });
      },
      findById(id) {
        return base.findById(id, tenantId);
      },
      create(doc) {
        const cleanDoc = { ...doc };
        delete cleanDoc.tenantId;
        return base.create({ ...cleanDoc, tenantId });
      },
      updateOne(filter, update, options = {}) {
        const cleanUpdate = sanitizeUpdatePayload(update);
        return base.updateOne({ ...filter, tenantId }, cleanUpdate, options);
      },
      updateMany(filter, update, options = {}) {
        const cleanUpdate = sanitizeUpdatePayload(update);
        return base.updateMany({ ...filter, tenantId }, cleanUpdate, options);
      },
      findOneAndUpdate(filter, update, options = { new: true }) {
        const cleanUpdate = sanitizeUpdatePayload(update);
        return base.findOneAndUpdate({ ...filter, tenantId }, cleanUpdate, options);
      },
      findByIdAndUpdate(id, update, options = { new: true }) {
        const cleanUpdate = sanitizeUpdatePayload(update);
        return base.findByIdAndUpdate(id, cleanUpdate, options, tenantId);
      },
      findOneAndDelete(filter) {
        return base.findOneAndDelete({ ...filter, tenantId });
      },
      findByIdAndDelete(id) {
        return base.findByIdAndDelete(id, tenantId);
      },
      deleteOne(filter = {}) {
        return base.deleteOne({ ...filter, tenantId });
      },
      deleteMany(filter = {}) {
        return base.deleteMany({ ...filter, tenantId });
      },
      countDocuments(filter = {}) {
        return base.countDocuments({ ...filter, tenantId });
      },
      insertMany(docs = []) {
        return base.insertMany(docs.map(d => ({ ...d, tenantId })));
      },
      aggregate(pipeline = []) {
        return base.aggregate([{ $match: { tenantId } }, ...pipeline]);
      }
    };
  }
  return scoped;
}

// Proxied db export: If an active request tenant context exists in AsyncLocalStorage,
// queries automatically scope through getTenantDb(tenantId).
// Otherwise, direct queries without tenantId throw TenantIsolationError.
const db = new Proxy(rawDb, {
  get(target, prop) {
    const ctx = getCurrentTenantContext();
    if (ctx && ctx.tenantDb && prop !== 'Tenant' && prop !== 'SuperAdmin' && prop !== 'SuperAdminAuditLog') {
      return ctx.tenantDb[prop];
    }
    return target[prop];
  }
});

// Connect to MongoDB Atlas
async function connectDB() {
  console.log('[MongoDB] Initializing database layer...');
  console.log(`[MongoDB] Target URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnectedToMongo = true;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas / Database.');
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[MongoDB] Notice: Could not connect to external MongoDB Atlas (${err.message}).`);
    console.warn('[MongoDB] Operating seamlessly in local persistent data store.');
  }
}

module.exports = {
  mongoose,
  connectDB,
  isConnected: () => isConnectedToMongo,
  Models,
  db,
  rawDb,
  localStore,
  TenantIsolationError,
  tenantStorage,
  getTenantDb,
  aggregateScoped,
  getCurrentTenantContext
};
