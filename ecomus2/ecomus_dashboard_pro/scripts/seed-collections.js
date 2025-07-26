const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import des modèles JavaScript pour le script de seed
const Collection = require('./models/Collection.js');
const Category = require('./models/Category.js');
const Store = require('./models/Store.js');
const Product = require('./models/Product.js');

// Données de collections basées sur les données statiques
const collectionsData = [
  // Collections basées sur collections8
  {
    title: "Men's Sneaker Collection",
    description: "Découvrez notre collection exclusive de sneakers pour hommes",
    imgSrc: "/images/collections/collection-1.jpg",
    altText: "Men's Sneaker Collection",
    heading: "Men's Sneaker",
    subheading: "Collection Exclusive",
    price: 89.99,
    backgroundColor: "#f8f9fa",
    featured: true,
    status: "active",
    categoryName: "Homme",
    seoTitle: "Collection Sneakers Homme - Chaussures de Sport",
    seoDescription: "Découvrez notre collection exclusive de sneakers pour hommes. Qualité premium et style moderne.",
    seoKeywords: ["sneakers", "homme", "chaussures", "sport", "mode"]
  },
  {
    title: "Men's Pants Collection",
    description: "Pantalons et jeans tendance pour hommes",
    imgSrc: "/images/collections/collection-2.jpg",
    altText: "Men's Pants Collection",
    heading: "Men's Pants",
    subheading: "Style & Confort",
    price: 65.99,
    backgroundColor: "#e9ecef",
    featured: true,
    status: "active",
    categoryName: "Vêtements",
    seoTitle: "Collection Pantalons Homme - Jeans & Chinos",
    seoDescription: "Pantalons et jeans de qualité pour hommes. Coupe moderne et matières premium.",
    seoKeywords: ["pantalons", "jeans", "homme", "mode", "vêtements"]
  },
  {
    title: "Men's Boot Collection",
    description: "Bottes et chaussures de ville élégantes",
    imgSrc: "/images/collections/collection-3.jpg",
    altText: "Men's Boot Collection",
    heading: "Men's Boot",
    subheading: "Élégance & Durabilité",
    price: 129.99,
    backgroundColor: "#dee2e6",
    featured: false,
    status: "active",
    categoryName: "Homme",
    seoTitle: "Collection Bottes Homme - Chaussures de Ville",
    seoDescription: "Bottes et chaussures de ville pour hommes. Cuir de qualité et finitions soignées.",
    seoKeywords: ["bottes", "chaussures", "ville", "homme", "cuir"]
  },
  // Collections basées sur collectionSlides3
  {
    title: "Bag Collection",
    description: "Sacs, sacoches et accessoires de maroquinerie",
    imgSrc: "/images/collections/collection-4.jpg",
    altText: "Bag Collection",
    heading: "Bag",
    subheading: "Maroquinerie Premium",
    price: 45.99,
    backgroundColor: "#f1f3f4",
    featured: true,
    status: "active",
    categoryName: "Vêtements",
    seoTitle: "Collection Sacs - Maroquinerie & Accessoires",
    seoDescription: "Sacs et accessoires de maroquinerie. Design moderne et matériaux de qualité.",
    seoKeywords: ["sacs", "maroquinerie", "accessoires", "mode", "cuir"]
  },
  {
    title: "Cap Collection",
    description: "Casquettes et chapeaux tendance",
    imgSrc: "/images/collections/collection-5.jpg",
    altText: "Cap Collection",
    heading: "Cap",
    subheading: "Style Urbain",
    price: 25.99,
    backgroundColor: "#f8f9fa",
    featured: false,
    status: "active",
    categoryName: "Vêtements",
    seoTitle: "Collection Casquettes - Chapeaux & Accessoires",
    seoDescription: "Casquettes et chapeaux pour tous les styles. Qualité et confort garantis.",
    seoKeywords: ["casquettes", "chapeaux", "accessoires", "mode", "urbain"]
  },
  {
    title: "Earphones Collection",
    description: "Écouteurs et accessoires audio haute qualité",
    imgSrc: "/images/collections/collection-6.jpg",
    altText: "Earphones Collection",
    heading: "Earphones",
    subheading: "Audio Premium",
    price: 79.99,
    backgroundColor: "#e9ecef",
    featured: true,
    status: "active",
    categoryName: "Électronique",
    seoTitle: "Collection Écouteurs - Audio & Technologie",
    seoDescription: "Écouteurs et accessoires audio de haute qualité. Son cristallin et design ergonomique.",
    seoKeywords: ["écouteurs", "audio", "technologie", "musique", "son"]
  },
  // Collections supplémentaires basées sur recentItems2
  {
    title: "Summer Essentials",
    description: "Les indispensables de l'été",
    imgSrc: "/images/collections/summer-collection.jpg",
    altText: "Summer Essentials Collection",
    heading: "Summer Essentials",
    subheading: "Été 2024",
    price: 39.99,
    backgroundColor: "#fff3cd",
    featured: true,
    status: "active",
    categoryName: "Homme",
    seoTitle: "Collection Été - Essentiels Summer 2024",
    seoDescription: "Les indispensables de l'été 2024. Mode, confort et style pour la saison chaude.",
    seoKeywords: ["été", "summer", "essentiels", "mode", "2024"]
  },
  {
    title: "Winter Warmth",
    description: "Collection hiver pour rester au chaud",
    imgSrc: "/images/collections/winter-collection.jpg",
    altText: "Winter Warmth Collection",
    heading: "Winter Warmth",
    subheading: "Hiver 2024",
    price: 99.99,
    backgroundColor: "#d1ecf1",
    featured: false,
    status: "active",
    categoryName: "Homme",
    seoTitle: "Collection Hiver - Chaleur & Confort 2024",
    seoDescription: "Collection hiver pour rester au chaud. Vêtements et accessoires pour l'hiver 2024.",
    seoKeywords: ["hiver", "winter", "chaud", "confort", "2024"]
  }
];

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedCollections() {
  try {
    console.log('🌱 Starting collections seeding...');

    // Récupérer le premier magasin actif
    const store = await Store.findOne({ isActive: true });
    if (!store) {
      console.error('❌ No active store found. Please create a store first.');
      return;
    }
    console.log(`📍 Using store: ${store.name} (${store._id})`);

    // Récupérer toutes les catégories (pas seulement les actives)
    const categories = await Category.find({});
    console.log(`📂 Found ${categories.length} total categories`);
    
    const activeCategories = await Category.find({ isActive: true });
     console.log(`📂 Found ${activeCategories.length} active categories`);

    // Créer un mapping des noms de catégories vers les IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
      console.log(`📂 Category mapping: "${cat.name}" -> ${cat._id}`);
    });
    console.log(`📋 Available categories: ${Object.keys(categoryMap).join(', ')}`);

    // Supprimer les collections existantes pour ce magasin
    const deletedCount = await Collection.deleteMany({ storeId: store._id });
    console.log(`🗑️ Deleted ${deletedCount.deletedCount} existing collections`);

    // Créer les nouvelles collections
    const createdCollections = [];
    
    for (const collectionData of collectionsData) {
      try {
        // Trouver la catégorie correspondante
        console.log(`🔍 Looking for category: "${collectionData.categoryName}"`);
        const categoryId = categoryMap[collectionData.categoryName];
        if (!categoryId) {
          console.warn(`⚠️ Category '${collectionData.categoryName}' not found, skipping collection '${collectionData.title}'`);
          console.log(`📋 Available categories: ${Object.keys(categoryMap).join(', ')}`);
          continue;
        }
        console.log(`✅ Found category: "${collectionData.categoryName}" -> ${categoryId}`);

        // Récupérer quelques produits de cette catégorie
        const products = await Product.find({ 
          category: categoryId, 
          store: store._id,
          status: 'active'
        }).limit(5);

        const collection = new Collection({
          title: collectionData.title,
          description: collectionData.description,
          imgSrc: collectionData.imgSrc,
          altText: collectionData.altText,
          heading: collectionData.heading,
          subheading: collectionData.subheading,
          price: collectionData.price,
          backgroundColor: collectionData.backgroundColor,
          featured: collectionData.featured,
          status: collectionData.status,
          storeId: store._id,
          category: categoryId,
          products: products.map(p => p._id),
          seoTitle: collectionData.seoTitle,
          seoDescription: collectionData.seoDescription,
          seoKeywords: collectionData.seoKeywords
        });

        await collection.save();
        createdCollections.push(collection);
        console.log(`✅ Created collection: ${collection.title} (${products.length} products)`);
      } catch (error) {
        console.error(`❌ Error creating collection '${collectionData.title}':`, error.message);
      }
    }

    console.log(`\n🎉 Collections seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Store: ${store.name}`);
    console.log(`   - Categories found: ${categories.length}`);
    console.log(`   - Collections created: ${createdCollections.length}`);
    console.log(`   - Featured collections: ${createdCollections.filter(c => c.featured).length}`);

    // Afficher quelques exemples
    console.log(`\n📋 Created collections:`);
    createdCollections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.title} ${collection.featured ? '⭐' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error during collections seeding:', error);
  }
}

async function main() {
  await connectDB();
  await seedCollections();
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedCollections };