import mongoose from 'mongoose';

// Modèle Supplier (Fournisseur Dropshipping)
const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  website: String,
  logo: String,
  
  // Informations de contact
  contact: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  
  // Configuration API
  apiConfig: {
    endpoint: String,
    apiKey: String,
    secretKey: String,
    format: {
      type: String,
      enum: ['json', 'xml', 'csv'],
      default: 'json'
    },
    authType: {
      type: String,
      enum: ['api_key', 'oauth', 'basic'],
      default: 'api_key'
    }
  },
  
  // Conditions commerciales
  terms: {
    minOrderAmount: {
      type: Number,
      default: 0
    },
    shippingCost: Number,
    processingTime: {
      type: Number,
      default: 1 // jours
    },
    returnPolicy: String,
    commission: {
      type: Number,
      default: 0 // pourcentage
    }
  },
  
  // Catégories supportées
  categories: [String],
  
  // Métriques
  metrics: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    responseTime: Number, // heures
    fulfillmentRate: {
      type: Number,
      default: 100 // pourcentage
    }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Documents de vérification
  verification: {
    documents: [String],
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Modèle Dropshipping Product
const DropshippingProductSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  
  supplierProductId: {
    type: String,
    required: true
  },
  
  // Informations produit
  name: {
    type: String,
    required: true
  },
  description: String,
  images: [String],
  category: String,
  tags: [String],
  
  // Prix et marges
  pricing: {
    supplierPrice: {
      type: Number,
      required: true
    },
    suggestedRetailPrice: Number,
    minimumRetailPrice: Number,
    margin: {
      type: Number,
      default: 30 // pourcentage
    }
  },
  
  // Stock et disponibilité
  inventory: {
    quantity: {
      type: Number,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    isUnlimited: {
      type: Boolean,
      default: false
    },
    lastUpdated: Date
  },
  
  // Variantes
  variants: [{
    sku: String,
    name: String,
    price: Number,
    quantity: Number,
    attributes: {
      size: String,
      color: String,
      material: String
    }
  }],
  
  // Expédition
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: String,
    processingTime: Number
  },
  
  // Synchronisation
  sync: {
    lastSyncAt: Date,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'error'],
      default: 'pending'
    },
    syncErrors: [String]
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Modèle Subscription Plan
const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  
  // Prix
  pricing: {
    monthly: Number,
    yearly: Number,
    setup: {
      type: Number,
      default: 0
    }
  },
  
  // Fonctionnalités
  features: {
    maxStores: {
      type: Number,
      default: 1
    },
    maxProducts: {
      type: Number,
      default: 100
    },
    maxOrders: {
      type: Number,
      default: 1000
    },
    maxStorage: {
      type: Number,
      default: 1024 // MB
    },
    maxBandwidth: {
      type: Number,
      default: 10240 // MB
    },
    
    // Fonctionnalités avancées
    customDomain: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    dropshipping: {
      type: Boolean,
      default: false
    },
    aiFeatures: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    whiteLabel: {
      type: Boolean,
      default: false
    }
  },
  
  // Permissions
  permissions: [String],
  
  // Rôles autorisés
  allowedRoles: [{
    type: String,
    enum: ['user', 'vendor', 'admin', 'super_admin']
  }],
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Modèle User Subscription
const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  
  // Période
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  nextBillingDate: Date,
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended'],
    default: 'active'
  },
  
  // Paiement
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    default: 'card'
  },
  
  // Utilisation
  usage: {
    stores: {
      type: Number,
      default: 0
    },
    products: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    },
    bandwidth: {
      type: Number,
      default: 0
    }
  },
  
  // Historique
  history: [{
    action: String,
    date: Date,
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Stripe/PayPal IDs
  stripeSubscriptionId: String,
  stripeCustomerId: String
}, {
  timestamps: true
});

// Modèle Banner/Advertisement
const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  
  // Contenu
  content: {
    text: String,
    html: String,
    image: String,
    video: String
  },
  
  // Type et position
  type: {
    type: String,
    enum: ['banner', 'popup', 'sidebar', 'footer', 'header'],
    default: 'banner'
  },
  
  position: {
    type: String,
    enum: ['top', 'bottom', 'left', 'right', 'center', 'floating'],
    default: 'top'
  },
  
  // Ciblage
  targeting: {
    stores: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    }],
    categories: [String],
    userRoles: [String],
    countries: [String],
    devices: [String] // mobile, desktop, tablet
  },
  
  // Planification
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: String,
    daysOfWeek: [Number], // 0-6
    hoursOfDay: [Number] // 0-23
  },
  
  // Actions
  action: {
    type: {
      type: String,
      enum: ['link', 'popup', 'download', 'none'],
      default: 'link'
    },
    url: String,
    target: {
      type: String,
      enum: ['_blank', '_self'],
      default: '_blank'
    }
  },
  
  // Métriques
  metrics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    }
  },
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  
  priority: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Modèle Payment Card
const PaymentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations carte (chiffrées)
  cardNumber: {
    type: String,
    required: true
  }, // 4 derniers chiffres seulement
  
  cardholderName: {
    type: String,
    required: true
  },
  
  expiryMonth: {
    type: Number,
    required: true
  },
  
  expiryYear: {
    type: Number,
    required: true
  },
  
  // Type de carte
  cardType: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover'],
    required: true
  },
  
  // Adresse de facturation
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Stripe/PayPal
  stripeCardId: String,
  stripeCustomerId: String,
  
  // Statut
  isDefault: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Vérification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedAt: Date,
  
  // Dernière utilisation
  lastUsed: Date
}, {
  timestamps: true
});

// Export des modèles
const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
const DropshippingProduct = mongoose.models.DropshippingProduct || mongoose.model('DropshippingProduct', DropshippingProductSchema);
const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
const UserSubscription = mongoose.models.UserSubscription || mongoose.model('UserSubscription', UserSubscriptionSchema);
const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
const PaymentCard = mongoose.models.PaymentCard || mongoose.model('PaymentCard', PaymentCardSchema);

export { 
  Supplier, 
  DropshippingProduct, 
  SubscriptionPlan, 
  UserSubscription, 
  Banner, 
  PaymentCard 
};

