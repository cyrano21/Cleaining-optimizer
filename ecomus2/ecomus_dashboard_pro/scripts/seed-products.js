// scripts/seed-products.js
/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db();
    const productsCollection = db.collection("products");
    const storesCollection = db.collection("stores");

    const store = await storesCollection.findOne({
      slug: "ecomus-store",
    });

    if (!store) {
      console.error(`❌ Store avec ce slug non trouvé.`);
      process.exit(1);
    }

    console.log(`🛠️ Seeding des produits dans "${store.name}" (${store._id})`);

    // Supprimer les anciens produits de ce store
    await productsCollection.deleteMany({ storeId: store._id });

    const products = Array.from({ length: 20 }).map((_, i) => ({
      _id: new ObjectId(),
      name: `Produit ${i + 1} - ${store.name}`,
      slug: `produit-${i + 1}-${store.slug}`, // ✅ Ajout d'un slug unique
      sku: `SKU-${store.slug}-${String(i + 1).padStart(3, '0')}`, // ✅ Ajout d'un SKU unique
      description: `Description complète optimisée SEO pour le produit ${i + 1}, adaptée à "${store.name}".`,
      price: Math.floor(Math.random() * 150) + 10,
      category: i % 2 === 0 ? "Accessoires" : "Vêtements",
      storeId: store._id,
      images: [`/images/products/placeholder-${(i % 10) + 1}.jpg`],
      stock: Math.floor(Math.random() * 100) + 10,
      rating: +(Math.random() * 5).toFixed(1),
      reviews: Math.floor(Math.random() * 150),
      variants: [
        { size: "S", color: "Rouge", stock: 10 },
        { size: "M", color: "Bleu", stock: 15 },
      ],
      isActive: true,
      featured: i % 3 === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await productsCollection.insertMany(products);
    console.log(
      `✅ ${products.length} produits insérés avec succès dans "${store.name}".`
    );
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
  } finally {
    await client.close();
    process.exit();
  }
}

seed();
