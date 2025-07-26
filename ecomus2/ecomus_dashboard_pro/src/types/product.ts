// Types unifiés pour les produits
export interface ProductFormData {
  // Informations de base
  title: string;
  name?: string; // Alias pour title pour compatibilité
  description: string;
  shortDescription?: string;
  
  // Prix et coûts
  price: number;
  comparePrice?: number;
  costPerItem?: number;
  
  // Gestion des stocks
  quantity: number;
  trackQuantity?: boolean;
  continueSellingOutOfStock?: boolean;
  lowStockAlert?: number;
  
  // Identifiants
  sku: string;
  barcode?: string;
  
  // Catégorisation
  category: string;
  brand?: string;
  tags: string[];
  
  // Médias
  images: (File | string)[];
  videos?: Array<{
    url: string;
    type: 'upload' | 'youtube' | 'vimeo';
    title?: string;
    description?: string;
    thumbnail?: string;
    duration?: number;
    file?: File;
  }>;
  
  // Médias 3D
  media3D?: Array<{
    modelUrl: string;
    textureUrls?: string[];
    type: 'gltf' | 'glb' | 'obj';
    previewImage?: string;
    modelSize?: number;
    animations?: string[];
  }>;
  
  // Vues 360
  views360?: Array<{
    id: string;
    name: string;
    images: string[];
    autoRotate: boolean;
    rotationSpeed?: number;
    zoomEnabled?: boolean;
    description?: string;
  }>;
  
  // Dimensions et poids
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Variantes
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  
  // Attributs personnalisés
  attributes?: Record<string, string>;
  
  // Métadonnées
  store?: string;
  vendor?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export interface Attribute {
  _id: string;
  category: string;
  value: string;
  description?: string;
}

export interface Store {
  id: string;
  name: string;
  slug?: string;
  subscription?: {
    plan: string;
    isActive: boolean;
    limits?: {
      maxProducts: number;
      maxStorage: number;
      maxOrders: number;
    };
  };
}

// Types pour les rôles
export type UserRole = 'admin' | 'vendor' | 'customer' | 'super_admin';

// Configuration par rôle
export interface RoleConfig {
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canManageStores: boolean;
  canViewAnalytics: boolean;
  maxProducts?: number;
  maxImages?: number;
  maxVideos?: number;
  max3DModels?: number;
  max360Views?: number;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canManageStores: true,
    canViewAnalytics: true,
    maxProducts: 1000,
    maxImages: 20,
    maxVideos: 10,
    max3DModels: 5,
    max360Views: 10,
  },
  vendor: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canManageStores: false,
    canViewAnalytics: true,
    maxProducts: 500,
    maxImages: 15,
    maxVideos: 8,
    max3DModels: 3,
    max360Views: 5,
  },
  customer: {
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canManageStores: false,
    canViewAnalytics: false,
  },
  super_admin: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canManageStores: true,
    canViewAnalytics: true,
    maxProducts: 10000,
    maxImages: 50,
    maxVideos: 20,
    max3DModels: 10,
    max360Views: 20,
  },
};

// Validation des formulaires
export interface ValidationError {
  field: string;
  message: string;
}

export const validateProductForm = (data: ProductFormData, role: UserRole): ValidationError[] => {
  const errors: ValidationError[] = [];
  const config = ROLE_CONFIGS[role];

  // Validation des champs requis
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Le titre du produit est requis' });
  }

  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'La description est requise' });
  }

  if (!data.category) {
    errors.push({ field: 'category', message: 'La catégorie est requise' });
  }

  if (data.price <= 0) {
    errors.push({ field: 'price', message: 'Le prix doit être supérieur à 0' });
  }

  if (data.quantity < 0) {
    errors.push({ field: 'quantity', message: 'La quantité ne peut pas être négative' });
  }

  // Validation des limites par rôle
  if (config.maxImages && data.images.length > config.maxImages) {
    errors.push({ 
      field: 'images', 
      message: `Maximum ${config.maxImages} images autorisées pour votre rôle` 
    });
  }

  if (config.maxVideos && data.videos && data.videos.length > config.maxVideos) {
    errors.push({ 
      field: 'videos', 
      message: `Maximum ${config.maxVideos} vidéos autorisées pour votre rôle` 
    });
  }

  if (config.max3DModels && data.media3D && data.media3D.length > config.max3DModels) {
    errors.push({ 
      field: 'media3D', 
      message: `Maximum ${config.max3DModels} modèles 3D autorisés pour votre rôle` 
    });
  }

  if (config.max360Views && data.views360 && data.views360.length > config.max360Views) {
    errors.push({ 
      field: 'views360', 
      message: `Maximum ${config.max360Views} vues 360 autorisées pour votre rôle` 
    });
  }

  return errors;
};

// Valeurs par défaut
export const getDefaultProductForm = (role: UserRole): ProductFormData => ({
  title: '',
  description: '',
  shortDescription: '',
  price: 0,
  comparePrice: 0,
  costPerItem: 0,
  quantity: 0,
  trackQuantity: true,
  continueSellingOutOfStock: false,
  sku: '',
  barcode: '',
  category: '',
  brand: '',
  tags: [],
  images: [],
  videos: [],
  media3D: [],
  views360: [],
  weight: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
  },
  status: 'draft',
  seoTitle: '',
  seoDescription: '',
  attributes: {},
  featured: false,
}); 