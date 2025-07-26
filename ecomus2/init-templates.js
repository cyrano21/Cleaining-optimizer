#!/usr/bin/env node

/**
 * SCRIPT D'INITIALISATION DES TEMPLATES
 * 
 * Crée les templates par défaut en base de données
 * pour remplacer les templates hardcodés
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import du modèle Template
const Template = require('./ecomus_dashboard_pro/src/models/Template.ts').default;

const DEFAULT_TEMPLATES = [
  {
    name: 'home-1',
    displayName: 'Fashion Classic',
    description: 'Template classique pour les boutiques de mode avec hero, catégories et produits',
    category: 'fashion',
    preview: {
      thumbnail: '/templates/previews/home-1-thumb.jpg',
      demoUrl: '/demo/home-1'
    },
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Principal',
        description: 'En-tête avec navigation et panier',
        order: 1,
        isRequired: true,
        defaultProps: { 
          textClass: 'text-white',
          showTopbar: false,
          showSearch: true,
          showWishlist: true,
          showCart: true
        },
        availableProps: [
          { name: 'textClass', type: 'string', required: false, defaultValue: 'text-white', description: 'Classe CSS pour la couleur du texte' },
          { name: 'showTopbar', type: 'boolean', required: false, defaultValue: false, description: 'Afficher la barre supérieure' },
          { name: 'showSearch', type: 'boolean', required: false, defaultValue: true, description: 'Afficher la recherche' },
          { name: 'showWishlist', type: 'boolean', required: false, defaultValue: true, description: 'Afficher la wishlist' },
          { name: 'showCart', type: 'boolean', required: false, defaultValue: true, description: 'Afficher le panier' }
        ]
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Bannière Hero',
        description: 'Grande bannière avec image et appel à l\'action',
        order: 2,
        isRequired: true,
        defaultProps: {
          showSlider: false,
          autoPlay: true,
          showArrows: true
        },
        availableProps: [
          { name: 'showSlider', type: 'boolean', required: false, defaultValue: false, description: 'Afficher sous forme de slider' },
          { name: 'autoPlay', type: 'boolean', required: false, defaultValue: true, description: 'Lecture automatique du slider' },
          { name: 'showArrows', type: 'boolean', required: false, defaultValue: true, description: 'Afficher les flèches de navigation' }
        ]
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Produits',
        description: 'Grille ou slider des catégories de produits',
        order: 3,
        defaultProps: { 
          limit: 6, 
          showTitle: true, 
          layout: 'grid',
          title: 'SHOP BY CATEGORIES'
        },
        availableProps: [
          { name: 'limit', type: 'number', required: false, defaultValue: 6, description: 'Nombre de catégories à afficher' },
          { name: 'showTitle', type: 'boolean', required: false, defaultValue: true, description: 'Afficher le titre de la section' },
          { name: 'layout', type: 'string', required: false, defaultValue: 'grid', description: 'Mise en page (grid/slider)' },
          { name: 'title', type: 'string', required: false, defaultValue: 'SHOP BY CATEGORIES', description: 'Titre de la section' }
        ]
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits Vedettes',
        description: 'Grille des produits mis en avant',
        order: 4,
        defaultProps: { 
          limit: 8, 
          title: 'Nos Produits',
          showFilters: false,
          layout: 'grid'
        },
        availableProps: [
          { name: 'limit', type: 'number', required: false, defaultValue: 8, description: 'Nombre de produits à afficher' },
          { name: 'title', type: 'string', required: false, defaultValue: 'Nos Produits', description: 'Titre de la section' },
          { name: 'showFilters', type: 'boolean', required: false, defaultValue: false, description: 'Afficher les filtres' },
          { name: 'layout', type: 'string', required: false, defaultValue: 'grid', description: 'Mise en page des produits' }
        ]
      },
      {
        type: 'brands',
        component: 'brands',
        name: 'Marques Partenaires',
        description: 'Logos des marques partenaires',
        order: 5,
        defaultProps: { 
          limit: 6, 
          showTitle: false,
          autoPlay: true
        },
        availableProps: [
          { name: 'limit', type: 'number', required: false, defaultValue: 6, description: 'Nombre de marques à afficher' },
          { name: 'showTitle', type: 'boolean', required: false, defaultValue: false, description: 'Afficher le titre de la section' },
          { name: 'autoPlay', type: 'boolean', required: false, defaultValue: true, description: 'Défilement automatique' }
        ]
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Pied de page',
        description: 'Pied de page avec liens et informations',
        order: 6,
        isRequired: true,
        defaultProps: {
          showNewsletter: true,
          showSocial: true,
          showPaymentMethods: true
        },
        availableProps: [
          { name: 'showNewsletter', type: 'boolean', required: false, defaultValue: true, description: 'Afficher l\'inscription newsletter' },
          { name: 'showSocial', type: 'boolean', required: false, defaultValue: true, description: 'Afficher les réseaux sociaux' },
          { name: 'showPaymentMethods', type: 'boolean', required: false, defaultValue: true, description: 'Afficher les moyens de paiement' }
        ]
      }
    ],
    defaultTheme: {
      colors: {
        primary: '#000000',
        secondary: '#666666', 
        accent: '#ff6b6b',
        background: '#ffffff',
        text: '#333333'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      layout: {
        maxWidth: '1200px',
        spacing: 'normal'
      }
    },
    isActive: true,
    isPremium: false,
    version: '1.0.0',
    compatibleWith: ['2.0.0']
  },
  
  {
    name: 'home-4',
    displayName: 'Fashion Modern',
    description: 'Template moderne avec marquee et testimonials',
    category: 'fashion',
    preview: {
      thumbnail: '/templates/previews/home-4-thumb.jpg',
      demoUrl: '/demo/home-4'
    },
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header avec Topbar',
        order: 1,
        isRequired: true,
        defaultProps: { textClass: 'text-white' }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Hero Banner',
        order: 2,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'marquee',
        component: 'marquee',
        name: 'Texte Défilant',
        order: 3,
        defaultProps: { 
          text: 'LIVRAISON GRATUITE • RETOURS FACILES • SUPPORT 24/7',
          speed: 'normal'
        }
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories',
        order: 4,
        defaultProps: { limit: 6, showTitle: true }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits',
        order: 5,
        defaultProps: { limit: 8, title: 'Produits Tendance' }
      },
      {
        type: 'testimonials',
        component: 'testimonials',
        name: 'Témoignages',
        order: 6,
        defaultProps: { limit: 3, layout: 'slider' }
      },
      {
        type: 'footer',
        component: 'footer2',
        name: 'Footer',
        order: 7,
        isRequired: true,
        defaultProps: {}
      }
    ],
    defaultTheme: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1e293b'
      }
    }
  },
  
  {
    name: 'home-electronic',
    displayName: 'Electronics Store',
    description: 'Template spécialisé pour les produits électroniques',
    category: 'electronics',
    preview: {
      thumbnail: '/templates/previews/home-electronic-thumb.jpg',
      demoUrl: '/demo/home-electronic'
    },
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
        defaultProps: { 
          title: 'Flash Sale',
          showProducts: true,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        type: 'products',
        component: 'productsElectronic',
        name: 'Produits Electronics',
        order: 5,
        defaultProps: { 
          limit: 12, 
          showFilters: true,
          categoryId: 'electronics'
        }
      },
      {
        type: 'collections',
        component: 'collections',
        name: 'Collections Spéciales',
        order: 6,
        defaultProps: { showTitle: true, layout: 'grid' }
      },
      {
        type: 'footer',
        component: 'footer2',
        name: 'Footer Electronics',
        order: 7,
        isRequired: true,
        defaultProps: {}
      }
    ],
    defaultTheme: {
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6',
        background: '#f9fafb',
        text: '#111827'
      }
    }
  }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createDefaultTemplates() {
  try {
    // Supprimer les templates existants
    await Template.deleteMany({});
    console.log('🗑️  Cleared existing templates');
    
    // Créer les nouveaux templates
    for (const templateData of DEFAULT_TEMPLATES) {
      const template = new Template(templateData);
      await template.save();
      console.log(`✅ Created template: ${template.displayName} (${template.name})`);
    }
    
    console.log(`\n🎉 Successfully created ${DEFAULT_TEMPLATES.length} templates`);
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  }
}

async function listTemplates() {
  try {
    const templates = await Template.find({}).select('name displayName category isActive');
    console.log('\n📋 Templates in database:');
    templates.forEach(template => {
      console.log(`  - ${template.displayName} (${template.name}) [${template.category}] ${template.isActive ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ Error listing templates:', error);
  }
}

async function main() {
  console.log('🚀 INITIALISATION DES TEMPLATES PAR DÉFAUT\n');
  
  await connectDB();
  await createDefaultTemplates();
  await listTemplates();
  
  console.log('\n✅ TEMPLATES INITIALISÉS !');
  console.log('\n📋 PROCHAINES ÉTAPES :');
  console.log('1. Tester l\'API /api/templates dans le dashboard');
  console.log('2. Créer des stores avec ces templates');
  console.log('3. Tester le rendu dynamique côté frontend');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  DEFAULT_TEMPLATES,
  createDefaultTemplates,
  listTemplates
};