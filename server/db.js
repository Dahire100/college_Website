require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');

// Connection state tracking
let isConnectedToMongo = false;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_db';

// Fallback JSON-backed storage directory if Atlas is not reachable
const localStoreDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(localStoreDir)) {
  fs.mkdirSync(localStoreDir, { recursive: true });
}

// ----------------------------------------------------
// MONGOOSE SCHEMAS
// ----------------------------------------------------

// 1. Single Admin Model
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: 'Administrator' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 2. Site Settings
const SiteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  group: { type: String, default: 'general' },
  label: { type: String },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// 3. Navigation
const NavigationSchema = new mongoose.Schema({
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
  sectionKey: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  ctaText: { type: String },
  ctaLink: { type: String },
  imageUrl: { type: String },
  layoutType: { type: String, default: 'standard' }, // 'standard', 'image_banner', 'bento_gallery', 'split_content'
  content: { type: String }
});

// 4b. Pages Manager
const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  navLabel: { type: String },
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroBadge: { type: String },
  heroImageUrl: { type: String },
  content: { type: String },
  showInHeader: { type: Boolean, default: true },
  showInFooter: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 4c. Subsections Manager
const SubsectionSchema = new mongoose.Schema({
  pageSlug: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String },
  layoutType: { type: String, default: 'split_content' }, // 'image_banner', 'split_content', 'bento_grid', 'card_grid', 'text_only'
  imageUrl: { type: String },
  content: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 5. Hero Banners
const BannerSchema = new mongoose.Schema({
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
  code: { type: String, required: true, unique: true },
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

// 10. Courses / Programs
const CourseSchema = new mongoose.Schema({
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
  academicYear: { type: String, required: true, unique: true },
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

// 14. Recruiters
const RecruiterSchema = new mongoose.Schema({
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
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  courseInterested: { type: String },
  departmentCode: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'resolved'], default: 'new' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// 21. Audit Log
const AuditLogSchema = new mongoose.Schema({
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
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  filePath: { type: String, required: true },
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

// Mongoose Models
const Models = {
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
  Media: mongoose.model('Media', MediaSchema)
};

// ----------------------------------------------------
// HYBRID DATA STORE ADAPTER
// Guarantees 100% operation whether connected to MongoDB Atlas
// or operating in seamless fallback store.
// ----------------------------------------------------
const jsonFilePath = path.join(localStoreDir, 'college_data.json');

function loadLocalStore() {
  if (fs.existsSync(jsonFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    } catch (e) {
      return {};
    }
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

// Wrapper around collections that either delegates to Mongoose model (if Mongo is live)
// or local store (if Mongo connection is pending/offline)
function createCollectionAdapter(modelName) {
  const Model = Models[modelName];
  if (!localStore[modelName]) localStore[modelName] = [];

  return {
    async find(filter = {}, sort = null) {
      if (isConnectedToMongo) {
        let q = Model.find(filter);
        if (sort) q = q.sort(sort);
        return await q.lean().exec();
      }
      // Local fallback filter
      let items = localStore[modelName] || [];
      return items.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (item[k] !== v) return false;
        }
        return true;
      });
    },

    async findOne(filter = {}) {
      if (isConnectedToMongo) {
        return await Model.findOne(filter).lean().exec();
      }
      const items = localStore[modelName] || [];
      return items.find(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (item[k] !== v) return false;
        }
        return true;
      }) || null;
    },

    async findById(id) {
      if (isConnectedToMongo) {
        return await Model.findById(id).lean().exec();
      }
      const items = localStore[modelName] || [];
      return items.find(item => String(item._id) === String(id) || String(item.id) === String(id)) || null;
    },

    async create(doc) {
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
      if (isConnectedToMongo) {
        return await Model.updateOne(filter, update, options).exec();
      }
      const items = localStore[modelName] || [];
      const item = items.find(i => {
        for (const [k, v] of Object.entries(filter)) {
          if (i[k] !== v) return false;
        }
        return true;
      });
      if (item) {
        const updateData = update.$set || update;
        Object.assign(item, updateData, { updatedAt: new Date().toISOString() });
        saveLocalStore(localStore);
        return { modifiedCount: 1 };
      }
      if (options && options.upsert) {
        const updateData = update.$set || update;
        const newDoc = {
          _id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString(),
          ...filter,
          ...updateData
        };
        items.push(newDoc);
        localStore[modelName] = items;
        saveLocalStore(localStore);
        return { modifiedCount: 0, upsertedCount: 1, upsertedId: newDoc._id };
      }
      return { modifiedCount: 0 };
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (isConnectedToMongo) {
        return await Model.findByIdAndUpdate(id, update, options).lean().exec();
      }
      const items = localStore[modelName] || [];
      const index = items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
      if (index !== -1) {
        const updateData = update.$set || update;
        items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
        saveLocalStore(localStore);
        return items[index];
      }
      return null;
    },

    async findByIdAndDelete(id) {
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

    async countDocuments(filter = {}) {
      if (isConnectedToMongo) {
        return await Model.countDocuments(filter).exec();
      }
      const items = localStore[modelName] || [];
      if (!Object.keys(filter).length) return items.length;
      return items.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (item[k] !== v) return false;
        }
        return true;
      }).length;
    },

    async insertMany(docs) {
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
    }
  };
}

// Build db collection adapters
const db = {};
for (const key of Object.keys(Models)) {
  db[key] = createCollectionAdapter(key);
}

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
    console.warn('[MongoDB] Set MONGODB_URI in .env to connect to your live MongoDB Atlas cluster.');
  }
}

module.exports = {
  mongoose,
  connectDB,
  isConnected: () => isConnectedToMongo,
  Models,
  db,
  localStore
};
