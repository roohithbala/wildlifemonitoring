const express = require('express');
const Detection = require('../models/Detection');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get comprehensive analytics for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const timeRange = req.query.timeRange || '7d';
    
    // Parse time range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[timeRange] || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic overview stats
    const totalDetections = await Detection.countDocuments({ user: userId });
    const recentDetections = await Detection.countDocuments({
      user: userId,
      createdAt: { $gte: startDate }
    });

    // Get previous period for growth calculation
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    const previousDetections = await Detection.countDocuments({
      user: userId,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const detectionGrowth = previousDetections > 0 
      ? Math.round(((recentDetections - previousDetections) / previousDetections) * 100)
      : 0;

    // Get species distribution
    const speciesDistribution = await Detection.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$topPrediction.species',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$topPrediction.confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get detection timeline
    const detectionTimeline = await Detection.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get confidence distribution
    const confidenceStats = await Detection.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          high: {
            $sum: {
              $cond: [{ $gte: ['$topPrediction.confidence', 0.7] }, 1, 0]
            }
          },
          medium: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$topPrediction.confidence', 0.5] },
                    { $lt: ['$topPrediction.confidence', 0.7] }
                  ]
                },
                1,
                0
              ]
            }
          },
          low: {
            $sum: {
              $cond: [{ $lt: ['$topPrediction.confidence', 0.5] }, 1, 0]
            }
          },
          avgConfidence: { $avg: '$topPrediction.confidence' }
        }
      }
    ]);

    // Get top locations
    const topLocations = await Detection.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
          'location.address': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$location.address',
          count: { $sum: 1 },
          region: { $first: '$location.region' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: '$_id',
          count: 1,
          region: 1,
          _id: 0
        }
      }
    ]);

    // Calculate metrics
    const uniqueSpecies = speciesDistribution.length;
    const averageConfidence = confidenceStats[0]?.avgConfidence || 0;
    const uniqueLocations = topLocations.length;

    res.json({
      success: true,
      data: {
        overview: {
          totalDetections,
          recentDetections,
          uniqueSpecies,
          averageConfidence,
          uniqueLocations,
          detectionGrowth,
          speciesGrowth: 0, // TODO: Calculate species growth
          confidenceChange: 0, // TODO: Calculate confidence change
          locationGrowth: 0 // TODO: Calculate location growth
        },
        speciesDistribution,
        detectionTimeline: detectionTimeline.map(item => ({
          date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
          count: item.count
        })),
        confidenceDistribution: confidenceStats[0] || { high: 0, medium: 0, low: 0 },
        topLocations,
        insights: [
          {
            title: 'Most Active Species',
            description: speciesDistribution[0] 
              ? `${speciesDistribution[0]._id} with ${speciesDistribution[0].count} detections`
              : 'No species data available',
            value: speciesDistribution[0]?.count || 0
          },
          {
            title: 'Detection Accuracy',
            description: `Average confidence level across all detections`,
            value: `${(averageConfidence * 100).toFixed(1)}%`
          },
          {
            title: 'Activity Trend',
            description: detectionGrowth > 0 
              ? `${detectionGrowth}% increase in detections`
              : detectionGrowth < 0 
                ? `${Math.abs(detectionGrowth)}% decrease in detections`
                : 'No change in detection activity',
            value: `${detectionGrowth}%`
          }
        ]
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics data'
    });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for current user
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get basic stats
    const totalDetections = await Detection.countDocuments({ user: userId });
    const recentDetections = await Detection.countDocuments({
      user: userId,
      createdAt: { $gte: startDate }
    });

    // Get species distribution
    const speciesStats = await Detection.getStatistics(userId, {
      start: startDate,
      end: new Date()
    });

    // Get detection timeline (daily counts)
    const timeline = await Detection.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get confidence distribution
    const confidenceStats = await Detection.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed'
        }
      },
      {
        $bucket: {
          groupBy: '$topPrediction.confidence',
          boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Get recent high-confidence detections
    const recentHighConfidence = await Detection.find({
      user: userId,
      'topPrediction.confidence': { $gte: 0.8 },
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('topPrediction imageUrl createdAt location');

    res.json({
      success: true,
      data: {
        overview: {
          totalDetections,
          recentDetections,
          uniqueSpecies: speciesStats.length,
          averageConfidence: speciesStats.length > 0 
            ? speciesStats.reduce((sum, s) => sum + s.avgConfidence, 0) / speciesStats.length 
            : 0
        },
        speciesDistribution: speciesStats,
        timeline: timeline.map(t => ({
          date: new Date(t._id.year, t._id.month - 1, t._id.day).toISOString().split('T')[0],
          count: t.count
        })),
        confidenceDistribution: confidenceStats,
        recentHighConfidence
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/species/:species
// @desc    Get detailed analytics for a specific species
// @access  Private
router.get('/species/:species', async (req, res) => {
  try {
    const userId = req.user.id;
    const species = req.params.species;
    const timeframe = req.query.timeframe || '90'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get detections for this species
    const detections = await Detection.find({
      user: userId,
      'topPrediction.species': new RegExp(species, 'i'),
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Get temporal distribution
    const temporalStats = await Detection.aggregate([
      {
        $match: {
          user: userId,
          'topPrediction.species': new RegExp(species, 'i'),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$metadata.timeOfDay',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$topPrediction.confidence' }
        }
      }
    ]);

    // Get location distribution
    const locationStats = await Detection.aggregate([
      {
        $match: {
          user: userId,
          'topPrediction.species': new RegExp(species, 'i'),
          'location.coordinates': { $ne: [0, 0] }
        }
      },
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] }
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$topPrediction.confidence' },
          detections: { $push: '$$ROOT' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        species,
        summary: {
          totalSightings: detections.length,
          averageConfidence: detections.length > 0 
            ? detections.reduce((sum, d) => sum + d.topPrediction.confidence, 0) / detections.length 
            : 0,
          lastSeen: detections.length > 0 ? detections[0].createdAt : null,
          firstSeen: detections.length > 0 ? detections[detections.length - 1].createdAt : null
        },
        temporalDistribution: temporalStats,
        locationDistribution: locationStats,
        recentDetections: detections.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Species analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching species analytics'
    });
  }
});

// @route   GET /api/analytics/heatmap
// @desc    Get location heatmap data
// @access  Private
router.get('/heatmap', async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || '30'; // days
    const species = req.query.species;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const matchQuery = {
      user: userId,
      createdAt: { $gte: startDate },
      'location.coordinates': { $ne: [0, 0] }
    };

    if (species) {
      matchQuery['topPrediction.species'] = new RegExp(species, 'i');
    }

    const heatmapData = await Detection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] }
          },
          count: { $sum: 1 },
          species: { $addToSet: '$topPrediction.species' },
          avgConfidence: { $avg: '$topPrediction.confidence' },
          maxConfidence: { $max: '$topPrediction.confidence' }
        }
      },
      {
        $project: {
          latitude: '$_id.lat',
          longitude: '$_id.lng',
          intensity: '$count',
          species: 1,
          avgConfidence: 1,
          maxConfidence: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: { heatmapData }
    });

  } catch (error) {
    console.error('Heatmap analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching heatmap data'
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || 'json'; // json, csv
    const timeframe = req.query.timeframe || '30';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const detections = await Detection.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).populate('verifiedBy', 'username');

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Species,Confidence,Latitude,Longitude,Status,Verified By\n';
      const csvData = detections.map(d => {
        const lat = d.location.coordinates[1] || 0;
        const lng = d.location.coordinates[0] || 0;
        const verifiedBy = d.verifiedBy ? d.verifiedBy.username : '';
        
        return `${d.createdAt.toISOString().split('T')[0]},${d.topPrediction.species},${d.topPrediction.confidence},${lat},${lng},${d.status},${verifiedBy}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="wildlife-detections-${Date.now()}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      // JSON format
      res.json({
        success: true,
        data: {
          exportDate: new Date(),
          timeframe: `${timeframe} days`,
          totalRecords: detections.length,
          detections
        }
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting analytics data'
    });
  }
});

// @route   GET /api/analytics/global
// @desc    Get global analytics (admin only)
// @access  Private (Admin)
router.get('/global', async (req, res) => {
  try {
    // Check admin permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const timeframe = req.query.timeframe || '30';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Global statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalDetections = await Detection.countDocuments();
    const recentDetections = await Detection.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Top species globally
    const topSpecies = await Detection.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$topPrediction.species',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$topPrediction.confidence' },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          species: '$_id',
          count: 1,
          avgConfidence: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // User activity
    const userActivity = await Detection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          detectionCount: { $sum: 1 },
          uniqueSpecies: { $addToSet: '$topPrediction.species' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          username: { $arrayElemAt: ['$user.username', 0] },
          detectionCount: 1,
          uniqueSpecies: { $size: '$uniqueSpecies' }
        }
      },
      { $sort: { detectionCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDetections,
          recentDetections,
          averageDetectionsPerUser: totalUsers > 0 ? Math.round(totalDetections / totalUsers) : 0
        },
        topSpecies,
        topUsers: userActivity
      }
    });

  } catch (error) {
    console.error('Global analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching global analytics'
    });
  }
});

module.exports = router;