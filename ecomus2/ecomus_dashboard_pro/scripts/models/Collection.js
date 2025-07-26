const mongoose = require('mongoose');

// Schéma Collection pour le script de seed
const collectionSchema = new mongoose.Schema({
  title: {
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
  imgSrc: {
    type: String,
    default: '/images/collections/default.jpg'
  },
  image: {
    type: String,
    default: '/images/collections/default.jpg'
  },
  images: [{
    type: String
  }],
  altText: {
    type: String,
    trim: true
  },
  heading: {
    type: String,
    trim: true
  },
  subheading: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0,
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
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  featured: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  itemCount: {
    type: Number,
    default: 0
  },
  itemsCount: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    trim: true
  },
  seoDescription: {
    type: String,
    trim: true
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index pour les performances
collectionSchema.index({ storeId: 1, status: 1 });
collectionSchema.index({ featured: 1, status: 1 });
collectionSchema.index({ category: 1, status: 1 });
collectionSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Middleware pre-save pour générer le slug
collectionSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Synchroniser les champs de compatibilité
  if (this.isModified('featured')) {
    this.isFeatured = this.featured;
  }
  if (this.isModified('isFeatured')) {
    this.featured = this.isFeatured;
  }
  if (this.isModified('imgSrc')) {
    this.image = this.imgSrc;
  }
  if (this.isModified('image')) {
    this.imgSrc = this.image;
  }
  if (this.isModified('products')) {
    this.itemsCount = this.products.length;
    this.itemCount = this.products.length;
  }
  
  // Synchroniser storeId et store
  if (this.isModified('storeId') && !this.store) {
    this.store = this.storeId;
  }
  if (this.isModified('store') && !this.storeId) {
    this.storeId = this.store;
  }
  
  next();
});

module.exports = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);