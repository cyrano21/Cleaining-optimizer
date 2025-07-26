import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';

export interface IDropshippingSupplier extends Document {
  name: string;
  slug: string;
  country: string;
  website?: string;
  description: string;
  rating: number;
  totalProducts: number;
  activeStores: number;
  status: 'verified' | 'pending' | 'suspended' | 'rejected';
  commission: number;
  shippingTime: string;
  minOrder: number;
  categories: string[];
  joinedDate: Date;
  totalRevenue: number;
  compliance: {
    taxCompliant: boolean;
    certifications: string[];
    lastAudit: Date;
  };
  apiCredentials?: {
    apiKey?: string;
    apiSecret?: string;
    endpoint?: string;
    authType: 'api_key' | 'oauth' | 'basic_auth';
  };
  shippingRates?: Array<{
    country: string;
    region?: string;
    cost: number;
    estimatedDays: number;
    trackingAvailable: boolean;
  }>;
  returnPolicy?: {
    acceptsReturns: boolean;
    returnWindow: number; // en jours
    returnShippingCost: 'buyer' | 'seller' | 'shared';
    restockingFee?: number;
  };
  contactInfo: {
    email: string;
    phone?: string;
    supportHours?: string;
    timezone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDropshippingProduct extends Document {
  // Référence au produit principal
  product: mongoose.Types.ObjectId;
  
  // Informations du fournisseur
  supplier: mongoose.Types.ObjectId;
  supplierProductId: string; // ID du produit chez le fournisseur
  supplierSku: string;
  
  // Pricing dropshipping
  supplierPrice: number;
  supplierCurrency: string;
  minimumOrderQuantity: number;
  
  // Stock et disponibilité
  supplierStock: number;
  lastStockUpdate: Date;
  stockSyncEnabled: boolean;
  
  // Shipping dropshipping
  shippingTime: {
    min: number;
    max: number;
    unit: 'days' | 'weeks';
  };
  shippingFrom: string; // Pays/région d'expédition
  
  // Mapping des variantes
  variantMapping?: Array<{
    localVariantId: string;
    supplierVariantId: string;
    supplierSku: string;
    supplierPrice: number;
    supplierStock: number;
  }>;
  
  // Synchronisation automatique
  autoSync: {
    price: boolean;
    stock: boolean;
    description: boolean;
    images: boolean;
  };
  
  // Historique des synchronisations
  syncHistory: Array<{
    date: Date;
    type: 'price' | 'stock' | 'description' | 'images' | 'full';
    status: 'success' | 'failed' | 'partial';
    changes?: { [key: string]: any };
    error?: string;
  }>;
  
  // Statut dropshipping
  dropshippingStatus: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  
  // Marges et profits
  profitMargin: number; // en pourcentage
  fixedMarkup?: number; // markup fixe en devise
  
  // Informations de qualité
  qualityScore?: number; // Score de 1 à 5
  supplierRating?: number;
  customerReviews?: {
    averageRating: number;
    totalReviews: number;
    lastReviewDate?: Date;
  };
  
  // Compliance et restrictions
  restrictions?: {
    countries: string[]; // Pays où le produit ne peut pas être vendu
    ageRestriction?: number;
    requiresLicense?: boolean;
    hazardousMaterial?: boolean;
  };
  
  // Métadonnées
  importDate: Date;
  lastModified: Date;
  importedBy: mongoose.Types.ObjectId; // Utilisateur qui a importé
  
  // Analytics dropshipping
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    returnRate: number;
    lastOrderDate?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IDropshippingOrder {
  // Référence à la commande principale
  order: mongoose.Types.ObjectId;
  orderItem: mongoose.Types.ObjectId;
  
  // Informations produit
  product: mongoose.Types.ObjectId;
  dropshippingProduct: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  
  // Détails de la commande
  quantity: number;
  supplierPrice: number;
  sellingPrice: number;
  profit: number;
  
  // Statut dropshipping
  dropshippingStatus: 'pending' | 'sent_to_supplier' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  
  // Informations fournisseur
  supplierOrderId?: string;
  supplierOrderDate?: Date;
  supplierInvoiceNumber?: string;
  
  // Shipping et tracking
  shippingInfo?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    shippedDate: Date;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  };
  
  // Adresse de livraison (peut différer de la commande principale)
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  
  // Communication avec le fournisseur
  supplierCommunication: Array<{
    date: Date;
    type: 'email' | 'api' | 'manual' | 'webhook';
    direction: 'sent' | 'received';
    subject?: string;
    message: string;
    status: 'sent' | 'delivered' | 'failed';
    response?: string;
  }>;
  
  // Gestion des erreurs
  errorLogs: Array<{
    date: Date;
    type: 'stock' | 'price' | 'shipping' | 'payment' | 'api' | 'other';
    message: string;
    resolved: boolean;
    resolvedDate?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
  }>;
  
  // Retours et remboursements
  returnInfo?: {
    requested: boolean;
    requestDate?: Date;
    reason?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    returnTrackingNumber?: string;
    refundAmount?: number;
    refundDate?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Schema pour les fournisseurs dropshipping
const DropshippingSupplierSchema = new Schema<IDropshippingSupplier>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  website: { type: String },
  description: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalProducts: { type: Number, default: 0 },
  activeStores: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['verified', 'pending', 'suspended', 'rejected'], 
    default: 'pending' 
  },
  commission: { type: Number, required: true, min: 0, max: 100 },
  shippingTime: { type: String, required: true },
  minOrder: { type: Number, default: 1 },
  categories: [{ type: String }],
  joinedDate: { type: Date, default: Date.now },
  totalRevenue: { type: Number, default: 0 },
  compliance: {
    taxCompliant: { type: Boolean, default: false },
    certifications: [{ type: String }],
    lastAudit: { type: Date }
  },
  apiCredentials: {
    apiKey: { type: String, select: false },
    apiSecret: { type: String, select: false },
    endpoint: { type: String },
    authType: { 
      type: String, 
      enum: ['api_key', 'oauth', 'basic_auth'],
      default: 'api_key'
    }
  },
  shippingRates: [{
    country: { type: String, required: true },
    region: { type: String },
    cost: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    trackingAvailable: { type: Boolean, default: true }
  }],
  returnPolicy: {
    acceptsReturns: { type: Boolean, default: false },
    returnWindow: { type: Number, default: 30 },
    returnShippingCost: { 
      type: String, 
      enum: ['buyer', 'seller', 'shared'],
      default: 'buyer'
    },
    restockingFee: { type: Number, min: 0, max: 100 }
  },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String },
    supportHours: { type: String },
    timezone: { type: String }
  }
}, {
  timestamps: true
});

// Schema pour les produits dropshipping
const DropshippingProductSchema = new Schema<IDropshippingProduct>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'DropshippingSupplier', required: true },
  supplierProductId: { type: String, required: true },
  supplierSku: { type: String, required: true },
  
  supplierPrice: { type: Number, required: true, min: 0 },
  supplierCurrency: { type: String, default: 'EUR' },
  minimumOrderQuantity: { type: Number, default: 1 },
  
  supplierStock: { type: Number, default: 0 },
  lastStockUpdate: { type: Date, default: Date.now },
  stockSyncEnabled: { type: Boolean, default: true },
  
  shippingTime: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    unit: { type: String, enum: ['days', 'weeks'], default: 'days' }
  },
  shippingFrom: { type: String, required: true },
  
  variantMapping: [{
    localVariantId: { type: String, required: true },
    supplierVariantId: { type: String, required: true },
    supplierSku: { type: String, required: true },
    supplierPrice: { type: Number, required: true },
    supplierStock: { type: Number, default: 0 }
  }],
  
  autoSync: {
    price: { type: Boolean, default: true },
    stock: { type: Boolean, default: true },
    description: { type: Boolean, default: false },
    images: { type: Boolean, default: false }
  },
  
  syncHistory: [{
    date: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['price', 'stock', 'description', 'images', 'full'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['success', 'failed', 'partial'],
      required: true 
    },
    changes: { type: Schema.Types.Mixed },
    error: { type: String }
  }],
  
  dropshippingStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  
  profitMargin: { type: Number, required: true, min: 0 },
  fixedMarkup: { type: Number, min: 0 },
  
  qualityScore: { type: Number, min: 1, max: 5 },
  supplierRating: { type: Number, min: 0, max: 5 },
  customerReviews: {
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    lastReviewDate: { type: Date }
  },
  
  restrictions: {
    countries: [{ type: String }],
    ageRestriction: { type: Number, min: 0 },
    requiresLicense: { type: Boolean, default: false },
    hazardousMaterial: { type: Boolean, default: false }
  },
  
  importDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  importedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    lastOrderDate: { type: Date }
  }
}, {
  timestamps: true
});

// Schema pour les commandes dropshipping
const DropshippingOrderSchema = new Schema<IDropshippingOrder>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderItem: { type: Schema.Types.ObjectId, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  dropshippingProduct: { type: Schema.Types.ObjectId, ref: 'DropshippingProduct', required: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'DropshippingSupplier', required: true },
  
  quantity: { type: Number, required: true, min: 1 },
  supplierPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  profit: { type: Number, required: true },
  
  dropshippingStatus: {
    type: String,
    enum: ['pending', 'sent_to_supplier', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  supplierOrderId: { type: String },
  supplierOrderDate: { type: Date },
  supplierInvoiceNumber: { type: String },
  
  shippingInfo: {
    carrier: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    shippedDate: { type: Date },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date }
  },
  
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String }
  },
  
  supplierCommunication: [{
    date: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['email', 'api', 'manual', 'webhook'],
      required: true 
    },
    direction: { 
      type: String, 
      enum: ['sent', 'received'],
      required: true 
    },
    subject: { type: String },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    },
    response: { type: String }
  }],
  
  errorLogs: [{
    date: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['stock', 'price', 'shipping', 'payment', 'api', 'other'],
      required: true 
    },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedDate: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  
  returnInfo: {
    requested: { type: Boolean, default: false },
    requestDate: { type: Date },
    reason: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'completed']
    },
    returnTrackingNumber: { type: String },
    refundAmount: { type: Number },
    refundDate: { type: Date }
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
DropshippingSupplierSchema.index({ status: 1 });
DropshippingSupplierSchema.index({ country: 1 });

DropshippingProductSchema.index({ product: 1 });
DropshippingProductSchema.index({ supplier: 1 });
DropshippingProductSchema.index({ supplierProductId: 1, supplier: 1 });
DropshippingProductSchema.index({ dropshippingStatus: 1 });
DropshippingProductSchema.index({ lastStockUpdate: 1 });

DropshippingOrderSchema.index({ order: 1 });
DropshippingOrderSchema.index({ supplier: 1 });
DropshippingOrderSchema.index({ dropshippingStatus: 1 });
DropshippingOrderSchema.index({ supplierOrderId: 1 });

// Middleware pour mettre à jour lastModified
DropshippingProductSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Méthodes statiques
DropshippingProductSchema.statics.findBySupplier = function(supplierId: string) {
  return this.find({ supplier: supplierId, dropshippingStatus: 'active' });
};

DropshippingProductSchema.statics.findOutOfStock = function() {
  return this.find({ 
    $or: [
      { supplierStock: 0 },
      { dropshippingStatus: 'out_of_stock' }
    ]
  });
};

DropshippingOrderSchema.statics.findPendingOrders = function() {
  return this.find({ 
    dropshippingStatus: { $in: ['pending', 'sent_to_supplier'] }
  });
};

// Export des modèles
export const DropshippingSupplier = mongoose.models.DropshippingSupplier || mongoose.model<IDropshippingSupplier>('DropshippingSupplier', DropshippingSupplierSchema);
export const DropshippingProduct = mongoose.models.DropshippingProduct || mongoose.model<IDropshippingProduct>('DropshippingProduct', DropshippingProductSchema);
export const DropshippingOrder = mongoose.models.DropshippingOrder || mongoose.model<IDropshippingOrder>('DropshippingOrder', DropshippingOrderSchema);

export default {
  DropshippingSupplier,
  DropshippingProduct,
  DropshippingOrder
};