// Script simple pour mettre à jour les produits avec les vraies images
const { MongoClient } = require('./ecomusnext-main/node_modules/mongodb');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Vrais produits avec images du site officiel
const realProductsData = [
  {
    title: "Ribbed Tank Top",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/orange-1.jpg",
    price: 16.95,
    oldPrice: 19.95,
    category: "Fashion",
    description: "Comfortable ribbed tank top perfect for everyday wear",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/orange-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/orange-2.jpg"
    ]
  },
  {
    title: "Ribbed modal T-shirt",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/brown.jpg",
    price: 18.95,
    oldPrice: 22.95,
    category: "Fashion",
    description: "Soft ribbed modal t-shirt for comfort and style",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/brown.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/brown-2.jpg"
    ]
  },
  {
    title: "Oversized Printed T-shirt",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/white-1.jpg",
    price: 10.00,
    category: "Fashion",
    description: "Trendy oversized printed t-shirt",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/white-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/white-2.jpg"
    ]
  },
  {
    title: "Oversized Printed T-shirt",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/pink-1.jpg",
    price: 10.00,
    category: "Fashion",
    description: "Stylish oversized t-shirt in pink",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/pink-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/pink-2.jpg"
    ]
  },
  {
    title: "V-neck linen T-shirt",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/light-green-1.jpg",
    price: 114.95,
    category: "Fashion",
    description: "Premium v-neck linen t-shirt for comfort",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/light-green-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/light-green-2.jpg"
    ]
  },
  {
    title: "Jersey thong body",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/black-1.jpg",
    price: 105.95,
    oldPrice: 120.00,
    category: "Fashion",
    description: "Comfortable jersey thong body",
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/black-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/black-2.jpg"
    ]
  }
];

async function updateProductsWithRealImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connexion à MongoDB...');
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const collection = db.collection('products');
    
    // Supprimer tous les anciens produits
    console.log('🗑️ Suppression des anciens produits...');
    await collection.deleteMany({});
    
    // Insérer les nouveaux produits avec vraies images
    console.log('📦 Insertion des nouveaux produits...');
    const productsToInsert = realProductsData.map((product, index) => ({
      ...product,
      id: index + 1,
      stock: Math.floor(Math.random() * 50) + 10,
      rating: (Math.random() * 2 + 3).toFixed(1), // Entre 3.0 et 5.0
      reviews: Math.floor(Math.random() * 100) + 5,
      isNew: Math.random() > 0.7,
      sale: product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await collection.insertMany(productsToInsert);
    console.log(`✅ ${result.insertedCount} produits insérés avec succès !`);
    
    // Afficher quelques exemples
    console.log('\n📋 Exemples de produits insérés :');
    productsToInsert.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.price}€`);
      console.log(`   Image: ${product.imgSrc}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des produits :', error);
  } finally {
    await client.close();
    console.log('🔒 Connexion fermée');
  }
}

// Exécuter le script
updateProductsWithRealImages();
