#!/usr/bin/env node

/**
 * MISE À JOUR COMPLÈTE DE TOUS LES TEMPLATES
 * 
 * Met à jour TOUS les 64 templates existants avec des sections appropriées
 * selon leur catégorie et leur nom
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus_dashboard';

/**
 * CONFIGURATIONS DE SECTIONS PAR CATÉGORIE
 */
const SECTION_CONFIGS = {
  // Templates Fashion
  Fashion: {
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Fashion',
        description: 'En-tête pour boutique de mode',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { textClass: 'text-white' }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Hero Fashion',
        description: 'Bannière principale de mode',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: { showSlider: false }
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Fashion',
        description: 'Catégories de vêtements',
        order: 3,
        isActive: true,
        defaultProps: { limit: 6, showTitle: true, layout: 'grid', title: 'SHOP BY CATEGORIES' }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits Fashion',
        description: 'Produits de mode tendance',
        order: 4,
        isActive: true,
        defaultProps: { limit: 8, title: 'Nouvelles Collections', showFilters: false }
      },
      {
        type: 'brands',
        component: 'brands',
        name: 'Marques Fashion',
        description: 'Marques partenaires',
        order: 5,
        isActive: true,
        defaultProps: { limit: 6, showTitle: false }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Footer Fashion',
        description: 'Pied de page mode',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  // Templates Tech/Electronics
  Tech: {
    sections: [
      {
        type: 'header',
        component: 'header1',
        name: 'Header Tech',
        description: 'En-tête technologique',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'hero',
        component: 'heroElectronic',
        name: 'Hero Tech',
        description: 'Bannière tech moderne',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categoriesElectronic',
        name: 'Catégories Tech',
        description: 'Catégories électroniques',
        order: 3,
        isActive: true,
        defaultProps: { limit: 8, layout: 'slider', title: 'TECH CATEGORIES' }
      },
      {
        type: 'countdown',
        component: 'countdown',
        name: 'Offres Tech',
        description: 'Promotions limitées',
        order: 4,
        isActive: true,
        defaultProps: { title: 'Flash Sale', showProducts: true }
      },
      {
        type: 'products',
        component: 'productsElectronic',
        name: 'Produits Tech',
        description: 'Produits technologiques',
        order: 5,
        isActive: true,
        defaultProps: { limit: 12, showFilters: true, title: 'Latest Tech' }
      },
      {
        type: 'footer',
        component: 'footer2',
        name: 'Footer Tech',
        description: 'Pied de page tech',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  // Templates Luxury
  Luxury: {
    sections: [
      {
        type: 'header',
        component: 'header3',
        name: 'Header Luxury',
        description: 'En-tête luxueux',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'hero',
        component: 'hero2',
        name: 'Hero Luxury',
        description: 'Bannière élégante',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Collections Luxury',
        description: 'Collections exclusives',
        order: 3,
        isActive: true,
        defaultProps: { limit: 4, layout: 'elegant', title: 'EXCLUSIVE COLLECTIONS' }
      },
      {
        type: 'products',
        component: 'products2',
        name: 'Produits Luxury',
        description: 'Produits haut de gamme',
        order: 4,
        isActive: true,
        defaultProps: { limit: 6, layout: 'luxury', title: 'Premium Selection' }
      },
      {
        type: 'lookbook',
        component: 'lookbook',
        name: 'Lookbook Luxury',
        description: 'Catalogue de style',
        order: 5,
        isActive: true,
        defaultProps: { showTitle: true }
      },
      {
        type: 'footer',
        component: 'footer3',
        name: 'Footer Luxury',
        description: 'Pied de page prestigieux',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  // Templates Beauty
  Beauty: {
    sections: [
      {
        type: 'header',
        component: 'header2',
        name: 'Header Beauty',
        description: 'En-tête beauté',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { textClass: 'text-rose' }
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Hero Beauty',
        description: 'Bannière beauté',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories Beauty',
        description: 'Types de produits beauté',
        order: 3,
        isActive: true,
        defaultProps: { limit: 6, layout: 'beauty', title: 'BEAUTY ESSENTIALS' }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits Beauty',
        description: 'Produits de beauté',
        order: 4,
        isActive: true,
        defaultProps: { limit: 8, title: 'Trending Now' }
      },
      {
        type: 'testimonials',
        component: 'testimonials',
        name: 'Avis Beauty',
        description: 'Témoignages clients',
        order: 5,
        isActive: true,
        defaultProps: { limit: 3, layout: 'beauty' }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Footer Beauty',
        description: 'Pied de page beauté',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  // Templates Business
  Business: {
    sections: [
      {
        type: 'header',
        component: 'header1',
        name: 'Header Business',
        description: 'En-tête professionnel',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Hero Business',
        description: 'Bannière corporate',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Services Business',
        description: 'Services et produits',
        order: 3,
        isActive: true,
        defaultProps: { limit: 6, layout: 'corporate', title: 'OUR SERVICES' }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Solutions Business',
        description: 'Solutions d\'entreprise',
        order: 4,
        isActive: true,
        defaultProps: { limit: 8, title: 'Business Solutions' }
      },
      {
        type: 'testimonials',
        component: 'testimonials',
        name: 'Témoignages Business',
        description: 'Retours clients',
        order: 5,
        isActive: true,
        defaultProps: { limit: 4, layout: 'corporate' }
      },
      {
        type: 'footer',
        component: 'footer2',
        name: 'Footer Business',
        description: 'Pied de page corporate',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  },

  // Templates par défaut pour autres catégories
  default: {
    sections: [
      {
        type: 'header',
        component: 'header1',
        name: 'Header Standard',
        description: 'En-tête standard',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'hero',
        component: 'hero1',
        name: 'Hero Standard',
        description: 'Bannière principale',
        order: 2,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      },
      {
        type: 'categories',
        component: 'categories',
        name: 'Catégories',
        description: 'Catégories de produits',
        order: 3,
        isActive: true,
        defaultProps: { limit: 6, showTitle: true, layout: 'grid' }
      },
      {
        type: 'products',
        component: 'products1',
        name: 'Produits',
        description: 'Produits populaires',
        order: 4,
        isActive: true,
        defaultProps: { limit: 8, title: 'Popular Products' }
      },
      {
        type: 'brands',
        component: 'brands',
        name: 'Partenaires',
        description: 'Marques partenaires',
        order: 5,
        isActive: true,
        defaultProps: { limit: 6, showTitle: false }
      },
      {
        type: 'footer',
        component: 'footer1',
        name: 'Footer',
        description: 'Pied de page',
        order: 6,
        isActive: true,
        isRequired: true,
        defaultProps: {}
      }
    ]
  }
};

/**
 * CONFIGURATIONS SPÉCIALES POUR CERTAINS TEMPLATES
 */
const SPECIAL_CONFIGS = {
  'Electronics Store': SECTION_CONFIGS.Tech,
  'Electronics Hub': SECTION_CONFIGS.Tech,
  'Tech Store': SECTION_CONFIGS.Tech,
  'Gaming Gear Central': SECTION_CONFIGS.Tech,
  'Audio Headphones': SECTION_CONFIGS.Tech,
  'Phone Case Designer': SECTION_CONFIGS.Tech,
  'Setup Gear Pro': SECTION_CONFIGS.Tech,
  'Speaker Sound System': SECTION_CONFIGS.Tech,
  
  'Fashion Boutique': SECTION_CONFIGS.Fashion,
  'Fashion Basic': SECTION_CONFIGS.Fashion,
  'Fashion Accessories': SECTION_CONFIGS.Fashion,
  'Designer Handbags': SECTION_CONFIGS.Fashion,
  'Footwear Fashion': SECTION_CONFIGS.Fashion,
  'Men\'s Fashion': SECTION_CONFIGS.Fashion,
  'Women\'s Fashion': SECTION_CONFIGS.Fashion,
  'Sneaker Drops': SECTION_CONFIGS.Fashion,
  'Premium Shoes': SECTION_CONFIGS.Fashion,
  'Swimwear Collection': SECTION_CONFIGS.Fashion,
  'T-Shirt Design Studio': SECTION_CONFIGS.Fashion,
  'Underwear Essentials': SECTION_CONFIGS.Fashion,
  'Activewear Pro': SECTION_CONFIGS.Fashion,
  'Sock Boutique': SECTION_CONFIGS.Fashion,
  'Eyewear Boutique': SECTION_CONFIGS.Fashion,
  
  'Beauty & Cosmetics': SECTION_CONFIGS.Beauty,
  'Cosmetic Paradise': SECTION_CONFIGS.Beauty,
  'Cosmetic Lab': SECTION_CONFIGS.Beauty,
  'Skincare Science': SECTION_CONFIGS.Beauty,
  
  'Luxury Jewelry': SECTION_CONFIGS.Luxury,
  'Jewelry Showcase': SECTION_CONFIGS.Luxury,
  'Fine Jewelry': SECTION_CONFIGS.Luxury,
  'Luxury Watches': SECTION_CONFIGS.Luxury,
  'Luxury Furniture': SECTION_CONFIGS.Luxury,
  
  'Modern Business': SECTION_CONFIGS.Business,
  'Default Template': SECTION_CONFIGS.Business,
  'Multi-Brand Marketplace': SECTION_CONFIGS.Business,
  'Gift Card Store': SECTION_CONFIGS.Business,
  'POD Store Hub': SECTION_CONFIGS.Business,
  'Custom Print Pod': SECTION_CONFIGS.Business
};

// Schema simplifié
const TemplateSchema = new mongoose.Schema({}, { strict: false });

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function getAllTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  return await Template.find({}).lean();
}

function getSectionsForTemplate(templateName, category) {
  // Vérifier les configurations spéciales d'abord
  if (SPECIAL_CONFIGS[templateName]) {
    return SPECIAL_CONFIGS[templateName].sections;
  }
  
  // Sinon utiliser la configuration par catégorie
  const config = SECTION_CONFIGS[category] || SECTION_CONFIGS.default;
  return config.sections;
}

async function updateAllTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  const templates = await getAllTemplates();
  
  console.log(`🔧 MISE À JOUR DE ${templates.length} TEMPLATES...`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const template of templates) {
    try {
      // Vérifier si le template a déjà des sections
      if (template.sections && template.sections.length > 0) {
        console.log(`  ⏭️  ${template.name} - déjà configuré (${template.sections.length} sections)`);
        skipped++;
        continue;
      }
      
      // Obtenir les sections appropriées
      const sections = getSectionsForTemplate(template.name, template.category);
      
      // Mettre à jour le template
      await Template.findByIdAndUpdate(
        template._id,
        {
          $set: {
            sections: sections,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      console.log(`  ✅ ${template.name} - ${sections.length} sections ajoutées (${template.category})`);
      updated++;
      
    } catch (error) {
      console.error(`  ❌ Erreur avec ${template.name}:`, error.message);
      errors++;
    }
  }
  
  return { updated, skipped, errors };
}

async function verifyUpdates() {
  const Template = mongoose.model('Template', TemplateSchema);
  const templates = await Template.find({}).lean();
  
  console.log('\n📊 VÉRIFICATION DES MISES À JOUR:');
  
  const stats = {
    withSections: 0,
    withoutSections: 0,
    byCategory: {}
  };
  
  templates.forEach(template => {
    const sectionsCount = template.sections ? template.sections.length : 0;
    
    if (sectionsCount > 0) {
      stats.withSections++;
    } else {
      stats.withoutSections++;
    }
    
    // Stats par catégorie
    if (!stats.byCategory[template.category]) {
      stats.byCategory[template.category] = { total: 0, withSections: 0 };
    }
    stats.byCategory[template.category].total++;
    if (sectionsCount > 0) {
      stats.byCategory[template.category].withSections++;
    }
  });
  
  console.log(`📄 Templates avec sections: ${stats.withSections}/${templates.length}`);
  console.log(`📄 Templates sans sections: ${stats.withoutSections}/${templates.length}`);
  
  console.log('\n📊 Répartition par catégorie:');
  Object.keys(stats.byCategory).forEach(category => {
    const cat = stats.byCategory[category];
    console.log(`  📁 ${category}: ${cat.withSections}/${cat.total} templates configurés`);
  });
  
  return stats;
}

async function main() {
  console.log('🚀 MISE À JOUR COMPLÈTE DE TOUS LES TEMPLATES');
  console.log('=============================================\n');
  
  await connectDB();
  
  // 1. Mettre à jour tous les templates
  const { updated, skipped, errors } = await updateAllTemplates();
  
  console.log('\n📊 RÉSULTATS:');
  console.log(`  ✅ Mis à jour: ${updated}`);
  console.log(`  ⏭️  Ignorés: ${skipped}`);
  console.log(`  ❌ Erreurs: ${errors}`);
  
  // 2. Vérifier les mises à jour
  await verifyUpdates();
  
  console.log('\n✅ MISE À JOUR COMPLÈTE TERMINÉE !');
  console.log('\n📝 PROCHAINES ÉTAPES:');
  console.log('  1. Tester l\'API /api/stores/[slug]/config');
  console.log('  2. Créer des stores avec différents templates');
  console.log('  3. Valider le rendu dynamique côté frontend');
  console.log('  4. Optimiser FactorizedComponents.tsx');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  SECTION_CONFIGS,
  SPECIAL_CONFIGS,
  getSectionsForTemplate,
  updateAllTemplates
};
