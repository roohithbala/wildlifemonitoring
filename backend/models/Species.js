const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  scientificName: {
    type: String,
    required: true,
    trim: true
  },
  family: {
    type: String,
    required: true,
    trim: true
  },
  conservationStatus: {
    type: String,
    enum: ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Extinct in Wild', 'Extinct'],
    default: 'Least Concern'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  habitat: {
    type: String,
    maxlength: 500
  },
  diet: {
    type: String,
    maxlength: 500
  },
  averageWeight: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'kg'
    }
  },
  averageLength: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  lifespan: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'years'
    }
  },
  imageUrl: String,
  tags: [String],
  isRare: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
speciesSchema.index({ name: 'text', scientificName: 'text', family: 'text' });
speciesSchema.index({ conservationStatus: 1 });
speciesSchema.index({ isRare: 1 });

module.exports = mongoose.model('Species', speciesSchema);