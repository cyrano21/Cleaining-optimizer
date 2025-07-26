#!/usr/bin/env node

/**
 * SCRIPT D'INITIALISATION - TEMPLATES CORE UNIQUEMENT
 * 
 * Phase 1 : Migration des 8 templates principaux (home-1 à home-8)
 * Les 42 templates spécialisés seront traités en phase 2
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus_dashboard';

/**
 * TEMPLATES CORE - HOME-1 À HOME-8 UNIQUEMENT
 * 
 * Ces templates sont les plus utilisés et servent de base
 * pour la validation du système de migration
 */
const CORE_TEMPLATES = [
  {
    id: 'home-1',
    name: 'Fashion Classic',
    description: 'Template classique pour les boutiques de mode avec hero, catégories et produits',
    category: 'Fashion',
    preview: '/templates/previews/home-1.jpg',
    thumbnails: ['/templates/previews/home-1-thumb.jpg'],
    tags: ['fashion', 'classic', 'elegant', 'hero', 'categories'],
    metadata: {
      author: 'Ecomus Team',
      version: '1.0.0',
      compatibility: ['ecomusnext@2.0.0'],
      features: ['Responsive', 'SEO Optimized', 'Fast Loading']
    },
    files: {
      components: [
        { name: 'Hero.tsx', path: '/components/homes/home-1/Hero.tsx' },
        { name: 'Categories.tsx', path: '/components/homes/home-1/Categories.tsx' },
        { name: 'Products.tsx', path: '/components/homes/home-1/Products.tsx' }
      ],
      styles: [],
      assets: []
    },
    accessibility: 'public',
    requiredSubscription: 'free',
    stats: { views: 0, uses: 0, rating: 0, reviews: 0 },
    status: 'published',
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Principal',
        description: 'En-tête avec navigation et panier',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { 
          textClass: 'text-white'
        }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Bannière Hero',
        description: 'Grande bannière avec image et appel à l\'action',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Produits',
        description: 'Grille des catégories de produits',
        order: 3,
        isActive: true,
        defaultProps: { 
          limit: 6, 
          showTitle: true, 
          layout: 'grid',
          title: 'SHOP BY CATEGORIES'
        }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits Vedettes',
        description: 'Grille des produits mis en avant',
        order: 4,
        isActive: true,
        defaultProps: { 
          limit: 8, 
          title: 'Nos Produits',
          showFilters: false
        }
      },
      {
        type: 'brands',
        component: 'brands',
        name: 'Marques Partenaires',
        description: 'Logos des marques partenaires',
        order: 5,
        isActive: true,
        defaultProps: { 
          limit: 6, 
          showTitle: false
        }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Pied de page',
        description: 'Pied de page avec liens et informations',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  {
    id: 'home-2',
    name: 'Fashion Minimal',
    description: 'Template minimaliste pour boutiques de mode épurées',
    category: 'Fashion',
    preview: '/templates/previews/home-2.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header1', name: 'Header Minimal', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero2', name: 'Hero Minimal', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 3, defaultProps: { limit: 4, layout: 'minimal' } },
      { type: 'products', component: 'products2', name: 'Produits', order: 4, defaultProps: { limit: 6 } },
      { type: 'footer', component: 'footer1', name: 'Footer', order: 5, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-3',
    name: 'Fashion Bold',
    description: 'Template audacieux avec animations et effets visuels',
    category: 'Fashion',
    preview: '/templates/previews/home-3.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header3', name: 'Header Bold', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero3', name: 'Hero Animé', order: 2, isRequired: true, defaultProps: { animation: true } },
      { type: 'slider', component: 'slider1', name: 'Slider Produits', order: 3, defaultProps: { autoPlay: true } },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 4, defaultProps: { limit: 8, layout: 'slider' } },
      { type: 'products', component: 'products3', name: 'Produits', order: 5, defaultProps: { limit: 12, showFilters: true } },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 6, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-4',
    name: 'Fashion Modern',
    description: 'Template moderne avec marquee et testimonials',
    category: 'Fashion',
    preview: '/templates/previews/home-4.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header2', name: 'Header Modern', order: 1, isRequired: true, defaultProps: { textClass: 'text-white' } },
      { type: 'hero', component: 'hero1', name: 'Hero', order: 2, isRequired: true, defaultProps: {} },
      { type: 'marquee', component: 'marquee', name: 'Texte Défilant', order: 3, defaultProps: { text: 'LIVRAISON GRATUITE • RETOURS FACILES' } },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 4, defaultProps: { limit: 6 } },
      { type: 'products', component: 'products1', name: 'Produits', order: 5, defaultProps: { limit: 8 } },
      { type: 'testimonials', component: 'testimonials', name: 'Témoignages', order: 6, defaultProps: { limit: 3 } },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 7, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-5',
    name: 'Fashion Luxury',
    description: 'Template haut de gamme pour marques de luxe',
    category: 'Luxury',
    preview: '/templates/previews/home-5.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header3', name: 'Header Luxury', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero2', name: 'Hero Élégant', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categories', name: 'Collections', order: 3, defaultProps: { limit: 4, layout: 'elegant' } },
      { type: 'products', component: 'products2', name: 'Produits Exclusifs', order: 4, defaultProps: { limit: 6, layout: 'luxury' } },
      { type: 'lookbook', component: 'lookbook', name: 'Lookbook', order: 5, defaultProps: { showTitle: true } },
      { type: 'footer', component: 'footer3', name: 'Footer Luxury', order: 6, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-6',
    name: 'Fashion Clean',
    description: 'Template épuré et rapide pour performances optimales',
    category: 'Fashion',
    preview: '/templates/previews/home-6.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header1', name: 'Header Clean', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero1', name: 'Hero Simple', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 3, defaultProps: { limit: 6, layout: 'clean' } },
      { type: 'products', component: 'products1', name: 'Produits', order: 4, defaultProps: { limit: 8 } },
      { type: 'footer', component: 'footer1', name: 'Footer', order: 5, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-7',
    name: 'Fashion Creative',
    description: 'Template créatif avec layouts innovants',
    category: 'Fashion',
    preview: '/templates/previews/home-7.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header2', name: 'Header Creative', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero3', name: 'Hero Créatif', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 3, defaultProps: { limit: 6, layout: 'creative' } },
      { type: 'products', component: 'products3', name: 'Produits', order: 4, defaultProps: { limit: 10 } },
      { type: 'instagram', component: 'instagram', name: 'Feed Instagram', order: 5, defaultProps: { hashtag: '#fashion' } },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 6, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-8',
    name: 'Fashion Complete',
    description: 'Template complet avec toutes les fonctionnalités',
    category: 'Fashion',
    preview: '/templates/previews/home-8.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header2', name: 'Header Complet', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'hero1', name: 'Hero', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 3, defaultProps: { limit: 8 } },
      { type: 'products', component: 'products1', name: 'Nouveautés', order: 4, defaultProps: { limit: 8, title: 'Nouveautés' } },
      { type: 'collections', component: 'collections', name: 'Collections', order: 5, defaultProps: { showTitle: true } },
      { type: 'testimonials', component: 'testimonials', name: 'Avis Clients', order: 6, defaultProps: { limit: 5 } },
      { type: 'brands', component: 'brands', name: 'Partenaires', order: 7, defaultProps: { limit: 8 } },
      { type: 'newsletter', component: 'newsletter', name: 'Newsletter', order: 8, defaultProps: {} },
      { type: 'footer', component: 'footer1', name: 'Footer', order: 9, isRequired: true, defaultProps: {} }
    ]
  }
];

// Schema simplifié pour les templates core
const TemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Business', 'Fashion', 'Tech', 'Luxury', 'Beauty', 'Food', 'Home', 'Kids', 'Sports', 'Books', 'Art', 'Pets', 'Garden'],
    required: true 
  },
  preview: { type: String, required: true },
  thumbnails: [String],
  tags: [String],
  metadata: {
    author: String,
    version: String,
    compatibility: [String],
    features: [String]
  },
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
  stats: {
    views: { type: Number, default: 0 },
    uses: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deprecated'],
    default: 'published'
  },
  sections: [{
    type: { type: String, required: true },
    component: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    defaultProps: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function checkExistingTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  const existing = await Template.find({}).select('id name status');
  
  console.log('\n🔍 TEMPLATES EXISTANTS EN BASE:');
  if (existing.length === 0) {
    console.log('  📭 Aucun template trouvé');
  } else {
    existing.forEach(t => {
      console.log(`  📄 ${t.id} - ${t.name} [${t.status}]`);
    });
  }
  
  return existing;
}

async function createCoreTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  
  console.log('\n🌱 CRÉATION DES TEMPLATES CORE...');
  
  for (const templateData of CORE_TEMPLATES) {
    try {
      // Vérifier si le template existe déjà
      const existing = await Template.findOne({ id: templateData.id });
      
      if (existing) {
        console.log(`  ⚠️  Template ${templateData.id} existe déjà - ignoré`);
        continue;
      }
      
      // Ajouter les champs manquants avec des valeurs par défaut
      const completeTemplate = {
        ...templateData,
        thumbnails: templateData.thumbnails || [],
        tags: templateData.tags || [],
        metadata: templateData.metadata || {},
        files: templateData.files || { components: [], styles: [], assets: [] },
        accessibility: templateData.accessibility || 'public',
        requiredSubscription: templateData.requiredSubscription || 'free',
        stats: templateData.stats || { views: 0, uses: 0, rating: 0, reviews: 0 }
      };
      
      const template = new Template(completeTemplate);
      await template.save();
      
      console.log(`  ✅ Template créé: ${template.name} (${template.id})`);
      
    } catch (error) {
      console.error(`  ❌ Erreur lors de la création de ${templateData.id}:`, error.message);
    }
  }
}

async function listCreatedTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  const templates = await Template.find({}).select('id name category status sections');
  
  console.log('\n📋 TEMPLATES CRÉÉS:');
  templates.forEach(template => {
    const sectionsCount = template.sections ? template.sections.length : 0;
    console.log(`  📄 ${template.id} - ${template.name}`);
    console.log(`      Catégorie: ${template.category} | Sections: ${sectionsCount} | Status: ${template.status}`);
  });
}

async function main() {
  console.log('🚀 INITIALISATION DES TEMPLATES CORE (Phase 1)');
  console.log('================================================\n');
  
  await connectDB();
  
  // 1. Vérifier les templates existants
  const existing = await checkExistingTemplates();
  
  // 2. Créer les templates core
  await createCoreTemplates();
  
  // 3. Lister les templates créés
  await listCreatedTemplates();
  
  console.log('\n✅ PHASE 1 TERMINÉE !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('  1. Tester l\'API /api/stores/[slug]/config');
  console.log('  2. Créer un store de test avec home-1');
  console.log('  3. Tester le rendu dynamique côté frontend');
  console.log('  4. Valider avant de passer à la Phase 2');
  console.log('\n⚠️  NOTE: Les 42 templates spécialisés restent inchangés pour l\'instant');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  CORE_TEMPLATES,
  createCoreTemplates,
  checkExistingTemplates
};
