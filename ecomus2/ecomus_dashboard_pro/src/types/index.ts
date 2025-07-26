// User Types
export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'vendor' | 'customer';
  status?: 'active' | 'inactive' | 'suspended';
  emailVerified?: boolean;
  lastLoginAt?: Date;
  storeId?: string; // ID de la boutique pour les vendors
  store?: Store; // Référence à la boutique
  createdAt: Date;
  updatedAt: Date;
}

// Store Types - AJOUT MULTI-STORE
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner: string; // Vendor ID
  ownerDetails?: User;
  logoUrl?: string;
  bannerUrl?: string;
  contact: {
    email?: string;
    phone?: string;
    address?: Address;
  };
  social: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  settings: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
    };
    business: {
      currency: string;
      taxRate: number;
      shippingCost: number;
      freeShippingThreshold: number;
    };
    features: {
      enableReviews: boolean;
      enableWishlist: boolean;
      enableComparison: boolean;
      enableMultiCurrency: boolean;
    };
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    limits: {
      maxProducts: number;
      maxStorage: number;
      maxOrders: number;
    };
    expiresAt?: Date;
  };
  isActive: boolean;
  isVerified: boolean;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Media Types
export interface Product3DData {
  modelUrl: string;
  textureUrls: string[];
  type: 'gltf' | 'glb' | 'obj';
  previewImage?: string;
  modelSize?: number;
  animations?: string[];
}

export interface ProductVideoData {
  url: string;
  type: 'upload' | 'youtube' | 'vimeo';
  thumbnail?: string;
  duration?: number;
  title?: string;
  description?: string;
}

export interface Product360Data {
  id: string;
  name: string;
  images: string[];
  autoRotate: boolean;
  rotationSpeed: number;
  zoomEnabled: boolean;
  description?: string;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  media3D?: Product3DData[];
  videos?: ProductVideoData[];
  views360?: Product360Data[];
  category: Category;
  brand: string;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  storeId?: string; // AJOUT MULTI-STORE
  store?: Store; // Référence à la boutique
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  image?: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Collection Types
export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  images?: string[];
  category?: Category;
  products?: Product[];
  price?: number;
  originalPrice?: number;
  discount?: number;
  storeId?: string;
  store?: Store;
  isFeatured: boolean;
  isActive: boolean;
  itemCount?: number;
  itemsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  storeId?: string; // AJOUT MULTI-STORE
  store?: Store; // Référence à la boutique
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
  variant?: ProductVariant;
}

// Interface pour OrderItem après populate (utilisée dans les réponses API)
export interface OrderItemPopulated {
  id: string;
  productId: {
    title: string;
    sku: string;
    images: string[];
    price: number;
  } | string; // Peut être soit l'objet produit soit l'ID string
  quantity: number;
  price: number;
  total?: number;
  variant?: ProductVariant;
}

// Interface pour Order après populate (utilisée dans les réponses API)
export interface OrderPopulated extends Omit<Order, 'items'> {
  items: OrderItemPopulated[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// Address Types
export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: User;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
  productGrowth: number;
  customerGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product: Product;
  sales: number;
  revenue: number;
}

export interface TopCategory {
  category: Category;
  sales: number;
  revenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'oldest';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  brand: string;
  stock: number;
  sku: string;
  tags: string[];
  images: File[];
  variants?: Omit<ProductVariant, 'id'>[];
  specifications?: ProductSpecification[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface CheckoutForm {
  email: string;
  shippingAddress: Omit<Address, 'id'>;
  billingAddress: Omit<Address, 'id'>;
  sameAsShipping: boolean;
  paymentMethod: string;
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Settings Types
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  currency: string;
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Theme Types
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: string;
}

// Vendor Dashboard Specific Types
export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}