/**
 * Script de test pour créer quelques produits de base
 * Version simplifiée pour valider la chaîne API-centric
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configuration de base
const cloudinaryBaseUrl = 'https://res.cloudinary.com/dcbryptkx/image/upload';

// Produits de test statiques
const testProducts = [
  {
    id: 1,
    title: "T-shirt Ribbed Tank Top",
    price: 16.95,
    imgSrc: "/images/products/black-1.jpg",
    imgHoverSrc: "/images/products/black-2.jpg",
    brand: "Ecomus",
    colors: [
      { name: "Black", colorClass: "bg_dark", imgSrc: "/images/products/black-1.jpg" },
      { name: "White", colorClass: "bg_white", imgSrc: "/images/products/white-1.jpg" }
    ],
    sizes: ["S", "M", "L", "XL"],
    filterCategories: ["Best seller", "Fashion"],
    description: "T-shirt côtelé en coton doux et confortable, parfait pour un usage quotidien."
  },
  {
    id: 2,
    title: "Sweatshirt à capuche",
    price: 45.00,
    originalPrice: 55.00,
    imgSrc: "/images/products/brown-1.jpg", 
    imgHoverSrc: "/images/products/brown-2.jpg",
    brand: "Ecomus",
    colors: [
      { name: "Brown", colorClass: "bg_brown", imgSrc: "/images/products/brown-1.jpg" },
      { name: "Grey", colorClass: "bg_grey", imgSrc: "/images/products/grey-1.jpg" }
    ],
    sizes: ["M", "L", "XL"],
    filterCategories: ["New arrivals", "Fashion"],
    description: "Sweatshirt à capuche en molleton, idéal pour les journées fraîches."
  },
  {
    id: 3,
    title: "Baskets Sport",
    price: 89.99,
    imgSrc: "/images/products/footwear-1.jpg",
    imgHoverSrc: "/images/products/footwear-2.jpg", 
    brand: "SportMax",
    colors: [
      { name: "White", colorClass: "bg_white", imgSrc: "/images/products/footwear-1.jpg" },
      { name: "Black", colorClass: "bg_dark", imgSrc: "/images/products/footwear-3.jpg" }
    ],
    sizes: ["39", "40", "41", "42", "43"],
    filterCategories: ["Sports", "Footwear"],
    description: "Baskets sport haute performance avec semelle amortissante."
  },
  {
    id: 4,
    title: "Sac à main élégant",
    price: 125.00,
    imgSrc: "/images/products/brown-handbag-1.jpg",
    imgHoverSrc: "/images/products/brown-handbag-2.jpg",
    brand: "LuxuryBags",
    colors: [
      { name: "Brown", colorClass: "bg_brown", imgSrc: "/images/products/brown-handbag-1.jpg" },
      { name: "Black", colorClass: "bg_dark", imgSrc: "/images/products/black-1.jpg" }
    ],
    filterCategories: ["Accessories", "Fashion"],
    description: "Sac à main en cuir véritable, parfait pour toutes les occasions."
  },
  {
    id: 5,
    title: "Casque Audio Bluetooth",
    price: 199.99,
    originalPrice: 249.99,
    imgSrc: "/images/products/headphone-1.png",
    imgHoverSrc: "/images/products/headphone-2.png",
    brand: "TechSound", 
    colors: [
      { name: "Black", colorClass: "bg_dark", imgSrc: "/images/products/headphone-1.png" },
      { name: "White", colorClass: "bg_white", imgSrc: "/images/products/headphone-white.jpg" }
    ],
    filterCategories: ["Electronics", "Audio"],
    description: "Casque audio Bluetooth haute qualité avec réduction de bruit active."
  }
];

// Fonction pour convertir les URLs d'images vers Cloudinary
function convertImageToCloudinary(imagePath) {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/images/products/')) {
    const fileName = imagePath.replace('/images/products/', '');
    const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return `${cloudinaryBaseUrl}/v1/ecomus/products/${nameWithoutExt}`;
  }
  
  return imagePath;
}

// Fonction pour générer un slug unique
function generateSlug(title, id) {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${id}`;
}

// Fonction pour générer un SKU unique
function generateSKU(title, id) {
  const titleCode = title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  return `${titleCode}-${id.toString().padStart(4, '0')}`;
}

async function createTestProducts() {
  try {
    console.log('🚀 Début de la création des produits de test...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard');
    console.log('✅ Connexion à MongoDB établie');
    
    // Import des modèles
    const Product = require('../src/models/Product.ts');
    const Store = require('../src/models/Store.ts');
    const Category = require('../src/models/Category.ts');
    const User = require('../src/models/User.ts');
    
    // Récupérer ou créer les données par défaut
    let defaultStore = await Store.findOne({ isActive: true });
    if (!defaultStore) {
      defaultStore = await Store.findOne().sort({ createdAt: -1 });
    }
    
    if (!defaultStore) {
      console.log('🏪 Création d\'une boutique de test...');
      defaultStore = await Store.create({
        name: 'Boutique de Test',
        slug: 'boutique-test',
        description: 'Boutique de démonstration pour tester les produits',
        isActive: true,
        status: 'active',
        homeTheme: 'fashion',
        homeTemplate: 'home-01',
        homeName: 'Boutique Fashion',
        homeDescription: 'Découvrez notre collection fashion',
        vendorStatus: 'none'
      });
    }
    
    // Créer/récupérer catégorie par défaut
    let defaultCategory = await Category.findOne({ slug: 'fashion' });
    if (!defaultCategory) {
      console.log('📁 Création d\'une catégorie de test...');
      defaultCategory = await Category.create({
        name: 'Fashion',
        slug: 'fashion', 
        description: 'Articles de mode',
        isActive: true,
        sort: 0
      });
    }
    
    // Récupérer ou créer un vendeur par défaut
    let defaultVendor = await User.findOne({ role: 'vendor' });
    if (!defaultVendor) {
      defaultVendor = await User.findOne({ role: 'admin' });
    }
    
    if (!defaultVendor) {
      console.log('👤 Création d\'un vendeur de test...');
      defaultVendor = await User.create({
        name: 'Vendeur Test',
        email: 'vendeur@test.com',
        password: 'password123',
        role: 'vendor',
        isActive: true
      });
    }
    
    console.log(`📦 Boutique: ${defaultStore.name}`);
    console.log(`📁 Catégorie: ${defaultCategory.name}`);
    console.log(`👤 Vendeur: ${defaultVendor.name || defaultVendor.email}`);
    
    // Supprimer les anciens produits de test
    const deleteResult = await Product.deleteMany({
      'attributes.originalData.source': 'test-products'
    });
    console.log(`🗑️ ${deleteResult.deletedCount} anciens produits de test supprimés`);
    
    // Créer les nouveaux produits
    console.log(`🔧 Création de ${testProducts.length} produits de test...`);
    
    const createdProducts = [];
    
    for (const productData of testProducts) {
      try {
        // Préparer les images
        const images = [];
        if (productData.imgSrc) {
          images.push(convertImageToCloudinary(productData.imgSrc));
        }
        if (productData.imgHoverSrc && productData.imgHoverSrc !== productData.imgSrc) {
          images.push(convertImageToCloudinary(productData.imgHoverSrc));
        }
        
        // Ajouter les images des couleurs
        if (productData.colors) {
          productData.colors.forEach(color => {
            const colorImage = convertImageToCloudinary(color.imgSrc);
            if (colorImage && !images.includes(colorImage)) {
              images.push(colorImage);
            }
          });
        }
        
        // Calculer le prix de comparaison et la remise
        let comparePrice = productData.originalPrice || 0;
        let discountPercentage = 0;
        if (comparePrice > productData.price) {
          discountPercentage = Math.round(((comparePrice - productData.price) / comparePrice) * 100);
        }
        
        const newProduct = {
          title: productData.title,
          slug: generateSlug(productData.title, productData.id),
          description: productData.description,
          price: productData.price,
          comparePrice,
          discountPercentage,
          sku: generateSKU(productData.title, productData.id),
          quantity: Math.floor(Math.random() * 50) + 10,
          lowStockAlert: 5,
          images: images.filter(Boolean),
          category: defaultCategory._id,
          tags: productData.filterCategories ? 
            productData.filterCategories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')) : [],
          vendor: defaultVendor._id,
          store: defaultStore._id,
          status: 'active',
          featured: Math.random() > 0.7,
          isDropshipping: false,
          weight: Math.round((Math.random() * 2 + 0.1) * 100) / 100,
          dimensions: {
            length: Math.floor(Math.random() * 30) + 10,
            width: Math.floor(Math.random() * 20) + 5,
            height: Math.floor(Math.random() * 15) + 3
          },
          seoTitle: productData.title,
          seoDescription: `Achetez ${productData.title} au meilleur prix. ${productData.description}`,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          totalReviews: Math.floor(Math.random() * 50),
          totalSales: Math.floor(Math.random() * 200),
          attributes: {
            brand: productData.brand,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            filterCategories: productData.filterCategories || [],
            originalData: {
              id: productData.id,
              source: 'test-products'
            }
          }
        };
        
        const product = await Product.create(newProduct);
        createdProducts.push(product);
        
        console.log(`✅ Produit créé: ${product.title} - ${product.price}€`);
        
      } catch (error) {
        console.error(`❌ Erreur lors de la création du produit ${productData.title}:`, error.message);
      }
    }
    
    // Mettre à jour les métriques de la boutique
    const totalProducts = await Product.countDocuments({ store: defaultStore._id });
    await Store.findByIdAndUpdate(defaultStore._id, {
      'metrics.totalProducts': totalProducts
    });
    
    console.log('\n🎉 Création des produits de test terminée !');
    console.log(`✅ ${createdProducts.length} produits créés avec succès`);
    console.log(`📈 Total des produits dans la boutique: ${totalProducts}`);
    
    console.log('\n📋 Produits créés :');
    createdProducts.forEach(product => {
      console.log(`  • ${product.title} - ${product.price}€ (${product.images.length} images)`);
    });
    
    console.log('\n🔗 URLs de test pour l\'API :');
    console.log(`   API Produits: http://localhost:3000/api/public/products`);
    console.log(`   API Boutique: http://localhost:3000/api/public/stores/${defaultStore.slug}`);
    console.log(`   Frontend: http://localhost:3001/boutique/${defaultStore.slug}`);
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestProducts()
    .then(() => {
      console.log('✨ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { createTestProducts };
