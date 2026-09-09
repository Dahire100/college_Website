const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_admin_jwt_secret_token_secure_2026';

// Middleware to authenticate Tenant Admin
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as administrator.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      try {
        decoded = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET || 'superadmin_jwt_secret_token_secure_saas_2026');
      } catch (err2) {
        return res.status(401).json({
          success: false,
          message: 'Administrative session expired or invalid. Please re-login.'
        });
      }
    }

    if (!decoded || !decoded.username) {
      return res.status(403).json({
        success: false,
        message: 'Invalid administrative token payload.'
      });
    }

    // 1. SuperAdmin token check
    if (decoded.role === 'superadmin') {
      const superAdmin = await db.SuperAdmin.findOne({ username: decoded.username });
      if (!superAdmin) {
        return res.status(403).json({
          success: false,
          message: 'SuperAdmin account not found.'
        });
      }
      req.admin = {
        id: superAdmin._id || superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        fullName: 'Super Administrator',
        role: 'superadmin',
        tenantId: req.tenantId || decoded.tenantId || 'global'
      };

      // Immutable Platform Audit Log for SuperAdmin Emergency / Tenant-Level Access
      db.SuperAdminAuditLog.create({
        superAdminId: String(superAdmin._id || superAdmin.id),
        action: 'superadmin_emergency_access',
        targetTenantId: String(req.tenantId || decoded.tenantId || 'global'),
        metadata: {
          path: req.originalUrl || req.path,
          method: req.method,
          username: superAdmin.username
        },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }).catch(auditErr => console.warn('[Audit] Emergency access log notice:', auditErr.message));

      return next();
    }

    if (!decoded.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Tenant identity missing in administrative token.'
      });
    }

    // 2. Verify tenant admin exists in database for this specific tenant
    let admin = null;
    if (decoded.id) {
      admin = await db.Admin.findOne({ _id: decoded.id, tenantId: decoded.tenantId });
    }
    if (!admin && decoded.username) {
      admin = await db.Admin.findOne({ username: decoded.username, tenantId: decoded.tenantId });
    }
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Administrator account not found.'
      });
    }

    req.admin = {
      id: admin._id || admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      tenantId: String(admin.tenantId || decoded.tenantId)
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Administrative session expired or invalid. Please re-login.'
    });
  }
}

module.exports = {
  requireAdmin,
  JWT_SECRET
};
