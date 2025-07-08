const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const slugify = require('slugify')

// Import des modèles
const { User } = require('../models/User')
const { Store } = require('../models/Store')
const { Category } = require('../models/Category')
const { Product } = require('../models/Product')
const { Order } = require('../models/Order')

// Import des données existantes
const { products1, products2, products3, products4, products5, products6, products7 } = require('../data/products')
const { collections, collectionData } = require('../data/categories')

// Configuration de MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-saas'
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connecté')
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error)
    process.exit(1)
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
    name: 'Boutique Éco',
    email: 'vendor1@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    isActive: true
  },
  {
    name: 'Fashion Store',
    email: 'vendor2@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    isActive: true
  },
  {
    name: 'Tech Accessories',
    email: 'vendor3@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    isActive: true
  },
  {
    name: 'Client Test',
    email: 'client@ecomus.com',
    password: 'client123',
    role: 'client',
    isActive: true
  }
]

const defaultStores = [
  {
    name: 'Boutique Éco',
    description: 'Produits écologiques et durables pour un mode de vie responsable',
    category: 'Écologie',
    settings: {
      currency: 'EUR',
      language: 'fr',
      timezone: 'Europe/Paris'
    },
    isActive: true
  },
  {
    name: 'Fashion Store',
    description: 'Mode tendance et accessoires pour tous les styles',
    category: 'Mode',
    settings: {
      currency: 'EUR',
      language: 'fr',
      timezone: 'Europe/Paris'
    },
    isActive: true
  },
  {
    name: 'Tech Accessories',
    description: 'Accessoires technologiques et gadgets innovants',
    category: 'Technologie',
    settings: {
      currency: 'EUR',
      language: 'fr',
      timezone: 'Europe/Paris'
    },
    isActive: true
  }
]

const defaultCategories = [
  {
    name: 'Vêtements',
    description: 'Tous types de vêtements'
  },
  {
    name: 'T-shirts',
    description: 'T-shirts et hauts',
    parent: 'Vêtements'
  },
  {
    name: 'Débardeurs',
    description: 'Débardeurs et tops',
    parent: 'Vêtements'
  },
  {
    name: 'Accessoires',
    description: 'Accessoires de mode'
  },
  {
    name: 'Lunettes',
    description: 'Lunettes de soleil et optiques',
    parent: 'Accessoires'
  },
  {
    name: 'Sacs',
    description: 'Sacs et maroquinerie',
    parent: 'Accessoires'
  },
  {
    name: 'Chaussures',
    description: 'Chaussures pour tous'
  },
  {
    name: 'Baskets',
    description: 'Chaussures de sport',
    parent: 'Chaussures'
  }
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
      ownerId: vendor._id,
      createdBy: vendor._id
    })
    
    stores.push(store)
    
    // Mettre à jour l'utilisateur avec le storeId
    await User.findByIdAndUpdate(vendor._id, { storeId: store._id })
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
  const categoryMap = new Map()
  
  // Créer d'abord les catégories parentes
  for (const catData of defaultCategories.filter(cat => !cat.parent)) {
    const slug = createUniqueSlug(catData.name, usedSlugs)
    
    const category = new Category({
      name: catData.name,
      slug,
      description: catData.description,
      isActive: true
    })
    
    categories.push(category)
    categoryMap.set(catData.name, category)
  }
  
  // Ensuite créer les sous-catégories
  for (const catData of defaultCategories.filter(cat => cat.parent)) {
    const parentCategory = categoryMap.get(catData.parent)
    if (!parentCategory) continue
    
    const slug = createUniqueSlug(catData.name, usedSlugs)
    
    const category = new Category({
      name: catData.name,
      slug,
      description: catData.description,
      parent: parentCategory._id,
      isActive: true
    })
    
    categories.push(category)
    categoryMap.set(catData.name, category)
  }
  
  await Category.insertMany(categories)
  console.log(`✅ ${categories.length} catégories créées`)
  
  return categories
}

// Transformation des produits existants
const transformProducts = (productArrays, stores, categories) => {
  const allProducts = [
    ...(productArrays.products1 || []),
    ...(productArrays.products2 || []),
    ...(productArrays.products3 || []),
    ...(productArrays.products4 || []),
    ...(productArrays.products5 || []),
    ...(productArrays.products6 || []),
    ...(productArrays.products7 || [])
  ]
  
  const transformedProducts = []
  const usedSlugs = []
  
  // Catégories par défaut pour mapper
  const categoryMapping = {
    'tank': categories.find(c => c.name === 'Débardeurs')?._id,
    'shirt': categories.find(c => c.name === 'T-shirts')?._id,
    't-shirt': categories.find(c => c.name === 'T-shirts')?._id,
    'top': categories.find(c => c.name === 'Débardeurs')?._id,
    'bag': categories.find(c => c.name === 'Sacs')?._id,
    'accessory': categories.find(c => c.name === 'Accessoires')?._id,
    'shoe': categories.find(c => c.name === 'Baskets')?._id
  }
  
  for (const product of allProducts) {
    if (!product.title || !product.price) continue
    
    // Déterminer la catégorie
    let categoryId = categories.find(c => c.name === 'Vêtements')?._id
    const title = product.title.toLowerCase()
    
    for (const [keyword, catId] of Object.entries(categoryMapping)) {
      if (title.includes(keyword) && catId) {
        categoryId = catId
        break
      }
    }
    
    // Assigner aléatoirement à une boutique
    const randomStore = stores[Math.floor(Math.random() * stores.length)]
    
    // Créer le slug
    const slug = createUniqueSlug(product.title, usedSlugs)
    
    // Gérer les images
    const images = []
    if (product.imgSrc && !product.imgSrc.includes('placeholder')) {
      images.push(product.imgSrc)
    }
    if (product.imgHoverSrc && !product.imgHoverSrc.includes('placeholder')) {
      images.push(product.imgHoverSrc)
    }
    if (product.colors) {
      product.colors.forEach(color => {
        if (color.imgSrc && !color.imgSrc.includes('placeholder')) {
          images.push(color.imgSrc)
        }
      })
    }
    
    // Si pas d'images valides, utiliser une image par défaut
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop')
    }
    
    // Créer les variants
    const variants = []
    if (product.colors && product.sizes) {
      product.colors.forEach(color => {
        product.sizes.forEach(size => {
          variants.push({
            name: `${color.name} - ${size}`,
            attributes: {
              color: color.name,
              size: size
            },
            price: product.price,
            sku: `${slug}-${color.name.toLowerCase()}-${size.toLowerCase()}`,
            inventory: {
              quantity: Math.floor(Math.random() * 50) + 10
            }
          })
        })
      })
    }
    
    const transformedProduct = {
      name: product.title,
      slug,
      description: `${product.title} - Produit de qualité premium disponible dans notre boutique.`,
      price: parseFloat(product.price),
      images,
      category: categoryId,
      storeId: randomStore._id,
      inventory: {
        quantity: Math.floor(Math.random() * 100) + 20,
        lowStockThreshold: 5
      },
      variants: variants.length > 0 ? variants : undefined,
      tags: product.filterCategories || [],
      brand: product.brand || 'Ecomus',
      isActive: product.isAvailable !== false,
      seo: {
        title: product.title,
        description: `Achetez ${product.title} - Livraison gratuite et retours faciles`,
        keywords: [product.title, product.brand || 'Ecomus', 'mode', 'qualité']
      }
    }
    
    transformedProducts.push(transformedProduct)
  }
  
  return transformedProducts
}

// Seed des produits
const seedProducts = async (stores, categories) => {
  console.log('🌱 Création des produits...')
  
  await Product.deleteMany({})
  
  const productData = {
    products1,
    products2: require('../data/products').products2 || [],
    products3: require('../data/products').products3 || [],
    products4: require('../data/products').products4 || [],
    products5: require('../data/products').products5 || [],
    products6: require('../data/products').products6 || [],
    products7: require('../data/products').products7 || []
  }
  
  const products = transformProducts(productData, stores, categories)
  
  if (products.length > 0) {
    await Product.insertMany(products)
    console.log(`✅ ${products.length} produits créés`)
  } else {
    console.log('⚠️ Aucun produit à créer')
  }
  
  return products
}

// Seed des commandes d'exemple
const seedOrders = async (users, products) => {
  console.log('🌱 Création des commandes d\'exemple...')
  
  await Order.deleteMany({})
  
  const clients = users.filter(user => user.role === 'client')
  if (clients.length === 0 || products.length === 0) {
    console.log('⚠️ Pas de clients ou de produits pour créer des commandes')
    return []
  }
  
  const orders = []
  
  // Créer quelques commandes d'exemple
  for (let i = 0; i < 5; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)]
    const numItems = Math.floor(Math.random() * 3) + 1
    const items = []
    let subtotal = 0
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const total = product.price * quantity
      
      items.push({
        productId: product._id,
        storeId: product.storeId,
        name: product.name,
        price: product.price,
        quantity,
        total
      })
      
      subtotal += total
    }
    
    const tax = subtotal * 0.2
    const shipping = 5.99
    const total = subtotal + tax + shipping
    
    const order = new Order({
      customerId: client._id,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        zipCode: '75001',
        country: 'France'
      },
      billingAddress: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        zipCode: '75001',
        country: 'France'
      }
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
    console.log('🚀 Début du seed de la base de données...')
    
    await connectDB()
    
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
    console.log(`   📦 ${products.length} produits`)
    console.log(`   🛒 ${orders.length} commandes`)
    
    console.log('\n🔑 Comptes de test:')
    console.log('   Admin: admin@ecomus.com / admin123')
    console.log('   Vendor: vendor1@ecomus.com / vendor123')
    console.log('   Client: client@ecomus.com / client123')
    
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
  seedUsers,
  seedStores,
  seedCategories,
  seedProducts,
  seedOrders
}
