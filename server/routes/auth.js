const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { requireAdmin, getJwtSecret } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/v1/auth/login (Protected by rate limiting against brute-force attacks)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid username and password strings are required.'
      });
    }

    if (!req.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required for authentication.'
      });
    }

    const cleanUsername = username.trim();

    // 1. Strict separation: SuperAdmin cannot log in through tenant auth endpoint
    if (cleanUsername.toLowerCase() === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'SuperAdmin authentication is isolated. Please use the dedicated portal at /superadmin/login.'
      });
    }

    // 2. Otherwise check tenant-scoped admin
    // Condition: Domain and username must match for admin to login
    const domain = (req.tenant?.domain || '').toLowerCase().trim();
    const subdomain = (req.tenant?.subdomain || '').toLowerCase().trim();
    const inputUser = cleanUsername.toLowerCase().trim();

    // Condition: Domain and username must match for admin to login
    // Note: 'admin' username is strictly reserved for the local demo tenant (localhost)
    const isDomainMatch =
      inputUser === domain ||
      (subdomain && inputUser === subdomain) ||
      (inputUser.replace(/^admin_/, '') === subdomain) ||
      (domain === 'localhost' && (inputUser === 'admin' || inputUser === 'apex' || inputUser === 'localhost'));

    if (!isDomainMatch) {
      return res.status(403).json({
        success: false,
        message: `Domain access restriction: Admin username must match the college domain (${domain}) to log in.`
      });
    }

    let admin = await db.Admin.findOne({ username: cleanUsername, tenantId: req.tenantId });
    if (!admin && req.tenant) {
      // Also match if the database record is stored under the domain, subdomain, or alias
      // Note: 'admin' alias is only valid for localhost demo tenant
      const candidates = [
        cleanUsername,
        domain,
        subdomain,
        `admin_${subdomain}`,
        domain === 'localhost' ? 'admin' : null
      ].filter(Boolean);
      admin = await db.Admin.findOne({ username: { $in: candidates }, tenantId: req.tenantId });
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    // Update last login
    await db.Admin.updateOne({ _id: admin._id || admin.id, tenantId: req.tenantId }, { lastLogin: new Date() });

    // Generate JWT token valid for 8h with embedded tenantId
    const token = jwt.sign(
      {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        tenantId: req.tenantId
      },
      getJwtSecret(),
      { expiresIn: '8h' }
    );

    // Audit log
    await db.AuditLog.create({
      tenantId: req.tenantId,
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
        fullName: admin.fullName,
        tenantId: req.tenantId
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

// POST /api/v1/auth/refresh (and /auth/refresh) - Refresh existing valid token
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.body && (req.body.token || req.body.refreshToken)) {
      token = req.body.token || req.body.refreshToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required for refresh.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Full re-login required.'
      });
    }

    if (!decoded || !decoded.tenantId || (!decoded.id && !decoded.username)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    // Tenant isolation verification: token's tenantId must match the request's resolved tenantId
    if (req.tenantId && String(decoded.tenantId) !== String(req.tenantId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Token does not match active tenant context.'
      });
    }

    // Verify tenant admin still exists and is active in database
    let admin = null;
    if (decoded.id) {
      admin = await db.Admin.findOne({ _id: decoded.id, tenantId: req.tenantId });
    }
    if (!admin && decoded.username) {
      admin = await db.Admin.findOne({ username: decoded.username, tenantId: req.tenantId });
    }
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrator account not found or deactivated.'
      });
    }

    // Issue new refreshed token with 8h expiry
    const newToken = jwt.sign(
      {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin',
        tenantId: req.tenantId
      },
      getJwtSecret(),
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      admin: {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        tenantId: req.tenantId
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh.'
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

    // Fetch current admin document scoped to tenant
    let admin = null;
    if (req.admin.id) {
      admin = await db.Admin.findOne({ _id: req.admin.id, tenantId: req.tenantId });
    }
    if (!admin && req.admin.username) {
      admin = await db.Admin.findOne({ username: req.admin.username, tenantId: req.tenantId });
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.'
      });
    }

    const updates = {};
    const isChangingUsername = username && username.trim().toLowerCase() !== admin.username.toLowerCase();
    const isChangingPassword = Boolean(newPassword);

    // Enforce condition: Administrator username CANNOT be changed (locked to college domain)
    if (isChangingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Administrator username cannot be changed. It is permanently bound to your college domain.'
      });
    }

    // Require current password for sensitive credential updates (e.g. changing password)
    if (isChangingPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password.'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }
    }

    // Validate and prepare new password
    if (isChangingPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.'
        });
      }
      if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one uppercase letter, one digit, and one special character.'
        });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Optional profile fields
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (email !== undefined) updates.email = email.trim();

    if (Object.keys(updates).length > 0) {
      await db.Admin.updateOne({ _id: admin._id || admin.id, tenantId: req.tenantId }, updates);
    }

    // Determine final values
    const finalId = admin._id || admin.id;
    const finalUsername = updates.username || admin.username;
    const finalEmail = updates.email || admin.email;
    const finalFullName = updates.fullName || admin.fullName;

    // Generate fresh JWT token with updated username
    const token = jwt.sign(
      { id: finalId, username: finalUsername, email: finalEmail, tenantId: req.tenantId },
      getJwtSecret(),
      { expiresIn: '8h' }
    );

    // Audit log
    const changedFields = [
      isChangingUsername && 'username',
      isChangingPassword && 'password',
      fullName !== undefined && 'fullName',
      email !== undefined && 'email'
    ].filter(Boolean);

    await db.AuditLog.create({
      tenantId: req.tenantId,
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
        fullName: finalFullName,
        tenantId: req.tenantId
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

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.'
      });
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one digit, and one special character.'
      });
    }

    const admin = await db.Admin.findOne({ username: req.admin.username, tenantId: req.tenantId });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.Admin.updateOne({ _id: admin._id || admin.id, tenantId: req.tenantId }, { passwordHash: newHash });

    await db.AuditLog.create({
      tenantId: req.tenantId,
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
