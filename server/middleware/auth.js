const jwt = require('jsonwebtoken');
const { db } = require('../db');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in .env');
  return secret;
}

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
      decoded = jwt.verify(token, getJwtSecret());
    } catch (e) {
      // Also accept superadmin tokens (verified against their own secret)
      const SUPER_SECRET = process.env.SUPERADMIN_JWT_SECRET;
      if (SUPER_SECRET) {
        try {
          decoded = jwt.verify(token, SUPER_SECRET);
        } catch (err2) { /* fall through */ }
      }
      if (!decoded) {
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

    // 2. Immediate Revocation Check: Verify tenant exists and is active
    const tenant = await db.Tenant.findById(decoded.tenantId);
    if (!tenant || tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Administrative access revoked: Institutional tenant account is suspended or deactivated.'
      });
    }

    // Cross-tenant token replay protection
    if (req.tenantId && String(req.tenantId) !== String(decoded.tenantId)) {
      return res.status(403).json({
        success: false,
        message: 'Security violation: Administrative token domain does not match current host context.'
      });
    }

    // 3. Verify tenant admin exists in database for this specific tenant
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

    // 4. Force password reset gate
    const isChangePasswordPath = req.path === '/change-password' || (req.originalUrl && req.originalUrl.includes('/change-password'));
    if (admin.mustChangePassword && !isChangePasswordPath) {
      return res.status(403).json({
        success: false,
        mustChangePassword: true,
        message: 'Initial security policy: You must change your temporary administrative password before performing any actions.'
      });
    }

    req.admin = {
      id: admin._id || admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      tenantId: String(admin.tenantId || decoded.tenantId),
      mustChangePassword: !!admin.mustChangePassword
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
  getJwtSecret
};
