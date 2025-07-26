const mongoose = require('mongoose');

// Schéma Store pour le script de seed
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  banner: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  settings: {
    theme: {
      type: String,
      default: 'default'
    },
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#ffffff' }
    }
  }
}, {
  timestamps: true
});

// Index pour les performances
storeSchema.index({ isActive: 1 });
storeSchema.index({ slug: 1 }, { unique: true, sparse: true });
storeSchema.index({ owner: 1 });

module.exports = mongoose.models.Store || mongoose.model('Store', storeSchema);