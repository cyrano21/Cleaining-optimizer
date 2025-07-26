import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  social: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  settings: {
    homeTemplate: {
      type: String,
      default: 'home-01'
    },
    theme: {
      primaryColor: { type: String, default: '#007bff' },
      secondaryColor: { type: String, default: '#6c757d' },
      fontFamily: { type: String, default: 'Inter' }
    },
    business: {
      currency: { type: String, default: 'EUR' },
      taxRate: { type: Number, default: 20 },
      shippingCost: { type: Number, default: 5 },
      freeShippingThreshold: { type: Number, default: 50 }
    },
    features: {
      enableReviews: { type: Boolean, default: true },
      enableWishlist: { type: Boolean, default: true },
      enableComparison: { type: Boolean, default: true },
      enableMultiCurrency: { type: Boolean, default: false }
    }
  },
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    limits: {
      maxProducts: { type: Number, default: 10 },
      maxStorage: { type: Number, default: 1000 }, // en MB
      maxOrders: { type: Number, default: 50 }
    },
    expiresAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
storeSchema.index({ ownerId: 1 });
storeSchema.index({ isActive: 1 });
storeSchema.index({ 'subscription.plan': 1 });
storeSchema.index({ slug: 1 });

// Middleware pour générer le slug automatiquement
storeSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.models.Store || mongoose.model('Store', storeSchema);
