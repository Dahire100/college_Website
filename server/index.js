require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { connectDB, db } = require('./db');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure public uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded media
app.use('/uploads', express.static(uploadsDir));

// Serve Frontend Static Assets
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Mount REST API Routes
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas / Local Fallback Ready'
  });
});

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
  
  // Ensure default seed data exists
  const noticeCount = await db.Notice.countDocuments();
  const pageCount = await db.Page.countDocuments();
  if (noticeCount === 0 || pageCount === 0) {
    console.log('[Server] Ensuring initial institutional data and pages are seeded...');
    await seed();
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Modern College Portal & CMS Server Running`);
    console.log(`🌐 Public Website:      http://localhost:${PORT}/`);
    console.log(`🔐 Single Admin CMS:    http://localhost:${PORT}/#admin`);
    console.log(`🔑 Default Credentials: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
