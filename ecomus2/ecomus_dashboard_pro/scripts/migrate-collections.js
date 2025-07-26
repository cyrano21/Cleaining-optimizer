/**
 * Script de migration pour convertir les données statiques des collections
 * en collections dynamiques dans la base de données MongoDB
 * 
 * Usage: node scripts/migrate-collections.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Schéma Collection (copie du modèle)
const collectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: '' },
  subheading: { type: String, default: '' },
  heading: { type: String, default: '' },
  imgSrc: { type: String, default: '' },
  altText: { type: String, default: '' },
  backgroundColor: { type: String, default: '#ffffff' },
  price: { type: Number },
  originalPrice: { type: Number },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  tags: [{ type: String }],
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Collection = mongoose.model('Collection', collectionSchema);

// Schémas pour les références
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

const Category = mongoose.model('Category', categorySchema);
const Store = mongoose.model('Store', storeSchema);

// Données statiques à migrer (basées sur les fichiers existants)
const staticCollectionsData = {
  // Collections pour home-headphone
  headphones: [
    {
      title: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Premium wireless headphones with noise cancellation",
      subheading: "Audio Excellence",
      heading: "Wireless Freedom",
      imgSrc: "/images/collections/collection-1.jpg",
      altText: "Wireless Headphones Collection",
      backgroundColor: "#f8f9fa",
      featured: true,
      categorySlug: "headphones",
      storeSlug: "electronics-store",
      tags: ["wireless", "bluetooth", "noise-cancelling"],
      seoTitle: "Premium Wireless Headphones Collection",
      seoDescription: "Discover our premium wireless headphones with superior sound quality",
      seoKeywords: ["wireless headphones", "bluetooth", "audio", "music"]
    },
    {
      title: "Gaming Headsets",
      slug: "gaming-headsets",
      description: "Professional gaming headsets for immersive gaming experience",
      subheading: "Gaming Audio",
      heading: "Game On",
      imgSrc: "/images/collections/collection-2.jpg",
      altText: "Gaming Headsets Collection",
      backgroundColor: "#1a1a1a",
      featured: true,
      categorySlug: "headphones",
      storeSlug: "electronics-store",
      tags: ["gaming", "microphone", "surround-sound"],
      seoTitle: "Professional Gaming Headsets Collection",
      seoDescription: "High-quality gaming headsets for competitive gaming",
      seoKeywords: ["gaming headsets", "esports", "microphone", "gaming audio"]
    },
    {
      title: "Studio Monitors",
      slug: "studio-monitors",
      description: "Professional studio monitor headphones for audio production",
      subheading: "Professional Audio",
      heading: "Studio Quality",
      imgSrc: "/images/collections/collection-3.jpg",
      altText: "Studio Monitors Collection",
      backgroundColor: "#2c3e50",
      featured: false,
      categorySlug: "headphones",
      storeSlug: "electronics-store",
      tags: ["studio", "professional", "monitoring"],
      seoTitle: "Professional Studio Monitor Headphones",
      seoDescription: "Professional studio monitor headphones for audio production",
      seoKeywords: ["studio monitors", "professional audio", "music production"]
    }
  ],
  
  // Collections pour home-electronic
  electronics: [
    {
      title: "Smart Devices",
      slug: "smart-devices",
      description: "Latest smart home devices and IoT products",
      subheading: "Smart Living",
      heading: "Connected Home",
      imgSrc: "/images/collections/smart-devices.jpg",
      altText: "Smart Devices Collection",
      backgroundColor: "#e3f2fd",
      featured: true,
      categorySlug: "electronics",
      storeSlug: "electronics-store",
      tags: ["smart home", "iot", "automation"],
      seoTitle: "Smart Home Devices Collection",
      seoDescription: "Transform your home with our smart device collection",
      seoKeywords: ["smart home", "iot devices", "home automation"]
    },
    {
      title: "Mobile Accessories",
      slug: "mobile-accessories",
      description: "Essential accessories for your mobile devices",
      subheading: "Mobile Tech",
      heading: "Stay Connected",
      imgSrc: "/images/collections/mobile-accessories.jpg",
      altText: "Mobile Accessories Collection",
      backgroundColor: "#fff3e0",
      featured: true,
      categorySlug: "electronics",
      storeSlug: "electronics-store",
      tags: ["mobile", "accessories", "charging"],
      seoTitle: "Mobile Device Accessories Collection",
      seoDescription: "Essential accessories for smartphones and tablets",
      seoKeywords: ["mobile accessories", "phone cases", "chargers"]
    }
  ],
  
  // Collections pour home-furniture
  furniture: [
    {
      title: "Living Room",
      slug: "living-room-furniture",
      description: "Comfortable and stylish living room furniture",
      subheading: "Home Comfort",
      heading: "Relax in Style",
      imgSrc: "/images/collections/living-room.jpg",
      altText: "Living Room Furniture Collection",
      backgroundColor: "#f5f5f5",
      featured: true,
      categorySlug: "furniture",
      storeSlug: "furniture-store",
      tags: ["living room", "sofa", "comfort"],
      seoTitle: "Living Room Furniture Collection",
      seoDescription: "Create the perfect living space with our furniture collection",
      seoKeywords: ["living room furniture", "sofa", "home decor"]
    },
    {
      title: "Bedroom",
      slug: "bedroom-furniture",
      description: "Create your perfect bedroom sanctuary",
      subheading: "Sleep Comfort",
      heading: "Dream Space",
      imgSrc: "/images/collections/bedroom.jpg",
      altText: "Bedroom Furniture Collection",
      backgroundColor: "#fafafa",
      featured: true,
      categorySlug: "furniture",
      storeSlug: "furniture-store",
      tags: ["bedroom", "bed", "sleep"],
      seoTitle: "Bedroom Furniture Collection",
      seoDescription: "Transform your bedroom into a comfortable sanctuary",
      seoKeywords: ["bedroom furniture", "beds", "bedroom decor"]
    }
  ],
  
  // Collections pour home-plant
  plants: [
    {
      title: "Indoor Plants",
      slug: "indoor-plants",
      description: "Beautiful indoor plants to brighten your home",
      subheading: "Green Living",
      heading: "Bring Nature Inside",
      imgSrc: "/images/collections/indoor-plants.jpg",
      altText: "Indoor Plants Collection",
      backgroundColor: "#e8f5e8",
      featured: true,
      categorySlug: "plants",
      storeSlug: "garden-store",
      tags: ["indoor", "houseplants", "air-purifying"],
      seoTitle: "Indoor Plants Collection",
      seoDescription: "Beautiful indoor plants for your home and office",
      seoKeywords: ["indoor plants", "houseplants", "home decor"]
    },
    {
      title: "Outdoor Garden",
      slug: "outdoor-garden",
      description: "Plants and accessories for your outdoor garden",
      subheading: "Garden Beauty",
      heading: "Outdoor Paradise",
      imgSrc: "/images/collections/outdoor-garden.jpg",
      altText: "Outdoor Garden Collection",
      backgroundColor: "#f0f8f0",
      featured: true,
      categorySlug: "plants",
      storeSlug: "garden-store",
      tags: ["outdoor", "garden", "landscaping"],
      seoTitle: "Outdoor Garden Plants Collection",
      seoDescription: "Create a beautiful outdoor garden with our plant collection",
      seoKeywords: ["outdoor plants", "garden plants", "landscaping"]
    }
  ]
};

// Données des catégories et magasins
const categoriesData = [
  { name: "Headphones", slug: "headphones", description: "Audio devices and headphones" },
  { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
  { name: "Furniture", slug: "furniture", description: "Home and office furniture" },
  { name: "Plants", slug: "plants", description: "Indoor and outdoor plants" },
  { name: "Fashion", slug: "fashion", description: "Clothing and accessories" },
  { name: "Books", slug: "books", description: "Books and educational materials" },
  { name: "Gaming", slug: "gaming", description: "Gaming accessories and equipment" }
];

const storesData = [
  { name: "Electronics Store", slug: "electronics-store", description: "Premium electronics and gadgets" },
  { name: "Furniture Store", slug: "furniture-store", description: "Quality home and office furniture" },
  { name: "Garden Store", slug: "garden-store", description: "Plants and gardening supplies" },
  { name: "Fashion Boutique", slug: "fashion-boutique", description: "Trendy clothing and accessories" },
  { name: "Book Store", slug: "book-store", description: "Books and educational materials" },
  { name: "Gaming Store", slug: "gaming-store", description: "Gaming equipment and accessories" }
];

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}

async function createCategoriesAndStores() {
  console.log('📁 Création des catégories et magasins...');
  
  // Créer les catégories
  for (const categoryData of categoriesData) {
    try {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Catégorie créée: ${categoryData.name}`);
      } else {
        console.log(`⚠️  Catégorie existe déjà: ${categoryData.name}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création de la catégorie ${categoryData.name}:`, error.message);
    }
  }
  
  // Créer les magasins
  for (const storeData of storesData) {
    try {
      const existingStore = await Store.findOne({ slug: storeData.slug });
      if (!existingStore) {
        await Store.create(storeData);
        console.log(`✅ Magasin créé: ${storeData.name}`);
      } else {
        console.log(`⚠️  Magasin existe déjà: ${storeData.name}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création du magasin ${storeData.name}:`, error.message);
    }
  }
}

async function migrateCollections() {
  console.log('🔄 Migration des collections...');
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const [collectionType, collections] of Object.entries(staticCollectionsData)) {
    console.log(`\n📦 Migration des collections ${collectionType}...`);
    
    for (const collectionData of collections) {
      try {
        // Vérifier si la collection existe déjà
        const existingCollection = await Collection.findOne({ slug: collectionData.slug });
        if (existingCollection) {
          console.log(`⚠️  Collection existe déjà: ${collectionData.title}`);
          totalSkipped++;
          continue;
        }
        
        // Trouver la catégorie et le magasin
        const category = await Category.findOne({ slug: collectionData.categorySlug });
        const store = await Store.findOne({ slug: collectionData.storeSlug });
        
        if (!category) {
          console.error(`❌ Catégorie non trouvée: ${collectionData.categorySlug}`);
          continue;
        }
        
        if (!store) {
          console.error(`❌ Magasin non trouvé: ${collectionData.storeSlug}`);
          continue;
        }
        
        // Créer la collection
        const newCollection = {
          title: collectionData.title,
          slug: collectionData.slug,
          description: collectionData.description,
          subheading: collectionData.subheading,
          heading: collectionData.heading,
          imgSrc: collectionData.imgSrc,
          altText: collectionData.altText,
          backgroundColor: collectionData.backgroundColor,
          featured: collectionData.featured,
          isActive: true,
          categoryId: category._id,
          storeId: store._id,
          products: [], // Sera rempli plus tard avec les vrais produits
          tags: collectionData.tags,
          seoTitle: collectionData.seoTitle,
          seoDescription: collectionData.seoDescription,
          seoKeywords: collectionData.seoKeywords
        };
        
        await Collection.create(newCollection);
        console.log(`✅ Collection créée: ${collectionData.title}`);
        totalCreated++;
        
      } catch (error) {
        console.error(`❌ Erreur lors de la création de la collection ${collectionData.title}:`, error.message);
      }
    }
  }
  
  console.log(`\n📊 Résumé de la migration:`);
  console.log(`✅ Collections créées: ${totalCreated}`);
  console.log(`⚠️  Collections ignorées (déjà existantes): ${totalSkipped}`);
}

async function cleanupExistingCollections() {
  const answer = process.argv.includes('--clean');
  
  if (answer) {
    console.log('🧹 Suppression des collections existantes...');
    const result = await Collection.deleteMany({});
    console.log(`✅ ${result.deletedCount} collections supprimées`);
  }
}

async function main() {
  try {
    console.log('🚀 Début de la migration des collections...');
    
    await connectToDatabase();
    
    // Nettoyer les collections existantes si demandé
    await cleanupExistingCollections();
    
    // Créer les catégories et magasins
    await createCategoriesAndStores();
    
    // Migrer les collections
    await migrateCollections();
    
    console.log('\n🎉 Migration terminée avec succès!');
    console.log('\n💡 Conseils pour la suite:');
    console.log('1. Vérifiez les collections dans votre dashboard');
    console.log('2. Associez des produits réels aux collections');
    console.log('3. Mettez à jour les images avec de vraies URLs');
    console.log('4. Testez les composants dynamiques sur votre site');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
  }
}

// Exécuter la migration
if (require.main === module) {
  main();
}

module.exports = {
  migrateCollections,
  createCategoriesAndStores,
  staticCollectionsData,
  categoriesData,
  storesData
};