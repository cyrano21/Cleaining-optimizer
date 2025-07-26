import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockAlert?: number;
  images: string[];
  // Support pour les attributs personnalisés
  attributes?: { [key: string]: any };
  // Support pour les médias 3D, vidéos et vues 360°
  media3D?: Array<{
    modelUrl: string;
    textureUrls: string[];
    type: 'gltf' | 'glb' | 'obj';
    previewImage?: string;
    modelSize?: number;
    animations?: string[];
  }>;
  videos?: Array<{
    url: string;
    type: 'upload' | 'youtube' | 'vimeo';
    thumbnail?: string;
    duration?: number;
    title?: string;
    description?: string;
  }>;
  // Support pour les vues 360°
  views360?: Array<{
    id: string;
    name: string;
    images: string[];
    autoRotate: boolean;
    rotationSpeed: number;
    zoomEnabled: boolean;
    description?: string;
  }>;
  category: mongoose.Types.ObjectId;
  collection?: mongoose.Types.ObjectId;
  tags: string[];
  vendor: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  // Intégration dropshipping
  isDropshipping: boolean;
  dropshippingInfo?: {
    supplierId?: mongoose.Types.ObjectId;
    supplierName?: string;
    supplierPrice?: number;
    profitMargin?: number;
    shippingTime?: string;
    lastStockSync?: Date;
  };
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  reviews: mongoose.Types.ObjectId[];
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre de produit'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Veuillez fournir une description du produit'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Veuillez fournir un prix de produit'],
    min: [0, 'Le prix doit être un nombre positif']
  },
  comparePrice: {
    type: Number,
    default: 0,
    min: [0, 'Le prix de comparaison doit être positif']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Le pourcentage de remise doit être positif'],
    max: [100, 'Le pourcentage de remise ne peut pas dépasser 100%']
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'La quantité doit être positive']
  },
  lowStockAlert: {
    type: Number,
    default: 5,
    min: [0, 'Le seuil d\'alerte doit être positif']
  },
  images: [{
    type: String,
    required: true
  }],
  // Support pour les attributs personnalisés
  attributes: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // Support pour les médias 3D
  media3D: [{
    modelUrl: {
      type: String,
      required: true,
      trim: true
    },
    textureUrls: [{
      type: String,
      trim: true
    }],
    type: {
      type: String,
      enum: ['gltf', 'glb', 'obj'],
      required: true
    },
    previewImage: {
      type: String,
      trim: true
    },
    modelSize: {
      type: Number,
      min: [0, 'La taille du modèle doit être positive']
    },
    animations: [{
      type: String,
      trim: true
    }]
  }],
  // Support pour les vidéos
  videos: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['upload', 'youtube', 'vimeo'],
      required: true
    },
    thumbnail: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      min: [0, 'La durée doit être positive']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    }
  }],
  // Support pour les vues 360°
  views360: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    images: [{
      type: String,
      required: true
    }],
    autoRotate: {
      type: Boolean,
      default: false
    },
    rotationSpeed: {
      type: Number,
      default: 100,
      min: [10, 'La vitesse de rotation doit être d\'au moins 10ms'],
      max: [1000, 'La vitesse de rotation ne peut pas dépasser 1000ms']
    },
    zoomEnabled: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'La description ne peut pas dépasser 300 caractères']
    }
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  collection: {
    type: Schema.Types.ObjectId,
    ref: 'Collection'
  },
  tags: [{
    type: String,
    trim: true
  }],
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Intégration dropshipping
  isDropshipping: {
    type: Boolean,
    default: false
  },
  dropshippingInfo: {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    supplierName: String,
    supplierPrice: Number,
    profitMargin: Number,
    shippingTime: String,
    lastStockSync: Date
  },
  weight: {
    type: Number,
    min: [0, 'Le poids doit être positif']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'La longueur doit être positive']
    },
    width: {
      type: Number,
      min: [0, 'La largeur doit être positive']
    },
    height: {
      type: Number,
      min: [0, 'La hauteur doit être positive']
    }
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères']
  },
  variant: {
    color: String,
    size: String,
    material: String
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'La note moyenne doit être positive'],
    max: [5, 'La note moyenne ne peut pas dépasser 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre total d\'avis doit être positif']
  },
  totalSales: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre total de ventes doit être positif']
  }
}, {
  timestamps: true
});

// Index pour les recherches
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ collection: 1 });
ProductSchema.index({ vendor: 1 });
ProductSchema.index({ store: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ totalSales: -1 });
ProductSchema.index({ createdAt: -1 });

// Méthodes statiques
ProductSchema.statics.findByStore = function(storeId: string) {
  return this.find({ store: storeId, status: 'active' });
};

ProductSchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'active' });
};

// Middleware pour calculer le prix avec remise
ProductSchema.virtual('finalPrice').get(function() {
  if (this.discountPercentage && this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Middleware pour gérer le slug automatiquement
ProductSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Middleware pour calculer le pourcentage de remise automatiquement
ProductSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('comparePrice')) {
    if (this.comparePrice && this.comparePrice > this.price) {
      this.discountPercentage = Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    } else {
      this.discountPercentage = 0;
    }
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
