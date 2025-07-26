const mongoose = require('mongoose');

// Schéma Product pour le script de seed
const productSchema = new mongoose.Schema({
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
  shortDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  images: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'out-of-stock'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attributes: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  variants: [{
    name: { type: String, required: true },
    options: [{
      name: { type: String, required: true },
      value: { type: String, required: true },
      price: { type: Number, min: 0 },
      stock: { type: Number, min: 0, default: 0 }
    }]
  }],
  seo: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: [{ type: String, trim: true }]
  }
}, {
  timestamps: true
});

// Index pour les performances
productSchema.index({ store: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ slug: 1 }, { unique: true, sparse: true });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Middleware pre-save
productSchema.pre('save', function(next) {
  // Synchroniser store et storeId
  if (this.isModified('store') && !this.storeId) {
    this.storeId = this.store;
  }
  if (this.isModified('storeId') && !this.store) {
    this.store = this.storeId;
  }
  
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);