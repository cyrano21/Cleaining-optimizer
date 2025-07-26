// Script pour insérer les produits électroniques avec le vrai modèle Product
const mongoose = require('mongoose');
require('dotenv').config();

async function insertElectronicsProducts() {
  try {
    console.log('🔗 Connexion à MongoDB local...');
    await mongoose.connect('mongodb://localhost:27017/ecomus_db');
    console.log('✅ Connecté à MongoDB local');

    // Utiliser un modèle simple sans index conflictuels
    const productSchema = new mongoose.Schema({
      title: { type: String, required: true },
      price: { type: Number, required: true },
      oldPrice: { type: Number },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      description: { type: String },
      images: [{ type: String }],
      slug: { type: String },
      sku: { type: String },
      stock: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      sale: { type: Boolean, default: false },
      rating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      tags: [{ type: String }],
      colors: [{ type: String }],
      sizes: [{ type: String }]
    }, { strict: false });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    const electronicsCategory = '686c54c34d17399c9ee6c6f0';

    console.log('🗑️ Suppression des anciens produits électroniques...');
    await Product.deleteMany({ category: electronicsCategory });

    // Produits électroniques avec structure complète
    const electronicsProducts = [
      {
        title: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
        price: 39.99,
        category: electronicsCategory,
        description: "Protection d'écran en verre trempé ultra-résistant pour iPhone 15 Pro",
        images: [
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-1.jpg",
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-2.jpg"
        ],
        slug: "ultraglass-2-screen-protector-iphone-15-pro",
        sku: "ELEC-001",
        stock: 50,
        isActive: true,
        featured: false
      },
      {
        title: "Smart Light Switch with Thread",
        price: 49.99,
        category: electronicsCategory,
        description: "Interrupteur intelligent compatible Thread pour maison connectée",
        images: [
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-3.jpg",
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-4.jpg"
        ],
        slug: "smart-light-switch-thread",
        sku: "ELEC-002",
        stock: 30,
        isActive: true,
        featured: false
      },
      {
        title: "SoundForm Rise Headphones",
        price: 79.99,
        oldPrice: 100.00,
        category: electronicsCategory,
        description: "Casque audio premium avec réduction de bruit active",
        images: [
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-5.jpg",
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-6.jpg"
        ],
        slug: "soundform-rise-headphones",
        sku: "ELEC-003",
        stock: 25,
        isActive: true,
        featured: true,
        sale: true
      },
      {
        title: "Wireless On-Ear Headphones for Kids",
        price: 24.99,
        oldPrice: 34.99,
        category: electronicsCategory,
        description: "Casque sans fil sécurisé pour enfants avec limitation de volume",
        images: [
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-7.jpg",
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-8.jpg"
        ],
        slug: "wireless-headphones-kids",
        sku: "ELEC-004",
        stock: 40,
        isActive: true,
        featured: false,
        sale: true
      },
      {
        title: "3-in-1 Wireless Charger MagSafe 15W",
        price: 127.49,
        oldPrice: 149.99,
        category: electronicsCategory,
        description: "Chargeur sans fil 3-en-1 compatible MagSafe 15W",
        images: [
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-9.jpg",
          "https://ecomusnext-themesflat.vercel.app/images/products/headphone-10.jpg"
        ],
        slug: "wireless-charger-magsafe-15w",
        sku: "ELEC-005",
        stock: 20,
        isActive: true,
        featured: true,
        sale: true
      }
    ];

    console.log('📦 Insertion des produits électroniques...');
    
    const insertedProducts = [];
    for (const productData of electronicsProducts) {
      try {
        const product = new Product(productData);
        const saved = await product.save();
        insertedProducts.push(saved);
        console.log(`✅ ${saved.title} - ${saved.price}€`);
      } catch (error) {
        console.error(`❌ Erreur insertion ${productData.title}:`, error.message);
      }
    }

    console.log(`\n🎉 ${insertedProducts.length} produits électroniques insérés !`);
    
    if (insertedProducts.length > 0) {
      console.log('\n📋 Produits insérés :');
      insertedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   Prix: ${product.price}€`);
        console.log(`   Image: ${product.images[0]}`);
        console.log(`   ID: ${product._id}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  } finally {
    console.log('🔒 Connexion fermée');
    await mongoose.connection.close();
  }
}

// Exécuter le script
insertElectronicsProducts();
