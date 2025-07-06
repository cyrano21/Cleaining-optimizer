// Script de seed simplifié avec Cloudinary - Version fonctionnelle
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const slugify = require('slugify')
const { v2: cloudinary } = require('cloudinary')
require('dotenv').config({ path: '.env.local' })

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Schémas Mongoose simplifiés
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendor', 'client'], default: 'client' },
  slug: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  emailVerified: Date
}, { timestamps: true })

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  comparePrice: Number,
  images: [String], // URLs Cloudinary
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  inventory: {
    quantity: { type: Number, default: 50 },
    trackQuantity: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  brand: String
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' }
}, { timestamps: true })

// Modèles
const User = mongoose.model('User', userSchema)
const Store = mongoose.model('Store', storeSchema) 
const Category = mongoose.model('Category', categorySchema)
const Product = mongoose.model('Product', productSchema)
const Order = mongoose.model('Order', orderSchema)

// Import des données
const { products1, products2, products3, products4, products5, products6, products7 } = require('../data/products')

// Configuration MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connecté')
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error)
    process.exit(1)
  }
}

// Cache des images
const imageCache = new Map()

// Upload vers Cloudinary
const uploadToCloudinary = async (imageUrl, folder = 'ecomus') => {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)
  }

  try {
    console.log(`📤 Upload: ${imageUrl.substring(0, 60)}...`)
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }]
    })
    
    console.log(`✅ Uploadé: ${result.secure_url}`)
    imageCache.set(imageUrl, result.secure_url)
    
    // Délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return result.secure_url
  } catch (error) {
    console.error(`❌ Erreur upload:`, error.message)
    return imageUrl // Fallback
  }
}

// Créer un slug unique
const createSlug = (text, existingSlugs = []) => {
  let baseSlug = slugify(text, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  existingSlugs.push(slug)
  return slug
}

// Données par défaut
const defaultUsers = [
  { name: 'Admin', email: 'admin@ecomus.com', password: 'admin123', role: 'admin' },
  { name: 'Vendor Demo', email: 'vendor@ecomus.com', password: 'vendor123', role: 'vendor' },
  { name: 'Client Demo', email: 'client@ecomus.com', password: 'client123', role: 'client' }
]

const defaultStores = [
  { name: 'Ecomus Store', description: 'Boutique principale' },
  { name: 'Fashion Green', description: 'Mode éthique' }
]

const defaultCategories = [
  { name: 'Vêtements', description: 'Mode et textile' },
  { name: 'Accessoires', description: 'Bijoux et accessoires' },
  { name: 'Chaussures', description: 'Chaussures pour tous' },
  { name: 'Maison', description: 'Décoration' },
  { name: 'Sport', description: 'Équipements sportifs' },
  { name: 'Beauté', description: 'Cosmétiques' }
]

// Seed des utilisateurs
const seedUsers = async () => {
  console.log('🌱 Création des utilisateurs...')
  await User.deleteMany({})
  
  const users = []
  const usedSlugs = []
  
  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const slug = createSlug(userData.name, usedSlugs)
    
    users.push(new User({
      ...userData,
      password: hashedPassword,
      slug,
      emailVerified: new Date()
    }))
  }
  
  await User.insertMany(users)
  console.log(`✅ ${users.length} utilisateurs créés`)
  return users
}

// Seed des boutiques
const seedStores = async (users) => {
  console.log('🌱 Création des boutiques...')
  await Store.deleteMany({})
  
  const vendors = users.filter(user => user.role === 'vendor')
  const stores = []
  const usedSlugs = []
  
  for (let i = 0; i < defaultStores.length && i < vendors.length; i++) {
    const storeData = defaultStores[i]
    const vendor = vendors[i]
    const slug = createSlug(storeData.name, usedSlugs)
    
    stores.push(new Store({
      ...storeData,
      slug,
      owner: vendor._id,
      isActive: true
    }))
  }
  
  await Store.insertMany(stores)
  console.log(`✅ ${stores.length} boutiques créées`)
  return stores
}

// Seed des catégories
const seedCategories = async () => {
  console.log('🌱 Création des catégories...')
  await Category.deleteMany({})
  
  const categories = []
  const usedSlugs = []
  
  for (const categoryData of defaultCategories) {
    const slug = createSlug(categoryData.name, usedSlugs)
    
    categories.push(new Category({
      ...categoryData,
      slug,
      isActive: true
    }))
  }
  
  await Category.insertMany(categories)
  console.log(`✅ ${categories.length} catégories créées`)
  return categories
}

// Seed des produits avec Cloudinary
const seedProducts = async (stores, categories) => {
  console.log('🌱 Création des produits avec Cloudinary...')
  await Product.deleteMany({})
  
  const allProducts = [
    ...(products1 || []),
    ...(products2 || []),
    ...(products3 || []),
    ...(products4 || []),
    ...(products5 || []),
    ...(products6 || []),
    ...(products7 || [])
  ]
  
  console.log(`📦 ${allProducts.length} produits disponibles`)
  
  const products = []
  const usedSlugs = []
  
  // Limiter à 20 produits pour le test
  const productsToProcess = allProducts.slice(0, 20)
  
  for (let i = 0; i < productsToProcess.length; i++) {
    const productData = productsToProcess[i]
    const store = stores[i % stores.length]
    const category = categories[i % categories.length]
    
    try {
      console.log(`\n🔄 Produit ${i + 1}/${productsToProcess.length}: ${productData.title}`)
      
      // Upload des images vers Cloudinary
      const images = []
      
      if (productData.imgSrc && productData.imgSrc.includes('unsplash.com')) {
        const mainImage = await uploadToCloudinary(productData.imgSrc, 'ecomus/products')
        images.push(mainImage)
      }
      
      if (productData.imgHoverSrc && productData.imgHoverSrc.includes('unsplash.com')) {
        const hoverImage = await uploadToCloudinary(productData.imgHoverSrc, 'ecomus/products')
        images.push(hoverImage)
      }
      
      const slug = createSlug(productData.title, usedSlugs)
      
      const product = new Product({
        title: productData.title,
        slug,
        description: `${productData.title} - Produit écologique de qualité`,
        price: productData.price || 19.99,
        comparePrice: productData.comparePrice || (productData.price * 1.2),
        images: images.filter(Boolean),
        category: category._id,
        store: store._id,
        inventory: {
          quantity: Math.floor(Math.random() * 100) + 10,
          trackQuantity: true
        },
        isActive: productData.isAvailable !== false,
        isFeatured: productData.filterCategories?.includes('Best seller') || false,
        tags: productData.filterCategories || ['Nouveau'],
        brand: productData.brand || 'Ecomus'
      })
      
      products.push(product)
      
    } catch (error) {
      console.error(`❌ Erreur produit ${productData.title}:`, error.message)
    }
  }
  
  await Product.insertMany(products)
  console.log(`✅ ${products.length} produits créés avec images Cloudinary`)
  return products
}

// Seed des commandes
const seedOrders = async (users, products) => {
  console.log('🌱 Création des commandes...')
  await Order.deleteMany({})
  
  const clients = users.filter(user => user.role === 'client')
  const orders = []
  
  for (let i = 0; i < 5; i++) {
    const client = clients[i % clients.length]
    const orderProducts = products.slice(i * 2, i * 2 + 3).map(product => ({
      product: product._id,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.price
    }))
    
    const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    orders.push(new Order({
      orderNumber: `ECM-${Date.now()}-${i}`,
      customer: client._id,
      items: orderProducts,
      total: total,
      status: ['pending', 'confirmed', 'shipped'][i % 3],
      paymentStatus: ['pending', 'paid'][i % 2]
    }))
  }
  
  await Order.insertMany(orders)
  console.log(`✅ ${orders.length} commandes créées`)
  return orders
}

// Fonction principale
const seedDatabase = async () => {
  try {
    console.log('🚀 Seed avec Cloudinary - Version Simplifiée')
    
    await connectDB()
    
    // Test Cloudinary
    try {
      const cloudinaryTest = await cloudinary.api.ping()
      console.log('✅ Cloudinary connecté:', cloudinaryTest.status)
    } catch (error) {
      console.warn('⚠️ Avertissement Cloudinary:', error.message)
    }
    
    // Seed complet
    const users = await seedUsers()
    const stores = await seedStores(users)
    const categories = await seedCategories()
    const products = await seedProducts(stores, categories)
    const orders = await seedOrders(users, products)
    
    console.log('\n🎉 Seed terminé avec succès !')
    console.log('📊 Résumé:')
    console.log(`   👤 ${users.length} utilisateurs`)
    console.log(`   🏪 ${stores.length} boutiques`) 
    console.log(`   📂 ${categories.length} catégories`)
    console.log(`   📦 ${products.length} produits avec images Cloudinary`)
    console.log(`   🛒 ${orders.length} commandes`)
    console.log(`   🖼️ ${imageCache.size} images uploadées`)
    
    console.log('\n🔑 Comptes de test:')
    console.log('   Admin: admin@ecomus.com / admin123')
    console.log('   Vendor: vendor@ecomus.com / vendor123')
    console.log('   Client: client@ecomus.com / client123')
    
    console.log('\n☁️ Images Cloudinary:')
    console.log(`   URL: https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`)
    
  } catch (error) {
    console.error('❌ Erreur seed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnexion MongoDB')
    process.exit(0)
  }
}

// Exécution
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
