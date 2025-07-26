const mongoose = require('mongoose');

// Schéma Category pour le script de seed
const categorySchema = new mongoose.Schema({
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
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, {
  timestamps: true
});

// Index pour les performances
categorySchema.index({ storeId: 1, isActive: 1 });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);