const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 AUTH MIDDLEWARE - Request Headers:', {
      authorization: req.headers['authorization'],
      'content-type': req.headers['content-type'],
      origin: req.headers['origin']
    });

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 AUTH MIDDLEWARE - Token Info:', {
      authHeader: authHeader ? authHeader.substring(0, 30) + '...' : 'NULL',
      token: token ? token.substring(0, 30) + '...' : 'NULL',
      tokenLength: token ? token.length : 0
    });

    if (!token) {
      console.log('❌ AUTH MIDDLEWARE - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    console.log('🔐 AUTH MIDDLEWARE - Verifying token with JWT_SECRET...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ AUTH MIDDLEWARE - Token decoded successfully:', decoded);

    // Handle test user case
    if (decoded.userId === 'test-user-123') {
      console.log('🧪 AUTH MIDDLEWARE - Using test user');
      req.user = {
        id: '507f1f77bcf86cd799439011', // Valid ObjectId format for test user
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true
      };
      console.log('✅ AUTH MIDDLEWARE - Test user authentication successful');
      return next();
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    console.log('👤 AUTH MIDDLEWARE - User lookup result:', user ? `Found: ${user.email}` : 'NOT FOUND');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    console.log('✅ AUTH MIDDLEWARE - Authentication successful for:', user.email);
    next();
  } catch (error) {
    console.error('❌ AUTH MIDDLEWARE - Error occurred:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'JsonWebTokenError') {
      console.log('❌ AUTH MIDDLEWARE - JWT Error: Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      console.log('❌ AUTH MIDDLEWARE - JWT Error: Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('❌ AUTH MIDDLEWARE - Unknown error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check user roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to check if user owns resource or is admin
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnershipOrAdmin
};