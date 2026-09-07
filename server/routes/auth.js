const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/v1/auth/login (Protected by rate limiting against brute-force attacks)
router.post('/login', authLimiter, async (req, res) => {
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

// PUT /api/v1/auth/profile
// Allows administrator to update username, password, fullName, and email
router.put('/profile', requireAdmin, async (req, res) => {
  try {
    const { username, currentPassword, newPassword, fullName, email } = req.body;

    // Fetch current admin document
    let admin = null;
    if (req.admin.id) {
      admin = await db.Admin.findById(req.admin.id);
    }
    if (!admin && req.admin.username) {
      admin = await db.Admin.findOne({ username: req.admin.username });
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.'
      });
    }

    const updates = {};
    const isChangingUsername = username && username.trim() !== admin.username;
    const isChangingPassword = Boolean(newPassword);

    // Require current password for sensitive credential updates
    if (isChangingUsername || isChangingPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change username or password.'
        });
      }

      const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }
    }

    // Validate and prepare new username
    if (isChangingUsername) {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long.'
        });
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username may only contain letters, numbers, hyphens, dots, and underscores.'
        });
      }

      // Check if username is already taken by another account
      const existingUser = await db.Admin.findOne({ username: cleanUsername });
      if (existingUser && String(existingUser._id || existingUser.id) !== String(admin._id || admin.id)) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken. Please choose another one.'
        });
      }

      updates.username = cleanUsername;
    }

    // Validate and prepare new password
    if (isChangingPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }
      updates.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    // Optional profile fields
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (email !== undefined) updates.email = email.trim();

    if (Object.keys(updates).length > 0) {
      await db.Admin.updateOne({ _id: admin._id || admin.id }, updates);
    }

    // Determine final values
    const finalId = admin._id || admin.id;
    const finalUsername = updates.username || admin.username;
    const finalEmail = updates.email || admin.email;
    const finalFullName = updates.fullName || admin.fullName;

    // Generate fresh JWT token with updated username
    const token = jwt.sign(
      { id: finalId, username: finalUsername, email: finalEmail },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log
    const changedFields = [
      isChangingUsername && 'username',
      isChangingPassword && 'password',
      fullName !== undefined && 'fullName',
      email !== undefined && 'email'
    ].filter(Boolean);

    await db.AuditLog.create({
      username: finalUsername,
      action: 'ADMIN_CREDENTIALS_UPDATED',
      entityType: 'auth',
      entityId: String(finalId),
      details: `Administrator updated credentials: ${changedFields.join(', ')}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Account credentials updated successfully!',
      token,
      admin: {
        id: finalId,
        username: finalUsername,
        email: finalEmail,
        fullName: finalFullName
      }
    });
  } catch (err) {
    console.error('Update credentials error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update admin account credentials.'
    });
  }
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
