/**
 * Sample Wildlife Detection Data Seeding Script
 * Creates realistic detection records for testing and demonstration
 */

const mongoose = require('mongoose');
const WildlifeDetection = require('./models/WildlifeDetection');
const { Species } = require('./seed-world-wildlife');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-monitoring');

// Sample detection locations around the world
const sampleLocations = [
  // Africa
  { country: 'Kenya', region: 'Maasai Mara', continent: 'Africa', coords: [35.1405, -1.4061], habitat: 'Savanna' },
  { country: 'Tanzania', region: 'Serengeti', continent: 'Africa', coords: [34.8333, -2.3333], habitat: 'Grassland' },
  { country: 'South Africa', region: 'Kruger National Park', continent: 'Africa', coords: [31.5490, -24.9907], habitat: 'Savanna' },
  { country: 'Rwanda', region: 'Volcanoes National Park', continent: 'Africa', coords: [29.5000, -1.4667], habitat: 'Mountain Forest' },
  { country: 'Botswana', region: 'Okavango Delta', continent: 'Africa', coords: [22.4500, -19.2833], habitat: 'Wetland' },
  
  // Asia
  { country: 'India', region: 'Sundarbans', continent: 'Asia', coords: [89.0000, 21.9497], habitat: 'Mangrove' },
  { country: 'China', region: 'Sichuan Province', continent: 'Asia', coords: [104.0667, 30.6500], habitat: 'Temperate Forest' },
  { country: 'Nepal', region: 'Chitwan National Park', continent: 'Asia', coords: [84.3542, 27.5291], habitat: 'Tropical Forest' },
  { country: 'Mongolia', region: 'Gobi Desert', continent: 'Asia', coords: [103.8467, 42.7536], habitat: 'Desert' },
  { country: 'Indonesia', region: 'Borneo', continent: 'Asia', coords: [114.5000, 0.0000], habitat: 'Rainforest' },
  
  // North America
  { country: 'United States', region: 'Yellowstone', continent: 'North America', coords: [-110.5885, 44.4280], habitat: 'Forest' },
  { country: 'Canada', region: 'Banff National Park', continent: 'North America', coords: [-115.5708, 51.4968], habitat: 'Alpine' },
  { country: 'Alaska', region: 'Denali National Park', continent: 'North America', coords: [-150.5000, 63.1148], habitat: 'Tundra' },
  { country: 'Mexico', region: 'Monarch Butterfly Reserve', continent: 'North America', coords: [-100.2833, 19.6167], habitat: 'Forest' },
  
  // South America
  { country: 'Brazil', region: 'Amazon Rainforest', continent: 'South America', coords: [-60.0000, -3.0000], habitat: 'Rainforest' },
  { country: 'Peru', region: 'Manu National Park', continent: 'South America', coords: [-71.6500, -12.0000], habitat: 'Rainforest' },
  { country: 'Ecuador', region: 'Galápagos Islands', continent: 'South America', coords: [-90.5000, -0.5000], habitat: 'Coastal' },
  { country: 'Argentina', region: 'Patagonia', continent: 'South America', coords: [-69.0000, -49.0000], habitat: 'Grassland' },
  
  // Europe
  { country: 'Norway', region: 'Svalbard', continent: 'Europe', coords: [16.0000, 78.0000], habitat: 'Arctic' },
  { country: 'Romania', region: 'Carpathian Mountains', continent: 'Europe', coords: [25.0000, 45.8333], habitat: 'Mountain Forest' },
  { country: 'Spain', region: 'Doñana National Park', continent: 'Europe', coords: [-6.4500, 37.0000], habitat: 'Wetland' },
  
  // Australia/Oceania
  { country: 'Australia', region: 'Great Barrier Reef', continent: 'Australia', coords: [145.7781, -16.2839], habitat: 'Marine' },
  { country: 'Australia', region: 'Blue Mountains', continent: 'Australia', coords: [150.3117, -33.7122], habitat: 'Eucalyptus Forest' },
  { country: 'New Zealand', region: 'Fiordland', continent: 'Oceania', coords: [167.7000, -45.4167], habitat: 'Temperate Rainforest' }
];

// Detection methods with realistic distributions
const detectionMethods = [
  { method: 'Camera Trap', weight: 40 },
  { method: 'AI Analysis', weight: 25 },
  { method: 'Drone Survey', weight: 15 },
  { method: 'Manual Observation', weight: 10 },
  { method: 'Acoustic Sensor', weight: 8 },
  { method: 'Satellite Imagery', weight: 2 }
];

// Animal behaviors
const behaviors = [
  'Feeding', 'Resting', 'Moving', 'Hunting', 'Mating', 'Caring for Young', 
  'Playing', 'Alert', 'Sleeping', 'Grooming', 'Territorial Display'
];

// Generate random weighted choice
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.method;
  }
  return items[0].method;
}

// Generate random date within the last 90 days
function randomRecentDate() {
  const now = Date.now();
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  return new Date(ninetyDaysAgo + Math.random() * (now - ninetyDaysAgo));
}

// Generate time of day based on hour
function getTimeOfDay(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'Dawn';
  if (hour >= 8 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 15) return 'Midday';
  if (hour >= 15 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 21) return 'Dusk';
  return 'Night';
}

// Generate realistic confidence based on detection method
function generateConfidence(method) {
  const baseConfidence = {
    'Camera Trap': 0.85,
    'AI Analysis': 0.80,
    'Drone Survey': 0.75,
    'Manual Observation': 0.95,
    'Acoustic Sensor': 0.70,
    'Satellite Imagery': 0.65
  };
  
  const base = baseConfidence[method] || 0.75;
  const variation = (Math.random() - 0.5) * 0.2; // ±0.1 variation
  return Math.max(0.5, Math.min(1.0, base + variation));
}

async function createSampleDetections() {
  try {
    console.log('🎲 Creating sample wildlife detection data...');
    
    // Get all species from database
    const allSpecies = await Species.find({});
    if (allSpecies.length === 0) {
      throw new Error('No species found in database. Please run seed-world-wildlife.js first.');
    }
    
    console.log(`📊 Found ${allSpecies.length} species in database`);
    
    // Clear existing detection data
    console.log('🗑️ Clearing existing detection data...');
    await WildlifeDetection.deleteMany({});
    
    const detections = [];
    const numDetections = 500; // Generate 500 sample detections
    
    console.log(`🎯 Generating ${numDetections} sample detections...`);
    
    for (let i = 0; i < numDetections; i++) {
      // Random species selection with some bias towards common species
      const species = allSpecies[Math.floor(Math.random() * allSpecies.length)];
      
      // Random location
      const location = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      
      // Add some coordinate variation (within ~10km)
      const coordVariation = 0.1; // roughly 10km
      const longitude = location.coords[0] + (Math.random() - 0.5) * coordVariation;
      const latitude = location.coords[1] + (Math.random() - 0.5) * coordVariation;
      
      // Random detection method
      const method = weightedRandom(detectionMethods);
      
      // Generate detection date
      const detectedAt = randomRecentDate();
      
      // Generate confidence based on method
      const confidence = generateConfidence(method);
      
      // Determine conservation importance
      const isEndangered = ['Endangered', 'Critically Endangered'].includes(species.conservationStatus);
      const isRare = ['Vulnerable', 'Near Threatened'].includes(species.conservationStatus);
      
      // Random behavior
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const groupSize = Math.floor(Math.random() * 5) + 1;
      
      // Create detection record
      const detection = {
        speciesDetected: {
          commonName: species.commonName,
          scientificName: species.scientificName,
          confidence: parseFloat(confidence.toFixed(3))
        },
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        country: location.country,
        region: location.region,
        continent: location.continent,
        habitat: location.habitat,
        detectedAt,
        timeOfDay: getTimeOfDay(detectedAt),
        detectionMethod: method,
        behavior: {
          activity: behavior,
          groupSize: groupSize,
          groupComposition: groupSize > 1 ? `Group of ${groupSize}` : 'Single individual'
        },
        conservationImportance: {
          endangeredSpecies: isEndangered,
          rareSpecies: isRare,
          firstRecordInArea: Math.random() < 0.05, // 5% chance of being first record
          breeding: Math.random() < 0.15, // 15% chance of breeding behavior
          migrationIndicator: Math.random() < 0.1 // 10% chance of migration
        },
        dataQuality: {
          imageClarity: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
          lighting: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
          animalVisibility: ['Full Body', 'Partial', 'Features Only'][Math.floor(Math.random() * 3)],
          verified: Math.random() < 0.7, // 70% verification rate
          verifiedBy: Math.random() < 0.7 ? 'Dr. Wildlife Expert' : undefined
        },
        aiAnalysis: {
          modelUsed: 'TensorFlow.js Wildlife Classifier',
          modelVersion: '1.0.0',
          processingTime: Math.floor(Math.random() * 2000) + 500,
          features: species.characteristics?.slice(0, 3) || ['Unknown features']
        },
        weather: {
          temperature: Math.floor(Math.random() * 35) - 10, // -10 to 25°C
          humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
          visibility: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)]
        },
        status: Math.random() < 0.8 ? 'Verified' : 'Pending Review',
        tags: [
          ...(isEndangered ? ['endangered'] : []),
          ...(isRare ? ['vulnerable'] : []),
          ...(confidence > 0.9 ? ['high-confidence'] : []),
          ...(Math.random() < 0.3 ? ['research-priority'] : [])
        ]
      };
      
      detections.push(detection);
    }
    
    // Insert all detections
    console.log('💾 Inserting detection records...');
    const insertedDetections = await WildlifeDetection.insertMany(detections);
    
    console.log(`✅ Successfully created ${insertedDetections.length} sample detections!`);
    
    // Update species detection frequencies
    console.log('📈 Updating species detection frequencies...');
    const speciesUpdates = {};
    
    insertedDetections.forEach(detection => {
      const speciesName = detection.speciesDetected.scientificName;
      speciesUpdates[speciesName] = (speciesUpdates[speciesName] || 0) + 1;
    });
    
    for (const [scientificName, count] of Object.entries(speciesUpdates)) {
      await Species.updateOne(
        { scientificName },
        { 
          $inc: { detectionFrequency: count },
          $set: { lastDetected: new Date() }
        }
      );
    }
    
    // Generate summary statistics
    const totalDetections = insertedDetections.length;
    const uniqueSpecies = new Set(insertedDetections.map(d => d.speciesDetected.commonName)).size;
    const endangeredDetections = insertedDetections.filter(d => d.conservationImportance.endangeredSpecies).length;
    const verifiedDetections = insertedDetections.filter(d => d.dataQuality.verified).length;
    const continentStats = {};
    
    insertedDetections.forEach(detection => {
      const continent = detection.continent;
      continentStats[continent] = (continentStats[continent] || 0) + 1;
    });
    
    console.log('\n📊 Sample Data Summary:');
    console.log(`   Total Detections: ${totalDetections}`);
    console.log(`   Unique Species: ${uniqueSpecies}`);
    console.log(`   Endangered Species Detections: ${endangeredDetections}`);
    console.log(`   Verified Detections: ${verifiedDetections}`);
    console.log(`   Verification Rate: ${(verifiedDetections/totalDetections*100).toFixed(1)}%`);
    
    console.log('\n🌍 Detections by Continent:');
    Object.entries(continentStats).forEach(([continent, count]) => {
      console.log(`   ${continent}: ${count} detections`);
    });
    
    console.log('\n🎯 Sample detection data is ready for world-level wildlife monitoring!');
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error creating sample detections:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  createSampleDetections();
}

module.exports = { createSampleDetections };