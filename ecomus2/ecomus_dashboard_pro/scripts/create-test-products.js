// Script pour créer des produits de test
import { connectDB } from '../src/lib/mongodb.js';
import mongoose from 'mongoose';

// Définir le schéma Product directement dans le script
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  images: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }]
}, { timestamps: true });

// Définir le schéma Category
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  featured: { type: Boolean, default: false },
  image: { type: String }
}, { timestamps: true });

// Définir le schéma Store
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  settings: {
    currency: { type: String, default: 'EUR' },
    language: { type: String, default: 'fr' }
  }
}, { timestamps: true });

// Créer les modèles
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: String,
  name: String,
  role: String
}));

async function createTestProducts() {
  try {
    await connectDB();
    console.log('✅ Connecté à MongoDB');

    // Créer une catégorie de test si elle n'existe pas
    let category = await Category.findOne({ slug: 'electronique' });
    if (!category) {
      category = await Category.create({
        name: 'Électronique',
        description: 'Appareils électroniques et gadgets',
        slug: 'electronique',
        featured: true,
        image: '/images/categories/electronique.jpg'
      });
      console.log('✅ Catégorie créée:', category.name);
    }

    // Trouver un utilisateur admin comme vendor par défaut
    const admin = await User.findOne({ role: { $in: ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'] } });
    if (!admin) {
      console.log('❌ Aucun utilisateur admin trouvé');
      return;
    }

    // Créer un store de test si il n'existe pas
    let store = await Store.findOne({ slug: 'store-principal' });
    if (!store) {
      store = await Store.create({
        name: 'Store Principal',
        slug: 'store-principal',
        description: 'Store principal de test',
        owner: admin._id,
        status: 'active',
        settings: {
          currency: 'EUR',
          language: 'fr'
        }
      });
      console.log('✅ Store créé:', store.name);
    }

    // Vérifier s'il y a déjà des produits
    const existingProductsCount = await Product.countDocuments();
    console.log(`📦 Produits existants: ${existingProductsCount}`);

    if (existingProductsCount > 0) {
      console.log('✅ Des produits existent déjà en base');
      return;
    }

    // Créer des produits de test
    const testProducts = [
      {
        title: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Le dernier iPhone avec puce A17 Pro',
        price: 1199,
        comparePrice: 1299,
        sku: 'IPH15PRO-001',
        stock: 50,
        category: category._id,
        vendor: admin._id,
        store: store._id,
        images: ['/images/products/iphone-15-pro.jpg'],
        status: 'active',
        featured: true,
        tags: ['smartphone', 'apple', 'premium']
      },
      {
        title: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'Ordinateur portable ultra-fin avec puce M2',
        price: 1399,
        comparePrice: 1499,
        sku: 'MBA-M2-001',
        stock: 25,
        category: category._id,
        vendor: admin._id,
        store: store._id,
        images: ['/images/products/macbook-air-m2.jpg'],
        status: 'active',
        featured: true,
        tags: ['laptop', 'apple', 'productivity']
      },
      {
        title: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Smartphone Android flagship avec IA',
        price: 899,
        comparePrice: 999,
        sku: 'SGS24-001',
        stock: 75,
        category: category._id,
        vendor: admin._id,
        store: store._id,
        images: ['/images/products/galaxy-s24.jpg'],
        status: 'active',
        featured: false,
        tags: ['smartphone', 'samsung', 'android']
      },
      {
        title: 'AirPods Pro 2',
        slug: 'airpods-pro-2',
        description: 'Écouteurs sans fil avec réduction de bruit active',
        price: 279,
        comparePrice: 299,
        sku: 'APP2-001',
        stock: 100,
        category: category._id,
        vendor: admin._id,
        store: store._id,
        images: ['/images/products/airpods-pro-2.jpg'],
        status: 'active',
        featured: false,
        tags: ['audio', 'apple', 'wireless']
      },
      {
        title: 'iPad Pro 12.9"',
        slug: 'ipad-pro-12-9',
        description: 'Tablette professionnelle avec puce M2',
        price: 1199,
        comparePrice: 1299,
        sku: 'IPP129-001',
        stock: 30,
        category: category._id,
        vendor: admin._id,
        store: store._id,
        images: ['/images/products/ipad-pro-12-9.jpg'],
        status: 'active',
        featured: true,
        tags: ['tablet', 'apple', 'creative']
      }
    ];

    for (const productData of testProducts) {
      const product = await Product.create(productData);
      console.log(`✅ Produit créé: ${product.title} - ${product.price}€`);
    }

    console.log(`🎉 ${testProducts.length} produits de test créés avec succès!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des produits:', error);
  } finally {
    process.exit(0);
  }
}

createTestProducts();
