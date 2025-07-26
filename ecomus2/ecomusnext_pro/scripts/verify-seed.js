#!/usr/bin/env node

// Script de vérification de l'intégrité des données après seed
const mongoose = require('mongoose')

// Import des modèles
const { User } = require('../models/User')
const { Store } = require('../models/Store')
const { Category } = require('../models/Category')
const { Product } = require('../models/Product')
const { Order } = require('../models/Order')

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

// Vérification des utilisateurs
const checkUsers = async () => {
  console.log('\n👤 Vérification des utilisateurs...')
  
  const users = await User.find({})
  console.log(`   Total: ${users.length} utilisateurs`)
  
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ])
  
  usersByRole.forEach(role => {
    console.log(`   ${role._id}: ${role.count}`)
  })
  
  // Vérifier l'admin
  const admin = await User.findOne({ role: 'admin' })
  if (admin) {
    console.log(`   ✅ Admin trouvé: ${admin.email}`)
  } else {
    console.log('   ❌ Aucun admin trouvé')
  }
  
  return users
}

// Vérification des boutiques
const checkStores = async () => {
  console.log('\n🏪 Vérification des boutiques...')
  
  const stores = await Store.find({}).populate('owner', 'name email')
  console.log(`   Total: ${stores.length} boutiques`)
  
  stores.forEach(store => {
    console.log(`   ✅ ${store.name} - Propriétaire: ${store.owner?.name || 'Non défini'}`)
  })
  
  // Vérifier les boutiques actives
  const activeStores = await Store.countDocuments({ isActive: true })
  console.log(`   Actives: ${activeStores}`)
  
  return stores
}

// Vérification des catégories
const checkCategories = async () => {
  console.log('\n📂 Vérification des catégories...')
  
  const categories = await Category.find({})
  console.log(`   Total: ${categories.length} catégories`)
  
  // Catégories principales
  const mainCategories = await Category.find({ parent: { $exists: false } })
  console.log(`   Principales: ${mainCategories.length}`)
  
  // Sous-catégories
  const subCategories = await Category.find({ parent: { $exists: true } })
  console.log(`   Sous-catégories: ${subCategories.length}`)
  
  // Afficher la hiérarchie
  for (const mainCat of mainCategories) {
    console.log(`   📁 ${mainCat.name}`)
    const children = await Category.find({ parent: mainCat._id })
    children.forEach(child => {
      console.log(`      └── ${child.name}`)
    })
  }
  
  return categories
}

// Vérification des produits
const checkProducts = async () => {
  console.log('\n📦 Vérification des produits...')
  
  const products = await Product.find({}).populate('category', 'name').populate('storeId', 'name')
  console.log(`   Total: ${products.length} produits`)
  
  // Produits par boutique
  const productsByStore = await Product.aggregate([
    {
      $lookup: {
        from: 'stores',
        localField: 'storeId',
        foreignField: '_id',
        as: 'store'
      }
    },
    { $unwind: '$store' },
    { $group: { _id: '$store.name', count: { $sum: 1 } } }
  ])
  
  console.log('   Par boutique:')
  productsByStore.forEach(store => {
    console.log(`      ${store._id}: ${store.count} produits`)
  })
  
  // Produits avec images
  const productsWithImages = await Product.countDocuments({ 
    images: { $exists: true, $not: { $size: 0 } } 
  })
  console.log(`   Avec images: ${productsWithImages}`)
  
  // Produits actifs
  const activeProducts = await Product.countDocuments({ isActive: true })
  console.log(`   Actifs: ${activeProducts}`)
  
  // Vérifier les prix
  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ])
  
  if (priceStats.length > 0) {
    const stats = priceStats[0]
    console.log(`   Prix moyen: ${stats.avgPrice.toFixed(2)}€`)
    console.log(`   Prix min: ${stats.minPrice}€`)
    console.log(`   Prix max: ${stats.maxPrice}€`)
  }
  
  return products
}

// Vérification des commandes
const checkOrders = async () => {
  console.log('\n🛒 Vérification des commandes...')
  
  const orders = await Order.find({}).populate('userId', 'name email')
  console.log(`   Total: ${orders.length} commandes`)
  
  // Commandes par statut
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])
  
  console.log('   Par statut:')
  ordersByStatus.forEach(status => {
    console.log(`      ${status._id}: ${status.count}`)
  })
  
  // Chiffre d'affaires total
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$total' } } }
  ])
  
  if (totalRevenue.length > 0) {
    console.log(`   Chiffre d'affaires total: ${totalRevenue[0].total.toFixed(2)}€`)
  }
  
  return orders
}

// Vérification des relations
const checkRelations = async () => {
  console.log('\n🔗 Vérification des relations...')
  
  // Produits sans catégorie
  const productsWithoutCategory = await Product.countDocuments({ 
    $or: [
      { category: { $exists: false } },
      { category: null }
    ]
  })
  console.log(`   Produits sans catégorie: ${productsWithoutCategory}`)
  
  // Produits sans boutique
  const productsWithoutStore = await Product.countDocuments({ 
    $or: [
      { storeId: { $exists: false } },
      { storeId: null }
    ]
  })
  console.log(`   Produits sans boutique: ${productsWithoutStore}`)
  
  // Boutiques sans propriétaire
  const storesWithoutOwner = await Store.countDocuments({ 
    $or: [
      { owner: { $exists: false } },
      { owner: null }
    ]
  })
  console.log(`   Boutiques sans propriétaire: ${storesWithoutOwner}`)
  
  // Commandes sans utilisateur
  const ordersWithoutUser = await Order.countDocuments({ 
    $or: [
      { userId: { $exists: false } },
      { userId: null }
    ]
  })
  console.log(`   Commandes sans utilisateur: ${ordersWithoutUser}`)
}

// Vérification des index
const checkIndexes = async () => {
  console.log('\n📊 Vérification des index...')
  
  const collections = ['users', 'stores', 'categories', 'products', 'orders']
  
  for (const collectionName of collections) {
    try {
      const indexes = await mongoose.connection.db.collection(collectionName).indexes()
      console.log(`   ${collectionName}: ${indexes.length} index(es)`)
      
      // Afficher les index importants
      indexes.forEach(index => {
        const keys = Object.keys(index.key).join(', ')
        if (keys !== '_id') {
          const unique = index.unique ? ' (unique)' : ''
          console.log(`      - ${keys}${unique}`)
        }
      })
    } catch (error) {
      console.log(`   ${collectionName}: Collection non trouvée`)
    }
  }
}

// Statistiques générales
const checkStats = async () => {
  console.log('\n📈 Statistiques générales...')
  
  // Taille de la base
  const stats = await mongoose.connection.db.stats()
  console.log(`   Taille de la DB: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   Nombre de collections: ${stats.collections}`)
  console.log(`   Nombre d'index: ${stats.indexes}`)
  
  // Documents par collection
  const collections = ['users', 'stores', 'categories', 'products', 'orders']
  for (const collectionName of collections) {
    try {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments()
      console.log(`   ${collectionName}: ${count} documents`)
    } catch (error) {
      console.log(`   ${collectionName}: 0 documents`)
    }
  }
}

// Fonction principale de vérification
const verifyDatabase = async () => {
  console.log('🔍 Vérification de l\'intégrité de la base de données...')
  
  try {
    await connectDB()
    
    const users = await checkUsers()
    const stores = await checkStores()
    const categories = await checkCategories()
    const products = await checkProducts()
    const orders = await checkOrders()
    
    await checkRelations()
    await checkIndexes()
    await checkStats()
    
    console.log('\n✅ Vérification terminée avec succès!')
    
    // Résumé final
    console.log('\n📋 Résumé:')
    console.log(`   👤 ${users.length} utilisateurs`)
    console.log(`   🏪 ${stores.length} boutiques`)
    console.log(`   📂 ${categories.length} catégories`)
    console.log(`   📦 ${products.length} produits`)
    console.log(`   🛒 ${orders.length} commandes`)
    
    console.log('\n🎯 La base de données est prête pour l\'utilisation!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Déconnexion MongoDB')
    process.exit(0)
  }
}

// Exécution du script
if (require.main === module) {
  verifyDatabase()
}

module.exports = { verifyDatabase }
