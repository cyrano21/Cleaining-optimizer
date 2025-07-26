// models/Template.ts
import mongoose, { Document, Schema } from 'mongoose';

/**
 * MODÈLE TEMPLATE - GESTION CENTRALISÉE DES TEMPLATES
 * 
 * Ce modèle remplace les templates hardcodés côté frontend
 * Toute la configuration des templates est maintenant gérée depuis le dashboard
 */

// Interface pour le document Template
export interface ITemplate extends Document {
  id: string;
  name: string;
  description: string;
  category: 'Business' | 'Fashion' | 'Tech' | 'Luxury' | 'Beauty' | 'Food' | 'Home' | 'Kids' | 'Sports' | 'Books' | 'Art' | 'Pets' | 'Garden';
  preview: string;
  thumbnails: string[];
  tags: string[];
  metadata: {
    author?: string;
    version?: string;
    compatibility?: string[];
    features?: string[];
  };
  files: {
    components: Array<{
      name?: string;
      path?: string;
      content?: string;
    }>;
    styles: Array<{
      name?: string;
      path?: string;
      content?: string;
    }>;
    assets: Array<{
      name?: string;
      url?: string;
      type?: string;
    }>;
  };
  accessibility: 'public' | 'premium' | 'admin_only' | 'custom';
  requiredSubscription: 'free' | 'basic' | 'premium' | 'enterprise';
  stats: {
    views: number;
    uses: number;
    rating: number;
    reviews: number;
  };
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const SectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['header', 'hero', 'categories', 'products', 'testimonials', 'brands', 'footer', 'slider', 'collections', 'countdown', 'marquee', 'lookbook', 'instagram', 'newsletter']
  },
  component: {
    type: String,
    required: true,
    // Ex: 'hero1', 'categories', 'products1', 'header2', etc.
  },
  name: {
    type: String,
    required: true,
    // Nom affiché dans le dashboard
  },
  description: {
    type: String,
    // Description pour le dashboard
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRequired: {
    type: Boolean,
    default: false,
    // Sections obligatoires (header, footer)
  },
  defaultProps: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Props par défaut pour le composant
    // Ex: { limit: 6, showTitle: true, layout: 'grid' }
  },
  availableProps: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object']
    },
    required: Boolean,
    defaultValue: mongoose.Schema.Types.Mixed,
    description: String
  }],
  // Configuration des props disponibles pour le dashboard
}, { _id: true });

const templateSchema = new Schema<ITemplate>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Business', 'Fashion', 'Tech', 'Luxury', 'Beauty', 'Food', 'Home', 'Kids', 'Sports', 'Books', 'Art', 'Pets', 'Garden']
  },
  preview: {
    type: String, // URL de l'image de preview
    required: true
  },
  thumbnails: [{
    type: String // URLs des images supplémentaires
  }],
  tags: [{
    type: String
  }],
  // Métadonnées du template
  metadata: {
    author: String,
    version: String,
    compatibility: [String],
    features: [String]
  },
  // Fichiers du template
  files: {
    components: [{
      name: String,
      path: String,
      content: String
    }],
    styles: [{
      name: String,
      path: String,
      content: String
    }],
    assets: [{
      name: String,
      url: String,
      type: String
    }]
  },
  // Accès et permissions
  accessibility: {
    type: String,
    enum: ['public', 'premium', 'admin_only', 'custom'],
    default: 'public'
  },
  requiredSubscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  // Statistiques
  stats: {
    views: { type: Number, default: 0 },
    uses: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  // Statut
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deprecated'],
    default: 'draft'
  },
  // Dates
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date,
  // Créateur
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Sections du template (NOUVEAU SYSTÈME)
  sections: [SectionSchema],
  
  // Thème par défaut
  defaultTheme: {
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#666666' },
      accent: { type: String, default: '#ff6b6b' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#333333' }
    },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' }
    },
    layout: {
      maxWidth: { type: String, default: '1200px' },
      spacing: { type: String, default: 'normal' }
    }
  },
  
  // Métadonnées supplémentaires
  version: {
    type: String,
    default: '1.0.0'
  },
  compatibleWith: [String],
  // Versions d'ecomusnext compatibles
  
  // Statistiques d'utilisation
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
templateSchema.index({ name: 1 });
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ isPremium: 1, isActive: 1 });

// Méthodes statiques
templateSchema.statics.getActiveTemplates = function() {
  return this.find({ isActive: true }).sort({ category: 1, displayName: 1 });
};

templateSchema.statics.getByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ displayName: 1 });
};

// Méthodes d'instance
templateSchema.methods.getActiveSections = function() {
  return this.sections.filter((section: any) => section.isActive);
};

templateSchema.methods.getSectionByType = function(type: string) {
  return this.sections.find((section: any) => section.type === type && section.isActive);
};

// Middleware pour mettre à jour updatedAt
templateSchema.pre('save', function(next) {
  // Le timestamp updatedAt est géré automatiquement par { timestamps: true }
  next();
});

// Export du modèle
const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);
export default Template;

/**
 * TEMPLATES PAR DÉFAUT À CRÉER EN BASE
 * 
 * Ces templates remplacent les anciens templates hardcodés
 */
export const DEFAULT_TEMPLATES = [
  {
    name: 'home-1',
    displayName: 'Fashion Classic',
    description: 'Template classique pour les boutiques de mode',
    category: 'fashion',
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Principal',
        order: 1,
        isRequired: true,
        defaultProps: { textClass: 'text-white' }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Bannière Hero',
        order: 2,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Produits',
        order: 3,
        defaultProps: { limit: 6, showTitle: true, layout: 'grid' }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits Vedettes',
        order: 4,
        defaultProps: { limit: 8, title: 'Nos Produits' }
      },
      {
        type: 'brands',
        component: 'brands',
        name: 'Marques Partenaires',
        order: 5,
        defaultProps: { limit: 6, showTitle: false }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Pied de page',
        order: 6,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },
  {
    name: 'home-electronic',
    displayName: 'Electronics Store',
    description: 'Template spécialisé pour les produits électroniques',
    category: 'electronics',
    sections: [
      {
        type: 'header',
        component: 'header1',
        name: 'Header Electronics',
        order: 1,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'hero',
        component: 'heroElectronic',
        name: 'Hero Electronics',
        order: 2,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categoriesElectronic',
        name: 'Catégories Électroniques',
        order: 3,
        defaultProps: { limit: 8, layout: 'slider' }
      },
      {
        type: 'countdown',
        component: 'countdown',
        name: 'Offre Limitée',
        order: 4,
        defaultProps: { title: 'Flash Sale', showProducts: true }
      },
      {
        type: 'products',
        component: 'productsElectronic',
        name: 'Produits Electronics',
        order: 5,
        defaultProps: { limit: 12, showFilters: true }
      },
      {
        type: 'footer',
        component: 'footer2',
        name: 'Footer Electronics',
        order: 6,
        isRequired: true,
        defaultProps: {}
      }
    ]
  }
];