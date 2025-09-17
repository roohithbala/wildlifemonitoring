const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    mimeType: String,
    exifData: {
      camera: String,
      lens: String,
      iso: Number,
      aperture: String,
      shutterSpeed: String,
      focalLength: String,
      dateTime: Date,
      gps: {
        latitude: Number,
        longitude: Number,
        altitude: Number
      }
    }
  },
  predictions: [{
    species: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    classIndex: Number,
    isWildlife: {
      type: Boolean,
      default: false
    },
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    scientificName: String,
    commonNames: [String],
    conservationStatus: String
  }],
  topPrediction: {
    species: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    classIndex: Number,
    isWildlife: {
      type: Boolean,
      default: false
    },
    scientificName: String,
    conservationStatus: String
  },
  analysisResults: {
    tensorFlowJS: {
      predictions: [{
        species: String,
        confidence: Number,
        classIndex: Number,
        isWildlife: Boolean
      }],
      processingTime: Number,
      modelType: String,
      backend: String
    },
    serverAnalysis: {
      predictions: [{
        species: String,
        confidence: Number,
        classIndex: Number
      }],
      processingTime: Number,
      modelVersion: String
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      trim: true
    },
    ecosystem: {
      type: String,
      enum: ['forest', 'grassland', 'wetland', 'desert', 'mountain', 'arctic', 'marine', 'urban', 'agricultural', 'unknown'],
      default: 'unknown'
    },
    accuracy: Number, // GPS accuracy in meters
    source: {
      type: String,
      enum: ['gps', 'manual', 'exif', 'ip', 'unknown'],
      default: 'unknown'
    }
  },
  metadata: {
    captureTime: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['camera', 'upload', 'mobile'],
      default: 'upload'
    },
    cameraModel: String,
    deviceInfo: {
      userAgent: String,
      platform: String,
      screenResolution: String
    },
    weather: {
      temperature: Number,
      humidity: Number,
      conditions: String,
      windSpeed: Number,
      visibility: Number
    },
    timeOfDay: {
      type: String,
      enum: ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night', 'unknown'],
      default: 'unknown'
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'unknown'],
      default: 'unknown'
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'verified', 'flagged'],
    default: 'processing'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNotes: {
    type: String,
    maxlength: 1000
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  environmentalData: {
    habitat: String,
    threatLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    populationStatus: String,
    migrationPattern: String
  },
  socialData: {
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Geospatial index for location queries
detectionSchema.index({ location: '2dsphere' });

// Compound indexes for better query performance
detectionSchema.index({ user: 1, createdAt: -1 });
detectionSchema.index({ 'topPrediction.species': 1, createdAt: -1 });
detectionSchema.index({ status: 1, createdAt: -1 });
detectionSchema.index({ 'topPrediction.confidence': -1 });

// Virtual for getting nearby detections
detectionSchema.methods.getNearbyDetections = function(maxDistance = 5000) {
  return this.constructor.find({
    location: {
      $near: {
        $geometry: this.location,
        $maxDistance: maxDistance
      }
    },
    _id: { $ne: this._id }
  }).limit(10);
};

// Static method to get detection statistics
detectionSchema.statics.getStatistics = function(userId, dateRange) {
  const match = { user: userId };
  
  if (dateRange) {
    match.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$topPrediction.species',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$topPrediction.confidence' },
        maxConfidence: { $max: '$topPrediction.confidence' },
        lastSeen: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Detection', detectionSchema);