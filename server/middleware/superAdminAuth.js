const jwt = require('jsonwebtoken');
const { db } = require('../db');

function getSuperAdminSecret() {
  const secret = process.env.SUPERADMIN_JWT_SECRET;
  if (!secret) throw new Error('FATAL: SUPERADMIN_JWT_SECRET environment variable is required. Set it in .env');
  return secret;
}

async function requireSuperAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'SuperAdmin authentication required.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, getSuperAdminSecret());
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired SuperAdmin token.'
      });
    }

    if (!decoded || decoded.role !== 'superadmin' || !decoded.username) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: SuperAdmin privileges required.'
      });
    }

    const superAdmin = await db.SuperAdmin.findOne({ username: decoded.username });
    if (!superAdmin) {
      return res.status(403).json({
        success: false,
        message: 'SuperAdmin account not found.'
      });
    }

    req.superAdmin = {
      id: superAdmin._id || superAdmin.id,
      username: superAdmin.username,
      email: superAdmin.email,
      role: 'superadmin'
    };

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying SuperAdmin authentication.'
    });
  }
}

module.exports = {
  requireSuperAdmin,
  getSuperAdminSecret
};
