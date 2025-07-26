// Types pour la configuration modulaire des templates

export interface SectionConfig {
  enabled: boolean;
  order?: number;
  props?: Record<string, any>;
  [key: string]: any;
}

// Configuration commune pour toutes les sections disponibles
export interface CommonSectionsConfig {
  [key: string]: SectionConfig | undefined;
  header?: SectionConfig & {
    type?: 'header1' | 'header2' | 'header3';
    textClass?: string;
  };
  hero?: SectionConfig & {
    type?: 'hero1' | 'hero2' | 'hero3' | 'hero-banner';
    showStore?: boolean;
    customBanner?: string;
    backgroundImage?: string;
  };
  slider?: SectionConfig & {
    type?: 'slider1' | 'slider2' | 'slider3';
    autoPlay?: boolean;
    showDots?: boolean;
  };
  categories?: SectionConfig & {
    limit?: number;
    showTitle?: boolean;
    layout?: 'grid' | 'carousel';
  };
  products?: SectionConfig & {
    title?: string;
    limit?: number;
    showFilters?: boolean;
    categoryId?: string;
    layout?: 'grid' | 'carousel';
  };
  collections?: SectionConfig & {
    showTitle?: boolean;
    layout?: 'grid' | 'carousel';
  };
  collectionBanner?: SectionConfig & {
    bannerImage?: string;
    bannerText?: string;
  };
  countdown?: SectionConfig & {
    title?: string;
    endDate?: string;
    showProducts?: boolean;
  };
  testimonials?: SectionConfig & {
    title?: string;
    limit?: number;
    layout?: 'grid' | 'carousel';
  };
  marquee?: SectionConfig & {
    text?: string;
    speed?: number;
  };
  blogs?: SectionConfig & {
    title?: string;
    limit?: number;
    layout?: 'grid' | 'carousel';
  };
  brands?: SectionConfig & {
    title?: string;
    limit?: number;
    showTitle?: boolean;
  };
  lookbook?: SectionConfig & {
    title?: string;
    showTitle?: boolean;
  };
  instagram?: SectionConfig & {
    title?: string;
    hashtag?: string;
  };
  newsletter?: SectionConfig & {
    title?: string;
    description?: string;
  };
  footer?: SectionConfig & {
    type?: 'footer1' | 'footer2' | 'footer3';
  };
}

export interface HomeElectronicConfig extends CommonSectionsConfig {
  // Spécifique à home-electronic si nécessaire
}

// Autres configs de templates
export interface Home1Config extends CommonSectionsConfig {}
export interface Home2Config extends CommonSectionsConfig {}
export interface Home3Config extends CommonSectionsConfig {}
export interface Home4Config extends CommonSectionsConfig {}
export interface Home5Config extends CommonSectionsConfig {}
export interface Home6Config extends CommonSectionsConfig {}
export interface Home7Config extends CommonSectionsConfig {}
export interface Home8Config extends CommonSectionsConfig {}

export interface TemplateConfig {
  templateId: string;
  sections: CommonSectionsConfig;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    darkMode?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Configurations par défaut pour tous les templates
export const DEFAULT_HOME_1_CONFIG: TemplateConfig = {
  templateId: 'home-1',
  sections: {
    header: { enabled: true, order: 1, type: 'header1' },
    hero: { enabled: true, order: 2, type: 'hero1' },
    categories: { enabled: true, order: 3, limit: 6, showTitle: true },
    products: { enabled: true, order: 4, title: 'Produits Tendance', limit: 8 },
    collections: { enabled: true, order: 5, layout: 'grid' },
    testimonials: { enabled: true, order: 6, limit: 3 },
    blogs: { enabled: true, order: 7, limit: 3 },
    footer: { enabled: true, order: 8, type: 'footer1' }
  },
  theme: { primaryColor: '#000000', secondaryColor: '#666666' }
};

export const DEFAULT_HOME_2_CONFIG: TemplateConfig = {
  templateId: 'home-2',
  sections: {
    header: { enabled: true, order: 1, type: 'header2' },
    slider: { enabled: true, order: 2, type: 'slider1', autoPlay: true },
    categories: { enabled: true, order: 3, limit: 8, layout: 'carousel' },
    products: { enabled: true, order: 4, title: 'Nouveautés', limit: 12 },
    collectionBanner: { enabled: true, order: 5 },
    testimonials: { enabled: true, order: 6, layout: 'carousel' },
    footer: { enabled: true, order: 7, type: 'footer2' }
  },
  theme: { primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4' }
};

export const DEFAULT_HOME_3_CONFIG: TemplateConfig = {
  templateId: 'home-3',
  sections: {
    header: { enabled: true, order: 1, type: 'header1' },
    hero: { enabled: true, order: 2, type: 'hero2' },
    products: { enabled: true, order: 3, title: 'Collections', limit: 10 },
    brands: { enabled: true, order: 4, limit: 6, showTitle: true },
    lookbook: { enabled: true, order: 5, showTitle: true },
    newsletter: { enabled: true, order: 6, title: 'Newsletter' },
    footer: { enabled: true, order: 7, type: 'footer1' }
  },
  theme: { primaryColor: '#2c3e50', secondaryColor: '#3498db' }
};

export const DEFAULT_HOME_4_CONFIG: TemplateConfig = {
  templateId: 'home-4',
  sections: {
    header: { enabled: true, order: 1, type: 'header2' },
    hero: { enabled: true, order: 2, type: 'hero-banner' },
    categories: { enabled: true, order: 3, limit: 4, layout: 'grid' },
    products: { enabled: true, order: 4, title: 'Meilleures Ventes', limit: 8 },
    countdown: { enabled: true, order: 5, title: 'Vente Flash' },
    testimonials: { enabled: true, order: 6, limit: 4 },
    footer: { enabled: true, order: 7, type: 'footer3' }
  },
  theme: { primaryColor: '#e74c3c', secondaryColor: '#34495e' }
};

export const DEFAULT_HOME_5_CONFIG: TemplateConfig = {
  templateId: 'home-5',
  sections: {
    header: { enabled: true, order: 1, type: 'header3' },
    slider: { enabled: true, order: 2, type: 'slider2', showDots: true },
    products: { enabled: true, order: 3, title: 'Sélection du Chef', limit: 6 },
    collections: { enabled: true, order: 4, layout: 'carousel' },
    instagram: { enabled: true, order: 5, hashtag: '#ecomus' },
    footer: { enabled: true, order: 6, type: 'footer2' }
  },
  theme: { primaryColor: '#9b59b6', secondaryColor: '#8e44ad' }
};

export const DEFAULT_HOME_6_CONFIG: TemplateConfig = {
  templateId: 'home-6',
  sections: {
    header: { enabled: true, order: 1, type: 'header1' },
    hero: { enabled: true, order: 2, type: 'hero3' },
    categories: { enabled: true, order: 3, limit: 6 },
    products: { enabled: true, order: 4, title: 'Nos Produits', limit: 12 },
    marquee: { enabled: true, order: 5, text: 'Livraison offerte • Retours gratuits' },
    blogs: { enabled: true, order: 6, limit: 4 },
    footer: { enabled: true, order: 7, type: 'footer1' }
  },
  theme: { primaryColor: '#1abc9c', secondaryColor: '#16a085' }
};

export const DEFAULT_HOME_7_CONFIG: TemplateConfig = {
  templateId: 'home-7',
  sections: {
    header: { enabled: true, order: 1, type: 'header2' },
    slider: { enabled: true, order: 2, type: 'slider3' },
    products: { enabled: true, order: 3, title: 'Tendances', limit: 8 },
    collectionBanner: { enabled: true, order: 4 },
    brands: { enabled: true, order: 5, limit: 8 },
    testimonials: { enabled: true, order: 6, limit: 2 },
    footer: { enabled: true, order: 7, type: 'footer3' }
  },
  theme: { primaryColor: '#f39c12', secondaryColor: '#e67e22' }
};

export const DEFAULT_HOME_8_CONFIG: TemplateConfig = {
  templateId: 'home-8',
  sections: {
    header: { enabled: true, order: 1, type: 'header3' },
    hero: { enabled: true, order: 2, type: 'hero1' },
    categories: { enabled: true, order: 3, limit: 8, layout: 'carousel' },
    products: { enabled: true, order: 4, title: 'Nouveaux Arrivages', limit: 10 },
    lookbook: { enabled: true, order: 5 },
    newsletter: { enabled: true, order: 6 },
    footer: { enabled: true, order: 7, type: 'footer2' }
  },
  theme: { primaryColor: '#27ae60', secondaryColor: '#2ecc71' }
};

export const DEFAULT_HOME_ELECTRONIC_CONFIG: TemplateConfig = {
  templateId: 'home-electronic',
  sections: {
    header: { enabled: true, order: 1, type: 'header2', textClass: 'text-white' },
    hero: { enabled: true, order: 2, showStore: true },
    categories: { enabled: true, order: 3, limit: 8, showTitle: true },
    products: { enabled: true, order: 4, title: 'Produits Électroniques', limit: 12, showFilters: false },
    collections: { enabled: true, order: 5, showTitle: true, layout: 'grid' },
    collectionBanner: { enabled: true, order: 6 },
    countdown: { enabled: true, order: 7, title: 'Offre Limitée', showProducts: true },
    testimonials: { enabled: true, order: 8, title: 'Avis Clients', limit: 3 },
    marquee: { enabled: true, order: 9, text: 'Livraison Gratuite • Retours 30 jours • Support 24/7', speed: 50 },
    blogs: { enabled: true, order: 10, title: 'Actualités Tech', limit: 3 },
    footer: { enabled: true, order: 11, type: 'footer1' }
  },
  theme: { primaryColor: '#007bff', secondaryColor: '#6c757d', darkMode: false },
  seo: {
    title: 'Boutique Électronique - Ecomus',
    description: 'Découvrez notre sélection de produits électroniques de qualité',
    keywords: ['électronique', 'high-tech', 'gadgets', 'smartphones', 'accessoires']
  }
};

// Fonction utilitaire pour obtenir la config par défaut d'un template
export const getDefaultConfigForTemplate = (templateId: string): TemplateConfig => {
  switch (templateId) {
    case 'home-1': case 'home-01': return DEFAULT_HOME_1_CONFIG;
    case 'home-2': case 'home-02': return DEFAULT_HOME_2_CONFIG;
    case 'home-3': case 'home-03': return DEFAULT_HOME_3_CONFIG;
    case 'home-4': case 'home-04': return DEFAULT_HOME_4_CONFIG;
    case 'home-5': case 'home-05': return DEFAULT_HOME_5_CONFIG;
    case 'home-6': case 'home-06': return DEFAULT_HOME_6_CONFIG;
    case 'home-7': case 'home-07': return DEFAULT_HOME_7_CONFIG;
    case 'home-8': case 'home-08': return DEFAULT_HOME_8_CONFIG;
    case 'home-electronic': return DEFAULT_HOME_ELECTRONIC_CONFIG;
    default: return DEFAULT_HOME_1_CONFIG; // Fallback
  }
};