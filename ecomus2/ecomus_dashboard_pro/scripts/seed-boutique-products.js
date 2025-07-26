// scripts/seed-boutique-products.js
/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seedBoutiqueProducts() {
  try {
    await client.connect();
    console.log("✅ Connexion MongoDB réussie");
    
    const db = client.db();
    const productsCollection = db.collection("products");
    const storesCollection = db.collection("stores");

    const targetSlug = "boutique-685ba4ab66267b0af88dcf06";
    
    // Trouver le store
    const store = await storesCollection.findOne({ slug: targetSlug });
    
    if (!store) {
      console.error(`❌ Store avec le slug ${targetSlug} non trouvé.`);
      process.exit(1);
    }

    console.log(`🛠️ Seeding des produits dans "${store.name}" (${store._id})`);

    // Supprimer les anciens produits de ce store
    const deleteResult = await productsCollection.deleteMany({ storeId: store._id });
    console.log(`🗑️ ${deleteResult.deletedCount} anciens produits supprimés`);

    // Créer de nouveaux produits avec des slugs corrects
    const products = Array.from({ length: 15 }).map((_, i) => ({
      _id: new ObjectId(),
      name: `Produit ${i + 1} - ${store.name}`,
      slug: `produit-${i + 1}-${store.slug}`,
      sku: `SKU-${store.slug}-${String(i + 1).padStart(3, '0')}`,
      description: `Description complète optimisée SEO pour le produit ${i + 1}, spécialement conçu pour "${store.name}". Ce produit offre une qualité exceptionnelle et répond aux besoins spécifiques de notre clientèle.`,
      price: Math.floor(Math.random() * 200) + 20,
      category: [
        "Mode & Accessoires",
        "Électronique", 
        "Maison & Jardin",
        "Sport & Loisirs",
        "Beauté & Santé"
      ][i % 5],
      storeId: store._id,
      images: [
        `/images/products/boutique-${(i % 8) + 1}.jpg`,
        `/images/products/boutique-${(i % 8) + 1}-alt.jpg`
      ],
      stock: Math.floor(Math.random() * 100) + 5,
      rating: +(Math.random() * 2 + 3).toFixed(1), // Entre 3.0 et 5.0
      reviews: Math.floor(Math.random() * 200) + 10,
      variants: [
        { size: "S", color: "Rouge", stock: Math.floor(Math.random() * 20) + 5 },
        { size: "M", color: "Bleu", stock: Math.floor(Math.random() * 20) + 5 },
        { size: "L", color: "Noir", stock: Math.floor(Math.random() * 20) + 5 },
      ],
      tags: ["nouveau", "tendance", "qualité", "boutique"],
      isActive: true,
      featured: i % 4 === 0, // 25% des produits en vedette
      onSale: i % 6 === 0, // 16% des produits en promotion
      salePrice: i % 6 === 0 ? Math.floor(Math.random() * 50) + 10 : null,
      weight: Math.floor(Math.random() * 2000) + 100, // en grammes
      dimensions: {
        length: Math.floor(Math.random() * 30) + 10,
        width: Math.floor(Math.random() * 20) + 5,
        height: Math.floor(Math.random() * 15) + 3
      },
      seoTitle: `${store.name} - Produit ${i + 1} de qualité premium`,
      seoDescription: `Découvrez le Produit ${i + 1} de ${store.name}. Qualité exceptionnelle, livraison rapide et satisfaction garantie.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insérer les nouveaux produits
    await productsCollection.insertMany(products);
    console.log(`✅ ${products.length} produits insérés avec succès dans "${store.name}".`);
    
    // Vérification finale
    const finalCount = await productsCollection.countDocuments({ storeId: store._id });
    console.log(`📊 Nombre total de produits dans le store: ${finalCount}`);
    
    console.log(`\n🌐 Vous pouvez maintenant visiter: http://localhost:3001/preview/store/${store.slug}`);
    
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
  } finally {
    await client.close();
    process.exit();
  }
}

seedBoutiqueProducts();