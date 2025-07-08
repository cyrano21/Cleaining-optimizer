// Types pour les données de store reçues de l'API
export interface AddressObject {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  network: string;
  url: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface StoreDesign {
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
}

export interface Store {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  banner?: string;
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  
  // Système de design et templates
  design?: StoreDesign;
  homeTheme: string;
  homeTemplate: string;
  homeName: string;
  homeDescription: string;
  
  // Statut et activation
  isActive: boolean;
  activatedAt?: string;
  activatedBy?: string;
  
  // Contact et adresse
  email?: string;
  phone?: string;
  website?: string;
  address?: AddressObject;
  
  // Navigation et réseaux sociaux
  navigationLinks?: NavLink[];
  socialLinks?: SocialLink[];
  footerLinks?: FooterLink[];
  
  // Dates
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreApiResponse {
  store: Store;
  success: boolean;
  message?: string;
}

export interface StoresApiResponse {
  stores: Store[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  success: boolean;
  message?: string;
}
