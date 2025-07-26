/**
 * BIBLIOTHÈQUE DE COMPOSANTS DYNAMIQUES
 * 
 * Définit tous les types de composants disponibles pour la construction 
 * dynamique des stores. Chaque composant a sa configuration et ses paramètres.
 */

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  
  // Configuration par défaut
  defaultConfig: Record<string, any>;
  
  // Schéma de configuration (pour validation et génération d'UI)
  configSchema: {
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color' | 'image' | 'url';
      label: string;
      description?: string;
      default?: any;
      required?: boolean;
      options?: any[]; // Pour les select/radio
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: string[];
      };
    }>;
  };
  
  // Paramètres responsive
  responsiveOptions?: string[];
  
  // Dépendances (autres composants requis)
  dependencies?: string[];
  
  // Composant premium/gratuit
  isPremium?: boolean;
}

// =============================================================================
// COMPOSANTS DE HERO / BANNER
// =============================================================================

export const HERO_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'hero-classic',
    name: 'Hero Classique',
    category: 'hero',
    description: 'Hero section avec image de fond, titre, sous-titre et bouton d\'action',
    tags: ['hero', 'banner', 'cta', 'image'],
    defaultConfig: {
      title: 'Bienvenue dans notre boutique',
      subtitle: 'Découvrez nos produits exceptionnels',
      buttonText: 'Découvrir',
      buttonLink: '/products',
      backgroundImage: '',
      textColor: '#ffffff',
      overlayOpacity: 0.5,
      textAlignment: 'center',
      height: 'full-screen'
    },
    configSchema: {
      properties: {
        title: {
          type: 'string',
          label: 'Titre principal',
          required: true
        },
        subtitle: {
          type: 'string',
          label: 'Sous-titre'
        },
        buttonText: {
          type: 'string',
          label: 'Texte du bouton'
        },
        buttonLink: {
          type: 'url',
          label: 'Lien du bouton'
        },
        backgroundImage: {
          type: 'image',
          label: 'Image de fond',
          required: true
        },
        textColor: {
          type: 'color',
          label: 'Couleur du texte',
          default: '#ffffff'
        },
        overlayOpacity: {
          type: 'number',
          label: 'Opacité de l\'overlay',
          validation: { min: 0, max: 1 },
          default: 0.5
        },
        textAlignment: {
          type: 'string',
          label: 'Alignement du texte',
          options: ['left', 'center', 'right'],
          default: 'center'
        },
        height: {
          type: 'string',
          label: 'Hauteur',
          options: ['auto', 'half-screen', 'full-screen', 'custom'],
          default: 'full-screen'
        }
      }
    },
    responsiveOptions: ['mobile', 'tablet', 'desktop']
  },
  
  {
    id: 'hero-split',
    name: 'Hero Split',
    category: 'hero',
    description: 'Hero section avec contenu à gauche et image à droite',
    tags: ['hero', 'split', 'two-columns'],
    defaultConfig: {
      title: 'Nouvelle Collection',
      subtitle: 'Styles exclusifs pour cette saison',
      buttonText: 'Voir la collection',
      buttonLink: '/collection',
      image: '',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      imagePosition: 'right'
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre', required: true },
        subtitle: { type: 'string', label: 'Sous-titre' },
        buttonText: { type: 'string', label: 'Texte du bouton' },
        buttonLink: { type: 'url', label: 'Lien du bouton' },
        image: { type: 'image', label: 'Image', required: true },
        backgroundColor: { type: 'color', label: 'Couleur de fond' },
        textColor: { type: 'color', label: 'Couleur du texte' },
        imagePosition: {
          type: 'string',
          label: 'Position de l\'image',
          options: ['left', 'right'],
          default: 'right'
        }
      }
    }
  },
  
  {
    id: 'hero-carousel',
    name: 'Hero Carrousel',
    category: 'hero',
    description: 'Carrousel de plusieurs slides hero',
    tags: ['hero', 'carousel', 'slider', 'multiple'],
    defaultConfig: {
      slides: [
        {
          title: 'Slide 1',
          subtitle: 'Description du slide 1',
          buttonText: 'En savoir plus',
          buttonLink: '/slide1',
          backgroundImage: '',
          textColor: '#ffffff'
        }
      ],
      autoplay: true,
      autoplayDelay: 5000,
      showArrows: true,
      showDots: true,
      height: 'full-screen'
    },
    configSchema: {
      properties: {
        slides: {
          type: 'array',
          label: 'Slides',
          required: true
        },
        autoplay: {
          type: 'boolean',
          label: 'Lecture automatique',
          default: true
        },
        autoplayDelay: {
          type: 'number',
          label: 'Délai entre slides (ms)',
          default: 5000
        },
        showArrows: {
          type: 'boolean',
          label: 'Afficher les flèches',
          default: true
        },
        showDots: {
          type: 'boolean',
          label: 'Afficher les points',
          default: true
        }
      }
    }
  }
];

// =============================================================================
// COMPOSANTS DE PRODUITS
// =============================================================================

export const PRODUCT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'product-grid',
    name: 'Grille de Produits',
    category: 'products',
    description: 'Grille responsive de produits avec filtres',
    tags: ['products', 'grid', 'shop', 'catalog'],
    defaultConfig: {
      title: 'Nos Produits',
      subtitle: 'Découvrez notre sélection',
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      showFilters: true,
      showSorting: true,
      showPagination: true,
      productsPerPage: 12,
      cardStyle: 'modern',
      showQuickView: true,
      showWishlist: true,
      showCompare: false
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        columns: {
          type: 'object',
          label: 'Colonnes par appareil'
        },
        showFilters: { type: 'boolean', label: 'Afficher les filtres', default: true },
        showSorting: { type: 'boolean', label: 'Afficher le tri', default: true },
        productsPerPage: {
          type: 'number',
          label: 'Produits par page',
          validation: { min: 1, max: 50 },
          default: 12
        },
        cardStyle: {
          type: 'string',
          label: 'Style des cartes',
          options: ['classic', 'modern', 'minimal', 'elegant'],
          default: 'modern'
        }
      }
    }
  },
  
  {
    id: 'featured-products',
    name: 'Produits Vedettes',
    category: 'products',
    description: 'Slider de produits mis en avant',
    tags: ['products', 'featured', 'slider', 'highlights'],
    defaultConfig: {
      title: 'Produits Vedettes',
      subtitle: 'Nos coups de cœur',
      limit: 8,
      showArrows: true,
      showDots: false,
      autoplay: false,
      slidesToShow: { desktop: 4, tablet: 3, mobile: 2 },
      cardStyle: 'elegant',
      criteriaType: 'manual' // manual, bestsellers, newest, rating
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        limit: {
          type: 'number',
          label: 'Nombre de produits',
          validation: { min: 1, max: 20 },
          default: 8
        },
        criteriaType: {
          type: 'string',
          label: 'Critère de sélection',
          options: ['manual', 'bestsellers', 'newest', 'rating', 'sale'],
          default: 'manual'
        },
        cardStyle: {
          type: 'string',
          label: 'Style des cartes',
          options: ['classic', 'modern', 'minimal', 'elegant'],
          default: 'elegant'
        }
      }
    }
  },
  
  {
    id: 'product-categories',
    name: 'Catégories de Produits',
    category: 'products',
    description: 'Grille de catégories avec images',
    tags: ['categories', 'navigation', 'grid'],
    defaultConfig: {
      title: 'Nos Catégories',
      subtitle: 'Explorez par catégorie',
      layout: 'grid',
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      showProductCount: true,
      cardStyle: 'overlay',
      imageHeight: 250
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        layout: {
          type: 'string',
          label: 'Mise en page',
          options: ['grid', 'masonry', 'slider'],
          default: 'grid'
        },
        columns: {
          type: 'object',
          label: 'Colonnes par appareil'
        },
        showProductCount: {
          type: 'boolean',
          label: 'Afficher le nombre de produits',
          default: true
        },
        cardStyle: {
          type: 'string',
          label: 'Style des cartes',
          options: ['overlay', 'bottom', 'side'],
          default: 'overlay'
        }
      }
    }
  }
];

// =============================================================================
// COMPOSANTS DE CONTENU
// =============================================================================

export const CONTENT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'text-block',
    name: 'Bloc de Texte',
    category: 'content',
    description: 'Section de texte avec titre et contenu riche',
    tags: ['text', 'content', 'rich-text'],
    defaultConfig: {
      title: 'À propos de nous',
      content: '<p>Votre contenu ici...</p>',
      textAlignment: 'left',
      backgroundColor: 'transparent',
      textColor: '#212529',
      maxWidth: '800px',
      padding: 'medium'
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        content: { type: 'string', label: 'Contenu HTML' },
        textAlignment: {
          type: 'string',
          label: 'Alignement',
          options: ['left', 'center', 'right', 'justify'],
          default: 'left'
        },
        backgroundColor: { type: 'color', label: 'Couleur de fond' },
        textColor: { type: 'color', label: 'Couleur du texte' },
        maxWidth: { type: 'string', label: 'Largeur maximale' },
        padding: {
          type: 'string',
          label: 'Espacement interne',
          options: ['none', 'small', 'medium', 'large'],
          default: 'medium'
        }
      }
    }
  },
  
  {
    id: 'features-grid',
    name: 'Grille d\'Avantages',
    category: 'content',
    description: 'Grille d\'avantages/fonctionnalités avec icônes',
    tags: ['features', 'benefits', 'icons', 'grid'],
    defaultConfig: {
      title: 'Pourquoi nous choisir ?',
      subtitle: 'Nos avantages',
      features: [
        {
          icon: 'truck',
          title: 'Livraison gratuite',
          description: 'Dès 50€ d\'achat'
        },
        {
          icon: 'shield',
          title: 'Paiement sécurisé',
          description: '100% sécurisé'
        },
        {
          icon: 'refresh',
          title: 'Retour gratuit',
          description: '30 jours pour changer d\'avis'
        }
      ],
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      cardStyle: 'minimal',
      iconStyle: 'outline'
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        features: { type: 'array', label: 'Liste des avantages' },
        columns: { type: 'object', label: 'Colonnes par appareil' },
        cardStyle: {
          type: 'string',
          label: 'Style des cartes',
          options: ['minimal', 'bordered', 'shadow', 'filled'],
          default: 'minimal'
        },
        iconStyle: {
          type: 'string',
          label: 'Style des icônes',
          options: ['outline', 'filled', 'duotone'],
          default: 'outline'
        }
      }
    }
  },
  
  {
    id: 'testimonials',
    name: 'Témoignages',
    category: 'content',
    description: 'Carrousel de témoignages clients',
    tags: ['testimonials', 'reviews', 'social-proof'],
    defaultConfig: {
      title: 'Ce que disent nos clients',
      subtitle: 'Témoignages authentiques',
      testimonials: [
        {
          content: 'Service exceptionnel et produits de qualité !',
          author: 'Marie Dupont',
          rating: 5,
          avatar: ''
        }
      ],
      layout: 'carousel',
      showRating: true,
      showAvatar: true,
      autoplay: true,
      slidesToShow: { desktop: 3, tablet: 2, mobile: 1 }
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        testimonials: { type: 'array', label: 'Témoignages' },
        layout: {
          type: 'string',
          label: 'Mise en page',
          options: ['carousel', 'grid', 'masonry'],
          default: 'carousel'
        },
        showRating: { type: 'boolean', label: 'Afficher les notes', default: true },
        showAvatar: { type: 'boolean', label: 'Afficher les avatars', default: true }
      }
    }
  }
];

// =============================================================================
// COMPOSANTS UTILITAIRES
// =============================================================================

export const UTILITY_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'newsletter-signup',
    name: 'Inscription Newsletter',
    category: 'utility',
    description: 'Formulaire d\'inscription à la newsletter',
    tags: ['newsletter', 'email', 'subscription'],
    defaultConfig: {
      title: 'Restez informé',
      subtitle: 'Recevez nos dernières offres et nouveautés',
      placeholder: 'Votre adresse email',
      buttonText: 'S\'inscrire',
      privacyText: 'En vous inscrivant, vous acceptez notre politique de confidentialité',
      backgroundColor: '#f8f9fa',
      layout: 'horizontal'
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        subtitle: { type: 'string', label: 'Sous-titre' },
        placeholder: { type: 'string', label: 'Placeholder', default: 'Votre adresse email' },
        buttonText: { type: 'string', label: 'Texte du bouton', default: 'S\'inscrire' },
        privacyText: { type: 'string', label: 'Texte de confidentialité' },
        backgroundColor: { type: 'color', label: 'Couleur de fond' },
        layout: {
          type: 'string',
          label: 'Disposition',
          options: ['horizontal', 'vertical', 'inline'],
          default: 'horizontal'
        }
      }
    }
  },
  
  {
    id: 'social-media',
    name: 'Réseaux Sociaux',
    category: 'utility',
    description: 'Liens vers les réseaux sociaux',
    tags: ['social', 'links', 'sharing'],
    defaultConfig: {
      title: 'Suivez-nous',
      platforms: [
        { name: 'Facebook', url: '', icon: 'facebook' },
        { name: 'Instagram', url: '', icon: 'instagram' },
        { name: 'Twitter', url: '', icon: 'twitter' }
      ],
      style: 'icons',
      size: 'medium',
      layout: 'horizontal'
    },
    configSchema: {
      properties: {
        title: { type: 'string', label: 'Titre' },
        platforms: { type: 'array', label: 'Plateformes' },
        style: {
          type: 'string',
          label: 'Style',
          options: ['icons', 'buttons', 'minimal'],
          default: 'icons'
        },
        size: {
          type: 'string',
          label: 'Taille',
          options: ['small', 'medium', 'large'],
          default: 'medium'
        },
        layout: {
          type: 'string',
          label: 'Disposition',
          options: ['horizontal', 'vertical', 'grid'],
          default: 'horizontal'
        }
      }
    }
  }
];

// =============================================================================
// CATALOGUE COMPLET DES COMPOSANTS
// =============================================================================

export const ALL_COMPONENTS: ComponentDefinition[] = [
  ...HERO_COMPONENTS,
  ...PRODUCT_COMPONENTS,
  ...CONTENT_COMPONENTS,
  ...UTILITY_COMPONENTS
];

// Fonction utilitaire pour récupérer un composant par ID
export function getComponentById(id: string): ComponentDefinition | undefined {
  return ALL_COMPONENTS.find(component => component.id === id);
}

// Fonction pour récupérer les composants par catégorie
export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return ALL_COMPONENTS.filter(component => component.category === category);
}

// Fonction pour rechercher des composants par tags
export function searchComponentsByTags(tags: string[]): ComponentDefinition[] {
  return ALL_COMPONENTS.filter(component =>
    tags.some(tag => component.tags.includes(tag))
  );
}

// Types utilitaires pour TypeScript
export type ComponentCategory = 'hero' | 'products' | 'content' | 'utility';
export type ComponentId = string;
export type ComponentConfig = Record<string, any>;
