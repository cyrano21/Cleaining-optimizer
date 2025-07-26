#!/usr/bin/env node

/**
 * SCRIPT DE MISE À JOUR DES TEMPLATES EXISTANTS
 * 
 * Au lieu de créer de nouveaux templates, on met à jour les existants
 * avec les sections nécessaires pour le système de factorisation
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus_dashboard';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function analyzeExistingTemplates() {
  // Utiliser le modèle générique pour explorer la structure
  const Template = mongoose.connection.db.collection('templates');
  
  console.log('\n🔍 ANALYSE DES TEMPLATES EXISTANTS...');
  
  // Récupérer un échantillon pour comprendre la structure
  const sample = await Template.findOne({});
  
  if (sample) {
    console.log('\n📋 STRUCTURE D\'UN TEMPLATE EXISTANT:');
    console.log('Champs disponibles:', Object.keys(sample));
    console.log('\n📄 ÉCHANTILLON:');
    console.log('ID:', sample._id);
    console.log('Champ id:', sample.id);
    console.log('Name:', sample.name);
    console.log('Slug:', sample.slug);
    console.log('Category:', sample.category);
    console.log('Sections:', sample.sections ? sample.sections.length : 'undefined');
    console.log('Files:', sample.files ? 'exists' : 'undefined');
  }
  
  // Compter les templates par catégorie
  const stats = await Template.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        templates: { $push: { name: '$name', id: '$id', slug: '$slug' } }
      }
    }
  ]);
  
  console.log('\n📊 RÉPARTITION PAR CATÉGORIE:');
  stats.forEach(stat => {
    console.log(`  📁 ${stat._id}: ${stat.count} templates`);
    stat.templates.slice(0, 3).forEach(t => {
      console.log(`    - ${t.name} (id: ${t.id}, slug: ${t.slug})`);
    });
  });
  
  return sample;
}

async function findCoreTemplates() {
  const Template = mongoose.connection.db.collection('templates');
  
  console.log('\n🎯 RECHERCHE DES TEMPLATES CORE...');
  
  // Chercher des templates qui correspondent à nos besoins
  const coreNames = [
    'Fashion Classic',
    'Fashion Boutique', 
    'Fashion Basic',
    'Modern Business',
    'Electronics Store',
    'Electronics Hub'
  ];
  
  const coreTemplates = await Template.find({
    name: { $in: coreNames }
  }).toArray();
  
  console.log(`📄 ${coreTemplates.length} templates core trouvés:`);
  coreTemplates.forEach(t => {
    console.log(`  - ${t.name} (id: ${t.id})`);
  });
  
  return coreTemplates;
}

async function addSectionsToTemplate(templateId, sections) {
  const Template = mongoose.connection.db.collection('templates');
  
  try {
    const result = await Template.updateOne(
      { _id: new mongoose.Types.ObjectId(templateId) },
      { 
        $set: { 
          sections: sections,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`  ✅ Sections ajoutées au template ${templateId}`);
      return true;
    } else {
      console.log(`  ⚠️  Aucune modification pour ${templateId}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Erreur pour ${templateId}:`, error.message);
    return false;
  }
}

const SECTIONS_FASHION_CLASSIC = [
  {
    type: 'header',
    component: 'header2',
    name: 'Header Principal',
    description: 'En-tête avec navigation et panier',
    order: 1,
    isActive: true,
    isRequired: true,
    defaultProps: { textClass: 'text-white' }
  },
  {
    type: 'hero',
    component: 'hero1',
    name: 'Bannière Hero',
    description: 'Grande bannière avec image',
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
    defaultProps: { limit: 6, showTitle: true, layout: 'grid' }
  },
  {
    type: 'products',
    component: 'products1',
    name: 'Produits Vedettes',
    description: 'Grille des produits',
    order: 4,
    isActive: true,
    defaultProps: { limit: 8, title: 'Nos Produits' }
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
];

const SECTIONS_ELECTRONICS = [
  {
    type: 'header',
    component: 'header1',
    name: 'Header Electronics',
    order: 1,
    isActive: true,
    isRequired: true,
    defaultProps: {}
  },
  {
    type: 'hero',
    component: 'heroElectronic',
    name: 'Hero Electronics',
    order: 2,
    isActive: true,
    isRequired: true,
    defaultProps: {}
  },
  {
    type: 'categories',
    component: 'categoriesElectronic',
    name: 'Catégories Électroniques',
    order: 3,
    isActive: true,
    defaultProps: { limit: 8, layout: 'slider' }
  },
  {
    type: 'countdown',
    component: 'countdown',
    name: 'Offre Limitée',
    order: 4,
    isActive: true,
    defaultProps: { title: 'Flash Sale', showProducts: true }
  },
  {
    type: 'products',
    component: 'productsElectronic',
    name: 'Produits Electronics',
    order: 5,
    isActive: true,
    defaultProps: { limit: 12, showFilters: true }
  },
  {
    type: 'footer',
    component: 'footer2',
    name: 'Footer Electronics',
    order: 6,
    isActive: true,
    isRequired: true,
    defaultProps: {}
  }
];

async function updateCoreTemplatesWithSections() {
  const Template = mongoose.connection.db.collection('templates');
  
  console.log('\n🔧 MISE À JOUR DES TEMPLATES AVEC SECTIONS...');
  
  // Mapping des templates existants vers nos sections
  const templateUpdates = [
    { name: 'Fashion Classic', sections: SECTIONS_FASHION_CLASSIC },
    { name: 'Fashion Boutique', sections: SECTIONS_FASHION_CLASSIC },
    { name: 'Fashion Basic', sections: SECTIONS_FASHION_CLASSIC },
    { name: 'Electronics Store', sections: SECTIONS_ELECTRONICS },
    { name: 'Electronics Hub', sections: SECTIONS_ELECTRONICS }
  ];
  
  let updated = 0;
  
  for (const update of templateUpdates) {
    const template = await Template.findOne({ name: update.name });
    
    if (template) {
      const success = await addSectionsToTemplate(template._id, update.sections);
      if (success) updated++;
    } else {
      console.log(`  ⚠️  Template '${update.name}' non trouvé`);
    }
  }
  
  console.log(`\n📊 ${updated} templates mis à jour avec succès`);
  return updated;
}

async function verifyUpdatedTemplates() {
  const Template = mongoose.connection.db.collection('templates');
  
  console.log('\n✅ VÉRIFICATION DES TEMPLATES MIS À JOUR...');
  
  const updatedTemplates = await Template.find({
    sections: { $exists: true, $ne: [] }
  }).toArray();
  
  console.log(`📋 ${updatedTemplates.length} templates avec sections:`);
  updatedTemplates.forEach(t => {
    const sectionsCount = t.sections ? t.sections.length : 0;
    console.log(`  📄 ${t.name} - ${sectionsCount} sections`);
    if (t.sections && sectionsCount > 0) {
      t.sections.forEach((section, index) => {
        console.log(`    ${index + 1}. ${section.name} (${section.type}/${section.component})`);
      });
    }
  });
  
  return updatedTemplates;
}

async function main() {
  console.log('🔧 MISE À JOUR DES TEMPLATES EXISTANTS AVEC SECTIONS');
  console.log('====================================================\n');
  
  await connectDB();
  
  // 1. Analyser la structure existante
  const sampleTemplate = await analyzeExistingTemplates();
  
  // 2. Trouver les templates core
  const coreTemplates = await findCoreTemplates();
  
  // 3. Mettre à jour avec les sections
  const updatedCount = await updateCoreTemplatesWithSections();
  
  // 4. Vérifier les résultats
  const finalTemplates = await verifyUpdatedTemplates();
  
  console.log('\n✅ MISE À JOUR TERMINÉE !');
  console.log(`📊 ${updatedCount} templates mis à jour`);
  console.log(`📋 ${finalTemplates.length} templates utilisables pour la factorisation`);
  
  console.log('\n📝 PROCHAINES ÉTAPES:');
  console.log('  1. Tester l\'API /api/stores/[slug]/config');
  console.log('  2. Créer un store avec un template mis à jour');
  console.log('  3. Valider le rendu dynamique côté frontend');
  console.log('  4. Adapter FactorizedComponents.tsx si nécessaire');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeExistingTemplates,
  updateCoreTemplatesWithSections,
  verifyUpdatedTemplates
};
