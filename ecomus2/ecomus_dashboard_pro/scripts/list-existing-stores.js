// scripts/list-existing-stores.js
/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function listStores() {
  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const storesCollection = db.collection("stores");

    const stores = await storesCollection.find({}).toArray();
    
    console.log(`\n📊 ${stores.length} store(s) trouvé(s) :\n`);
    
    if (stores.length === 0) {
      console.log('❌ Aucun store trouvé dans la base de données.');
      console.log('💡 Vous devez d\'abord créer des stores avant de pouvoir seeder des produits.');
    } else {
      stores.forEach((store, index) => {
        console.log(`${index + 1}. Nom: "${store.name || 'Sans nom'}"`); 
        console.log(`   Slug: "${store.slug || 'Sans slug'}"`); 
        console.log(`   ID: ${store._id}`);
        console.log(`   Actif: ${store.isActive ? '✅' : '❌'}`);
        console.log(`   Créé: ${store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'Date inconnue'}`);
        console.log('   ---');
      });
      
      console.log('\n💡 Pour utiliser un de ces stores dans le script seed-products.js,');
      console.log('   modifiez la ligne 17 avec le bon slug.');
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des stores :", error);
  } finally {
    await client.close();
    process.exit();
  }
}

listStores();