/**
 * World-Level Wildlife Database Seeding Script
 * Populates MongoDB with comprehensive global wildlife species data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-monitoring');

// Wildlife Species Schema for reference data
const SpeciesSchema = new mongoose.Schema({
  commonName: { type: String, required: true },
  scientificName: { type: String, required: true, unique: true, index: true },
  family: String,
  order: String,
  class: String,
  conservationStatus: {
    type: String,
    enum: ['Extinct', 'Extinct in Wild', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient'],
    default: 'Data Deficient'
  },
  habitat: [String],
  region: [String],
  continent: [String],
  averageWeight: Number, // in kg
  averageLength: Number, // in cm
  lifespan: Number, // in years
  diet: {
    type: String,
    enum: ['Carnivore', 'Herbivore', 'Omnivore', 'Insectivore', 'Piscivore'],
    default: 'Omnivore'
  },
  characteristics: [String],
  funFacts: [String],
  imageUrls: [String],
  soundUrls: [String],
  activityPeriod: {
    type: String,
    enum: ['Diurnal', 'Nocturnal', 'Crepuscular', 'Cathemeral'],
    default: 'Diurnal'
  },
  socialBehavior: {
    type: String,
    enum: ['Solitary', 'Pair', 'Small Group', 'Large Group', 'Colonial'],
    default: 'Solitary'
  },
  migrationPattern: {
    type: String,
    enum: ['Non-migratory', 'Seasonal', 'Altitudinal', 'Nomadic'],
    default: 'Non-migratory'
  },
  threatsAndChallenges: [String],
  conservationEfforts: [String],
  detectionFrequency: { type: Number, default: 0 },
  lastDetected: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Species = mongoose.model('Species', SpeciesSchema);

// Comprehensive world wildlife species data
const worldWildlifeSpecies = [
  // African Wildlife
  {
    commonName: 'African Elephant',
    scientificName: 'Loxodonta africana',
    family: 'Elephantidae',
    order: 'Proboscidea',
    class: 'Mammalia',
    conservationStatus: 'Endangered',
    habitat: ['Savanna', 'Grassland', 'Forest'],
    region: ['Sub-Saharan Africa'],
    continent: ['Africa'],
    averageWeight: 6000,
    averageLength: 600,
    lifespan: 70,
    diet: 'Herbivore',
    characteristics: ['Large ears', 'Long trunk', 'Tusks', 'Gray skin'],
    funFacts: ['Can drink up to 300 liters of water per day', 'Excellent memory', 'Communicate through infrasound'],
    activityPeriod: 'Cathemeral',
    socialBehavior: 'Large Group',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Poaching', 'Habitat loss', 'Human-elephant conflict'],
    conservationEfforts: ['Anti-poaching patrols', 'Habitat protection', 'Community conservation programs']
  },
  {
    commonName: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    family: 'Hominidae',
    order: 'Primates',
    class: 'Mammalia',
    conservationStatus: 'Critically Endangered',
    habitat: ['Mountain Forest'],
    region: ['Central Africa', 'East Africa'],
    continent: ['Africa'],
    averageWeight: 180,
    averageLength: 150,
    lifespan: 35,
    diet: 'Herbivore',
    characteristics: ['Thick fur', 'Large hands', 'Prominent sagittal crest', 'Peaceful nature'],
    funFacts: ['Share 98% DNA with humans', 'Live in family groups', 'Very gentle despite their size'],
    activityPeriod: 'Diurnal',
    socialBehavior: 'Small Group',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Habitat destruction', 'Poaching', 'Disease transmission from humans'],
    conservationEfforts: ['Gorilla tourism', 'Habitat protection', 'Veterinary care']
  },
  {
    commonName: 'African Lion',
    scientificName: 'Panthera leo',
    family: 'Felidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Vulnerable',
    habitat: ['Savanna', 'Grassland', 'Semi-desert'],
    region: ['Sub-Saharan Africa'],
    continent: ['Africa'],
    averageWeight: 190,
    averageLength: 250,
    lifespan: 15,
    diet: 'Carnivore',
    characteristics: ['Mane (males)', 'Powerful build', 'Social cats', 'Excellent hunters'],
    funFacts: ['Only cats that live in groups', 'Males sleep 20 hours a day', 'Roar can be heard 8km away'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Large Group',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Habitat loss', 'Human-wildlife conflict', 'Poaching'],
    conservationEfforts: ['Protected areas', 'Community conservancies', 'Conflict mitigation']
  },

  // Asian Wildlife
  {
    commonName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    family: 'Felidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Endangered',
    habitat: ['Tropical Forest', 'Mangrove', 'Grassland'],
    region: ['India', 'Bangladesh', 'Nepal', 'Bhutan'],
    continent: ['Asia'],
    averageWeight: 220,
    averageLength: 300,
    lifespan: 15,
    diet: 'Carnivore',
    characteristics: ['Orange coat with black stripes', 'Powerful swimmer', 'Solitary hunter', 'Night vision'],
    funFacts: ['Each tiger has unique stripe patterns', 'Can leap up to 10 meters', 'Excellent swimmers'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Solitary',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Poaching', 'Habitat fragmentation', 'Human-tiger conflict'],
    conservationEfforts: ['Tiger reserves', 'Anti-poaching units', 'Corridor protection']
  },
  {
    commonName: 'Giant Panda',
    scientificName: 'Ailuropoda melanoleuca',
    family: 'Ursidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Vulnerable',
    habitat: ['Temperate Forest'],
    region: ['Central China'],
    continent: ['Asia'],
    averageWeight: 100,
    averageLength: 120,
    lifespan: 20,
    diet: 'Herbivore',
    characteristics: ['Black and white fur', 'Pseudo-thumb', 'Bamboo specialist', 'Round appearance'],
    funFacts: ['Eats 12-16 hours per day', 'Can only digest 17% of bamboo eaten', 'Symbol of conservation'],
    activityPeriod: 'Cathemeral',
    socialBehavior: 'Solitary',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Habitat loss', 'Bamboo flowering cycles', 'Climate change'],
    conservationEfforts: ['Captive breeding', 'Nature reserves', 'Corridor creation']
  },
  {
    commonName: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    family: 'Felidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Vulnerable',
    habitat: ['Alpine', 'Subalpine'],
    region: ['Central Asia', 'South Asia'],
    continent: ['Asia'],
    averageWeight: 45,
    averageLength: 120,
    lifespan: 15,
    diet: 'Carnivore',
    characteristics: ['Thick fur', 'Large paws', 'Long tail', 'Blue-gray eyes'],
    funFacts: ['Cannot roar, only purr', 'Can leap 15 meters', 'Tail helps with balance'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Solitary',
    migrationPattern: 'Altitudinal',
    threatsAndChallenges: ['Climate change', 'Poaching', 'Prey depletion'],
    conservationEfforts: ['Community conservation', 'Camera trap monitoring', 'Livestock insurance']
  },

  // North American Wildlife
  {
    commonName: 'Grizzly Bear',
    scientificName: 'Ursus arctos horribilis',
    family: 'Ursidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Least Concern',
    habitat: ['Forest', 'Alpine', 'Tundra'],
    region: ['Western North America'],
    continent: ['North America'],
    averageWeight: 270,
    averageLength: 200,
    lifespan: 25,
    diet: 'Omnivore',
    characteristics: ['Brown fur with grizzled tips', 'Shoulder hump', 'Long claws', 'Powerful build'],
    funFacts: ['Can run up to 55 km/h', 'Excellent sense of smell', 'Hibernate for 5-7 months'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Solitary',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Habitat fragmentation', 'Human conflict', 'Climate change'],
    conservationEfforts: ['Protected areas', 'Bear-proof containers', 'Wildlife corridors']
  },
  {
    commonName: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    family: 'Accipitridae',
    order: 'Accipitriformes',
    class: 'Aves',
    conservationStatus: 'Least Concern',
    habitat: ['Forest', 'Wetland', 'Coastal'],
    region: ['North America'],
    continent: ['North America'],
    averageWeight: 5,
    averageLength: 90,
    lifespan: 30,
    diet: 'Piscivore',
    characteristics: ['White head and tail', 'Dark brown body', 'Hooked beak', 'Powerful talons'],
    funFacts: ['National bird of USA', 'Can see 4-7 times better than humans', 'Mates for life'],
    activityPeriod: 'Diurnal',
    socialBehavior: 'Pair',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['DDT poisoning (historical)', 'Habitat loss', 'Power line collisions'],
    conservationEfforts: ['DDT ban', 'Nest site protection', 'Captive breeding programs']
  },

  // South American Wildlife
  {
    commonName: 'Jaguar',
    scientificName: 'Panthera onca',
    family: 'Felidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Near Threatened',
    habitat: ['Rainforest', 'Wetland', 'Grassland'],
    region: ['Central America', 'South America'],
    continent: ['South America'],
    averageWeight: 95,
    averageLength: 180,
    lifespan: 15,
    diet: 'Carnivore',
    characteristics: ['Spotted coat', 'Powerful jaw', 'Excellent swimmer', 'Stocky build'],
    funFacts: ['Strongest bite of all big cats', 'Only big cat in Americas', 'Can crush turtle shells'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Solitary',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Deforestation', 'Hunting', 'Habitat fragmentation'],
    conservationEfforts: ['Protected areas', 'Corridor protection', 'Community programs']
  },
  {
    commonName: 'Giant Otter',
    scientificName: 'Pteronura brasiliensis',
    family: 'Mustelidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Endangered',
    habitat: ['River', 'Wetland'],
    region: ['Amazon Basin'],
    continent: ['South America'],
    averageWeight: 30,
    averageLength: 150,
    lifespan: 12,
    diet: 'Piscivore',
    characteristics: ['Webbed feet', 'Dense fur', 'Long tail', 'Social behavior'],
    funFacts: ['Largest otter species', 'Highly vocal', 'Live in family groups'],
    activityPeriod: 'Diurnal',
    socialBehavior: 'Small Group',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Habitat destruction', 'Water pollution', 'Illegal hunting'],
    conservationEfforts: ['Protected areas', 'Water quality monitoring', 'Community education']
  },

  // European Wildlife
  {
    commonName: 'European Brown Bear',
    scientificName: 'Ursus arctos arctos',
    family: 'Ursidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Least Concern',
    habitat: ['Forest', 'Mountain'],
    region: ['Europe', 'Northern Asia'],
    continent: ['Europe'],
    averageWeight: 200,
    averageLength: 180,
    lifespan: 25,
    diet: 'Omnivore',
    characteristics: ['Brown fur', 'Shoulder hump', 'Strong limbs', 'Excellent sense of smell'],
    funFacts: ['Can climb trees despite size', 'Hibernate in winter', 'Excellent memory'],
    activityPeriod: 'Crepuscular',
    socialBehavior: 'Solitary',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Human conflict', 'Habitat fragmentation', 'Hunting'],
    conservationEfforts: ['Protected areas', 'Corridor creation', 'Conflict prevention']
  },

  // Australian Wildlife
  {
    commonName: 'Koala',
    scientificName: 'Phascolarctos cinereus',
    family: 'Phascolarctidae',
    order: 'Diprotodontia',
    class: 'Mammalia',
    conservationStatus: 'Vulnerable',
    habitat: ['Eucalyptus Forest'],
    region: ['Eastern Australia'],
    continent: ['Australia'],
    averageWeight: 12,
    averageLength: 70,
    lifespan: 15,
    diet: 'Herbivore',
    characteristics: ['Gray fur', 'Large nose', 'Strong claws', 'Eucalyptus specialist'],
    funFacts: ['Sleep 18-22 hours per day', 'Rarely drink water', 'Unique fingerprints'],
    activityPeriod: 'Nocturnal',
    socialBehavior: 'Solitary',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Habitat loss', 'Disease', 'Vehicle strikes'],
    conservationEfforts: ['Habitat protection', 'Wildlife hospitals', 'Crossing structures']
  },
  {
    commonName: 'Tasmanian Devil',
    scientificName: 'Sarcophilus harrisii',
    family: 'Dasyuridae',
    order: 'Dasyuromorphia',
    class: 'Mammalia',
    conservationStatus: 'Endangered',
    habitat: ['Forest', 'Coastal Scrub'],
    region: ['Tasmania'],
    continent: ['Australia'],
    averageWeight: 8,
    averageLength: 65,
    lifespan: 5,
    diet: 'Carnivore',
    characteristics: ['Black fur', 'Powerful jaw', 'Stocky build', 'Screeching call'],
    funFacts: ['Strongest bite relative to body size', 'Can eat 40% of body weight', 'Mainly nocturnal'],
    activityPeriod: 'Nocturnal',
    socialBehavior: 'Solitary',
    migrationPattern: 'Non-migratory',
    threatsAndChallenges: ['Devil Facial Tumor Disease', 'Habitat loss', 'Vehicle strikes'],
    conservationEfforts: ['Captive breeding', 'Disease research', 'Habitat protection']
  },

  // Arctic Wildlife
  {
    commonName: 'Polar Bear',
    scientificName: 'Ursus maritimus',
    family: 'Ursidae',
    order: 'Carnivora',
    class: 'Mammalia',
    conservationStatus: 'Vulnerable',
    habitat: ['Arctic Sea Ice', 'Tundra'],
    region: ['Arctic Circle'],
    continent: ['North America', 'Europe', 'Asia'],
    averageWeight: 400,
    averageLength: 250,
    lifespan: 25,
    diet: 'Carnivore',
    characteristics: ['White fur', 'Black skin', 'Webbed paws', 'Excellent swimmer'],
    funFacts: ['Can swim for hours', 'Fur is actually transparent', 'Excellent sense of smell'],
    activityPeriod: 'Cathemeral',
    socialBehavior: 'Solitary',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Climate change', 'Sea ice loss', 'Pollution'],
    conservationEfforts: ['International agreements', 'Research monitoring', 'Pollution reduction']
  },

  // Marine Wildlife
  {
    commonName: 'Great White Shark',
    scientificName: 'Carcharodon carcharias',
    family: 'Lamnidae',
    order: 'Lamniformes',
    class: 'Chondrichthyes',
    conservationStatus: 'Vulnerable',
    habitat: ['Coastal Waters', 'Open Ocean'],
    region: ['Global (temperate and tropical)'],
    continent: ['Global'],
    averageWeight: 1500,
    averageLength: 450,
    lifespan: 70,
    diet: 'Carnivore',
    characteristics: ['Large size', 'Triangular teeth', 'Powerful tail', 'Excellent senses'],
    funFacts: ['Can detect blood from miles away', 'Can breach completely out of water', 'Ancient species'],
    activityPeriod: 'Cathemeral',
    socialBehavior: 'Solitary',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Overfishing', 'Shark finning', 'Climate change'],
    conservationEfforts: ['Fishing regulations', 'Marine protected areas', 'Research tagging']
  },
  {
    commonName: 'Humpback Whale',
    scientificName: 'Megaptera novaeangliae',
    family: 'Balaenopteridae',
    order: 'Artiodactyla',
    class: 'Mammalia',
    conservationStatus: 'Least Concern',
    habitat: ['Open Ocean', 'Coastal Waters'],
    region: ['Global'],
    continent: ['Global'],
    averageWeight: 30000,
    averageLength: 1400,
    lifespan: 90,
    diet: 'Carnivore',
    characteristics: ['Long pectoral fins', 'Complex songs', 'Acrobatic behavior', 'Baleen plates'],
    funFacts: ['Songs can last 30 minutes', 'Migrate up to 25,000 km annually', 'Can breach completely'],
    activityPeriod: 'Cathemeral',
    socialBehavior: 'Small Group',
    migrationPattern: 'Seasonal',
    threatsAndChallenges: ['Ship strikes', 'Entanglement', 'Ocean noise'],
    conservationEfforts: ['Shipping lane modifications', 'Entanglement response', 'Marine sanctuaries']
  }
];

async function seedDatabase() {
  try {
    console.log('🌍 Starting world-level wildlife database seeding...');
    
    // Drop the entire collection to avoid index conflicts
    console.log('🗑️ Dropping existing species collection...');
    await mongoose.connection.db.dropCollection('species').catch(() => {
      console.log('   Collection doesn\'t exist, continuing...');
    });
    
    // Clear any existing data (redundant but safe)
    console.log('🗑️ Clearing existing species data...');
    await Species.deleteMany({});
    
    // Insert new species data
    console.log('📊 Inserting world wildlife species...');
    const insertedSpecies = await Species.insertMany(worldWildlifeSpecies);
    
    console.log(`✅ Successfully seeded ${insertedSpecies.length} wildlife species!`);
    console.log('🌍 World-level wildlife database is ready!');
    
    // Display summary by continent
    const continentStats = {};
    insertedSpecies.forEach(species => {
      species.continent.forEach(continent => {
        continentStats[continent] = (continentStats[continent] || 0) + 1;
      });
    });
    
    console.log('\n📈 Species Distribution by Continent:');
    Object.entries(continentStats).forEach(([continent, count]) => {
      console.log(`   ${continent}: ${count} species`);
    });
    
    // Display conservation status summary
    const statusStats = {};
    insertedSpecies.forEach(species => {
      statusStats[species.conservationStatus] = (statusStats[species.conservationStatus] || 0) + 1;
    });
    
    console.log('\n🔴 Conservation Status Summary:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} species`);
    });
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, Species };