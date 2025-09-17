/**
 * Wildlife Detection Model
 * Stores real-time wildlife detection records from the monitoring system
 */

const mongoose = require('mongoose');

const WildlifeDetectionSchema = new mongoose.Schema({
  // Detection metadata
  detectionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Detected species information
  speciesDetected: {
    commonName: { type: String, required: true },
    scientificName: String,
    confidence: { type: Number, required: true, min: 0, max: 1 }
  },
  
  // Detection location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  
  // Geographic information
  country: String,
  region: String,
  continent: String,
  habitat: String,
  ecosystem: String,
  
  // Detection timing
  detectedAt: { type: Date, required: true, default: Date.now },
  timeOfDay: {
    type: String,
    enum: ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Dusk', 'Night'],
    required: true
  },
  
  // Environmental conditions
  weather: {
    temperature: Number, // Celsius
    humidity: Number, // Percentage
    windSpeed: Number, // km/h
    precipitation: Number, // mm
    visibility: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
    }
  },
  
  // Image/Video data
  mediaFiles: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: String,
    filename: String,
    size: Number, // bytes
    duration: Number, // seconds (for video/audio)
    resolution: String, // e.g., "1920x1080"
    format: String // e.g., "jpg", "mp4", "wav"
  }],
  
  // Detection method
  detectionMethod: {
    type: String,
    enum: ['Camera Trap', 'Drone Survey', 'Manual Observation', 'Acoustic Sensor', 'Satellite Imagery', 'AI Analysis'],
    required: true,
    default: 'AI Analysis'
  },
  
  // Camera/sensor information
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    manufacturer: String,
    model: String,
    firmwareVersion: String,
    batteryLevel: Number, // percentage
    storageUsed: Number // percentage
  },
  
  // Animal behavior observed
  behavior: {
    activity: {
      type: String,
      enum: ['Feeding', 'Resting', 'Moving', 'Hunting', 'Mating', 'Caring for Young', 'Playing', 'Alert', 'Sleeping', 'Unknown']
    },
    groupSize: { type: Number, default: 1 },
    groupComposition: String, // e.g., "Adult male with 2 juveniles"
    movementDirection: String, // e.g., "North", "Towards water source"
    interactionWithOtherSpecies: [String]
  },
  
  // Conservation relevance
  conservationImportance: {
    endangeredSpecies: { type: Boolean, default: false },
    rareSpecies: { type: Boolean, default: false },
    firstRecordInArea: { type: Boolean, default: false },
    breeding: { type: Boolean, default: false },
    migrationIndicator: { type: Boolean, default: false },
    humanWildlifeConflict: { type: Boolean, default: false }
  },
  
  // Data quality and validation
  dataQuality: {
    imageClarity: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    lighting: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    animalVisibility: {
      type: String,
      enum: ['Full Body', 'Partial', 'Silhouette', 'Features Only'],
      default: 'Partial'
    },
    verified: { type: Boolean, default: false },
    verifiedBy: String, // Expert who verified the detection
    verificationNotes: String
  },
  
  // AI/ML analysis details
  aiAnalysis: {
    modelUsed: String,
    modelVersion: String,
    processingTime: Number, // milliseconds
    alternativeSpecies: [{
      commonName: String,
      scientificName: String,
      confidence: Number
    }],
    features: [String], // e.g., ["spots", "long_tail", "large_ears"]
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  },
  
  // Research and monitoring context
  surveyInfo: {
    surveyId: String,
    surveyName: String,
    researcher: String,
    institution: String,
    projectName: String,
    fundingSource: String
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['Pending Review', 'Verified', 'Rejected', 'Needs More Data'],
    default: 'Pending Review'
  },
  
  // Tags for organization
  tags: [String],
  
  // Notes and comments
  notes: String,
  publicNotes: String, // Notes that can be shared publicly
  
  // System metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Indexes for performance
WildlifeDetectionSchema.index({ location: '2dsphere' }); // Geospatial queries
WildlifeDetectionSchema.index({ detectedAt: -1 }); // Recent detections
WildlifeDetectionSchema.index({ 'speciesDetected.commonName': 1 }); // Species lookup
WildlifeDetectionSchema.index({ 'speciesDetected.confidence': -1 }); // High confidence detections
WildlifeDetectionSchema.index({ country: 1, region: 1 }); // Geographic queries
WildlifeDetectionSchema.index({ detectionMethod: 1 }); // Method-based queries
WildlifeDetectionSchema.index({ status: 1 }); // Workflow queries
WildlifeDetectionSchema.index({ 'conservationImportance.endangeredSpecies': 1 }); // Conservation priority

// Virtual fields
WildlifeDetectionSchema.virtual('age').get(function() {
  return Date.now() - this.detectedAt;
});

WildlifeDetectionSchema.virtual('isRecentDetection').get(function() {
  const hoursDiff = (Date.now() - this.detectedAt) / (1000 * 60 * 60);
  return hoursDiff <= 24; // Last 24 hours
});

// Methods
WildlifeDetectionSchema.methods.updateConfidence = function(newConfidence) {
  this.speciesDetected.confidence = newConfidence;
  this.updatedAt = Date.now();
  return this.save();
};

WildlifeDetectionSchema.methods.verify = function(verifiedBy, notes) {
  this.status = 'Verified';
  this.dataQuality.verified = true;
  this.dataQuality.verifiedBy = verifiedBy;
  this.dataQuality.verificationNotes = notes;
  this.updatedAt = Date.now();
  return this.save();
};

WildlifeDetectionSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    this.updatedAt = Date.now();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
WildlifeDetectionSchema.statics.findBySpecies = function(speciesName) {
  return this.find({ 'speciesDetected.commonName': new RegExp(speciesName, 'i') });
};

WildlifeDetectionSchema.statics.findInRadius = function(longitude, latitude, radiusKm) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    }
  });
};

WildlifeDetectionSchema.statics.getRecentDetections = function(hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ detectedAt: { $gte: cutoffTime } })
    .sort({ detectedAt: -1 });
};

WildlifeDetectionSchema.statics.getSpeciesStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$speciesDetected.commonName',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$speciesDetected.confidence' },
        lastDetected: { $max: '$detectedAt' },
        locations: { $addToSet: '$country' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

WildlifeDetectionSchema.statics.getConservationPriorityDetections = function() {
  return this.find({
    $or: [
      { 'conservationImportance.endangeredSpecies': true },
      { 'conservationImportance.rareSpecies': true },
      { 'conservationImportance.firstRecordInArea': true }
    ]
  }).sort({ detectedAt: -1 });
};

// Pre-save middleware
WildlifeDetectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-tag endangered species
  if (this.conservationImportance.endangeredSpecies && !this.tags.includes('endangered')) {
    this.tags.push('endangered');
  }
  
  // Auto-tag high confidence detections
  if (this.speciesDetected.confidence >= 0.9 && !this.tags.includes('high-confidence')) {
    this.tags.push('high-confidence');
  }
  
  next();
});

const WildlifeDetection = mongoose.model('WildlifeDetection', WildlifeDetectionSchema);

module.exports = WildlifeDetection;