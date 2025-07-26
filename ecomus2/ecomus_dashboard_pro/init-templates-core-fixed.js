#!/usr/bin/env node

/**
 * SCRIPT CORRIGÉ - TEMPLATES CORE AVEC LE MODÈLE EXISTANT
 * 
 * Utilise le modèle Template.ts existant avec les bonnes propriétés
 */

require('dotenv').config();

// Simulation du modèle Template existant (compatible avec le vrai modèle)
const mongoose = require('mongoose');

// Import du vrai modèle Template
let Template;
try {
  // Essayer d'importer le vrai modèle
  const templateModule = require('./src/models/Template.ts');
  Template = templateModule.default || templateModule.Template;
  console.log('✅ Modèle Template.ts importé avec succès');
} catch (error) {
  console.log('⚠️  Impossible d\'importer Template.ts, utilisation d\'un modèle simple...');
  
  // Modèle simplifié compatible
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
      components: [{ name: String, path: String, content: String }],
      styles: [{ name: String, path: String, content: String }],
      assets: [{ name: String, url: String, type: String }]
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
      // Pas de availableProps pour éviter les erreurs de validation
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  Template = mongoose.model('Template', TemplateSchema);
}

/**
 * TEMPLATES CORE SIMPLIFIÉS - COMPATIBLES AVEC LE MODÈLE EXISTANT
 */
const CORE_TEMPLATES = [
  {
    id: 'home-1-classic',
    name: 'Fashion Classic (Core)',
    description: 'Template classique factorizable pour boutiques de mode',
    category: 'Fashion',
    preview: '/templates/previews/home-1.jpg',
    thumbnails: ['/templates/previews/home-1-thumb.jpg'],
    tags: ['fashion', 'classic', 'core'],
    metadata: {
      author: 'Ecomus Team',
      version: '1.0.0',
      features: ['Factorizable', 'Dynamic Props', 'API Driven']
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
        description: 'En-tête avec navigation',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { textClass: 'text-white' }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Bannière Hero',
        description: 'Grande bannière d\'accueil',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Produits',
        description: 'Grille des catégories',
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
        description: 'Produits mis en avant',
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
        description: 'Logos des marques',
        order: 5,
        isActive: true,
        defaultProps: { limit: 6, showTitle: false }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Pied de page',
        description: 'Footer avec liens',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  {
    id: 'home-4-modern',
    name: 'Fashion Modern (Core)',
    description: 'Template moderne avec marquee et testimonials',
    category: 'Fashion',
    preview: '/templates/previews/home-4.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header2', name: 'Header Modern', order: 1, isRequired: true, defaultProps: { textClass: 'text-white' } },
      { type: 'hero', component: 'hero1', name: 'Hero Banner', order: 2, isRequired: true, defaultProps: {} },
      { type: 'marquee', component: 'marquee', name: 'Texte Défilant', order: 3, defaultProps: { text: 'LIVRAISON GRATUITE • RETOURS FACILES' } },
      { type: 'categories', component: 'categories', name: 'Catégories', order: 4, defaultProps: { limit: 6 } },
      { type: 'products', component: 'products1', name: 'Produits', order: 5, defaultProps: { limit: 8 } },
      { type: 'testimonials', component: 'testimonials', name: 'Témoignages', order: 6, defaultProps: { limit: 3 } },
      { type: 'footer', component: 'footer2', name: 'Footer', order: 7, isRequired: true, defaultProps: {} }
    ]
  },

  {
    id: 'home-electronic-core',
    name: 'Electronics Store (Core)',
    description: 'Template spécialisé électronique factorizable',
    category: 'Tech',
    preview: '/templates/previews/home-electronic.jpg',
    status: 'published',
    sections: [
      { type: 'header', component: 'header1', name: 'Header Electronics', order: 1, isRequired: true, defaultProps: {} },
      { type: 'hero', component: 'heroElectronic', name: 'Hero Electronics', order: 2, isRequired: true, defaultProps: {} },
      { type: 'categories', component: 'categoriesElectronic', name: 'Catégories Tech', order: 3, defaultProps: { limit: 8, layout: 'slider' } },
      { type: 'countdown', component: 'countdown', name: 'Offre Limitée', order: 4, defaultProps: { title: 'Flash Sale', showProducts: true } },
      { type: 'products', component: 'productsElectronic', name: 'Produits Tech', order: 5, defaultProps: { limit: 12, showFilters: true } },
      { type: 'footer', component: 'footer2', name: 'Footer Tech', order: 6, isRequired: true, defaultProps: {} }
    ]
  }
];

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomusnext';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB:', uri);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function checkExistingTemplates() {
  const existing = await Template.find({}).select('id name status sections');
  
  console.log('\n🔍 TEMPLATES EXISTANTS EN BASE:');
  if (existing.length === 0) {
    console.log('  📭 Aucun template trouvé');
  } else {
    console.log(`  📊 ${existing.length} templates trouvés`);
    existing.forEach(t => {
      const sectionsCount = t.sections ? t.sections.length : 0;
      const displayId = t.id || 'undefined';
      console.log(`  📄 ${displayId} - ${t.name} [${t.status}] (${sectionsCount} sections)`);
    });
  }
  
  return existing;
}

async function createCoreTemplates() {
  console.log('\n🌱 CRÉATION DES TEMPLATES CORE FACTORISABLES...');
  
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
      
      // Valeurs par défaut pour éviter les erreurs
      const completeTemplate = {
        ...templateData,
        thumbnails: templateData.thumbnails || [],
        tags: templateData.tags || ['core', 'factorizable'],
        metadata: templateData.metadata || { author: 'Ecomus Team', version: '1.0.0' },
        files: templateData.files || { components: [], styles: [], assets: [] },
        accessibility: templateData.accessibility || 'public',
        requiredSubscription: templateData.requiredSubscription || 'free',
        stats: templateData.stats || { views: 0, uses: 0, rating: 0, reviews: 0 }
      };
      
      const template = new Template(completeTemplate);
      await template.save();
      
      console.log(`  ✅ Template créé: ${template.name} (${template.id}) - ${template.sections.length} sections`);
      created++;
      
    } catch (error) {
      console.error(`  ❌ Erreur lors de la création de ${templateData.id}:`, error.message);
    }
  }
  
  console.log(`\n📊 RÉSUMÉ: ${created} créés, ${skipped} ignorés`);
}

async function listCoreTemplates() {
  const coreTemplates = await Template.find({ 
    id: { $in: ['home-1-classic', 'home-4-modern', 'home-electronic-core'] }
  }).select('id name category status sections');
  
  console.log('\n📋 TEMPLATES CORE CRÉÉS:');
  if (coreTemplates.length === 0) {
    console.log('  📭 Aucun template core trouvé');
  } else {
    coreTemplates.forEach(template => {
      const sectionsCount = template.sections ? template.sections.length : 0;
      console.log(`  📄 ${template.id} - ${template.name}`);
      console.log(`      Catégorie: ${template.category} | Sections: ${sectionsCount} | Status: ${template.status}`);
    });
  }
}

async function main() {
  console.log('🚀 INITIALISATION DES TEMPLATES CORE FACTORISABLES');
  console.log('===================================================\n');
  
  await connectDB();
  
  // 1. Vérifier les templates existants
  const existing = await checkExistingTemplates();
  
  // 2. Créer les templates core factorisables
  await createCoreTemplates();
  
  // 3. Lister les templates core créés
  await listCoreTemplates();
  
  console.log('\n✅ CRÉATION DES TEMPLATES CORE TERMINÉE !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('  1. Tester l\'API /api/stores/[slug]/config avec un template core');
  console.log('  2. Créer un store de test utilisant home-1-classic');
  console.log('  3. Valider le rendu dynamique côté frontend');
  console.log('  4. Optimiser FactorizedComponents.tsx');
  console.log('\n⚠️  NOTE: Templates existants préservés, nouveaux templates avec IDs uniques');
  
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
