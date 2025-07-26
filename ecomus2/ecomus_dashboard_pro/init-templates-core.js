#!/usr/bin/env node

/**
 * SCRIPT D'INITIALISATION - TEMPLATES CORE AVEC YARN
 * 
 * Utilise le modèle Template.ts existant du dashboard
 * Phase 1 : Migration des 8 templates principaux (home-1 à home-8)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Configuration MongoDB - utilise la variable d'environnement du dashboard
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ecomus_dashboard';

/**
 * TEMPLATES CORE - COMPATIBLES AVEC LE MODÈLE EXISTANT
 * 
 * Adapté au modèle Template.ts existant du dashboard
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
        { name: 'Hero.tsx', path: '/components/homes/home-1/Hero.tsx', content: '' },
        { name: 'Categories.tsx', path: '/components/homes/home-1/Categories.tsx', content: '' },
        { name: 'Products.tsx', path: '/components/homes/home-1/Products.tsx', content: '' }
      ],
      styles: [],
      assets: []
    },
    accessibility: 'public',
    requiredSubscription: 'free',
    stats: { views: 0, uses: 0, rating: 0, reviews: 0 },
    status: 'published',
    // Champ obligatoire createdBy - utiliser un ObjectId valide ou un ID d'admin
    createdBy: new mongoose.Types.ObjectId(), // Sera remplacé par un vrai user ID
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Principal',
        description: 'En-tête avec navigation et panier',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { textClass: 'text-white' },
        availableProps: [
          { name: 'textClass', type: 'string', required: false, defaultValue: 'text-white', description: 'Classe CSS pour la couleur du texte' }
        ]
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Bannière Hero',
        description: 'Grande bannière avec image et appel à l\'action',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {},
        availableProps: []
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
        isActive: true,
        defaultProps: { 
          limit: 8, 
          title: 'Nos Produits',
          showFilters: false
        },
        availableProps: [
          { name: 'limit', type: 'number', required: false, defaultValue: 8, description: 'Nombre de produits à afficher' },
          { name: 'title', type: 'string', required: false, defaultValue: 'Nos Produits', description: 'Titre de la section' },
          { name: 'showFilters', type: 'boolean', required: false, defaultValue: false, description: 'Afficher les filtres' }
        ]
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
        },
        availableProps: [
          { name: 'limit', type: 'number', required: false, defaultValue: 6, description: 'Nombre de marques à afficher' },
          { name: 'showTitle', type: 'boolean', required: false, defaultValue: false, description: 'Afficher le titre de la section' }
        ]
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Pied de page',
        description: 'Pied de page avec liens et informations',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {},
        availableProps: []
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
    compatibleWith: ['2.0.0'],
    usageCount: 0,
    rating: 0
  },

  {
    id: 'home-2',
    name: 'Fashion Minimal',
    description: 'Template minimaliste pour boutiques de mode épurées',
    category: 'Fashion',
    preview: '/templates/previews/home-2.jpg',
    thumbnails: [],
    tags: ['fashion', 'minimal', 'clean'],
    metadata: { author: 'Ecomus Team', version: '1.0.0' },
    files: { components: [], styles: [], assets: [] },
    accessibility: 'public',
    requiredSubscription: 'free',
    stats: { views: 0, uses: 0, rating: 0, reviews: 0 },
    status: 'published',
    createdBy: new mongoose.Types.ObjectId(),
    sections: [
      { type: 'header', component: 'header1', name: 'Header Minimal', order: 1, isRequired: true, defaultProps: {}, availableProps: [] },
      { type: 'hero', component: 'hero2', name: 'Hero Minimal', order: 2, isRequired: true, defaultProps: {}, availableProps: [] },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 3, defaultProps: { limit: 4, layout: 'minimal' }, availableProps: [] },
      { type: 'products', component: 'products2', name: 'Produits', order: 4, defaultProps: { limit: 6 }, availableProps: [] },
      { type: 'footer', component: 'footer1', name: 'Footer', order: 5, isRequired: true, defaultProps: {}, availableProps: [] }
    ],
    defaultTheme: { colors: { primary: '#333333', secondary: '#666666', accent: '#000000', background: '#ffffff', text: '#333333' } },
    isActive: true,
    isPremium: false,
    version: '1.0.0',
    compatibleWith: ['2.0.0']
  },

  {
    id: 'home-3',
    name: 'Fashion Bold',
    description: 'Template audacieux avec animations et effets visuels',
    category: 'Fashion',
    preview: '/templates/previews/home-3.jpg',
    thumbnails: [],
    tags: ['fashion', 'bold', 'animated'],
    metadata: { author: 'Ecomus Team', version: '1.0.0' },
    files: { components: [], styles: [], assets: [] },
    accessibility: 'public',
    requiredSubscription: 'free',
    stats: { views: 0, uses: 0, rating: 0, reviews: 0 },
    status: 'published',
    createdBy: new mongoose.Types.ObjectId(),
    sections: [
      { type: 'header', component: 'header3', name: 'Header Bold', order: 1, isRequired: true, defaultProps: {}, availableProps: [] },
      { type: 'hero', component: 'hero3', name: 'Hero Animé', order: 2, isRequired: true, defaultProps: { animation: true }, availableProps: [] },
      { type: 'slider', component: 'slider1', name: 'Slider Produits', order: 3, defaultProps: { autoPlay: true }, availableProps: [] },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 4, defaultProps: { limit: 8, layout: 'slider' }, availableProps: [] },
      { type: 'products', component: 'products3', name: 'Produits', order: 5, defaultProps: { limit: 12, showFilters: true }, availableProps: [] },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 6, isRequired: true, defaultProps: {}, availableProps: [] }
    ],
    defaultTheme: { colors: { primary: '#1a1a1a', secondary: '#666666', accent: '#ff4757', background: '#ffffff', text: '#1a1a1a' } },
    isActive: true,
    isPremium: false,
    version: '1.0.0',
    compatibleWith: ['2.0.0']
  },

  {
    id: 'home-4',
    name: 'Fashion Modern',
    description: 'Template moderne avec marquee et testimonials',
    category: 'Fashion',
    preview: '/templates/previews/home-4.jpg',
    thumbnails: [],
    tags: ['fashion', 'modern', 'testimonials'],
    metadata: { author: 'Ecomus Team', version: '1.0.0' },
    files: { components: [], styles: [], assets: [] },
    accessibility: 'public',
    requiredSubscription: 'free',
    stats: { views: 0, uses: 0, rating: 0, reviews: 0 },
    status: 'published',
    createdBy: new mongoose.Types.ObjectId(),
    sections: [
      { type: 'header', component: 'header2', name: 'Header Modern', order: 1, isRequired: true, defaultProps: { textClass: 'text-white' }, availableProps: [] },
      { type: 'hero', component: 'hero1', name: 'Hero', order: 2, isRequired: true, defaultProps: {}, availableProps: [] },
      { type: 'marquee', component: 'marquee', name: 'Texte Défilant', order: 3, defaultProps: { text: 'LIVRAISON GRATUITE • RETOURS FACILES' }, availableProps: [] },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 4, defaultProps: { limit: 6 }, availableProps: [] },
      { type: 'products', component: 'products1', name: 'Produits', order: 5, defaultProps: { limit: 8 }, availableProps: [] },
      { type: 'testimonials', component: 'testimonials', name: 'Témoignages', order: 6, defaultProps: { limit: 3 }, availableProps: [] },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 7, isRequired: true, defaultProps: {}, availableProps: [] }
    ],
    defaultTheme: { colors: { primary: '#2563eb', secondary: '#64748b', accent: '#f59e0b', background: '#ffffff', text: '#1e293b' } },
    isActive: true,
    isPremium: false,
    version: '1.0.0',
    compatibleWith: ['2.0.0']
  }
];

// Utiliser le modèle existant
let Template;
try {
  // Essayer d'importer le modèle TypeScript existant
  const templateModule = require('./src/models/Template.ts');
  Template = templateModule.default || templateModule.Template;
} catch (error) {
  console.log('⚠️  Impossible d\'importer Template.ts, création d\'un modèle simple...');
  
  // Créer un modèle mongoose simple compatible
  const SectionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    component: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    defaultProps: { type: mongoose.Schema.Types.Mixed, default: {} },
    availableProps: [{ 
      name: String, 
      type: String, 
      required: Boolean, 
      defaultValue: mongoose.Schema.Types.Mixed, 
      description: String 
    }]
  });

  const TemplateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    preview: { type: String, required: true },
    thumbnails: [String],
    tags: [String],
    metadata: { author: String, version: String, compatibility: [String], features: [String] },
    files: {
      components: [{ name: String, path: String, content: String }],
      styles: [{ name: String, path: String, content: String }],
      assets: [{ name: String, url: String, type: String }]
    },
    accessibility: { type: String, default: 'public' },
    requiredSubscription: { type: String, default: 'free' },
    stats: { views: Number, uses: Number, rating: Number, reviews: Number },
    status: { type: String, default: 'published' },
    sections: [SectionSchema],
    defaultTheme: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
    version: { type: String, default: '1.0.0' },
    compatibleWith: [String],
    usageCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }
  }, { timestamps: true });

  Template = mongoose.model('Template', TemplateSchema);
}

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
  console.log('\n🌱 CRÉATION DES TEMPLATES CORE...');
  
  let created = 0;
  let skipped = 0;
  
  for (const templateData of CORE_TEMPLATES) {
    try {
      // Vérifier si le template existe déjà
      const existing = await Template.findOne({ id: templateData.id });
      
      if (existing) {
        console.log(`  ⚠️  Template ${templateData.id} existe déjà - ignoré`);
        skipped++;
        continue;
      }
      
      const template = new Template(templateData);
      await template.save();
      
      console.log(`  ✅ Template créé: ${template.name} (${template.id})`);
      created++;
      
    } catch (error) {
      console.error(`  ❌ Erreur lors de la création de ${templateData.id}:`, error.message);
    }
  }
  
  console.log(`\n📊 RÉSUMÉ: ${created} créés, ${skipped} ignorés`);
}

async function listCreatedTemplates() {
  const templates = await Template.find({}).select('id name category status sections');
  
  console.log('\n📋 TEMPLATES EN BASE:');
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
  console.log('  1. Tester l\'API /api/templates depuis le dashboard');
  console.log('  2. Créer un store de test avec home-1');
  console.log('  3. Créer l\'API /api/stores/[slug]/config');
  console.log('  4. Tester le rendu dynamique côté frontend');
  console.log('\n⚠️  NOTE: Les 42 templates spécialisés restent inchangés');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CORE_TEMPLATES, createCoreTemplates, checkExistingTemplates };
