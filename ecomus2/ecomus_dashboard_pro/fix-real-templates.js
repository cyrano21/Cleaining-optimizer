#!/usr/bin/env node

/**
 * SCRIPT DE CORRECTION DES TEMPLATES
 * 
 * Corrige les templates en base de données pour qu'ils correspondent
 * exactement aux composants réels du frontend
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus_dashboard';
const FRONTEND_PATH = '../ecomusnext_pro/components/homes';

// MAPPING DES TEMPLATES AVEC LES VRAIS COMPOSANTS
const REAL_TEMPLATE_MAPPINGS = {
  'home-1': {
    name: 'Fashion Classic',
    description: 'Template classique pour boutiques de mode',
    category: 'Fashion',
    components: ['Brands', 'Categories', 'Hero', 'Lookbook', 'Marquee', 'Products', 'ProductsAPI', 'Slider'],
    sections: [
      { type: 'header', component: 'Header2', name: 'Header Principal', order: 0, defaultProps: { textClass: 'text-white' } },
      { type: 'hero', component: 'Hero', name: 'Bannière Hero', order: 1, defaultProps: {} },
      { type: 'marquee', component: 'Marquee', name: 'Texte Défilant', order: 2, defaultProps: { text: 'NOUVELLE COLLECTION' } },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 6, showTitle: true } },
      { type: 'products', component: 'Products', name: 'Produits Vedettes', order: 4, defaultProps: { limit: 8, title: 'Nos Produits' } },
      { type: 'brands', component: 'Brands', name: 'Marques Partenaires', order: 5, defaultProps: { limit: 6, showTitle: false } },
      { type: 'lookbook', component: 'Lookbook', name: 'Lookbook', order: 6, defaultProps: { showTitle: true } },
      { type: 'footer', component: 'Footer1', name: 'Pied de page', order: 7, defaultProps: {} }
    ]
  },
  'home-2': {
    name: 'Fashion Minimal',
    description: 'Template minimaliste pour boutiques de mode',
    category: 'Fashion',
    components: ['BannerCollection', 'Brands', 'Categories', 'Collection', 'Hero', 'Products', 'Slider', 'Store'],
    sections: [
      { type: 'header', component: 'Header1', name: 'Header Minimal', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Minimal', order: 1, defaultProps: {} },
      { type: 'slider', component: 'Slider', name: 'Slider Produits', order: 2, defaultProps: { autoPlay: true } },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 4, layout: 'minimal' } },
      { type: 'collection', component: 'Collection', name: 'Collection Spéciale', order: 4, defaultProps: {} },
      { type: 'products', component: 'Products', name: 'Produits', order: 5, defaultProps: { limit: 6 } },
      { type: 'brands', component: 'Brands', name: 'Marques', order: 6, defaultProps: { limit: 4 } },
      { type: 'footer', component: 'Footer1', name: 'Footer', order: 7, defaultProps: {} }
    ]
  },
  'home-3': {
    name: 'Fashion Dynamic',
    description: 'Template avec animations et effets dynamiques',
    category: 'Fashion',
    components: ['Categories', 'Countdown', 'Hero', 'Products', 'Products2', 'Products2API', 'Slider', 'Testimonials', 'VideoBanner'],
    sections: [
      { type: 'header', component: 'Header3', name: 'Header Dynamique', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Animé', order: 1, defaultProps: { animation: true } },
      { type: 'slider', component: 'Slider', name: 'Slider', order: 2, defaultProps: { autoPlay: true } },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 8, layout: 'slider' } },
      { type: 'countdown', component: 'Countdown', name: 'Offre Limitée', order: 4, defaultProps: { title: 'Flash Sale' } },
      { type: 'products', component: 'Products', name: 'Produits Principaux', order: 5, defaultProps: { limit: 8 } },
      { type: 'products', component: 'Products2', name: 'Produits Secondaires', order: 6, defaultProps: { limit: 6 } },
      { type: 'testimonials', component: 'Testimonials', name: 'Témoignages', order: 7, defaultProps: { limit: 3 } },
      { type: 'footer', component: 'Footer2', name: 'Footer', order: 8, defaultProps: {} }
    ]
  },
  'home-4': {
    name: 'Fashion Modern',
    description: 'Template moderne avec testimonials et marquee',
    category: 'Fashion',
    components: ['Categories', 'Categories2', 'Hero', 'Marquee', 'Products', 'ShopGram', 'Testimonials'],
    sections: [
      { type: 'header', component: 'Header2', name: 'Header Modern', order: 0, defaultProps: { textClass: 'text-white' } },
      { type: 'hero', component: 'Hero', name: 'Hero', order: 1, defaultProps: {} },
      { type: 'marquee', component: 'Marquee', name: 'Texte Défilant', order: 2, defaultProps: { text: 'LIVRAISON GRATUITE' } },
      { type: 'categories', component: 'Categories', name: 'Catégories Principales', order: 3, defaultProps: { limit: 6 } },
      { type: 'products', component: 'Products', name: 'Produits', order: 4, defaultProps: { limit: 8 } },
      { type: 'testimonials', component: 'Testimonials', name: 'Témoignages', order: 5, defaultProps: { limit: 3 } },
      { type: 'categories', component: 'Categories2', name: 'Catégories Secondaires', order: 6, defaultProps: { limit: 4 } },
      { type: 'shopgram', component: 'ShopGram', name: 'Instagram Feed', order: 7, defaultProps: {} },
      { type: 'footer', component: 'Footer2', name: 'Footer', order: 8, defaultProps: {} }
    ]
  },
  'home-5': {
    name: 'Fashion Luxury',
    description: 'Template haut de gamme pour marques de luxe',
    category: 'Luxury',
    components: ['BannerCountdown', 'Categories', 'Collection', 'Features', 'Hero', 'Lookbook', 'Products', 'ShopGram'],
    sections: [
      { type: 'header', component: 'Header3', name: 'Header Luxury', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Élégant', order: 1, defaultProps: {} },
      { type: 'countdown', component: 'BannerCountdown', name: 'Bannière Countdown', order: 2, defaultProps: {} },
      { type: 'categories', component: 'Categories', name: 'Collections', order: 3, defaultProps: { limit: 4, layout: 'elegant' } },
      { type: 'collection', component: 'Collection', name: 'Collection Exclusive', order: 4, defaultProps: {} },
      { type: 'products', component: 'Products', name: 'Produits Exclusifs', order: 5, defaultProps: { limit: 6, layout: 'luxury' } },
      { type: 'features', component: 'Features', name: 'Fonctionnalités', order: 6, defaultProps: {} },
      { type: 'lookbook', component: 'Lookbook', name: 'Lookbook', order: 7, defaultProps: { showTitle: true } },
      { type: 'shopgram', component: 'ShopGram', name: 'Galerie', order: 8, defaultProps: {} },
      { type: 'footer', component: 'Footer3', name: 'Footer Luxury', order: 9, defaultProps: {} }
    ]
  },
  'home-6': {
    name: 'Fashion Clean',
    description: 'Template épuré et performant',
    category: 'Fashion',
    components: ['Banner', 'Categories', 'Features', 'Hero', 'Location', 'Products'],
    sections: [
      { type: 'header', component: 'Header1', name: 'Header Clean', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Simple', order: 1, defaultProps: {} },
      { type: 'banner', component: 'Banner', name: 'Bannière', order: 2, defaultProps: {} },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 6, layout: 'clean' } },
      { type: 'products', component: 'Products', name: 'Produits', order: 4, defaultProps: { limit: 8 } },
      { type: 'features', component: 'Features', name: 'Fonctionnalités', order: 5, defaultProps: {} },
      { type: 'location', component: 'Location', name: 'Localisation', order: 6, defaultProps: {} },
      { type: 'footer', component: 'Footer1', name: 'Footer', order: 7, defaultProps: {} }
    ]
  },
  'home-7': {
    name: 'Fashion Creative',
    description: 'Template créatif avec layouts innovants',
    category: 'Fashion',
    components: ['Banner', 'Categories', 'Countdown', 'Hero', 'Marquee', 'Products'],
    sections: [
      { type: 'header', component: 'Header2', name: 'Header Creative', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Créatif', order: 1, defaultProps: {} },
      { type: 'banner', component: 'Banner', name: 'Bannière Creative', order: 2, defaultProps: {} },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 6, layout: 'creative' } },
      { type: 'countdown', component: 'Countdown', name: 'Compte à Rebours', order: 4, defaultProps: {} },
      { type: 'products', component: 'Products', name: 'Produits', order: 5, defaultProps: { limit: 10 } },
      { type: 'marquee', component: 'Marquee', name: 'Texte Défilant', order: 6, defaultProps: {} },
      { type: 'footer', component: 'Footer2', name: 'Footer', order: 7, defaultProps: {} }
    ]
  },
  'home-8': {
    name: 'Fashion Complete',
    description: 'Template complet avec toutes les fonctionnalités',
    category: 'Fashion',
    components: ['Blogs', 'Categories', 'Collection', 'Collection2', 'Hero', 'Lookbook', 'Marquee', 'Products'],
    sections: [
      { type: 'header', component: 'Header2', name: 'Header Complet', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero', order: 1, defaultProps: {} },
      { type: 'marquee', component: 'Marquee', name: 'Annonces', order: 2, defaultProps: {} },
      { type: 'categories', component: 'Categories', name: 'Catégories', order: 3, defaultProps: { limit: 8 } },
      { type: 'products', component: 'Products', name: 'Nouveautés', order: 4, defaultProps: { limit: 8, title: 'Nouveautés' } },
      { type: 'collection', component: 'Collection', name: 'Collection 1', order: 5, defaultProps: {} },
      { type: 'collection', component: 'Collection2', name: 'Collection 2', order: 6, defaultProps: {} },
      { type: 'lookbook', component: 'Lookbook', name: 'Lookbook', order: 7, defaultProps: {} },
      { type: 'blogs', component: 'Blogs', name: 'Articles de Blog', order: 8, defaultProps: { limit: 3 } },
      { type: 'footer', component: 'Footer1', name: 'Footer', order: 9, defaultProps: {} }
    ]
  },
  'home-electronic': {
    name: 'Electronics Hub',
    description: 'Template spécialisé pour produits électroniques',
    category: 'Tech',
    components: ['Blogs', 'Categories', 'CollectionBanner', 'Collections', 'Hero', 'Marquee', 'Products', 'Testimonials'],
    sections: [
      { type: 'header', component: 'Header1', name: 'Header Electronics', order: 0, defaultProps: {} },
      { type: 'hero', component: 'Hero', name: 'Hero Electronics', order: 1, defaultProps: {} },
      { type: 'marquee', component: 'Marquee', name: 'Annonces Tech', order: 2, defaultProps: { text: 'NOUVELLE TECHNOLOGIE' } },
      { type: 'categories', component: 'Categories', name: 'Catégories Tech', order: 3, defaultProps: { limit: 8, layout: 'slider' } },
      { type: 'banner', component: 'CollectionBanner', name: 'Bannière Collection', order: 4, defaultProps: {} },
      { type: 'collections', component: 'Collections', name: 'Collections Tech', order: 5, defaultProps: { showTitle: true } },
      { type: 'products', component: 'Products', name: 'Produits Electronics', order: 6, defaultProps: { limit: 12, showFilters: true } },
      { type: 'testimonials', component: 'Testimonials', name: 'Avis Clients', order: 7, defaultProps: { limit: 5 } },
      { type: 'blogs', component: 'Blogs', name: 'Articles Tech', order: 8, defaultProps: { limit: 3 } },
      { type: 'footer', component: 'Footer2', name: 'Footer Electronics', order: 9, defaultProps: {} }
    ]
  }
};

// Schema simple pour les templates
const TemplateSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  slug: String,
  sections: [{
    type: String,
    component: String,
    name: String,
    description: String,
    order: Number,
    isActive: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    defaultProps: { type: mongoose.Schema.Types.Mixed, default: {} }
  }]
}, { strict: false });

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function findTemplatesBySlug() {
  const Template = mongoose.model('Template', TemplateSchema);
  
  console.log('\n🔍 RECHERCHE DES TEMPLATES PAR SLUG...');
  
  const templateMappings = {};
  
  for (const [homeDir, config] of Object.entries(REAL_TEMPLATE_MAPPINGS)) {
    // Recherche par slug correspondant
    const possibleSlugs = [homeDir, homeDir.replace('-', ''), `home-${homeDir.split('-')[1]}`];
    
    let template = null;
    for (const slug of possibleSlugs) {
      template = await Template.findOne({ slug }).lean();
      if (template) break;
    }
    
    if (!template) {
      // Recherche par nom approximatif
      const searchTerms = config.name.toLowerCase().split(' ');
      template = await Template.findOne({
        $or: [
          { name: new RegExp(searchTerms.join('|'), 'i') },
          { description: new RegExp(searchTerms.join('|'), 'i') },
          { category: config.category }
        ]
      }).lean();
    }
    
    if (template) {
      templateMappings[homeDir] = {
        templateId: template._id,
        templateName: template.name,
        config
      };
      console.log(`  ✅ ${homeDir} → ${template.name} (${template._id})`);
    } else {
      console.log(`  ❌ ${homeDir} → Aucun template trouvé`);
    }
  }
  
  return templateMappings;
}

async function updateTemplateWithRealSections(templateId, config) {
  const Template = mongoose.model('Template', TemplateSchema);
  
  try {
    const sectionsToUpdate = config.sections.map((section, index) => ({
      type: section.type,
      component: section.component,
      name: section.name,
      description: section.description || `Section ${section.component}`,
      order: section.order,
      isActive: true,
      isRequired: ['header', 'footer'].includes(section.type),
      defaultProps: section.defaultProps || {}
    }));
    
    await Template.findByIdAndUpdate(templateId, {
      $set: {
        sections: sectionsToUpdate,
        description: config.description,
        category: config.category
      }
    });
    
    return sectionsToUpdate.length;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du template ${templateId}:`, error.message);
    return 0;
  }
}

async function verifyUpdatedTemplates(templateMappings) {
  const Template = mongoose.model('Template', TemplateSchema);
  
  console.log('\n✅ VÉRIFICATION DES TEMPLATES MIS À JOUR...');
  
  for (const [homeDir, mapping] of Object.entries(templateMappings)) {
    const template = await Template.findById(mapping.templateId).lean();
    
    if (template && template.sections && template.sections.length > 0) {
      console.log(`📄 ${template.name} - ${template.sections.length} sections`);
      template.sections.forEach((section, index) => {
        console.log(`    ${index + 1}. ${section.name} (${section.type}/${section.component})`);
      });
    } else {
      console.log(`❌ ${mapping.templateName} - Pas de sections`);
    }
  }
}

async function main() {
  console.log('🔧 CORRECTION DES TEMPLATES AVEC VRAIS COMPOSANTS');
  console.log('=================================================\n');
  
  await connectDB();
  
  // 1. Trouver les templates correspondants
  const templateMappings = await findTemplatesBySlug();
  
  // 2. Mettre à jour avec les vraies sections
  console.log('\n🔧 MISE À JOUR DES SECTIONS...');
  let updatedCount = 0;
  
  for (const [homeDir, mapping] of Object.entries(templateMappings)) {
    const sectionsCount = await updateTemplateWithRealSections(mapping.templateId, mapping.config);
    if (sectionsCount > 0) {
      console.log(`  ✅ ${mapping.templateName} mis à jour (${sectionsCount} sections)`);
      updatedCount++;
    } else {
      console.log(`  ❌ Échec pour ${mapping.templateName}`);
    }
  }
  
  // 3. Vérifier les résultats
  await verifyUpdatedTemplates(templateMappings);
  
  console.log(`\n✅ CORRECTION TERMINÉE !`);
  console.log(`📊 ${updatedCount} templates mis à jour avec les vrais composants`);
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('  1. Mettre à jour FactorizedComponents.tsx avec les vrais noms');
  console.log('  2. Tester l\'API /api/stores/[slug]/config');
  console.log('  3. Valider le rendu dynamique côté frontend');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  REAL_TEMPLATE_MAPPINGS,
  updateTemplateWithRealSections
};
