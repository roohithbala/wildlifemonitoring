// MongoDB initialization script
db = db.getSiblingDB('wildlife-monitoring');

// Create collections
db.createCollection('users');
db.createCollection('detections');
db.createCollection('species');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.detections.createIndex({ "user": 1, "createdAt": -1 });
db.detections.createIndex({ "location": "2dsphere" });
db.detections.createIndex({ "topPrediction.species": 1 });
db.species.createIndex({ "name": "text", "scientificName": "text" });

// Insert sample species data
db.species.insertMany([
  {
    name: "African Elephant",
    scientificName: "Loxodonta africana",
    family: "Elephantidae",
    conservationStatus: "Endangered",
    description: "The African elephant is the largest living terrestrial animal.",
    habitat: "Savannas, grasslands, and forests",
    diet: "Herbivore",
    isRare: true,
    tags: ["mammal", "herbivore", "endangered"]
  },
  {
    name: "Bengal Tiger",
    scientificName: "Panthera tigris tigris",
    family: "Felidae",
    conservationStatus: "Endangered",
    description: "The Bengal tiger is a tiger subspecies native to India.",
    habitat: "Tropical forests, grasslands, and mangroves",
    diet: "Carnivore",
    isRare: true,
    tags: ["mammal", "carnivore", "endangered"]
  },
  {
    name: "Bald Eagle",
    scientificName: "Haliaeetus leucocephalus",
    family: "Accipitridae",
    conservationStatus: "Least Concern",
    description: "The bald eagle is a bird of prey found in North America.",
    habitat: "Near large bodies of water",
    diet: "Carnivore",
    isRare: false,
    tags: ["bird", "carnivore", "raptor"]
  },
  {
    name: "Giant Panda",
    scientificName: "Ailuropoda melanoleuca",
    family: "Ursidae",
    conservationStatus: "Vulnerable",
    description: "The giant panda is a bear species endemic to south central China.",
    habitat: "Bamboo forests in mountains",
    diet: "Herbivore",
    isRare: true,
    tags: ["mammal", "herbivore", "vulnerable"]
  },
  {
    name: "Snow Leopard",
    scientificName: "Panthera uncia",
    family: "Felidae",
    conservationStatus: "Vulnerable",
    description: "The snow leopard is a large cat native to mountain ranges of Central Asia.",
    habitat: "Alpine and subalpine zones",
    diet: "Carnivore",
    isRare: true,
    tags: ["mammal", "carnivore", "vulnerable"]
  }
]);

print('Database initialized successfully!');