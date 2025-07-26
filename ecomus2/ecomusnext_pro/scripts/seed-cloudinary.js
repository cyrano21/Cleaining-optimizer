// Script de seed avec upload Cloudinary
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const slugify = require('slugify')
const { v2: cloudinary } = require('cloudinary')
require('dotenv').config({ path: '.env.local' })

// Définition directe des modèles en CommonJS
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit faire au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'client'],
    default: 'client'
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: Date
}, {
  timestamps: true
})

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    theme: {
      type: String,
      default: 'default'
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    language: {
      type: String,
      default: 'fr'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  analytics: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
})

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du produit est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  comparePrice: Number,
  images: [String],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false }
  },
  variants: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    inventory: { type: Number, default: 0 }
  }],
  seo: {
    title: String,
    description: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  brand: String,
  reviews: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String
  }
}, {
  timestamps: true
})

// Création des modèles
const User = mongoose.model('User', userSchema)
const Store = mongoose.model('Store', storeSchema)
const Category = mongoose.model('Category', categorySchema)
const Product = mongoose.model('Product', productSchema)
const Order = mongoose.model('Order', orderSchema)

// Import des données existantes
const { products1, products2, products3, products4, products5, products6, products7 } = require('../data/products')
const { collections, collectionData } = require('../data/categories')

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('🔧 Configuration Cloudinary:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 6) + '...',
  api_secret: process.env.CLOUDINARY_API_SECRET?.slice(0, 6) + '...'
})

// Configuration de MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    console.log('🔗 Connexion à:', mongoUri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
    
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connecté')
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error)
    process.exit(1)
  }
}

// Cache pour éviter de re-uploader les mêmes images
const imageCache = new Map()

// Fonction pour uploader une image vers Cloudinary
const uploadImageToCloudinary = async (imageUrl, folder = 'ecomus') => {
  if (imageCache.has(imageUrl)) {
    console.log(`📎 Image en cache: ${imageUrl}`)
    return imageCache.get(imageUrl)
  }

  try {
    console.log(`📤 Upload vers Cloudinary: ${imageUrl}`)
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' }
      ]
    })
    
    console.log(`✅ Image uploadée: ${result.secure_url}`)
    imageCache.set(imageUrl, result.secure_url)
    
    // Petit délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return result.secure_url
  } catch (error) {
    console.error(`❌ Erreur upload ${imageUrl}:`, error.message)
    return imageUrl // Fallback vers l'URL originale
  }
}

// Fonction pour créer un slug unique
const createUniqueSlug = (text, existingSlugs = []) => {
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
  {
    name: 'Super Admin',
    email: 'admin@ecomus.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Vendor Demo',
    email: 'vendor1@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    isActive: true
  },
  {
    name: 'Client Demo',
    email: 'client@ecomus.com',
    password: 'client123',
    role: 'client',
    isActive: true
  }
]

const defaultStores = [
  {
    name: 'Ecomus Store',
    description: 'Boutique principale Ecomus avec produits écologiques',
    settings: {
      theme: 'default',
      currency: 'EUR',
      language: 'fr'
    }
  },
  {
    name: 'Fashion Green',
    description: 'Mode éthique et durable',
    settings: {
      theme: 'fashion',
      currency: 'EUR',
      language: 'fr'
    }
  }
]

const defaultCategories = [
  { name: 'Vêtements', description: 'Mode et textile' },
  { name: 'Accessoires', description: 'Bijoux et accessoires' },
  { name: 'Chaussures', description: 'Chaussures pour tous' },
  { name: 'Maison', description: 'Décoration et mobilier' },
  { name: 'Sport', description: 'Équipements sportifs' },
  { name: 'Beauté', description: 'Cosmétiques et soins' }
]

// Fonction pour hasher les mots de passe
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

// Seed des utilisateurs
const seedUsers = async () => {
  console.log('🌱 Création des utilisateurs...')
  
  await User.deleteMany({})
  
  const users = []
  const usedSlugs = []
  
  for (const userData of defaultUsers) {
    const hashedPassword = await hashPassword(userData.password)
    const slug = createUniqueSlug(userData.name, usedSlugs)
    
    const user = new User({
      ...userData,
      password: hashedPassword,
      slug,
      emailVerified: new Date()
    })
    
    users.push(user)
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
    const slug = createUniqueSlug(storeData.name, usedSlugs)
    
    const store = new Store({
      ...storeData,
      slug,
      owner: vendor._id,
      isActive: true,
      createdAt: new Date(),
      analytics: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
      }
    })
    
    stores.push(store)
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
    const slug = createUniqueSlug(categoryData.name, usedSlugs)
    
    const category = new Category({
      ...categoryData,
      slug,
      isActive: true,
      products: []
    })
    
    categories.push(category)
  }
  
  await Category.insertMany(categories)
  console.log(`✅ ${categories.length} catégories créées`)
  
  return categories
}

// Seed des produits avec upload Cloudinary
const seedProducts = async (stores, categories) => {
  console.log('🌱 Création des produits avec upload Cloudinary...')
  
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
  
  console.log(`📦 ${allProducts.length} produits à traiter...`)
  
  const products = []
  const usedSlugs = []
  
  // Limiter à 50 produits pour le test
  const productsToProcess = allProducts.slice(0, 50)
  
  for (let i = 0; i < productsToProcess.length; i++) {
    const productData = productsToProcess[i]
    const store = stores[i % stores.length]
    const category = categories[i % categories.length]
    
    try {
      console.log(`\n🔄 Traitement produit ${i + 1}/${productsToProcess.length}: ${productData.title}`)
      
      // Upload de l'image principale
      let mainImageUrl = productData.imgSrc
      if (productData.imgSrc && productData.imgSrc.includes('unsplash.com')) {
        mainImageUrl = await uploadImageToCloudinary(productData.imgSrc, `ecomus/products`)
      }
      
      // Upload de l'image hover
      let hoverImageUrl = productData.imgHoverSrc
      if (productData.imgHoverSrc && productData.imgHoverSrc.includes('unsplash.com')) {
        hoverImageUrl = await uploadImageToCloudinary(productData.imgHoverSrc, `ecomus/products`)
      }
      
      // Upload des images des variants (couleurs, tailles, etc.)
      const variants = []
      
      // Gestion des couleurs
      if (productData.colors && Array.isArray(productData.colors)) {
        for (const color of productData.colors) {
          try {
            let colorImageUrl = color.imgSrc
            if (color.imgSrc && color.imgSrc.includes('unsplash.com')) {
              colorImageUrl = await uploadImageToCloudinary(color.imgSrc, `ecomus/products/colors`)
            }
            
            variants.push({
              name: String(color.name || 'Couleur'),
              type: 'color',
              value: String(color.name ? color.name.toLowerCase().replace(/\s+/g, '-') : 'default'),
              image: String(colorImageUrl || mainImageUrl || ''),
              price: Number(productData.price || 19.99),
              inventory: Number(Math.floor(Math.random() * 50) + 5)
            })
          } catch (error) {
            console.warn(`⚠️ Erreur variant couleur ${color.name}:`, error.message)
          }
        }
      }
      
      // Gestion des tailles si disponibles
      if (productData.sizes && Array.isArray(productData.sizes)) {
        for (const size of productData.sizes) {
          variants.push({
            name: String(size.name || size),
            type: 'size',
            value: String(typeof size === 'string' ? size.toLowerCase() : size.name?.toLowerCase() || 'default'),
            image: String(mainImageUrl || ''),
            price: Number(productData.price || 19.99),
            inventory: Number(Math.floor(Math.random() * 30) + 10)
          })
        }
      }
      
      // Si pas de variants, créer un variant par défaut
      if (variants.length === 0) {
        variants.push({
          name: 'Standard',
          type: 'default',
          value: 'standard',
          image: String(mainImageUrl || ''),
          price: Number(productData.price || 19.99),
          inventory: Number(Math.floor(Math.random() * 100) + 20)
        })
      }
      
      const slug = createUniqueSlug(productData.title, usedSlugs)
      
      const product = new Product({
        title: productData.title,
        slug,
        description: `${productData.title} - Produit écologique de qualité premium`,
        price: productData.price || 19.99,
        comparePrice: productData.comparePrice || productData.price * 1.2,
        images: [mainImageUrl, hoverImageUrl].filter(Boolean),
        category: category._id,
        store: store._id,
        inventory: {
          quantity: Math.floor(Math.random() * 100) + 10,
          trackQuantity: true,
          allowBackorder: false
        },
        variants: variants,
        seo: {
          title: productData.title,
          description: `Découvrez ${productData.title} - Produit écologique`
        },
        isActive: productData.isAvailable !== false,
        isFeatured: productData.filterCategories?.includes('Best seller') || false,
        tags: productData.filterCategories || ['Nouveau'],
        brand: productData.brand || 'Ecomus',
        reviews: {
          averageRating: Math.random() * 2 + 3, // Entre 3 et 5
          totalReviews: Math.floor(Math.random() * 100),
          reviews: []
        },
        createdAt: new Date()
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
  console.log('🌱 Création des commandes de test...')
  
  await Order.deleteMany({})
  
  const clients = users.filter(user => user.role === 'client')
  const orders = []
  
  for (let i = 0; i < 10; i++) {
    const client = clients[i % clients.length]
    const orderProducts = products.slice(i * 2, i * 2 + 3).map(product => ({
      product: product._id,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.price
    }))
    
    const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const order = new Order({
      orderNumber: `ECM-${Date.now()}-${i}`,
      customer: client._id,
      items: orderProducts,
      totals: {
        subtotal: total,
        tax: total * 0.2,
        shipping: 5.99,
        total: total * 1.2 + 5.99
      },
      status: ['pending', 'confirmed', 'shipped', 'delivered'][i % 4],
      paymentStatus: ['pending', 'paid', 'failed'][i % 3],
      shippingAddress: {
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ')[1] || '',
        email: client.email,
        phone: '+33123456789',
        address: '123 Rue Example',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    })
    
    orders.push(order)
  }
  
  await Order.insertMany(orders)
  console.log(`✅ ${orders.length} commandes créées`)
  
  return orders
}

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    console.log('🚀 Début du seed avec Cloudinary...')
    
    // Connexion à MongoDB
    await connectDB()
    
    // Test de connexion Cloudinary
    try {
      const cloudinaryTest = await cloudinary.api.ping()
      console.log('✅ Cloudinary connecté:', cloudinaryTest)
    } catch (error) {
      console.warn('⚠️ Avertissement Cloudinary:', error.message)
    }
    
    // Nettoyer toutes les collections
    console.log('🧹 Nettoyage de la base de données...')
    await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({})
    ])
    
    // Seed dans l'ordre de dépendance
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
    console.log(`   🖼️ ${imageCache.size} images uploadées vers Cloudinary`)
    
    console.log('\n🔑 Comptes de test:')
    console.log('   Admin: admin@ecomus.com / admin123')
    console.log('   Vendor: vendor1@ecomus.com / vendor123')
    console.log('   Client: client@ecomus.com / client123')
    
    console.log('\n☁️ Images Cloudinary:')
    console.log(`   Dossier: ecomus/`)
    console.log(`   URL base: https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`)
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnexion MongoDB')
    process.exit(0)
  }
}

// Exécution du script
if (require.main === module) {
  seedDatabase()
}

module.exports = {
  seedDatabase,
  uploadImageToCloudinary
}
