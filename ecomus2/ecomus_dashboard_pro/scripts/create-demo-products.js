/**
 * Script de création de produits de démonstration synchrones avec les données existantes
 * 
 * Ce script va :
 * 1. Lire les données des produits existants dans ecomusnext-main/data/products.js
 * 2. Adapter les URLs d'images pour respecter le système Cloudinary
 * 3. Créer les produits en base avec le bon format MongoDB
 * 4. Associer les produits aux boutiques existantes
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importer les modèles
const Product = require('../src/models/Product.ts');
const Store = require('../src/models/Store.ts');
const Category = require('../src/models/Category.ts');
const User = require('../src/models/User.ts');

// Configuration Cloudinary
const cloudinaryBaseUrl = 'https://res.cloudinary.com/dcbryptkx/image/upload';

// Fonction pour convertir les URLs d'images vers Cloudinary
function convertImageToCloudinary(imagePath) {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète (Unsplash par exemple), on la garde
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si c'est un chemin local, on le convertit vers Cloudinary
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

// Mappings des catégories
const categoryMapping = {
  'Best seller': 'bestsellers',
  'New arrivals': 'new-arrivals',
  'On Sale': 'sale',
  'Men': 'men',
  'Women': 'women',
  'Kids': 'kids',
  'Accessories': 'accessories',
  'Electronics': 'electronics',
  'Home & Garden': 'home-garden',
  'Sports': 'sports',
  'Fashion': 'fashion',
  'Beauty': 'beauty'
};

// Fonction pour créer les catégories si elles n'existent pas
async function ensureCategoriesExist() {
  const categories = Object.entries(categoryMapping);
  const categoryDocs = [];
  
  for (const [name, slug] of categories) {
    let category = await Category.findOne({ slug });
    
    if (!category) {
      category = await Category.create({
        name,
        slug,
        description: `Catégorie ${name}`,
        isActive: true,
        sort: 0
      });
      console.log(`✅ Catégorie créée: ${name}`);
    }
    
    categoryDocs.push(category);
  }
  
  return categoryDocs;
}

// Fonction pour adapter un produit du format data/products.js vers le modèle MongoDB
function adaptProductToMongoDB(product, defaultStore, defaultCategory, defaultVendor) {
  const images = [];
  
  // Image principale
  if (product.imgSrc) {
    images.push(convertImageToCloudinary(product.imgSrc));
  }
  
  // Image de survol
  if (product.imgHoverSrc && product.imgHoverSrc !== product.imgSrc) {
    images.push(convertImageToCloudinary(product.imgHoverSrc));
  }
  
  // Images des variantes de couleur
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach(color => {
      if (color.imgSrc && !images.includes(convertImageToCloudinary(color.imgSrc))) {
        images.push(convertImageToCloudinary(color.imgSrc));
      }
    });
  }
  
  // Calculer le prix de comparaison et la remise
  let comparePrice = product.originalPrice || product.oldPrice || 0;
  if (typeof comparePrice === 'string') {
    comparePrice = parseFloat(comparePrice.replace(/[^0-9.]/g, ''));
  }
  
  let discountPercentage = 0;
  if (comparePrice > product.price) {
    discountPercentage = Math.round(((comparePrice - product.price) / comparePrice) * 100);
  }
  
  const adaptedProduct = {
    title: product.title || 'Produit de démonstration',
    slug: generateSlug(product.title || 'produit', product.id),
    description: product.description || 
      (Array.isArray(product.description) ? product.description.join('. ') : 'Description du produit de démonstration'),
    price: product.price || 0,
    comparePrice: comparePrice || 0,
    discountPercentage,
    sku: generateSKU(product.title || 'PROD', product.id),
    quantity: Math.floor(Math.random() * 50) + 10, // Stock aléatoire entre 10 et 60
    lowStockAlert: 5,
    images: images.filter(Boolean), // Supprimer les URLs vides
    category: defaultCategory._id,
    tags: [],
    vendor: defaultVendor._id,
    store: defaultStore._id,
    status: 'active',
    featured: product.populer || product.featured || Math.random() > 0.8, // 20% de chance d'être featured
    isDropshipping: false,
    weight: Math.random() * 2 + 0.1, // Poids aléatoire entre 0.1 et 2.1 kg
    dimensions: {
      length: Math.floor(Math.random() * 30) + 10,
      width: Math.floor(Math.random() * 20) + 5,
      height: Math.floor(Math.random() * 15) + 3
    },
    seoTitle: product.title,
    seoDescription: `Achetez ${product.title} au meilleur prix. Livraison rapide et gratuite.`,
    averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Entre 3.0 et 5.0
    totalReviews: Math.floor(Math.random() * 100),
    totalSales: Math.floor(Math.random() * 500),
    
    // Attributs personnalisés basés sur les données du produit original
    attributes: {
      brand: product.brand || product.vendorName || 'Ecomus',
      colors: product.colors || [],
      sizes: product.sizes || [],
      filterCategories: product.filterCategories || [],
      isAvailable: product.isAvailable !== false,
      onSale: product.onSale || product.sale || null,
      countdown: product.countdown || null,
      originalData: {
        id: product.id,
        source: 'ecomusnext-products-data'
      }
    }
  };
  
  // Ajouter les tags basés sur les catégories de filtre
  if (product.filterCategories) {
    adaptedProduct.tags = product.filterCategories.map(cat => 
      cat.toLowerCase().replace(/\s+/g, '-')
    );
  }
  
  return adaptedProduct;
}

// Fonction principale
async function createDemoProducts() {
  try {
    console.log('🚀 Début de la création des produits de démonstration...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard');
    console.log('✅ Connexion à MongoDB établie');
    
    // Créer les catégories si nécessaire
    await ensureCategoriesExist();
    
    // Récupérer les données par défaut
    const defaultStore = await Store.findOne({ isActive: true }) || 
      await Store.findOne().sort({ createdAt: -1 });
    
    if (!defaultStore) {
      throw new Error('Aucune boutique trouvée. Créez au moins une boutique avant d\'exécuter ce script.');
    }
    
    const defaultCategory = await Category.findOne({ slug: 'fashion' }) || 
      await Category.findOne();
    
    if (!defaultCategory) {
      throw new Error('Aucune catégorie trouvée.');
    }
    
    const defaultVendor = await User.findOne({ role: 'vendor' }) || 
      await User.findOne({ role: 'admin' });
    
    if (!defaultVendor) {
      throw new Error('Aucun vendeur trouvé.');
    }
    
    console.log(`📦 Boutique par défaut: ${defaultStore.name}`);
    console.log(`📁 Catégorie par défaut: ${defaultCategory.name}`);
    console.log(`👤 Vendeur par défaut: ${defaultVendor.name || defaultVendor.email}`);
    
    // Lire le fichier de données des produits
    const productsDataPath = path.join(__dirname, '../../ecomusnext-main/data/products.js');
    
    if (!fs.existsSync(productsDataPath)) {
      throw new Error(`Fichier de données non trouvé: ${productsDataPath}`);
    }
    
    // Importer dynamiquement les données des produits
    delete require.cache[require.resolve(productsDataPath)];
    const productsData = require(productsDataPath);
    
    // Extraire tous les produits des différents exports
    const allProducts = [];
    Object.keys(productsData).forEach(key => {
      if (Array.isArray(productsData[key])) {
        allProducts.push(...productsData[key]);
      }
    });
    
    console.log(`📊 ${allProducts.length} produits trouvés dans le fichier de données`);
    
    // Limiter le nombre de produits pour les tests (prendre les 50 premiers)
    const productsToCreate = allProducts.slice(0, 50);
    console.log(`🔧 Création de ${productsToCreate.length} produits de démonstration...`);
    
    // Supprimer les produits existants avec l'attribut source = 'ecomusnext-products-data'
    const deleteResult = await Product.deleteMany({
      'attributes.originalData.source': 'ecomusnext-products-data'
    });
    console.log(`🗑️ ${deleteResult.deletedCount} anciens produits de démonstration supprimés`);
    
    // Créer les nouveaux produits
    const createdProducts = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const productData of productsToCreate) {
      try {
        const adaptedProduct = adaptProductToMongoDB(
          productData, 
          defaultStore, 
          defaultCategory, 
          defaultVendor
        );
        
        // Vérifier que le produit a au moins une image
        if (adaptedProduct.images.length === 0) {
          console.log(`⚠️ Produit ignoré (pas d'images): ${adaptedProduct.title}`);
          continue;
        }
        
        const product = await Product.create(adaptedProduct);
        createdProducts.push(product);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`✅ ${successCount} produits créés...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la création du produit ${productData.title}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Création des produits terminée !');
    console.log(`✅ ${successCount} produits créés avec succès`);
    console.log(`❌ ${errorCount} erreurs rencontrées`);
    
    // Afficher quelques exemples
    if (createdProducts.length > 0) {
      console.log('\n📋 Exemples de produits créés :');
      createdProducts.slice(0, 5).forEach(product => {
        console.log(`  • ${product.title} - ${product.price}€ (${product.images.length} images)`);
      });
    }
    
    // Mettre à jour les métriques de la boutique
    const totalProducts = await Product.countDocuments({ store: defaultStore._id });
    await Store.findByIdAndUpdate(defaultStore._id, {
      'metrics.totalProducts': totalProducts
    });
    
    console.log(`\n📈 Métriques mises à jour pour la boutique ${defaultStore.name}`);
    console.log(`   Total des produits: ${totalProducts}`);
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createDemoProducts()
    .then(() => {
      console.log('✨ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { createDemoProducts };
