/**
 * Wildlife Detection API Routes
 * Real MongoDB integration for world-level wildlife monitoring
 */

const express = require('express');
const router = express.Router();
const WildlifeDetection = require('../models/WildlifeDetection');
const { Species } = require('../seed-world-wildlife');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/wildlife/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `wildlife-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|wav|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
});

/**
 * GET /api/wildlife/dashboard
 * Get dashboard statistics from real MongoDB data
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    console.log('📊 Fetching real dashboard data from MongoDB...');
    
    // Get total detection count
    const totalDetections = await WildlifeDetection.countDocuments();
    
    // Get recent detections (last 24 hours)
    const recentDetections = await WildlifeDetection.getRecentDetections(24);
    
    // Get species statistics
    const speciesStats = await WildlifeDetection.getSpeciesStats();
    
    // Get conservation priority detections
    const conservationPriorityDetections = await WildlifeDetection.getConservationPriorityDetections();
    
    // Get geographic distribution
    const geographicStats = await WildlifeDetection.aggregate([
      {
        $group: {
          _id: '$continent',
          count: { $sum: 1 },
          countries: { $addToSet: '$country' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get detection method statistics
    const methodStats = await WildlifeDetection.aggregate([
      {
        $group: {
          _id: '$detectionMethod',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get monthly trend data
    const monthlyTrends = await WildlifeDetection.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$detectedAt' },
            month: { $month: '$detectedAt' }
          },
          count: { $sum: 1 },
          uniqueSpecies: { $addToSet: '$speciesDetected.commonName' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    // Calculate detection trends
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayDetections = await WildlifeDetection.countDocuments({
      detectedAt: { $gte: yesterday }
    });
    
    const weekDetections = await WildlifeDetection.countDocuments({
      detectedAt: { $gte: lastWeek }
    });
    
    // Get high-confidence detections
    const highConfidenceDetections = await WildlifeDetection.countDocuments({
      'speciesDetected.confidence': { $gte: 0.8 }
    });
    
    // Get unique species count
    const uniqueSpeciesCount = await WildlifeDetection.distinct('speciesDetected.commonName');
    
    const dashboardData = {
      overview: {
        totalDetections,
        recentDetections: recentDetections.length,
        uniqueSpecies: uniqueSpeciesCount.length,
        conservationAlerts: conservationPriorityDetections.length,
        highConfidenceDetections,
        detectionTrends: {
          today: todayDetections,
          thisWeek: weekDetections,
          changeFromLastWeek: weekDetections > 0 ? ((todayDetections / (weekDetections / 7) - 1) * 100).toFixed(1) : 0
        }
      },
      speciesDistribution: speciesStats.slice(0, 10), // Top 10 species
      geographicDistribution: geographicStats,
      detectionMethods: methodStats,
      monthlyTrends: monthlyTrends.reverse(),
      recentActivity: recentDetections.slice(0, 10).map(detection => ({
        id: detection._id,
        species: detection.speciesDetected.commonName,
        confidence: detection.speciesDetected.confidence,
        location: `${detection.country || 'Unknown'}, ${detection.region || 'Unknown'}`,
        timestamp: detection.detectedAt,
        method: detection.detectionMethod,
        conservation: detection.conservationImportance.endangeredSpecies,
        verified: detection.dataQuality.verified
      })),
      conservationAlerts: conservationPriorityDetections.slice(0, 5).map(detection => ({
        id: detection._id,
        species: detection.speciesDetected.commonName,
        location: `${detection.country || 'Unknown'}, ${detection.region || 'Unknown'}`,
        timestamp: detection.detectedAt,
        alertType: detection.conservationImportance.endangeredSpecies ? 'Endangered Species' :
                  detection.conservationImportance.rareSpecies ? 'Rare Species' : 'First Record',
        confidence: detection.speciesDetected.confidence
      }))
    };
    
    console.log('✅ Real dashboard data retrieved successfully');
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/wildlife/detections
 * Get paginated wildlife detections with filtering
 */
router.get('/detections', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      species,
      country,
      continent,
      method,
      verified,
      endangered,
      startDate,
      endDate,
      minConfidence = 0
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (species) {
      filter['speciesDetected.commonName'] = new RegExp(species, 'i');
    }
    
    if (country) {
      filter.country = new RegExp(country, 'i');
    }
    
    if (continent) {
      filter.continent = continent;
    }
    
    if (method) {
      filter.detectionMethod = method;
    }
    
    if (verified !== undefined) {
      filter['dataQuality.verified'] = verified === 'true';
    }
    
    if (endangered !== undefined) {
      filter['conservationImportance.endangeredSpecies'] = endangered === 'true';
    }
    
    if (startDate || endDate) {
      filter.detectedAt = {};
      if (startDate) filter.detectedAt.$gte = new Date(startDate);
      if (endDate) filter.detectedAt.$lte = new Date(endDate);
    }
    
    if (minConfidence > 0) {
      filter['speciesDetected.confidence'] = { $gte: parseFloat(minConfidence) };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [detections, total] = await Promise.all([
      WildlifeDetection.find(filter)
        .sort({ detectedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      WildlifeDetection.countDocuments(filter)
    ]);
    
    res.json({
      detections,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: detections.length,
        totalRecords: total
      },
      filters: {
        species,
        country,
        continent,
        method,
        verified,
        endangered,
        startDate,
        endDate,
        minConfidence
      }
    });
    
  } catch (error) {
    console.error('Error fetching detections:', error);
    res.status(500).json({ message: 'Error fetching detections', error: error.message });
  }
});

/**
 * POST /api/wildlife/detect
 * Process new wildlife detection (with image upload)
 */
router.post('/detect', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      species,
      confidence,
      longitude,
      latitude,
      country,
      region,
      continent,
      habitat,
      notes
    } = req.body;
    
    if (!species || !confidence || !longitude || !latitude) {
      return res.status(400).json({
        message: 'Missing required fields: species, confidence, longitude, latitude'
      });
    }
    
    // Check if species exists in our database
    const speciesData = await Species.findOne({
      $or: [
        { commonName: new RegExp(species, 'i') },
        { scientificName: new RegExp(species, 'i') }
      ]
    });
    
    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour >= 5 && hour < 8) timeOfDay = 'Dawn';
    else if (hour >= 8 && hour < 12) timeOfDay = 'Morning';
    else if (hour >= 12 && hour < 15) timeOfDay = 'Midday';
    else if (hour >= 15 && hour < 18) timeOfDay = 'Afternoon';
    else if (hour >= 18 && hour < 21) timeOfDay = 'Dusk';
    else timeOfDay = 'Night';
    
    // Create new detection record
    const detection = new WildlifeDetection({
      speciesDetected: {
        commonName: species,
        scientificName: speciesData?.scientificName || '',
        confidence: parseFloat(confidence)
      },
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      country: country || 'Unknown',
      region: region || 'Unknown',
      continent: continent || 'Unknown',
      habitat: habitat || 'Unknown',
      timeOfDay,
      detectionMethod: 'AI Analysis',
      mediaFiles: req.file ? [{
        type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        url: `/uploads/wildlife/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
        format: path.extname(req.file.originalname).substring(1)
      }] : [],
      conservationImportance: {
        endangeredSpecies: speciesData?.conservationStatus === 'Endangered' || 
                          speciesData?.conservationStatus === 'Critically Endangered',
        rareSpecies: speciesData?.conservationStatus === 'Vulnerable' || 
                    speciesData?.conservationStatus === 'Near Threatened'
      },
      aiAnalysis: {
        modelUsed: 'TensorFlow.js Wildlife Classifier',
        modelVersion: '1.0.0',
        processingTime: Math.random() * 1000 + 500 // Simulated processing time
      },
      notes,
      createdBy: req.user.id
    });
    
    await detection.save();
    
    // Update species detection frequency
    if (speciesData) {
      speciesData.detectionFrequency += 1;
      speciesData.lastDetected = new Date();
      await speciesData.save();
    }
    
    console.log(`✅ New wildlife detection recorded: ${species} at ${latitude}, ${longitude}`);
    
    res.status(201).json({
      message: 'Wildlife detection recorded successfully',
      detection: {
        id: detection._id,
        species: detection.speciesDetected.commonName,
        confidence: detection.speciesDetected.confidence,
        location: detection.location,
        timestamp: detection.detectedAt,
        conservationAlert: detection.conservationImportance.endangeredSpecies
      }
    });
    
  } catch (error) {
    console.error('Error processing wildlife detection:', error);
    res.status(500).json({ message: 'Error processing detection', error: error.message });
  }
});

/**
 * GET /api/wildlife/species
 * Get list of all known species from database
 */
router.get('/species', async (req, res) => {
  try {
    const { search, continent, conservationStatus, limit = 50 } = req.query;
    
    const filter = {};
    
    if (search) {
      filter.$or = [
        { commonName: new RegExp(search, 'i') },
        { scientificName: new RegExp(search, 'i') }
      ];
    }
    
    if (continent) {
      filter.continent = continent;
    }
    
    if (conservationStatus) {
      filter.conservationStatus = conservationStatus;
    }
    
    const species = await Species.find(filter)
      .limit(parseInt(limit))
      .sort({ commonName: 1 });
    
    res.json(species);
    
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ message: 'Error fetching species', error: error.message });
  }
});

/**
 * GET /api/wildlife/map-data
 * Get detection data for map visualization
 */
router.get('/map-data', auth, async (req, res) => {
  try {
    const { 
      bounds, // Format: "sw_lat,sw_lng,ne_lat,ne_lng"
      species,
      startDate,
      endDate,
      minConfidence = 0.5
    } = req.query;
    
    const filter = {
      'speciesDetected.confidence': { $gte: parseFloat(minConfidence) }
    };
    
    // Geographic bounds filtering
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(parseFloat);
      filter.location = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }
    
    if (species) {
      filter['speciesDetected.commonName'] = new RegExp(species, 'i');
    }
    
    if (startDate || endDate) {
      filter.detectedAt = {};
      if (startDate) filter.detectedAt.$gte = new Date(startDate);
      if (endDate) filter.detectedAt.$lte = new Date(endDate);
    }
    
    const detections = await WildlifeDetection.find(filter)
      .limit(1000) // Limit for performance
      .select('speciesDetected location detectedAt conservationImportance dataQuality')
      .sort({ detectedAt: -1 });
    
    // Format for map display
    const mapData = detections.map(detection => ({
      id: detection._id,
      species: detection.speciesDetected.commonName,
      confidence: detection.speciesDetected.confidence,
      coordinates: detection.location.coordinates,
      timestamp: detection.detectedAt,
      endangered: detection.conservationImportance.endangeredSpecies,
      verified: detection.dataQuality.verified
    }));
    
    res.json({
      detections: mapData,
      summary: {
        total: mapData.length,
        species: [...new Set(mapData.map(d => d.species))].length,
        endangered: mapData.filter(d => d.endangered).length,
        verified: mapData.filter(d => d.verified).length
      }
    });
    
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ message: 'Error fetching map data', error: error.message });
  }
});

/**
 * GET /api/wildlife/analytics
 * Get detailed analytics data
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const [
      totalDetections,
      speciesStats,
      conservationStats,
      geographicStats,
      timelineData,
      confidenceStats
    ] = await Promise.all([
      WildlifeDetection.countDocuments({ detectedAt: { $gte: startDate } }),
      
      WildlifeDetection.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$speciesDetected.commonName',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$speciesDetected.confidence' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      
      WildlifeDetection.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            endangered: {
              $sum: { $cond: ['$conservationImportance.endangeredSpecies', 1, 0] }
            },
            vulnerable: {
              $sum: { $cond: ['$conservationImportance.rareSpecies', 1, 0] }
            },
            total: { $sum: 1 }
          }
        }
      ]),
      
      WildlifeDetection.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { continent: '$continent', country: '$country' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      WildlifeDetection.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } }
            },
            count: { $sum: 1 },
            uniqueSpecies: { $addToSet: '$speciesDetected.commonName' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      WildlifeDetection.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $bucket: {
            groupBy: '$speciesDetected.confidence',
            boundaries: [0, 0.5, 0.7, 0.8, 0.9, 1.0],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ])
    ]);
    
    res.json({
      summary: {
        totalDetections,
        timeframe,
        dateRange: { start: startDate, end: now }
      },
      species: speciesStats,
      conservation: conservationStats[0] || { endangered: 0, vulnerable: 0, total: 0 },
      geographic: geographicStats,
      timeline: timelineData.map(item => ({
        date: item._id.date,
        detections: item.count,
        species: item.uniqueSpecies.length
      })),
      confidence: confidenceStats
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;