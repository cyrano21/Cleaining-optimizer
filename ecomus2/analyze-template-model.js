/**
 * Script pour analyser la vraie structure du modèle Template MongoDB
 * Aide à comprendre pourquoi les updates échouent avec CastError
 */

const mongoose = require('mongoose');

// Connexion MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Ecomus', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

// Analyser la structure d'un template existant
async function analyzeExistingTemplate() {
  try {
    // Import du modèle Template
    const Template = require('./ecomus_dashboard_pro/src/models/Template');
    
    console.log('\n🔍 ANALYSE DU MODÈLE TEMPLATE');
    console.log('=====================================');
    
    // 1. Analyser le schéma Mongoose
    console.log('\n📋 STRUCTURE DU SCHÉMA:');
    const schema = Template.schema;
    
    Object.keys(schema.paths).forEach(path => {
      const schemaType = schema.paths[path];
      console.log(`- ${path}: ${schemaType.instance} ${schemaType.isRequired ? '(required)' : '(optional)'}`);
      
      // Détails spéciaux pour les sections
      if (path === 'sections') {
        console.log(`  └─ Type: ${schemaType.constructor.name}`);
        console.log(`  └─ Schema: ${JSON.stringify(schemaType.schema?.paths || 'N/A', null, 2)}`);
      }
    });
    
    // 2. Récupérer un template existant pour voir la vraie structure
    console.log('\n📂 ANALYSE D\'UN TEMPLATE EXISTANT:');
    const existingTemplate = await Template.findOne({}).lean();
    
    if (existingTemplate) {
      console.log(`Template trouvé: ${existingTemplate.name}`);
      console.log('\n📄 STRUCTURE SECTIONS ACTUELLE:');
      
      if (existingTemplate.sections && existingTemplate.sections.length > 0) {
        console.log('Type des sections:', typeof existingTemplate.sections);
        console.log('Array?:', Array.isArray(existingTemplate.sections));
        console.log('Nombre de sections:', existingTemplate.sections.length);
        
        existingTemplate.sections.forEach((section, index) => {
          console.log(`\n  Section ${index + 1}:`);
          console.log(`  - Type: ${typeof section}`);
          console.log(`  - Contenu: ${JSON.stringify(section, null, 4)}`);
        });
      } else {
        console.log('❌ Aucune section trouvée dans ce template');
      }
      
      // Afficher d'autres champs importants
      console.log('\n📊 AUTRES CHAMPS:');
      console.log(`- _id: ${existingTemplate._id}`);
      console.log(`- name: ${existingTemplate.name}`);
      console.log(`- category: ${existingTemplate.category || 'N/A'}`);
      console.log(`- status: ${existingTemplate.status || 'N/A'}`);
      console.log(`- isActive: ${existingTemplate.isActive}`);
      console.log(`- createdAt: ${existingTemplate.createdAt}`);
      
    } else {
      console.log('❌ Aucun template trouvé dans la base');
    }
    
    // 3. Essayer de comprendre le format attendu pour les sections
    console.log('\n🔧 TEST DU FORMAT SECTIONS:');
    
    // Test avec différents formats
    const testFormats = [
      {
        name: 'Format Array de strings',
        data: ['Hero', 'Categories', 'Products']
      },
      {
        name: 'Format Array d\'objets simples',
        data: [
          { name: 'Hero' },
          { name: 'Categories' },
          { name: 'Products' }
        ]
      },
      {
        name: 'Format Array d\'objets complexes',
        data: [
          { 
            name: 'Hero',
            type: 'hero',
            props: {},
            isVisible: true
          },
          { 
            name: 'Categories',
            type: 'categories',
            props: {},
            isVisible: true
          }
        ]
      }
    ];
    
    for (const format of testFormats) {
      try {
        console.log(`\n  Testing: ${format.name}`);
        
        // Test de validation sans sauvegarde
        const testTemplate = new Template({
          name: 'Test Template',
          category: 'test',
          sections: format.data,
          isActive: true
        });
        
        const validationError = testTemplate.validateSync();
        if (validationError) {
          console.log(`  ❌ Erreur: ${validationError.message}`);
        } else {
          console.log(`  ✅ Format valide!`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécution principale
async function main() {
  await connectDB();
  await analyzeExistingTemplate();
  
  console.log('\n🎯 ANALYSE TERMINÉE');
  mongoose.connection.close();
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
