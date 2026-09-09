const jwt = require('jsonwebtoken');
const { db } = require('../db');

const SUPERADMIN_JWT_SECRET = process.env.SUPERADMIN_JWT_SECRET || 'superadmin_jwt_secret_token_secure_saas_2026';

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
      decoded = jwt.verify(token, SUPERADMIN_JWT_SECRET);
    } catch (err) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'college_admin_jwt_secret_token_secure_2026');
      } catch (err2) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired SuperAdmin token.'
        });
      }
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
  SUPERADMIN_JWT_SECRET
};
