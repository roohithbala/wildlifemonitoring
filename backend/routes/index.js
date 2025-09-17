const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const wildlifeRoutes = require('./wildlife');

// Use route modules
router.use('/auth', authRoutes);
router.use('/wildlife', wildlifeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Wildlife Monitoring API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Wildlife Monitoring System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      wildlife: {
        dashboard: 'GET /api/wildlife/dashboard',
        detections: 'GET /api/wildlife/detections',
        detect: 'POST /api/wildlife/detect',
        species: 'GET /api/wildlife/species',
        mapData: 'GET /api/wildlife/map-data',
        analytics: 'GET /api/wildlife/analytics'
      }
    },
    documentation: 'https://github.com/wildlife-monitoring/api-docs'
  });
});

module.exports = router;