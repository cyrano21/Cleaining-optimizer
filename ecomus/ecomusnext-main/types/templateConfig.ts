// Types pour la configuration modulaire des templates

export interface SectionConfig {
  enabled: boolean;
  order?: number;
  props?: Record<string, any>;
}

export interface HomeElectronicConfig {
  header?: SectionConfig & {
    type?: 'header1' | 'header2' | 'header3';
    textClass?: string;
  };
  hero?: SectionConfig & {
    showStore?: boolean;
    customBanner?: string;
  };
  categories?: SectionConfig & {
    limit?: number;
    showTitle?: boolean;
  };
  products?: SectionConfig & {
    title?: string;
    limit?: number;
    showFilters?: boolean;
    categoryId?: string;
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
  };
  marquee?: SectionConfig & {
    text?: string;
    speed?: number;
  };
  blogs?: SectionConfig & {
    title?: string;
    limit?: number;
  };
  footer?: SectionConfig & {
    type?: 'footer1' | 'footer2' | 'footer3';
  };
}

export interface TemplateConfig {
  templateId: string;
  sections: HomeElectronicConfig;
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

// Configuration par défaut pour le template home-electronic
export const DEFAULT_HOME_ELECTRONIC_CONFIG: TemplateConfig = {
  templateId: 'home-electronic',
  sections: {
    header: {
      enabled: true,
      order: 1,
      type: 'header2',
      textClass: 'text-white'
    },
    hero: {
      enabled: true,
      order: 2,
      showStore: true
    },
    categories: {
      enabled: true,
      order: 3,
      limit: 8,
      showTitle: true
    },
    products: {
      enabled: true,
      order: 4,
      title: 'Produits Électroniques',
      limit: 12,
      showFilters: false
    },
    collections: {
      enabled: true,
      order: 5,
      showTitle: true,
      layout: 'grid'
    },
    collectionBanner: {
      enabled: true,
      order: 6
    },
    countdown: {
      enabled: true,
      order: 7,
      title: 'Offre Limitée',
      showProducts: true
    },
    testimonials: {
      enabled: true,
      order: 8,
      title: 'Avis Clients',
      limit: 3
    },
    marquee: {
      enabled: true,
      order: 9,
      text: 'Livraison Gratuite • Retours 30 jours • Support 24/7',
      speed: 50
    },
    blogs: {
      enabled: true,
      order: 10,
      title: 'Actualités Tech',
      limit: 3
    },
    footer: {
      enabled: true,
      order: 11,
      type: 'footer1'
    }
  },
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    darkMode: false
  },
  seo: {
    title: 'Boutique Électronique - Ecomus',
    description: 'Découvrez notre sélection de produits électroniques de qualité',
    keywords: ['électronique', 'high-tech', 'gadgets', 'smartphones', 'accessoires']
  }
};
