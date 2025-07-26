const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function fixProductsStoreAssociation() {
  try {
    await client.connect();
    console.log('✅ Connexion MongoDB réussie');
    
    const db = client.db();
    const productsCollection = db.collection('products');
    const storesCollection = db.collection('stores');
    
    // Récupérer le premier store actif (Ecomus Store)
    const activeStore = await storesCollection.findOne({ isActive: true });
    
    if (!activeStore) {
      console.log('❌ Aucun store actif trouvé');
      return;
    }
    
    console.log(`🏪 Store actif trouvé: ${activeStore.name} (${activeStore._id})`);
    
    // Compter les produits sans storeId ou avec storeId incorrect
    const productsWithoutStore = await productsCollection.countDocuments({
      $or: [
        { storeId: { $exists: false } },
        { storeId: null },
        { storeId: '' },
        { storeId: { $ne: activeStore._id.toString() } }
      ]
    });
    
    console.log(`📦 Produits à associer: ${productsWithoutStore}`);
    
    if (productsWithoutStore > 0) {
      // Associer tous les produits au store actif
      const result = await productsCollection.updateMany(
        {
          $or: [
            { storeId: { $exists: false } },
            { storeId: null },
            { storeId: '' },
            { storeId: { $ne: activeStore._id.toString() } }
          ]
        },
        {
          $set: { storeId: activeStore._id.toString() }
        }
      );
      
      console.log(`✅ ${result.modifiedCount} produits associés au store ${activeStore.name}`);
      
      // Vérifier le résultat
      const productsInStore = await productsCollection.countDocuments({ 
        storeId: activeStore._id.toString() 
      });
      console.log(`📊 Total produits dans le store: ${productsInStore}`);
      
      // Afficher quelques produits associés
      const sampleProducts = await productsCollection.find({ 
        storeId: activeStore._id.toString() 
      }).limit(5).toArray();
      
      console.log('\n📋 Quelques produits associés:');
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title || product.name}`);
        console.log(`   Prix: ${product.price}€`);
        console.log(`   Store ID: ${product.storeId}`);
      });
    } else {
      console.log('✅ Tous les produits sont déjà associés correctement');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

fixProductsStoreAssociation();