#!/usr/bin/env node

/**
 * CORRECTION FINALE DES TEMPLATES AVEC VRAIS COMPOSANTS
 * 
 * Basé sur l'analyse, ce script corrige uniquement les templates
 * qui n'ont pas le bon format de sections (Array d'objets)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Mapping des vrais composants frontend
const REAL_COMPONENTS_MAPPING = {
  'home-1': ['Brands', 'Categories', 'Hero', 'Lookbook', 'Marquee', 'Products', 'ProductsAPI', 'Slider'],
  'home-2': ['BannerCollection', 'Brands', 'Categories', 'Collection', 'Hero', 'Products', 'Slider', 'Store'],
  'home-3': ['Categories', 'Countdown', 'Hero', 'Products', 'Products2', 'Products2API', 'Slider', 'Testimonials', 'VideoBanner'],
  'home-4': ['Categories', 'Categories2', 'Hero', 'Marquee', 'Products', 'ShopGram', 'Testimonials'],
  'home-5': ['BannerCountdown', 'Categories', 'Collection', 'Features', 'Hero', 'Lookbook', 'Products', 'ShopGram'],
  'home-6': ['Banner', 'Categories', 'Features', 'Hero', 'Location', 'Products'],
  'home-7': ['Banner', 'Categories', 'Countdown', 'Hero', 'Marquee', 'Products'],
  'home-8': ['Blogs', 'Categories', 'Collection', 'Collection2', 'Hero', 'Lookbook', 'Marquee', 'Products'],
  'home-electronic': ['Blogs', 'Categories', 'CollectionBanner', 'Collections', 'Hero', 'Marquee', 'Products', 'Testimonials']
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

function generateSectionsFromComponents(components) {
  const sections = [];
  
  components.forEach((component, index) => {
    const lowerComponent = component.toLowerCase();
    
    // Déterminer le type de section basé sur le nom du composant
    let type = 'other';
    if (lowerComponent.includes('header')) type = 'header';
    else if (lowerComponent.includes('hero')) type = 'hero';
    else if (lowerComponent.includes('categor')) type = 'categories';
    else if (lowerComponent.includes('product')) type = 'products';
    else if (lowerComponent.includes('blog')) type = 'blogs';
    else if (lowerComponent.includes('collection')) type = 'collections';
    else if (lowerComponent.includes('banner')) type = 'banner';
    else if (lowerComponent.includes('marquee')) type = 'marquee';
    else if (lowerComponent.includes('testimonial')) type = 'testimonials';
    else if (lowerComponent.includes('brand')) type = 'brands';
    else if (lowerComponent.includes('footer')) type = 'footer';
    else if (lowerComponent.includes('lookbook')) type = 'lookbook';
    else if (lowerComponent.includes('countdown')) type = 'countdown';
    else if (lowerComponent.includes('slider')) type = 'slider';
    else if (lowerComponent.includes('feature')) type = 'features';
    else if (lowerComponent.includes('shopgram')) type = 'shopgram';
    else if (lowerComponent.includes('location')) type = 'location';
    
    // Déterminer si c'est requis
    const isRequired = type === 'header' || type === 'footer';
    
    // Props par défaut selon le type
    const defaultProps = {};
    if (type === 'categories') defaultProps.limit = 6;
    if (type === 'products') defaultProps.limit = 8;
    if (type === 'testimonials') defaultProps.limit = 3;
    if (type === 'brands') defaultProps.limit = 6;
    if (type === 'blogs') defaultProps.limit = 3;
    
    sections.push({
      type: type,
      component: component,
      name: `Section ${component}`,
      description: `Section ${component} du template`,
      order: index,
      isActive: true,
      isRequired: isRequired,
      defaultProps: defaultProps
    });
  });
  
  return sections;
}

async function fixTemplatesSections() {
  console.log('🔧 CORRECTION DES SECTIONS TEMPLATES');
  console.log('=====================================\n');
  
  const db = mongoose.connection.db;
  const collection = db.collection('templates');
  
  // Récupérer tous les templates
  const templates = await collection.find({}).toArray();
  console.log(`📊 ${templates.length} templates trouvés\n`);
  
  let fixed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const template of templates) {
    console.log(`📄 Template: ${template.name} (${template._id})`);
    
    // Vérifier le format des sections
    const hasCorrectSections = Array.isArray(template.sections) && 
                               template.sections.length > 0 && 
                               template.sections[0].type && 
                               template.sections[0].component;
    
    if (hasCorrectSections) {
      console.log(`  ✅ Sections correctes (${template.sections.length} sections) - ignoré\n`);
      skipped++;
      continue;
    }
    
    // Trouver les composants correspondants
    let realComponents = null;
    
    // Essayer de matcher par slug
    if (template.slug) {
      realComponents = REAL_COMPONENTS_MAPPING[template.slug];
    }
    
    // Si pas trouvé, essayer par nom
    if (!realComponents) {
      const templateNameLower = template.name.toLowerCase();
      for (const [slug, components] of Object.entries(REAL_COMPONENTS_MAPPING)) {
        if (templateNameLower.includes(slug.replace('home-', '')) || 
            templateNameLower.includes(slug)) {
          realComponents = components;
          break;
        }
      }
    }
    
    // Si toujours pas trouvé, utiliser des composants par défaut selon la catégorie
    if (!realComponents) {
      console.log(`  ⚠️  Aucun composant spécifique trouvé, utilisation par défaut`);
      realComponents = ['Hero', 'Categories', 'Products', 'Footer1'];
    }
    
    // Générer les sections
    const newSections = generateSectionsFromComponents(realComponents);
    
    try {
      // Mettre à jour le template
      await collection.updateOne(
        { _id: template._id },
        { 
          $set: { 
            sections: newSections 
          } 
        }
      );
      
      console.log(`  ✅ Sections mises à jour (${newSections.length} sections)`);
      console.log(`     Composants: ${realComponents.join(', ')}\n`);
      fixed++;
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}\n`);
      errors++;
    }
  }
  
  console.log('📊 RÉSUMÉ:');
  console.log(`  ✅ Templates corrigés: ${fixed}`);
  console.log(`  ⏭️  Templates ignorés: ${skipped}`);
  console.log(`  ❌ Erreurs: ${errors}`);
}

async function verifyResults() {
  console.log('\n🔍 VÉRIFICATION DES RÉSULTATS');
  console.log('==============================\n');
  
  const db = mongoose.connection.db;
  const collection = db.collection('templates');
  
  const templates = await collection.find({}).toArray();
  
  const withSections = templates.filter(t => Array.isArray(t.sections) && t.sections.length > 0);
  const withoutSections = templates.filter(t => !Array.isArray(t.sections) || t.sections.length === 0);
  
  console.log(`📊 ÉTAT FINAL:`);
  console.log(`  ✅ Templates avec sections: ${withSections.length}`);
  console.log(`  ❌ Templates sans sections: ${withoutSections.length}\n`);
  
  console.log(`📋 TEMPLATES AVEC SECTIONS:`);
  withSections.forEach(template => {
    console.log(`  📄 ${template.name} - ${template.sections.length} sections`);
  });
  
  if (withoutSections.length > 0) {
    console.log(`\n⚠️  TEMPLATES SANS SECTIONS:`);
    withoutSections.forEach(template => {
      console.log(`  📄 ${template.name} (${template._id})`);
    });
  }
}

async function main() {
  await connectDB();
  await fixTemplatesSections();
  await verifyResults();
  
  console.log('\n✅ CORRECTION TERMINÉE !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Tester l\'API /api/stores/[slug]/config');
  console.log('2. Créer un store de test');
  console.log('3. Valider le rendu dynamique côté frontend');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixTemplatesSections,
  generateSectionsFromComponents,
  REAL_COMPONENTS_MAPPING
};
