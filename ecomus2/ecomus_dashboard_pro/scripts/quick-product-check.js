// scripts/quick-product-check.js
/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function quickCheck() {
  try {
    await client.connect();
    console.log("✅ MongoDB connecté");
    
    const db = client.db();
    const storesCollection = db.collection("stores");
    const productsCollection = db.collection("products");

    // Vérifier le store boutique-685ba4ab66267b0af88dcf06
    const targetSlug = "boutique-685ba4ab66267b0af88dcf06";
    const store = await storesCollection.findOne({ slug: targetSlug });
    
    if (store) {
      console.log(`\n🏪 Store trouvé: ${store.name}`);
      console.log(`   ID: ${store._id}`);
      console.log(`   Statut: ${store.status}`);
      console.log(`   Actif: ${store.isActive}`);
      
      // Compter les produits
      const productCount = await productsCollection.countDocuments({ storeId: store._id });
      console.log(`   📦 Produits: ${productCount}`);
      
      if (productCount > 0) {
        const products = await productsCollection.find({ storeId: store._id }).toArray();
        console.log(`\n📋 Liste des produits:`);
        products.forEach((p, i) => {
          console.log(`${i+1}. ${p.name} (${p.slug}) - ${p.price}€`);
        });
      } else {
        console.log(`\n❌ PROBLÈME: Aucun produit trouvé pour ce store!`);
      }
    } else {
      console.log(`\n❌ Store non trouvé: ${targetSlug}`);
    }
    
    // Vérifier aussi ecomus-store
    const ecomusStore = await storesCollection.findOne({ slug: "ecomus-store" });
    if (ecomusStore) {
      const ecomusProductCount = await productsCollection.countDocuments({ storeId: ecomusStore._id });
      console.log(`\n🏪 Ecomus Store: ${ecomusProductCount} produits`);
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
  }
}

quickCheck();