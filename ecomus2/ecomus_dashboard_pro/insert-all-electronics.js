// Script pour insérer tous les produits électroniques un par un
const mongoose = require('mongoose');
require('dotenv').config();

// Produits électroniques avec les vraies images du site
const correctElectronicsProducts = [
  {
    title: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-1.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-2.jpg",
    price: 39.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "Smart Light Switch with Thread",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-3.jpg", 
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-4.jpg",
    price: 49.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "SoundForm Rise",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-5.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-6.jpg",
    price: 79.99,
    oldPrice: 100.00,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "Wireless On-Ear Headphones for Kids",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-7.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-8.jpg",
    price: 24.99,
    oldPrice: 34.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-9.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-10.jpg",
    price: 127.49,
    oldPrice: 149.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "3-in-1 Wireless Charger for Apple Devices",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-11.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-12.jpg",
    price: 119.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "Wireless Earbuds Pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-13.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-14.jpg",
    price: 199.99,
    category: '686c54c34d17399c9ee6c6f0'
  },
  {
    title: "Smart Watch Series 8",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-15.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-16.jpg",
    price: 399.99,
    category: '686c54c34d17399c9ee6c6f0'
  }
];

async function insertElectronicsProducts() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Utiliser un schéma flexible pour éviter les conflits
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    console.log('🗑️ Suppression des anciens produits électroniques...');
    await Product.deleteMany({ category: '686c54c34d17399c9ee6c6f0' });

    console.log('📦 Insertion des nouveaux produits électroniques un par un...');
    
    const insertedProducts = [];
    for (let i = 0; i < correctElectronicsProducts.length; i++) {
      const product = correctElectronicsProducts[i];
      try {
        const newProduct = new Product({
          title: product.title,
          price: product.price,
          oldPrice: product.oldPrice,
          category: new mongoose.Types.ObjectId(product.category),
          description: `${product.title} - Produit électronique de haute qualité`,
          images: [product.imgSrc, product.imgHoverSrc],
          imgSrc: product.imgSrc,
          imgHoverSrc: product.imgHoverSrc,
          isActive: true,
          featured: false,
          sale: product.oldPrice ? true : false,
          soldOut: false,
          preOrder: false,
          rating: 4.5,
          reviewsCount: Math.floor(Math.random() * 50) + 10,
          tags: ['electronics', 'tech', 'gadget'],
          colors: [],
          sizes: ['S', 'M', 'L', 'XL'],
          slug: product.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          sku: `ELEC-${String(i + 1).padStart(3, '0')}`,
          stock: Math.floor(Math.random() * 100) + 20,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const saved = await newProduct.save();
        insertedProducts.push(saved);
        console.log(`✅ ${i + 1}. ${product.title} - ${product.price}€`);
        
      } catch (error) {
        console.error(`❌ Erreur insertion produit ${i + 1}:`, error.message);
      }
    }

    console.log(`\n🎉 ${insertedProducts.length} produits électroniques insérés avec succès !`);
    
    if (insertedProducts.length > 0) {
      console.log('\n📋 Exemples de produits insérés :');
      insertedProducts.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - ${product.price}€`);
        console.log(`   Image: ${product.images[0]}`);
        console.log(`   ID: ${product._id}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  } finally {
    console.log('\n🔒 Connexion fermée');
    await mongoose.connection.close();
  }
}

// Exécuter le script
insertElectronicsProducts();
