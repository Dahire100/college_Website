const { db, getTenantDb, tenantStorage } = require('../db');

class SimpleCache {
  constructor(defaultTTLSec = 60) {
    this.defaultTTL = defaultTTLSec * 1000;
    this.cache = new Map();
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  set(key, value, ttlSec) {
    const ttl = (ttlSec ? ttlSec * 1000 : this.defaultTTL);
    this.cache.set(key, { value, expiry: Date.now() + ttl });
  }
  del(key) {
    this.cache.delete(key);
  }
  flush() {
    this.cache.clear();
  }
}

const tenantCache = new SimpleCache(60);

function normalizeHost(rawHost) {
  return String(rawHost || '')
    .split(':')[0]
    .toLowerCase()
    .trim();
}

function invalidateTenantCache(domain, subdomain) {
  if (domain) tenantCache.del(normalizeHost(domain));
  if (subdomain) {
    tenantCache.del(normalizeHost(subdomain));
    tenantCache.del(`${normalizeHost(subdomain)}.localhost`);
  }
}

const resolveTenant = async (req, res, next) => {
  try {
    let host = normalizeHost(req.hostname);

    // Hard-gated test header override (only allowed in non-production AND explicit env opt-in)
    const isTestOverrideAllowed =
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_TENANT_HEADER_OVERRIDE === 'true';

    if (isTestOverrideAllowed && req.headers['x-tenant-domain']) {
      host = normalizeHost(req.headers['x-tenant-domain']);
    }

    let tenant = tenantCache.get(host);

    if (!tenant) {
      const subdomainPart = host.split('.')[0];
      const allTenants = await db.Tenant.find({});
      tenant = allTenants.find(t =>
        normalizeHost(t.domain) === host ||
        (t.subdomain && normalizeHost(t.subdomain) === subdomainPart)
      );

      if (tenant) {
        tenantCache.set(host, tenant);
      }
    }

    if (!tenant || tenant.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive'
      });
    }

    req.tenantId = String(tenant._id || tenant.id);
    req.tenant = tenant;
    req.tenantDb = getTenantDb(req.tenantId);

    // Hardening: Strip any user-supplied or spoofed tenantId from req.body, req.query, or req.params
    // ensuring AsyncLocalStorage-bound context is the sole source of tenant identity
    if (req.body && typeof req.body === 'object' && 'tenantId' in req.body) {
      delete req.body.tenantId;
    }
    if (req.query && typeof req.query === 'object' && 'tenantId' in req.query) {
      delete req.query.tenantId;
    }

    // Run remaining middleware & route handlers inside tenant context
    tenantStorage.run({ tenantId: req.tenantId, tenant: req.tenant, tenantDb: req.tenantDb }, () => {
      next();
    });
  } catch (err) {
    next(err);
  }
};

const verifyTenantAccess = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // SuperAdmin has platform-wide authority across all tenants
  if (req.admin.role === 'superadmin') {
    return next();
  }

  if (!req.admin.tenantId || !req.tenantId || String(req.admin.tenantId) !== String(req.tenantId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Tenant access mismatch'
    });
  }

  next();
};

module.exports = {
  resolveTenant,
  verifyTenantAccess,
  normalizeHost,
  invalidateTenantCache,
  tenantCache
};
