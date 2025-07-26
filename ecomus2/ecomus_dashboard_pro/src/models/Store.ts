import mongoose, { Schema } from 'mongoose';

export interface FooterLink { label: string; url: string; }
export interface NavLink { label: string; href: string; }
export interface SocialLink { network: string; url: string; }

// Interface pour l'adresse
export interface AddressObject {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface StoreDocument extends mongoose.Document {
  // Sections dynamiques activables (optionnel)
  sections?: string[];
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  
  // SYSTÈME DE DESIGN ET TEMPLATES
  design?: {
    selectedTemplate?: {
      id: string;
      name: string;
      category: string;
    };
    additionalPages?: {
      id: string;
      name: string;
      isEnabled: boolean;
    }[];
  };
  
  // CHAMPS HOMES TO STORES TRANSFORMATION
  homeTheme: string;
  homeTemplate: string;
  homeName: string;
  homeDescription: string;
  
  // SYSTÈME D'ACTIVATION
  isActive: boolean;
  activatedAt?: Date;
  activatedBy?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  
  // ABONNEMENT
  subscription?: {
    plan: string;
    isActive: boolean;
    expiresAt?: Date;
  };
  
  // ASSIGNMENT VENDEUR
  vendor?: mongoose.Types.ObjectId;
  vendorRequestedAt?: Date;
  vendorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  
  // CUSTOMISATION THEME
  customizations?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    branding?: {
      logo?: string;
      favicon?: string;
      storeName?: string;
    };
    layout?: {
      style?: string;
      headerType?: string;
      footerType?: string;
    };
  };
  
  // TEXTES ENRICHIS
  bannerText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  enrichedAt?: Date;
  
  // SEO PAR STORE
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  
  // ANALYTICS PAR STORE
  analytics?: {
    visitorsCount?: number;
    conversionRate?: number;
    averageOrderValue?: number;
    topProducts?: any[];
  };
  
  // DONNÉES DE TEMPLATE
  templateData?: any;
  
  // PRODUITS ÉCHANTILLONS
  sampleProducts?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
  }>;
  
  // MÉTRIQUES
  metrics?: {
    totalProducts?: number;
    totalOrders?: number;
    totalRevenue?: number;
    averageRating?: number;
    totalReviews?: number;
  };
  
  // VÉRIFICATION
  verification?: {
    isVerified?: boolean;
    verifiedAt?: Date;
    documents?: any[];
  };
  
  // ANCIENS CHAMPS (pour compatibilité)
  footerText?: string;
  footerLinks?: FooterLink[];
  navLinks?: NavLink[];
  socialLinks?: SocialLink[];
  
  // CONTACT ET ADRESSE
  address?: string | AddressObject;
  email?: string;
  phone?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  
  // RÉSEAUX SOCIAUX
  socialMedia?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // PARAMÈTRES
  settings?: {
    theme?: any;
    business?: any;
    features?: any;
    currency?: string;
    taxRate?: number;
    freeShippingThreshold?: number;
  };
  
  // STATUT ET MISE EN AVANT
  featured?: boolean;
  isPublic?: boolean;
  
  // RELATIONS
  owner?: mongoose.Types.ObjectId;
  vendors: mongoose.Types.ObjectId[];
  categories?: mongoose.Types.ObjectId[];
  templateId: mongoose.Types.ObjectId;
  
  // DATES
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<StoreDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    banner: String,
    logoUrl: String, // Pour compatibilité
    primaryColor: { type: String, default: "#1F2937" },
    accentColor: { type: String, default: "#3B82F6" },
    secondaryColor: String,
    
    // CHAMPS HOMES TO STORES
    homeTheme: { type: String, required: true },
    homeTemplate: { type: String, required: true },
    homeName: { type: String, required: true },
    homeDescription: String,

    // Sections dynamiques activables (optionnel)
    sections: [{ type: String }],
    
    // SYSTÈME D'ACTIVATION
    isActive: { type: Boolean, default: false },
    activatedAt: Date,
    activatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'pending', 'suspended'], 
      default: 'inactive' 
    },
    
    // ABONNEMENT
    subscription: {
      plan: { type: String, default: 'free' },
      isActive: { type: Boolean, default: true },
      expiresAt: Date
    },
    
    // ASSIGNMENT VENDEUR
    vendor: { type: Schema.Types.ObjectId, ref: "User" },
    vendorRequestedAt: Date,
    vendorStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },
    
    // CUSTOMISATION THEME
    customizations: {
      colors: {
        primary: String,
        secondary: String,
        accent: String
      },
      branding: {
        logo: String,
        favicon: String,
        storeName: String
      },
      layout: {
        style: String,
        headerType: String,
        footerType: String
      }
    },
    
    // TEXTES ENRICHIS
    bannerText: String,
    heroTitle: String,
    heroSubtitle: String,
    enrichedAt: Date,
    
    // SEO
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String
    },
    
    // ANALYTICS
    analytics: {
      visitorsCount: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      topProducts: [Schema.Types.Mixed]
    },
    
    // DONNÉES DE TEMPLATE
    templateData: Schema.Types.Mixed,
    
    // PRODUITS ÉCHANTILLONS
    sampleProducts: [{
      id: String,
      name: String,
      price: Number,
      image: String,
      description: String
    }],
    
    // MÉTRIQUES
    metrics: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
    },
    
    // VÉRIFICATION
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      documents: [Schema.Types.Mixed]
    },
    
    // ANCIENS CHAMPS (pour compatibilité)
    footerText: String,
    footerLinks: [{ label: String, url: String }],
    navLinks: [{ label: String, href: String }],
    socialLinks: [{ network: String, url: String }],
    
    // CONTACT ET ADRESSE
    address: Schema.Types.Mixed, // Peut être string ou objet
    email: String,
    phone: String,
    contact: {
      email: String,
      phone: String,
      address: String,
      website: String
    },
    
    // RÉSEAUX SOCIAUX
    socialMedia: {
      website: String,
      facebook: String,
      instagram: String,
      twitter: String
    },
    
    // PARAMÈTRES
    settings: {
      theme: Schema.Types.Mixed,
      business: Schema.Types.Mixed,
      features: Schema.Types.Mixed,
      currency: { type: String, default: 'EUR' },
      taxRate: { type: Number, default: 20 },
      freeShippingThreshold: { type: Number, default: 50 }
    },
    
    // STATUT ET MISE EN AVANT
    featured: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    
    // SYSTÈME DE DESIGN ET TEMPLATES
    design: {
      selectedTemplate: {
        id: String,
        name: String,
        category: String
      },
      additionalPages: [{
        id: String,
        name: String,
        isEnabled: { type: Boolean, default: true }
      }]
    },
    
    // RELATIONS
    owner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    vendors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" }
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model<StoreDocument>("Store", StoreSchema);
