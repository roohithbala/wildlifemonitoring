const express = require('express');
const Detection = require('../models/Detection');
const wildlifeClassification = require('../services/wildlifeClassification');
const { uploadSingle } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, image metadata extraction will be limited');
}

const router = express.Router();

// Helper function to clean metadata and ensure valid enum values
const cleanMetadata = (metadata) => {
  const cleanedMetadata = { ...metadata };
  
  // Ensure timeOfDay is a valid enum value
  const validTimeOfDay = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night', 'unknown'];
  if (!validTimeOfDay.includes(cleanedMetadata.timeOfDay)) {
    cleanedMetadata.timeOfDay = 'unknown';
  }
  
  // Ensure season is a valid enum value
  const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'unknown'];
  if (!validSeasons.includes(cleanedMetadata.season)) {
    cleanedMetadata.season = 'unknown';
  }
  
  // Ensure source is a valid enum value
  const validSources = ['camera', 'upload', 'mobile'];
  if (!validSources.includes(cleanedMetadata.source)) {
    cleanedMetadata.source = 'upload';
  }
  
  return cleanedMetadata;
};

// Helper function to determine time of day from current time
const determineTimeOfDay = (date = new Date()) => {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
};

// @route   POST /api/detections/analyze
// @desc    Upload and analyze image for wildlife detection
// @access  Private
router.post('/analyze', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { location, metadata } = req.body;
    let parsedLocation = null;
    let parsedMetadata = null;

    // Parse location if provided
    if (location) {
      try {
        parsedLocation = JSON.parse(location);
      } catch (error) {
        console.error('Location parsing error:', error);
      }
    }

    // Parse metadata if provided
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        console.error('Metadata parsing error:', error);
      }
    }

    // Extract image metadata safely
    let imageMetadata = {
      width: null,
      height: null,
      format: null,
      mimeType: req.file.mimetype
    };

    let thumbnailUrl = null;

    if (sharp) {
      try {
        const imageBuffer = fs.readFileSync(req.file.path);
        
        // Validate image format before processing
        const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
        const fileExtension = path.extname(req.file.originalname).toLowerCase().substring(1);
        const mimeType = req.file.mimetype.toLowerCase();
        
        // Check if it's a supported image format
        const isValidFormat = supportedFormats.includes(fileExtension) || 
                             mimeType.startsWith('image/');
        
        if (!isValidFormat) {
          console.warn(`⚠️ Unsupported image format: ${fileExtension}, MIME: ${mimeType}`);
          throw new Error(`Unsupported image format: ${fileExtension}`);
        }
        
        const metadata = await sharp(imageBuffer).metadata();
        
        imageMetadata = {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          mimeType: req.file.mimetype
        };

        // Generate thumbnail
        const thumbnailPath = path.join(path.dirname(req.file.path), `thumb_${req.file.filename}`);
        await sharp(imageBuffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        thumbnailUrl = `/uploads/${req.user.id}/thumb_${req.file.filename}`;
        
      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError);
        // Continue without thumbnail generation
      }
    }

    // Create enhanced detection record
    const detection = new Detection({
      user: req.user.id,
      imageUrl: `/uploads/${req.user.id}/${req.file.filename}`,
      thumbnailUrl,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      imageMetadata,
      predictions: [],
      topPrediction: { species: 'processing', confidence: 0 },
      location: parsedLocation || {
        type: 'Point',
        coordinates: [0, 0]
      },
      metadata: {
        captureTime: new Date(),
        source: parsedMetadata?.source || 'upload',
        timeOfDay: parsedMetadata?.timeOfDay ? cleanMetadata({ timeOfDay: parsedMetadata.timeOfDay }).timeOfDay : determineTimeOfDay(),
        ...cleanMetadata(parsedMetadata || {})
      },
      analysisResults: {
        tensorFlowJS: parsedMetadata?.tensorFlowResult || null,
        serverAnalysis: null
      },
      status: 'processing'
    });



    await detection.save();

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Emit processing started event
    io.to(`user-${req.user.id}`).emit('detection-processing', {
      detectionId: detection._id,
      status: 'processing'
    });

    // Perform classification asynchronously
    setImmediate(async () => {
      try {
        // Check if we already have TensorFlow.js results
        const hasTensorFlowResults = parsedMetadata?.tensorFlowResult?.topPrediction;
        
        let enhancedPredictions = [];
        let topPrediction = {};
        let serverResult = null;

        if (hasTensorFlowResults) {
          // Use TensorFlow.js results as primary
          console.log('✅ Using TensorFlow.js browser analysis results');
          const tfResult = parsedMetadata.tensorFlowResult;
          
          enhancedPredictions = tfResult.predictions.map(pred => ({
            ...pred,
            classIndex: pred.classIndex || Math.floor(Math.random() * 1000),
            scientificName: getScientificName(pred.species),
            conservationStatus: getConservationStatus(pred.species)
          }));

          topPrediction = {
            ...tfResult.topPrediction,
            scientificName: getScientificName(tfResult.topPrediction.species),
            conservationStatus: getConservationStatus(tfResult.topPrediction.species)
          };
        } else {
          // Fallback to server analysis
          console.log('🔄 Running server-side analysis');
          const imagePath = path.join(process.cwd(), 'uploads', req.user.id.toString(), req.file.filename);
          
          // Use fake predictions for development
          // In production, uncomment the line below:
          // serverResult = await wildlifeClassification.classifyImage(imagePath);
          serverResult = wildlifeClassification.generateFakePredictions();

          enhancedPredictions = serverResult.predictions.map(pred => ({
            ...pred,
            classIndex: pred.classIndex || Math.floor(Math.random() * 1000),
            isWildlife: ['bear', 'wolf', 'fox', 'deer', 'bird', 'eagle', 'tiger', 'leopard', 'elephant'].some(animal => 
              pred.species.toLowerCase().includes(animal)
            ),
            scientificName: getScientificName(pred.species),
            conservationStatus: getConservationStatus(pred.species)
          }));

          topPrediction = {
            ...serverResult.topPrediction,
            classIndex: enhancedPredictions[0]?.classIndex,
            isWildlife: enhancedPredictions[0]?.isWildlife,
            scientificName: enhancedPredictions[0]?.scientificName,
            conservationStatus: enhancedPredictions[0]?.conservationStatus
          };
        }

        // Update detection with enhanced results
        detection.predictions = enhancedPredictions;
        detection.topPrediction = topPrediction;
        detection.status = 'completed';
        detection.processingTime = serverResult?.processingTime || parsedMetadata?.tensorFlowResult?.processingTime || 0;
        
        // Store server analysis results if we ran server analysis
        if (serverResult) {
          detection.analysisResults.serverAnalysis = {
            predictions: serverResult.predictions,
            processingTime: serverResult.processingTime,
            modelVersion: '1.0.0'
          };
        }

        // Calculate quality score
        detection.qualityScore = calculateQualityScore(detection);

        await detection.save();

        // Emit completion event with enhanced data
        io.to(`user-${req.user.id}`).emit('detection-completed', {
          detectionId: detection._id,
          result: {
            predictions: enhancedPredictions,
            topPrediction: detection.topPrediction,
            processingTime: detection.processingTime,
            qualityScore: detection.qualityScore
          }
        });

        // Check if it's a rare species and send notification
        if (detection.topPrediction.confidence > 0.7) {
          const rareSpecies = ['snow leopard', 'tiger', 'elephant', 'panda', 'rhinoceros', 'polar bear'];
          const isRare = rareSpecies.some(rare => 
            detection.topPrediction.species.toLowerCase().includes(rare)
          );

          if (isRare) {
            io.to(`user-${req.user.id}`).emit('rare-species-detected', {
              detectionId: detection._id,
              species: result.topPrediction.species,
              confidence: result.topPrediction.confidence,
              location: detection.location,
              conservationStatus: detection.topPrediction.conservationStatus
            });
          }
        }

      } catch (error) {
        console.error('Classification error:', error);
        
        // Update detection with error status
        detection.status = 'failed';
        await detection.save();

        // Emit error event
        io.to(`user-${req.user.id}`).emit('detection-error', {
          detectionId: detection._id,
          error: 'Failed to analyze image'
        });
      }
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully, analysis in progress',
      data: {
        detection: {
          id: detection._id,
          imageUrl: detection.imageUrl,
          thumbnailUrl: detection.thumbnailUrl,
          status: detection.status,
          imageMetadata: detection.imageMetadata,
          createdAt: detection.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Upload and analyze error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error during image analysis'
    });
  }
});

// Helper functions for enhanced detection data
function getScientificName(species) {
  const scientificNames = {
    'brown bear': 'Ursus arctos',
    'american black bear': 'Ursus americanus',
    'polar bear': 'Ursus maritimus',
    'grey wolf': 'Canis lupus',
    'red fox': 'Vulpes vulpes',
    'arctic fox': 'Vulpes lagopus',
    'tiger': 'Panthera tigris',
    'leopard': 'Panthera pardus',
    'snow leopard': 'Panthera uncia',
    'african elephant': 'Loxodonta africana',
    'indian elephant': 'Elephas maximus'
  };
  
  return scientificNames[species.toLowerCase()] || '';
}

function getConservationStatus(species) {
  const conservationStatus = {
    'polar bear': 'Vulnerable',
    'tiger': 'Endangered',
    'snow leopard': 'Vulnerable',
    'african elephant': 'Endangered',
    'indian elephant': 'Endangered',
    'grey wolf': 'Least Concern',
    'red fox': 'Least Concern',
    'brown bear': 'Least Concern'
  };
  
  return conservationStatus[species.toLowerCase()] || 'Unknown';
}

function calculateQualityScore(detection) {
  let score = 50; // Base score
  
  // Image quality factors
  if (detection.imageMetadata.width >= 1920) score += 10;
  if (detection.imageMetadata.height >= 1080) score += 10;
  
  // Prediction confidence
  if (detection.topPrediction.confidence > 0.8) score += 20;
  else if (detection.topPrediction.confidence > 0.6) score += 10;
  
  // Location data
  if (detection.location.coordinates[0] !== 0 && detection.location.coordinates[1] !== 0) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

// @route   GET /api/detections
// @desc    Get user's detections with pagination and filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const species = req.query.species || '';
    const status = req.query.status || '';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build query
    const query = { user: req.user.id };

    if (species) {
      query['topPrediction.species'] = new RegExp(species, 'i');
    }

    if (status && ['processing', 'completed', 'failed', 'verified'].includes(status)) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const detections = await Detection.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('verifiedBy', 'username firstName lastName');

    const total = await Detection.countDocuments(query);

    res.json({
      success: true,
      data: {
        detections,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get detections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching detections'
    });
  }
});

// @route   GET /api/detections/:id
// @desc    Get single detection by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('verifiedBy', 'username firstName lastName');

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    res.json({
      success: true,
      data: { detection }
    });

  } catch (error) {
    console.error('Get detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching detection'
    });
  }
});

// @route   PUT /api/detections/:id/verify
// @desc    Verify detection (admin/researcher only)
// @access  Private
router.put('/:id/verify', async (req, res) => {
  try {
    // Check if user has permission to verify
    if (!['admin', 'researcher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to verify detections'
      });
    }

    const { verificationNotes } = req.body;

    const detection = await Detection.findByIdAndUpdate(
      req.params.id,
      {
        status: 'verified',
        verifiedBy: req.user.id,
        verificationNotes: verificationNotes || ''
      },
      { new: true }
    ).populate('verifiedBy', 'username firstName lastName');

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    res.json({
      success: true,
      message: 'Detection verified successfully',
      data: { detection }
    });

  } catch (error) {
    console.error('Verify detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying detection'
    });
  }
});

// @route   DELETE /api/detections/:id
// @desc    Delete detection
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    // Delete associated image file
    const imagePath = path.join(process.cwd(), detection.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete detection record
    await Detection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Detection deleted successfully'
    });

  } catch (error) {
    console.error('Delete detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting detection'
    });
  }
});

// @route   GET /api/detections/nearby/:id
// @desc    Get nearby detections
// @access  Private
router.get('/nearby/:id', async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    const maxDistance = parseInt(req.query.maxDistance) || 5000; // 5km default
    const nearbyDetections = await detection.getNearbyDetections(maxDistance);

    res.json({
      success: true,
      data: { nearbyDetections }
    });

  } catch (error) {
    console.error('Get nearby detections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching nearby detections'
    });
  }
});

module.exports = router;