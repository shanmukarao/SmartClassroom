const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { exec } = require('./db/database');
const { runGlobalSignalEvaluation } = require('./services/smartSignalEngine');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const helpRoutes = require('./routes/helpRoutes');
const continuityRoutes = require('./routes/continuityRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Schema on Server Startup
async function initSchema() {
  try {
    const schemaPath = path.resolve(__dirname, 'db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await exec(sql);
    console.log('Database schema verified & initialized successfully.');
  } catch (err) {
    console.error('Error initializing schema:', err);
  }
}

initSchema();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Inclusive Smart Classroom Platform API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/continuity', continuityRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/announcements', announcementRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Inclusive Smart Classroom Backend API Running`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
