const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const admin = await db.Admin.findOne({ username: username.trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    // Update last login
    await db.Admin.updateOne({ _id: admin._id }, { lastLogin: new Date() });

    // Generate JWT token valid for 24h
    const token = jwt.sign(
      { id: admin._id || admin.id, username: admin.username, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log
    await db.AuditLog.create({
      username: admin.username,
      action: 'ADMIN_LOGIN_SUCCESS',
      entityType: 'auth',
      entityId: String(admin._id || admin.id),
      details: 'Administrator logged into CMS dashboard',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAdmin, async (req, res) => {
  return res.json({
    success: true,
    admin: req.admin
  });
});

// POST /api/v1/auth/change-password
router.post('/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const admin = await db.Admin.findOne({ username: req.admin.username });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.Admin.updateOne({ _id: admin._id }, { passwordHash: newHash });

    await db.AuditLog.create({
      username: admin.username,
      action: 'ADMIN_PASSWORD_CHANGED',
      entityType: 'auth',
      entityId: String(admin._id || admin.id),
      details: 'Administrator updated access password',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.'
    });
  }
});

module.exports = router;
