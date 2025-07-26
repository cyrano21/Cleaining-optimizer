// Script pour créer des attributs de test
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function createTestAttributes() {
  console.log('🏷️ Création d\'attributs de test...');
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    const attributesCollection = db.collection('attributes');
    
    // Vérifier s'il y a déjà des attributs
    const existingCount = await attributesCollection.countDocuments();
    console.log(`📊 Attributs existants: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('✅ Des attributs existent déjà, pas besoin d\'en créer.');
      return;
    }
    
    // Créer des attributs de test
    const testAttributes = [
      {
        name: 'Couleur',
        type: 'select',
        values: ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc'],
        category: 'electronique',
        status: 'active',
        storeId: '683f9286c77cce00d2b5d370',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Taille',
        type: 'select',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        category: 'vetements',
        status: 'active',
        storeId: '683f9286c77cce00d2b5d370',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Matière',
        type: 'select',
        values: ['Coton', 'Polyester', 'Laine', 'Soie', 'Lin'],
        category: 'vetements',
        status: 'active',
        storeId: '683f9286c77cce00d2b5d370',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Capacité',
        type: 'select',
        values: ['64GB', '128GB', '256GB', '512GB', '1TB'],
        category: 'electronique',
        status: 'active',
        storeId: '683f9286c77cce00d2b5d370',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marque',
        type: 'text',
        values: [],
        category: 'general',
        status: 'active',
        storeId: '683f9286c77cce00d2b5d370',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await attributesCollection.insertMany(testAttributes);
    console.log(`✅ ${result.insertedCount} attributs créés avec succès!`);
    
    // Afficher les attributs créés
    console.log('📝 Attributs créés:');
    testAttributes.forEach((attr, i) => {
      console.log(`  ${i + 1}. ${attr.name} (${attr.type}) - Catégorie: ${attr.category}`);
    });
    
  } catch (error) {
    console.error('💥 Erreur lors de la création des attributs:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécution
console.log('🚀 Démarrage de la création d\'attributs...');
createTestAttributes()
  .then(() => {
    console.log('✅ Terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });