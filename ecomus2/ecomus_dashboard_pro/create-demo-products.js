const mongoose = require('mongoose');
require('dotenv').config();

// Configuration de connexion MongoDB directe pour le script
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(MONGODB_URI);
}

// Script de peuplement de produits de démonstration
async function createDemoProducts() {
  try {
    await connectDB();
    
    // Définition du schéma Product directement dans le script
    const productSchema = new mongoose.Schema({
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      shortDescription: String,
      price: { type: Number, required: true },
      originalPrice: Number,
      images: [String],
      thumbnail: String,
      category: String,
      subcategory: String,
      tags: [String],
      brand: String,
      sku: String,
      stock: { type: Number, default: 0 },
      status: { type: String, default: 'active' },
      visibility: { type: String, default: 'public' },
      featured: { type: Boolean, default: false },
      rating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    
    // Produits de démonstration avec des images Cloudinary existantes
    const demoProducts = [
      {
        title: "T-shirt Cotton Premium",
        slug: "t-shirt-cotton-premium",
        description: "T-shirt en coton biologique ultra confortable, parfait pour un style décontracté.",
        price: 29.99,
        comparePrice: 39.99,
        discountPercentage: 25,
        sku: "TSH-001",
        quantity: 50,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/orange-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/orange-2.jpg"
        ],
        category: null, // À adapter selon vos catégories
        tags: ["cotton", "basic", "unisex", "eco-friendly"],
        status: "active",
        featured: true,
        weight: 0.2,
        dimensions: { length: 30, width: 25, height: 2 },
        seoTitle: "T-shirt Cotton Premium - Confort et Style",
        seoDescription: "Découvrez notre t-shirt en coton premium, alliant confort et durabilité pour un look casual parfait.",
        variant: { color: "Orange", size: "M" },
        averageRating: 4.5,
        totalReviews: 12,
        totalSales: 45
      },
      {
        title: "Jeans Denim Classic",
        slug: "jeans-denim-classic",
        description: "Jean classique en denim de qualité supérieure, coupe moderne et confortable.",
        price: 79.99,
        comparePrice: 99.99,
        discountPercentage: 20,
        sku: "JEA-001",
        quantity: 30,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/blue-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/blue-2.jpg"
        ],
        tags: ["denim", "casual", "classic", "cotton"],
        status: "active",
        featured: true,
        weight: 0.8,
        dimensions: { length: 100, width: 50, height: 3 },
        variant: { color: "Blue", size: "32" },
        averageRating: 4.7,
        totalReviews: 23,
        totalSales: 67
      },
      {
        title: "Sneakers Urban Style",
        slug: "sneakers-urban-style",
        description: "Baskets urbaines tendance, parfaites pour tous vos déplacements en ville.",
        price: 129.99,
        comparePrice: 159.99,
        discountPercentage: 19,
        sku: "SNE-001",
        quantity: 25,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/white-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/white-2.jpg"
        ],
        tags: ["shoes", "sneakers", "urban", "comfort"],
        status: "active",
        featured: false,
        weight: 0.9,
        dimensions: { length: 30, width: 12, height: 10 },
        variant: { color: "White", size: "42" },
        averageRating: 4.3,
        totalReviews: 18,
        totalSales: 34
      },
      {
        title: "Hoodie Cozy Warm",
        slug: "hoodie-cozy-warm",
        description: "Sweat à capuche ultra doux, idéal pour les journées fraîches.",
        price: 59.99,
        comparePrice: 79.99,
        discountPercentage: 25,
        sku: "HOO-001",
        quantity: 40,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/black-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/black-2.jpg"
        ],
        tags: ["hoodie", "warm", "casual", "cotton"],
        status: "active",
        featured: true,
        weight: 0.6,
        dimensions: { length: 35, width: 30, height: 3 },
        variant: { color: "Black", size: "L" },
        averageRating: 4.6,
        totalReviews: 31,
        totalSales: 89
      },
      {
        title: "Dress Summer Floral",
        slug: "dress-summer-floral",
        description: "Robe d'été légère avec motifs floraux, parfaite pour les beaux jours.",
        price: 89.99,
        comparePrice: 119.99,
        discountPercentage: 25,
        sku: "DRE-001",
        quantity: 20,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/pink-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/pink-2.jpg"
        ],
        tags: ["dress", "summer", "floral", "feminine"],
        status: "active",
        featured: true,
        weight: 0.3,
        dimensions: { length: 90, width: 40, height: 2 },
        variant: { color: "Pink", size: "M" },
        averageRating: 4.8,
        totalReviews: 26,
        totalSales: 52
      },
      {
        title: "Jacket Leather Premium",
        slug: "jacket-leather-premium",
        description: "Veste en cuir véritable de qualité premium, style intemporel.",
        price: 299.99,
        comparePrice: 399.99,
        discountPercentage: 25,
        sku: "JAC-001",
        quantity: 15,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/brown-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/brown-2.jpg"
        ],
        tags: ["jacket", "leather", "premium", "style"],
        status: "active",
        featured: false,
        weight: 1.2,
        dimensions: { length: 60, width: 50, height: 5 },
        variant: { color: "Brown", size: "L" },
        averageRating: 4.9,
        totalReviews: 14,
        totalSales: 21
      },
      {
        title: "Shorts Beach Comfort",
        slug: "shorts-beach-comfort",
        description: "Short de plage léger et respirant, parfait pour l'été.",
        price: 39.99,
        comparePrice: 49.99,
        discountPercentage: 20,
        sku: "SHO-001",
        quantity: 35,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/beige-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/beige-2.jpg"
        ],
        tags: ["shorts", "beach", "summer", "light"],
        status: "active",
        featured: false,
        weight: 0.2,
        dimensions: { length: 40, width: 30, height: 2 },
        variant: { color: "Beige", size: "M" },
        averageRating: 4.2,
        totalReviews: 9,
        totalSales: 28
      },
      {
        title: "Scarf Wool Winter",
        slug: "scarf-wool-winter",
        description: "Écharpe en laine douce et chaude pour l'hiver.",
        price: 49.99,
        comparePrice: 69.99,
        discountPercentage: 29,
        sku: "SCA-001",
        quantity: 45,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/grey-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/grey-2.jpg"
        ],
        tags: ["scarf", "wool", "winter", "warm"],
        status: "active",
        featured: true,
        weight: 0.3,
        dimensions: { length: 180, width: 30, height: 1 },
        variant: { color: "Grey", size: "One Size" },
        averageRating: 4.4,
        totalReviews: 16,
        totalSales: 42
      },
      {
        title: "Hat Baseball Classic",
        slug: "hat-baseball-classic",
        description: "Casquette baseball classique, ajustable et confortable.",
        price: 24.99,
        comparePrice: 34.99,
        discountPercentage: 29,
        sku: "HAT-001",
        quantity: 60,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/red-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/red-2.jpg"
        ],
        tags: ["hat", "baseball", "classic", "adjustable"],
        status: "active",
        featured: false,
        weight: 0.15,
        dimensions: { length: 25, width: 25, height: 12 },
        variant: { color: "Red", size: "One Size" },
        averageRating: 4.1,
        totalReviews: 7,
        totalSales: 19
      },
      {
        title: "Bag Tote Canvas",
        slug: "bag-tote-canvas",
        description: "Sac tote en toile résistante, idéal pour le quotidien.",
        price: 34.99,
        comparePrice: 44.99,
        discountPercentage: 22,
        sku: "BAG-001",
        quantity: 25,
        images: [
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/green-1.jpg",
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1708444613/ecomus/products/green-2.jpg"
        ],
        tags: ["bag", "tote", "canvas", "eco-friendly"],
        status: "active",
        featured: true,
        weight: 0.4,
        dimensions: { length: 40, width: 35, height: 15 },
        variant: { color: "Green", size: "Large" },
        averageRating: 4.3,
        totalReviews: 11,
        totalSales: 33
      }
    ];

    // Supprimer les produits existants (optionnel)
    console.log('🗑️ Suppression des produits existants...');
    await Product.deleteMany({});

    // Insérer les nouveaux produits
    console.log('📦 Insertion des produits de démonstration...');
    const insertedProducts = await Product.insertMany(demoProducts);
    
    console.log(`✅ ${insertedProducts.length} produits de démonstration créés avec succès !`);
    
    // Afficher quelques infos
    insertedProducts.forEach(product => {
      console.log(`- ${product.title} (${product.sku}) - ${product.price}€`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des produits:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Exécuter le script
if (require.main === module) {
  createDemoProducts();
}

module.exports = createDemoProducts;
