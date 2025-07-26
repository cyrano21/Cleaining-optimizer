// Script pour corriger les images des produits électroniques avec les vraies URLs
const mongoose = require('./ecomusnext-main/node_modules/mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Produits électroniques avec les vraies images du site
const correctElectronicsProducts = [
  {
    title: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-1.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-2.jpg",
    price: 39.99,
    category: 'electronics'
  },
  {
    title: "Smart Light Switch with Thread",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-3.jpg", 
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-4.jpg",
    price: 49.99,
    category: 'electronics'
  },
  {
    title: "SoundForm Rise",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-5.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-6.jpg",
    price: 79.99,
    oldPrice: 100.00,
    category: 'electronics'
  },
  {
    title: "Wireless On-Ear Headphones for Kids",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-7.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-8.jpg",
    price: 24.99,
    oldPrice: 34.99,
    category: 'electronics'
  },
  {
    title: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-9.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-10.jpg",
    price: 127.49,
    oldPrice: 149.99,
    category: 'electronics'
  },
  {
    title: "3-in-1 Wireless Charger for Apple Devices",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-11.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-12.jpg",
    price: 119.99,
    category: 'electronics'
  },
  {
    title: "Wireless Earbuds Pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-13.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-14.jpg",
    price: 199.99,
    category: 'electronics'
  },
  {
    title: "Smart Watch Series 8",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-15.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-16.jpg",
    price: 399.99,
    category: 'electronics'
  }
];

// Schéma simple pour les produits
const productSchema = new mongoose.Schema({
  title: String,
  imgSrc: String,
  imgHoverSrc: String,
  price: Number,
  oldPrice: Number,
  category: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

async function updateElectronicsProducts() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Créer le modèle Product
    const Product = mongoose.model('Product', productSchema);

    console.log('🗑️ Suppression des anciens produits électroniques...');
    await Product.deleteMany({ category: 'electronics' });

    console.log('📦 Insertion des nouveaux produits électroniques...');
    const insertedProducts = await Product.insertMany(correctElectronicsProducts.map(product => ({
      ...product,
      _id: new mongoose.Types.ObjectId(),
      description: `${product.title} - Produit électronique de haute qualité`,
    })));

    console.log(`✅ ${insertedProducts.length} produits électroniques insérés avec succès !`);
    
    console.log('\n📋 Exemples de produits insérés :');
    insertedProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.price}€`);
      console.log(`   Image: ${product.imgSrc}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des produits électroniques:', error);
  } finally {
    console.log('🔒 Connexion fermée');
    await mongoose.connection.close();
  }
}

// Exécuter le script
updateElectronicsProducts();
