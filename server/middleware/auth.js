const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_admin_jwt_secret_token_secure_2026';

// Middleware to authenticate the Single Admin
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
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.username) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired administrative token.'
      });
    }

    // Verify admin exists in database
    const admin = await db.Admin.findOne({ username: decoded.username });
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
      fullName: admin.fullName
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
