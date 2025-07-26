#!/usr/bin/env node

/**
 * ANALYSE DÉTAILLÉE DU MODÈLE TEMPLATE EXISTANT
 * 
 * Ce script analyse la vraie structure du modèle Template
 * pour comprendre comment ajouter les sections correctement
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function analyzeTemplateModel() {
  console.log('🔍 ANALYSE DU MODÈLE TEMPLATE EXISTANT');
  console.log('======================================\n');
  
  // Récupérer un template existant pour analyser sa structure
  const db = mongoose.connection.db;
  const collection = db.collection('templates');
  
  // Récupérer un échantillon de templates
  const templates = await collection.find({}).limit(3).toArray();
  
  console.log(`📊 ${templates.length} templates trouvés\n`);
  
  templates.forEach((template, index) => {
    console.log(`📄 TEMPLATE ${index + 1}: ${template.name}`);
    console.log('─'.repeat(50));
    console.log('Champs disponibles:', Object.keys(template));
    console.log('Structure détaillée:');
    
    Object.keys(template).forEach(key => {
      const value = template[key];
      const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
      console.log(`  ${key}: ${type}`);
      
      if (key === 'sections' && value) {
        console.log(`    Contenu sections:`, JSON.stringify(value, null, 2));
      }
    });
    console.log('\n');
  });
  
  // Analyser les indexes et contraintes
  const indexes = await collection.indexes();
  console.log('📋 INDEXES DE LA COLLECTION:');
  indexes.forEach(index => {
    console.log(`  - ${JSON.stringify(index.key)} (${index.name})`);
  });
  
  // Analyser la structure avec mongoose
  console.log('\n🔧 ANALYSE VIA MONGOOSE:');
  try {
    // Essayer d'importer le modèle existant
    const Template = require('../src/models/Template.ts').default;
    const schema = Template.schema;
    
    console.log('📋 SCHÉMA MONGOOSE:');
    console.log('  Champs du schéma:', Object.keys(schema.paths));
    
    // Analyser le champ sections spécifiquement
    if (schema.paths.sections) {
      console.log('\n📄 CHAMP SECTIONS:');
      console.log('  Type:', schema.paths.sections.constructor.name);
      console.log('  Options:', schema.paths.sections.options);
      
      if (schema.paths.sections.schema) {
        console.log('  Sous-schéma:', Object.keys(schema.paths.sections.schema.paths));
      }
    }
    
  } catch (error) {
    console.log('⚠️  Impossible d\'analyser le modèle Mongoose:', error.message);
  }
}

async function testSectionUpdate() {
  console.log('\n🧪 TEST DE MISE À JOUR DE SECTIONS');
  console.log('===================================\n');
  
  const db = mongoose.connection.db;
  const collection = db.collection('templates');
  
  // Prendre un template de test
  const testTemplate = await collection.findOne({ name: { $exists: true } });
  
  if (!testTemplate) {
    console.log('❌ Aucun template trouvé pour les tests');
    return;
  }
  
  console.log(`🎯 Template de test: ${testTemplate.name} (${testTemplate._id})`);
  
  // Tester différents formats de sections
  const testFormats = [
    {
      name: 'Format Array d\'objets',
      sections: [
        {
          type: 'header',
          component: 'Header1',
          name: 'Test Header',
          order: 1,
          isActive: true
        }
      ]
    },
    {
      name: 'Format Array de strings',
      sections: ['header', 'hero', 'footer']
    },
    {
      name: 'Format Object',
      sections: {
        header: { component: 'Header1', order: 1 },
        hero: { component: 'Hero1', order: 2 }
      }
    }
  ];
  
  for (const format of testFormats) {
    console.log(`\n🔬 Test: ${format.name}`);
    try {
      // Test de validation sans sauvegarde
      const result = await collection.updateOne(
        { _id: testTemplate._id },
        { $set: { sections: format.sections } },
        { dryRun: true } // Option fictive pour illustrer
      );
      console.log('  ✅ Format potentiellement accepté');
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message.substring(0, 100)}...`);
    }
  }
}

async function generateCorrectSectionFormat() {
  console.log('\n💡 GÉNÉRATION DU FORMAT CORRECT');
  console.log('================================\n');
  
  // Basé sur l'analyse, proposer le bon format
  console.log('📝 Format recommandé pour les sections:');
  
  const correctFormat = {
    sections: [
      {
        type: 'header',
        component: 'Header2',
        name: 'Header Principal',
        description: 'En-tête avec navigation',
        order: 1,
        isActive: true,
        isRequired: true,
        defaultProps: { textClass: 'text-white' },
        availableProps: []
      }
    ]
  };
  
  console.log(JSON.stringify(correctFormat, null, 2));
  
  console.log('\n📋 Script de correction recommandé:');
  console.log(`
const updateTemplate = async (templateId, sections) => {
  try {
    const result = await Template.findByIdAndUpdate(
      templateId,
      { 
        $set: { 
          sections: sections 
        } 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    return result;
  } catch (error) {
    console.error('Erreur mise à jour:', error.message);
    throw error;
  }
};
  `);
}

async function main() {
  await connectDB();
  await analyzeTemplateModel();
  await testSectionUpdate();
  await generateCorrectSectionFormat();
  
  console.log('\n✅ ANALYSE TERMINÉE !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Corriger le format des sections selon l\'analyse');
  console.log('2. Utiliser le bon schéma Mongoose');
  console.log('3. Tester la mise à jour avec le format correct');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeTemplateModel,
  testSectionUpdate,
  generateCorrectSectionFormat
};
