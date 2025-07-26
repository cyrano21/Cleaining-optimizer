import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  images?: string[];
  imgSrc?: string; // Backward compatibility
  altText?: string;
  subheading?: string;
  heading?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  itemCount?: number;
  itemsCount?: number;
  backgroundColor?: string;
  featured?: boolean; // Backward compatibility
  isFeatured: boolean;
  isActive: boolean;
  storeId?: mongoose.Types.ObjectId | string;
  store?: string;
  category?: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'draft';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre de collection'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  image: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  imgSrc: {
    type: String,
    trim: true
  },
  altText: {
    type: String,
    default: 'collection-img',
    trim: true
  },
  subheading: {
    type: String,
    trim: true,
    maxlength: [100, 'Le sous-titre ne peut pas dépasser 100 caractères']
  },
  heading: {
    type: String,
    trim: true,
    maxlength: [100, 'Le titre principal ne peut pas dépasser 100 caractères']
  },
  price: {
    type: Number,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Le prix original ne peut pas être négatif']
  },
  discount: {
    type: Number,
    min: [0, 'La remise ne peut pas être négative'],
    max: [100, 'La remise ne peut pas dépasser 100%']
  },
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre d\'articles doit être positif']
  },
  itemsCount: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre d\'articles doit être positif']
  },
  backgroundColor: {
    type: String,
    trim: true
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
  storeId: {
    type: Schema.Types.Mixed
  },
  store: {
    type: String,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches et performances
CollectionSchema.index({ title: 'text', description: 'text' });
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ storeId: 1 });
CollectionSchema.index({ category: 1 });
CollectionSchema.index({ status: 1 });
CollectionSchema.index({ featured: 1 });
CollectionSchema.index({ isFeatured: 1 });
CollectionSchema.index({ isActive: 1 });
CollectionSchema.index({ createdAt: -1 });

// Index composés
CollectionSchema.index({ isActive: 1, isFeatured: 1 });
CollectionSchema.index({ storeId: 1, isActive: 1 });
CollectionSchema.index({ category: 1, isActive: 1 });
CollectionSchema.index({ status: 1, isActive: 1 });

// Propriétés virtuelles
CollectionSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

CollectionSchema.virtual('hasDiscount').get(function() {
  return this.originalPrice && this.price && this.originalPrice > this.price;
});

// Méthodes statiques
CollectionSchema.statics.findByStore = function(storeId: string) {
  return this.find({ storeId: storeId, isActive: true });
};

CollectionSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true });
};

CollectionSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

CollectionSchema.statics.findByCategory = function(categoryId: string) {
  return this.find({ category: categoryId, isActive: true });
};

// Méthodes d'instance
CollectionSchema.methods.addProduct = function(productId: string) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    this.itemCount = this.products.length;
    this.itemsCount = this.products.length;
  }
  return this.save();
};

CollectionSchema.methods.removeProduct = function(productId: string) {
  this.products = this.products.filter(id => id.toString() !== productId.toString());
  this.itemCount = this.products.length;
  this.itemsCount = this.products.length;
  return this.save();
};

CollectionSchema.methods.toggleFeatured = function() {
  this.isFeatured = !this.isFeatured;
  this.featured = this.isFeatured; // Backward compatibility
  return this.save();
};

CollectionSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Middleware pour gérer le slug automatiquement
CollectionSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Middleware pour calculer la remise
CollectionSchema.pre('save', function(next) {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

// Middleware pour synchroniser les champs de compatibilité
CollectionSchema.pre('save', function(next) {
  // Synchroniser featured avec isFeatured
  if (this.isModified('isFeatured')) {
    this.featured = this.isFeatured;
  } else if (this.isModified('featured')) {
    this.isFeatured = this.featured;
  }
  
  // Synchroniser image avec imgSrc
  if (this.isModified('image') && this.image && !this.imgSrc) {
    this.imgSrc = this.image;
  } else if (this.isModified('imgSrc') && this.imgSrc && !this.image) {
    this.image = this.imgSrc;
  }
  
  next();
});

// Middleware pour mettre à jour le nombre d'articles
CollectionSchema.pre('save', function(next) {
  if (this.isModified('products')) {
    this.itemCount = this.products.length;
    this.itemsCount = this.products.length;
  }
  
  // Synchroniser itemCount et itemsCount
  if (this.itemCount !== undefined && this.itemsCount === undefined) {
    this.itemsCount = this.itemCount;
  } else if (this.itemsCount !== undefined && this.itemCount === undefined) {
    this.itemCount = this.itemsCount;
  }
  
  next();
});

const Collection = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;