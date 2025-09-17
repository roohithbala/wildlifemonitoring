const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const detectionRoutes = require('./routes/detections');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (for uploaded images)
// Static file serving
app.use('/uploads', express.static('uploads'));
app.use('/ml-model', express.static('../ml-model'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-monitoring', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-monitoring', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined monitoring room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/detections', authenticateToken, detectionRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Test routes for debugging (no authentication required)
app.get('/api/test/analytics/dashboard', (req, res) => {
  console.log('🧪 TEST ANALYTICS DASHBOARD called');
  res.json({
    success: true,
    data: {
      overview: {
        totalDetections: 150,
        recentDetections: 23,
        uniqueSpecies: 8,
        averageConfidence: 0.82
      },
      speciesDistribution: [
        { _id: 'Deer', count: 45, avgConfidence: 0.85 },
        { _id: 'Bear', count: 28, avgConfidence: 0.78 },
        { _id: 'Wolf', count: 22, avgConfidence: 0.81 }
      ],
      timeline: [
        { date: '2025-09-16', count: 8 },
        { date: '2025-09-15', count: 5 }
      ],
      confidenceDistribution: [
        { _id: 0.8, count: 89 },
        { _id: 0.6, count: 35 }
      ],
      recentHighConfidence: [
        {
          topPrediction: { species: 'Deer', confidence: 0.95 },
          createdAt: new Date(),
          location: { address: 'Forest Trail A' }
        }
      ]
    }
  });
});

app.post('/api/test/login', (req, res) => {
  console.log('🧪 TEST LOGIN called');
  const { generateToken } = require('./middleware/auth');
  
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };
  
  const token = generateToken(mockUser.id);
  
  res.json({
    success: true,
    message: 'Test login successful',
    data: {
      user: mockUser,
      token: token
    }
  });
});

app.post('/api/test/camera-upload', (req, res) => {
  console.log('🧪 TEST CAMERA UPLOAD called');
  res.json({
    success: true,
    message: 'Camera test upload successful',
    data: {
      detection: {
        id: 'test-camera-' + Date.now(),
        imageUrl: '/uploads/camera-test.jpg',
        status: 'completed',
        topPrediction: { species: 'Wildlife Detected', confidence: 0.92 },
        processingTime: 850,
        source: 'camera',
        createdAt: new Date().toISOString()
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🦅 Wildlife Monitoring System API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Local'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('💾 MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;