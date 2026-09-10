require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { connectDB, db } = require('./db');
const { seed } = require('./seed');

const helmet = require('helmet');
const compression = require('compression');
const { apiLimiter } = require('./middleware/rateLimit');
const { resolveTenant } = require('./middleware/tenant');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust exactly one reverse proxy hop (Render / Vercel edge) - prevents IP and Host spoofing
app.set('trust proxy', 1);

// Security Middleware (Helmet HTTP Headers with permissive CSP for React SPA & CDNs)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Performance / Caching Compression (Gzip / Deflate)
app.use(compression());

// Security & Parsing Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure public uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. GLOBAL SUPERADMIN API (Isolated from Tenant Resolution)
const superadminRoutes = require('./routes/superadmin');
app.use('/superadmin', superadminRoutes);

// 2. UNPROTECTED HEALTH CHECK (System monitoring without domain requirements)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas / Local Fallback Ready'
  });
});

// Apply API Rate Limiting to /api routes
app.use('/api', apiLimiter);

// 3. TENANT RESOLUTION MIDDLEWARE
// Applied to all /api routes (except health) and /uploads
app.use('/api', resolveTenant);
app.use('/auth', resolveTenant);
app.use('/uploads', resolveTenant);

// 4. TENANT CONFIG ENDPOINTS
const tenantConfigRoutes = require('./routes/tenantConfig');
app.use('/api/tenant-config', tenantConfigRoutes);
app.use('/api/v1/public/tenant-config', tenantConfigRoutes);

// 5. REST API ROUTES (TENANT-SCOPED)
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// 6. MEDIA UPLOAD SERVING (Tenant Partitioned & Access Controlled)
app.use('/uploads/:tenantId', (req, res, next) => {
  if (req.tenantId && req.params.tenantId !== req.tenantId) {
    return res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant file access blocked' });
  }
  const tenantDir = path.join(uploadsDir, req.params.tenantId);
  express.static(tenantDir, { maxAge: '7d', immutable: true })(req, res, next);
});

// Fallback for root platform media (Strictly disallows traversing into tenant subdirectories)
app.use('/uploads', (req, res, next) => {
  const cleanPath = (req.path || '').replace(/^\//, '');
  if (cleanPath.includes('/') || cleanPath.includes('\\')) {
    return res.status(403).json({ success: false, message: 'Forbidden: Direct cross-tenant directory access blocked' });
  }
  next();
}, express.static(uploadsDir, {
  maxAge: '7d',
  immutable: true
}));

// Serve Frontend Static Assets with HTTP Caching
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.includes('assets') || filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Catch-all route to serve index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await connectDB();
  
  // Ensure default seed data and tenant exist
  const tenantCount = await db.Tenant.countDocuments();
  if (tenantCount === 0) {
    console.log('[Server] Ensuring initial institutional data and default tenant are seeded...');
    await seed();
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Modern College Portal & Multi-Tenant SaaS Server Running`);
    console.log(`🌐 Public Website:      http://localhost:${PORT}/`);
    console.log(`🔐 Unified Admin CMS:   http://localhost:${PORT}/admin`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Tenant Admin:        ${process.env.ADMIN_USERNAME || 'admin'} / ********`);
      console.log(`👑 SuperAdmin:          ${process.env.SUPERADMIN_USERNAME || 'superadmin'} / ********`);
    }
    console.log(`=======================================================`);
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;
module.exports.startServer = startServer;
