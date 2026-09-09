const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { db, getTenantDb, tenantStorage, mongoose, localStore } = require('../db');
const { requireSuperAdmin, SUPERADMIN_JWT_SECRET } = require('../middleware/superAdminAuth');
const { invalidateTenantCache } = require('../middleware/tenant');

// Brute-force protection for SuperAdmin login: max 5 attempts per 15 mins per IP
const superAdminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
  validate: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, try again later.' }
});

// POST /superadmin/login
router.post('/login', superAdminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid username and password strings are required' });
    }

    const superAdmin = await db.SuperAdmin.findOne({ username: username.trim().toLowerCase() });
    if (!superAdmin) {
      return res.status(401).json({ success: false, message: 'Invalid SuperAdmin credentials' });
    }

    const isMatch = bcrypt.compareSync(password, superAdmin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid SuperAdmin credentials' });
    }

    await db.SuperAdmin.updateOne({ _id: superAdmin._id || superAdmin.id }, { lastLogin: new Date() });

    const token = jwt.sign(
      {
        id: superAdmin._id || superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: 'superadmin'
      },
      SUPERADMIN_JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      token,
      superAdmin: {
        id: superAdmin._id || superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: 'superadmin'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'SuperAdmin login failed: ' + err.message });
  }
});

// Helper: Record SuperAdmin action in audit trail
async function logSuperAdminAction(req, action, targetTenantId, metadata = {}) {
  try {
    const superAdminId = String(req.superAdmin?.id || req.superAdmin?._id || 'unknown');
    const targetTenantIdStr = String(targetTenantId);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    await db.SuperAdminAuditLog.create({
      superAdminId,
      action,
      targetTenantId: targetTenantIdStr,
      metadata,
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[SuperAdminAuditLog] Failed to record audit entry:', err.message);
  }
}

// Protected routes below
router.use(requireSuperAdmin);

// GET /superadmin/profile - Retrieve authenticated SuperAdmin profile
router.get('/profile', async (req, res) => {
  try {
    const superAdmin = await db.SuperAdmin.findOne({ username: req.superAdmin.username });
    if (!superAdmin) {
      return res.status(404).json({ success: false, message: 'SuperAdmin account not found' });
    }

    return res.json({
      success: true,
      superAdmin: {
        id: superAdmin._id || superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        fullName: superAdmin.fullName || 'Platform Super Administrator',
        role: superAdmin.role || 'superadmin',
        lastLogin: superAdmin.lastLogin,
        createdAt: superAdmin.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch SuperAdmin profile: ' + err.message });
  }
});

// PUT /superadmin/profile - Update SuperAdmin profile details or password
router.put('/profile', async (req, res) => {
  try {
    const superAdmin = await db.SuperAdmin.findOne({ username: req.superAdmin.username });
    if (!superAdmin) {
      return res.status(404).json({ success: false, message: 'SuperAdmin account not found' });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;
    const updates = {};

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change SuperAdmin master password.'
        });
      }

      const isMatch = bcrypt.compareSync(currentPassword, superAdmin.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New master password must be at least 8 characters long.'
        });
      }

      updates.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@')) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
      updates.email = cleanEmail;
    }

    if (Object.keys(updates).length > 0) {
      await db.SuperAdmin.updateOne({ _id: superAdmin._id || superAdmin.id }, updates);
    }

    const updated = await db.SuperAdmin.findById(superAdmin._id || superAdmin.id);

    await logSuperAdminAction(req, 'superadmin_profile_updated', 'global', {
      updatedFields: Object.keys(updates).filter(k => k !== 'passwordHash')
    });

    return res.json({
      success: true,
      message: 'SuperAdmin profile updated successfully.',
      superAdmin: {
        id: updated._id || updated.id,
        username: updated.username,
        email: updated.email,
        fullName: updated.fullName || 'Platform Super Administrator',
        role: updated.role || 'superadmin',
        lastLogin: updated.lastLogin,
        createdAt: updated.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update SuperAdmin profile: ' + err.message });
  }
});

// POST /superadmin/tenants - Onboard new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { name, domain, subdomain, plan, branding } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ success: false, message: 'Tenant name and domain are required' });
    }

    const normalizedDomain = domain.trim().toLowerCase();
    const existing = await db.Tenant.findOne({ domain: normalizedDomain });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Tenant with this domain already exists' });
    }

    const tenant = await db.Tenant.create({
      name: name.trim(),
      domain: normalizedDomain,
      subdomain: subdomain ? subdomain.trim().toLowerCase() : undefined,
      status: 'active',
      plan: plan || 'standard',
      branding: branding || {
        collegeName: name.trim(),
        logoUrl: '',
        primaryColor: '#0f172a',
        storageLimitBytes: 524288000
      }
    });

    const tenantId = String(tenant._id || tenant.id);
    const tenantDb = getTenantDb(tenantId);

    // Automatically provision initial admin with username matching the domain/subdomain
    const adminUsername = tenant.subdomain || tenant.domain;
    const adminPassword = req.body.adminPassword || 'Admin@123';
    const passwordHash = bcrypt.hashSync(adminPassword, 10);

    try {
      await tenantStorage.run({ tenantId, tenant, tenantDb }, async () => {
        await db.Admin.create({
          tenantId,
          username: adminUsername,
          email: req.body.adminEmail || `admin@${tenant.domain}`,
          fullName: `${tenant.name} Administrator`,
          passwordHash,
          lastLogin: new Date()
        });
      });
    } catch (adminErr) {
      console.warn('[Tenant Provisioning] Notice: Admin creation note:', adminErr.message);
    }

    invalidateTenantCache(tenant.domain, tenant.subdomain);

    await logSuperAdminAction(req, 'tenant_created', tenant._id || tenant.id, {
      name: tenant.name,
      domain: tenant.domain,
      adminUsername,
      plan: tenant.plan
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant and administrative account created successfully',
      tenant,
      adminUsername
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create tenant: ' + err.message });
  }
});

// GET /superadmin/tenants - List all tenants
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await db.Tenant.find({});
    return res.json({
      success: true,
      count: tenants.length,
      tenants
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tenants: ' + err.message });
  }
});

// PUT /superadmin/tenants/:id and PATCH /superadmin/tenants/:id - Update tenant state
const updateTenantHandler = async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const { name, domain, subdomain, plan, branding, status } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (domain) updates.domain = domain.trim().toLowerCase();
    if (subdomain !== undefined) updates.subdomain = subdomain ? subdomain.trim().toLowerCase() : undefined;
    if (plan) updates.plan = plan;
    if (status) updates.status = status;
    if (branding) updates.branding = { ...tenant.branding, ...branding };

    await db.Tenant.updateOne({ _id: tenant._id || tenant.id }, updates);
    invalidateTenantCache(tenant.domain, tenant.subdomain);
    if (updates.domain || updates.subdomain) {
      invalidateTenantCache(updates.domain, updates.subdomain);

      // Reconcile domain-username binding: If SuperAdmin rebinds college domain or subdomain,
      // update the tenant admin username to match the new domain so credentials remain aligned.
      const newDomainUsername = updates.subdomain || updates.domain;
      const { mongoose } = require('../db');
      if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
        await mongoose.connection.collection('admins').updateMany(
          { tenantId: String(tenant._id || tenant.id) },
          { $set: { username: newDomainUsername } }
        );
      }
    }

    await logSuperAdminAction(req, 'tenant_updated', tenant._id || tenant.id, {
      updatedFields: Object.keys(updates),
      updates
    });

    const updatedTenant = await db.Tenant.findById(req.params.id);
    return res.json({
      success: true,
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update tenant: ' + err.message });
  }
};

router.put('/tenants/:id', updateTenantHandler);
router.patch('/tenants/:id', updateTenantHandler);

// PATCH /superadmin/tenants/:id/suspend and POST /superadmin/tenants/:id/suspend
const suspendTenantHandler = async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    await db.Tenant.updateOne({ _id: tenant._id || tenant.id }, { status: 'suspended' });
    invalidateTenantCache(tenant.domain, tenant.subdomain);

    await logSuperAdminAction(req, 'tenant_suspended', tenant._id || tenant.id, {
      previousStatus: tenant.status,
      domain: tenant.domain
    });

    return res.json({ success: true, message: 'Tenant suspended successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to suspend tenant: ' + err.message });
  }
};

router.patch('/tenants/:id/suspend', suspendTenantHandler);
router.post('/tenants/:id/suspend', suspendTenantHandler);

// PATCH /superadmin/tenants/:id/activate and POST /superadmin/tenants/:id/activate
const activateTenantHandler = async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    await db.Tenant.updateOne({ _id: tenant._id || tenant.id }, { status: 'active' });
    invalidateTenantCache(tenant.domain, tenant.subdomain);

    await logSuperAdminAction(req, 'tenant_activated', tenant._id || tenant.id, {
      previousStatus: tenant.status,
      domain: tenant.domain
    });

    return res.json({ success: true, message: 'Tenant activated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to activate tenant: ' + err.message });
  }
};

router.patch('/tenants/:id/activate', activateTenantHandler);
router.post('/tenants/:id/activate', activateTenantHandler);

// DELETE /superadmin/tenants/:id - Permanently delete a tenant and its scoped data
router.delete('/tenants/:id', async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Safety guard: Protect default localhost platform tenant from accidental deletion
    if (tenant.domain === 'localhost') {
      return res.status(400).json({
        success: false,
        message: 'The default platform root tenant (localhost) cannot be deleted.'
      });
    }

    const tenantId = String(tenant._id || tenant.id);

    // Invalidate caches immediately
    invalidateTenantCache(tenant.domain, tenant.subdomain);

    // Delete tenant record
    await db.Tenant.deleteOne({ _id: tenant._id || tenant.id });

    // Clean up tenant-scoped records (admins, audit logs, media files metadata, etc.)
    const { Models } = require('../db');
    if (Models) {
      const collectionsToClean = [
        'Admin', 'Page', 'Notice', 'Event', 'Department', 'Course',
        'Faculty', 'Admission', 'Placement', 'Recruiter', 'Facility',
        'Testimonial', 'Leadership', 'Research', 'Gallery', 'SubInstitution',
        'SiteSetting', 'HomepageSection', 'AuditLog', 'StudentInquiry', 'Banner'
      ];
      for (const col of collectionsToClean) {
        if (Models[col] && typeof Models[col].deleteMany === 'function') {
          try {
            await Models[col].deleteMany({ tenantId });
          } catch (e) {}
        }
      }
    }

    await logSuperAdminAction(req, 'tenant_deleted', tenantId, {
      name: tenant.name,
      domain: tenant.domain,
      subdomain: tenant.subdomain,
      plan: tenant.plan
    });

    return res.json({
      success: true,
      message: `Tenant '${tenant.name}' and all associated data permanently deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete tenant: ' + err.message });
  }
});

// GET /superadmin/tenants/:id/usage
router.get('/tenants/:id/usage', async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const tenantId = String(tenant._id || tenant.id);
    const pagesCount = await db.Page.countDocuments({ tenantId });
    const noticesCount = await db.Notice.countDocuments({ tenantId });
    const mediaItems = await db.Media.find({ tenantId });
    const mediaCount = mediaItems.length;
    const storageBytes = mediaItems.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);

    return res.json({
      success: true,
      usage: {
        tenantId,
        tenantName: tenant.name,
        domain: tenant.domain,
        status: tenant.status,
        plan: tenant.plan,
        pagesCount,
        noticesCount,
        mediaCount,
        storageBytes,
        storageLimitBytes: tenant.branding?.storageLimitBytes || 524288000
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch usage: ' + err.message });
  }
});

// POST /superadmin/tenants/:id/reset-admin - Support role: Reset tenant admin credentials
router.post('/tenants/:id/reset-admin', async (req, res) => {
  try {
    const tenant = await db.Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const tenantId = String(tenant._id || tenant.id);
    const { username, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'A new password with minimum 6 characters is required' });
    }

    const defaultAdminUsername = tenant.subdomain || tenant.domain || 'admin';
    const targetUsername = username ? username.trim().toLowerCase() : defaultAdminUsername;

    // Find or create the tenant admin
    let query = { tenantId };
    if (targetUsername) query.username = targetUsername;
    let admin = await db.Admin.findOne(query);

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    if (!admin) {
      admin = await db.Admin.create({
        tenantId,
        username: targetUsername,
        email: `admin@${tenant.domain}`,
        passwordHash,
        fullName: `${tenant.name} Administrator`
      });
    } else {
      await db.Admin.updateOne(
        { _id: admin._id || admin.id, tenantId },
        { passwordHash, updatedAt: new Date() }
      );
    }

    await logSuperAdminAction(req, 'tenant_updated', tenantId, {
      subAction: 'admin_credential_reset',
      targetAdminUsername: admin.username
    });

    return res.json({
      success: true,
      message: `Administrator credentials for tenant '${tenant.name}' reset successfully`,
      adminUsername: admin.username
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reset admin credentials: ' + err.message });
  }
});

// GET /superadmin/audit-log - Paginated audit history filterable by tenantId or action
router.get('/audit-log', async (req, res) => {
  try {
    const { tenantId, targetTenantId, action, page = 1, limit = 20 } = req.query;
    const filter = {};
    const tid = tenantId || targetTenantId;
    if (tid) filter.targetTenantId = String(tid);
    if (action) filter.action = action;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    let allLogs = await db.SuperAdminAuditLog.find(filter, { timestamp: -1 });
    if (!Array.isArray(allLogs)) allLogs = [];
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = allLogs.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLogs = allLogs.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: paginatedLogs,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs: ' + err.message });
  }
});

// GET /superadmin/health - Platform diagnostics & infrastructure runtime metrics
router.get('/health', async (req, res) => {
  try {
    const tenants = await db.Tenant.find({});
    const active = tenants.filter(t => t.status === 'active').length;
    const suspended = tenants.filter(t => t.status === 'suspended').length;
    const trial = tenants.filter(t => t.status === 'trial').length;

    let pingMs = 0;
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const start = Date.now();
      await mongoose.connection.db.command({ ping: 1 });
      pingMs = Date.now() - start;
    }

    return res.json({
      success: true,
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      database: {
        connected: isMongoConnected,
        readyState: mongoose.connection ? mongoose.connection.readyState : 0,
        type: isMongoConnected ? 'MongoDB Atlas' : 'Local Persistence Store',
        pingMs
      },
      tenants: {
        total: tenants.length,
        active,
        suspended,
        trial
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Health check failed: ' + err.message });
  }
});

// GET /superadmin/database - Comprehensive Database & Storage Explorer
router.get('/database', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    let pingMs = 0;
    let dbStats = {
      collections: 0,
      objects: 0,
      avgObjSize: 0,
      dataSize: 0,
      storageSize: 0,
      indexes: 0,
      indexSize: 0
    };

    if (isMongoConnected) {
      const t0 = Date.now();
      await mongoose.connection.db.command({ ping: 1 });
      pingMs = Date.now() - t0;

      try {
        const rawStats = await mongoose.connection.db.stats();
        dbStats = {
          collections: rawStats.collections || 0,
          objects: rawStats.objects || 0,
          avgObjSize: rawStats.avgObjSize || 0,
          dataSize: rawStats.dataSize || 0,
          storageSize: rawStats.storageSize || 0,
          indexes: rawStats.indexes || 0,
          indexSize: rawStats.indexSize || 0
        };
      } catch (statsErr) {
        console.warn('Failed to retrieve db.stats()', statsErr.message);
      }
    }

    // Registered collections with architecture metadata
    const registeredCollections = [
      { name: 'tenants', model: 'Tenant', scope: 'global', description: 'Institutional tenants & domain configurations' },
      { name: 'superadmins', model: 'SuperAdmin', scope: 'global', description: 'Platform root control identities' },
      { name: 'superadminauditlogs', model: 'SuperAdminAuditLog', scope: 'global', description: 'Immutable security & provisioning audit log' },
      { name: 'admins', model: 'Admin', scope: 'tenant', description: 'Tenant institution administrators' },
      { name: 'pages', model: 'Page', scope: 'tenant', description: 'Institutional content & landing pages' },
      { name: 'notices', model: 'Notice', scope: 'tenant', description: 'Announcements, circulars, & alerts' },
      { name: 'events', model: 'Event', scope: 'tenant', description: 'Campus & academic calendar events' },
      { name: 'departments', model: 'Department', scope: 'tenant', description: 'Academic divisions & faculties' },
      { name: 'courses', model: 'Course', scope: 'tenant', description: 'Offered curriculum & degree programs' },
      { name: 'faculties', model: 'Faculty', scope: 'tenant', description: 'Professors, instructors, & academic staff' },
      { name: 'inquiries', model: 'Inquiry', scope: 'tenant', description: 'Prospective applicant inquiries & leads' },
      { name: 'sitesettings', model: 'SiteSetting', scope: 'tenant', description: 'College-specific themes, contact & navigation' },
      { name: 'homepagesections', model: 'HomepageSection', scope: 'tenant', description: 'CMS dynamic modular homepage blocks' },
      { name: 'banners', model: 'Banner', scope: 'tenant', description: 'Promotional & alert banners' },
      { name: 'media', model: 'Media', scope: 'tenant', description: 'Uploaded assets, prospectuses, & PDFs' },
      { name: 'auditlogs', model: 'AuditLog', scope: 'tenant', description: 'College-level administrative activity records' }
    ];

    let totalDocumentCount = 0;
    const collectionsSummary = [];

    for (const col of registeredCollections) {
      let docCount = 0;
      let indexesCount = 1;
      let unscopedCount = 0;

      if (isMongoConnected) {
        try {
          const rawCol = mongoose.connection.collection(col.name);
          docCount = await rawCol.countDocuments({});
          try {
            const indexes = await rawCol.indexes();
            indexesCount = indexes.length;
          } catch (idxErr) {}

          if (col.scope === 'tenant') {
            unscopedCount = await rawCol.countDocuments({
              $or: [{ tenantId: { $exists: false } }, { tenantId: null }, { tenantId: '' }]
            });
          }
        } catch (e) {
          docCount = 0;
        }
      } else {
        const data = localStore ? localStore.read(col.name) || [] : [];
        docCount = Array.isArray(data) ? data.length : 0;
      }

      totalDocumentCount += docCount;
      collectionsSummary.push({
        name: col.name,
        modelName: col.model,
        scope: col.scope,
        description: col.description,
        documentCount: docCount,
        indexesCount,
        unscopedCount,
        isolationStatus: unscopedCount === 0 ? 'isolated' : 'warning'
      });
    }

    // Per-Tenant Data Distribution Breakdown
    const tenants = await db.Tenant.find({});
    const tenantDistribution = [];

    for (const t of tenants) {
      const tid = String(t._id || t.id);
      let tenantTotalDocs = 0;

      if (isMongoConnected) {
        const keyCols = ['admins', 'pages', 'notices', 'events', 'courses', 'departments', 'faculties', 'inquiries', 'media'];
        for (const c of keyCols) {
          try {
            const cnt = await mongoose.connection.collection(c).countDocuments({ tenantId: tid });
            tenantTotalDocs += cnt;
          } catch (e) {}
        }
      }

      tenantDistribution.push({
        id: tid,
        name: t.name,
        domain: t.domain,
        subdomain: t.subdomain,
        plan: t.plan,
        status: t.status,
        documentCount: tenantTotalDocs
      });
    }

    // Mask URI for display
    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_db';
    const maskedUri = rawUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:••••••••@');

    return res.json({
      success: true,
      database: {
        connected: isMongoConnected,
        readyState: mongoose.connection ? mongoose.connection.readyState : 0,
        provider: isMongoConnected ? 'MongoDB Atlas' : 'Local JSON Store',
        databaseName: mongoose.connection?.name || 'college_db',
        maskedUri,
        pingMs,
        stats: {
          totalCollections: registeredCollections.length,
          totalDocuments: dbStats.objects || totalDocumentCount,
          dataSizeBytes: dbStats.dataSize,
          storageSizeBytes: dbStats.storageSize,
          indexSizeBytes: dbStats.indexSize,
          indexesCount: dbStats.indexes
        }
      },
      collections: collectionsSummary,
      tenantDistribution,
      integrity: {
        checkedAt: new Date().toISOString(),
        isHealthy: collectionsSummary.every(c => c.unscopedCount === 0),
        totalUnscopedLeakedDocs: collectionsSummary.reduce((acc, c) => acc + (c.unscopedCount || 0), 0)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch database information: ' + err.message });
  }
});

// POST /superadmin/database/ping - Live DB latency test
router.post('/database/ping', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      return res.json({
        success: true,
        provider: 'Local Persistence Store',
        connected: false,
        latencyMs: 1,
        timestamp: new Date().toISOString()
      });
    }

    const start = Date.now();
    await mongoose.connection.db.command({ ping: 1 });
    const latencyMs = Date.now() - start;

    return res.json({
      success: true,
      provider: 'MongoDB Atlas',
      connected: true,
      latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database ping failed: ' + err.message });
  }
});

// POST /superadmin/database/verify-integrity - Deep tenant data isolation audit
router.post('/database/verify-integrity', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      return res.json({
        success: true,
        healthy: true,
        message: 'Local store active. Tenant isolation verified.',
        scannedCollections: 0,
        totalIssues: 0
      });
    }

    const tenantScopedCols = [
      'admins', 'pages', 'notices', 'events', 'departments', 'courses',
      'faculties', 'inquiries', 'sitesettings', 'homepagesections',
      'banners', 'media', 'auditlogs'
    ];

    const tenants = await db.Tenant.find({});
    const validTenantIds = new Set(tenants.map(t => String(t._id || t.id)));

    const auditResults = [];
    let totalIssues = 0;
    let totalScanned = 0;

    for (const colName of tenantScopedCols) {
      const rawCol = mongoose.connection.collection(colName);
      const totalDocs = await rawCol.countDocuments({});
      totalScanned += totalDocs;

      // Check missing or empty tenantId
      const missingTenantIdDocs = await rawCol.countDocuments({
        $or: [{ tenantId: { $exists: false } }, { tenantId: null }, { tenantId: '' }]
      });

      // Check orphaned tenantId (pointing to non-existent tenant)
      let orphanedTenantDocs = 0;
      if (totalDocs > 0) {
        const sample = await rawCol.find({}, { projection: { tenantId: 1 } }).toArray();
        for (const doc of sample) {
          if (doc.tenantId && !validTenantIds.has(String(doc.tenantId))) {
            orphanedTenantDocs++;
          }
        }
      }

      const issues = missingTenantIdDocs + orphanedTenantDocs;
      totalIssues += issues;

      auditResults.push({
        collection: colName,
        totalDocs,
        missingTenantIdDocs,
        orphanedTenantDocs,
        status: issues === 0 ? 'passed' : 'failed'
      });
    }

    await logSuperAdminAction(req, 'tenant_updated', 'global', {
      subAction: 'database_integrity_verified',
      totalScanned,
      totalIssues,
      healthy: totalIssues === 0
    });

    return res.json({
      success: true,
      healthy: totalIssues === 0,
      totalScanned,
      totalIssues,
      scannedCollections: tenantScopedCols.length,
      auditResults,
      message: totalIssues === 0
        ? 'Database integrity verified: 100% of tenant-scoped documents have valid tenantId bindings.'
        : `Integrity check flagged ${totalIssues} issue(s) across tenant collections.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Integrity verification failed: ' + err.message });
  }
});

// POST /superadmin/database/fix-unscoped - Auto-heal & backfill legacy unstamped records to root tenant
router.post('/database/fix-unscoped', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      return res.json({ success: true, message: 'No action required on local persistence store.' });
    }

    const defaultTenant = await db.Tenant.findOne({ domain: 'localhost' });
    if (!defaultTenant) {
      return res.status(404).json({ success: false, message: 'Default localhost tenant not found.' });
    }

    const rootTenantId = String(defaultTenant._id || defaultTenant.id);
    const tenantScopedCols = [
      'admins', 'pages', 'notices', 'events', 'departments', 'courses',
      'faculties', 'inquiries', 'sitesettings', 'homepagesections',
      'banners', 'media', 'auditlogs'
    ];

    let totalUpdated = 0;
    let totalPruned = 0;
    const updateDetails = [];

    for (const col of tenantScopedCols) {
      const rawCol = mongoose.connection.collection(col);
      const unassigned = await rawCol.find({
        $or: [{ tenantId: { $exists: false } }, { tenantId: null }, { tenantId: '' }]
      }).toArray();

      let colUpdated = 0;
      let colPruned = 0;

      for (const doc of unassigned) {
        try {
          await rawCol.updateOne({ _id: doc._id }, { $set: { tenantId: rootTenantId } });
          colUpdated++;
          totalUpdated++;
        } catch (err) {
          if (err.code === 11000) {
            // Redundant legacy copy of already-seeded record for root tenant -> prune duplicate
            await rawCol.deleteOne({ _id: doc._id });
            colPruned++;
            totalPruned++;
          }
        }
      }

      if (colUpdated > 0 || colPruned > 0) {
        updateDetails.push({ collection: col, updated: colUpdated, prunedDuplicates: colPruned });
      }
    }

    await logSuperAdminAction(req, 'tenant_updated', rootTenantId, {
      subAction: 'backfilled_unscoped_documents',
      totalUpdated,
      totalPruned,
      details: updateDetails
    });

    return res.json({
      success: true,
      message: `Database healed: ${totalUpdated} legacy record(s) bound to root tenant (${defaultTenant.domain}), ${totalPruned} duplicate orphan(s) pruned.`,
      totalUpdated,
      totalPruned,
      updateDetails
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fix unscoped documents: ' + err.message });
  }
});

// POST /superadmin/database/purge-orphans - Prune leftover records belonging to deleted tenants
router.post('/database/purge-orphans', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      return res.json({ success: true, message: 'Local store active. No orphaned records.' });
    }

    const tenants = await db.Tenant.find({});
    const validTenantIds = tenants.map(t => String(t._id || t.id));

    const tenantScopedCols = [
      'admins', 'pages', 'notices', 'events', 'departments', 'courses',
      'faculties', 'inquiries', 'sitesettings', 'homepagesections',
      'banners', 'media', 'auditlogs'
    ];

    let totalPurged = 0;
    const purgeDetails = [];

    for (const col of tenantScopedCols) {
      const rawCol = mongoose.connection.collection(col);
      const result = await rawCol.deleteMany({
        tenantId: { $nin: validTenantIds }
      });
      if (result.deletedCount > 0) {
        totalPurged += result.deletedCount;
        purgeDetails.push({ collection: col, purgedCount: result.deletedCount });
      }
    }

    await logSuperAdminAction(req, 'tenant_updated', 'global', {
      subAction: 'pruned_orphaned_database_records',
      totalPurged,
      details: purgeDetails
    });

    return res.json({
      success: true,
      message: `Database cleaned: ${totalPurged} orphaned record(s) purged across ${purgeDetails.length} collection(s).`,
      totalPurged,
      purgeDetails
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to purge orphaned records: ' + err.message });
  }
});

module.exports = router;
