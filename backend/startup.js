/**
 * Wildlife Monitoring System Backend Startup Script
 * Ensures proper MongoDB connection and world-level wildlife model loading
 */

const mongoose = require('mongoose');
const wildlifeClassification = require('./services/wildlifeClassification');
require('dotenv').config();

async function startupSequence() {
  console.log('🚀 Starting Wildlife Monitoring System Backend...');
  console.log('=' * 60);

  try {
    // 1. Check environment configuration
    console.log('🔧 Checking environment configuration...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
    console.log('✅ Environment configuration valid');

    // 2. Connect to MongoDB
    console.log('🍃 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);

    // 3. Load wildlife classification model
    console.log('🤖 Loading world-level wildlife detection model...');
    await wildlifeClassification.loadModel();
    console.log('✅ Wildlife detection model loaded');

    // 4. Verify collections and create indexes
    console.log('📊 Setting up database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Available collections: ${collections.map(c => c.name).join(', ')}`);

    // 5. Start the main server
    console.log('🌐 Starting main server...');
    require('./server.js');

  } catch (error) {
    console.error('❌ Startup failed:', error);
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running: mongod --version');
    console.error('   2. Verify .env file configuration');
    console.error('   3. Ensure all dependencies are installed: npm install');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the system
startupSequence();