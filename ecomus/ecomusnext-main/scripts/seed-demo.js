#!/usr/bin/env node

// Script de seed en mode démo (sans connexion MongoDB réelle)
// Utile pour voir la structure des données transformées

const bcrypt = require('bcryptjs')
const slugify = require('slugify')

// Import des données existantes
const { products1 } = require('../data/products')
const { collections, collectionData } = require('../data/categories')

console.log('🚀 Démonstration du processus de seed...\n')

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

// Fonction pour hasher les mots de passe
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

// Données utilisateurs par défaut
const defaultUsers = [
  {
    name: 'Super Admin',
    email: 'admin@ecomus.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Boutique Mode',
    email: 'vendor1@ecomus.com',
    password: 'vendor123',
    role: 'vendor'
  },
  {
    name: 'Tech Store',
    email: 'vendor2@ecomus.com', 
    password: 'vendor123',
    role: 'vendor'
  },
  {
    name: 'Client Test',
    email: 'client@ecomus.com',
    password: 'client123',
    role: 'client'
  }
]

// Boutiques par défaut
const defaultStores = [
  {
    name: 'Boutique Mode Premium',
    description: 'Vêtements et accessoires de mode haut de gamme',
    settings: {
      currency: 'EUR',
      language: 'fr',
      allowReviews: true,
      autoApproveProducts: false
    }
  },
  {
    name: 'Tech & Gadgets Store',
    description: 'Accessoires technologiques et gadgets innovants',
    settings: {
      currency: 'EUR', 
      language: 'fr',
      allowReviews: true,
      autoApproveProducts: true
    }
  }
]

// Catégories par défaut
const defaultCategories = [
  { name: 'Vêtements', description: 'Tous les vêtements' },
  { name: 'Accessoires', description: 'Accessoires de mode' },
  { name: 'Chaussures', description: 'Toutes les chaussures' },
  { name: 'Sacs', description: 'Sacs et bagagerie' },
  { name: 'T-shirts', description: 'T-shirts et hauts', parent: 'Vêtements' },
  { name: 'Débardeurs', description: 'Débardeurs et tops', parent: 'Vêtements' },
  { name: 'Baskets', description: 'Chaussures de sport', parent: 'Chaussures' }
]

// Démonstration de création des utilisateurs
async function demoUsers() {
  console.log('👤 Création des utilisateurs de démonstration:')
  const users = []
  const usedSlugs = []
  
  for (const userData of defaultUsers) {
    const hashedPassword = await hashPassword(userData.password)
    const slug = createUniqueSlug(userData.name, usedSlugs)
    
    const user = {
      ...userData,
      password: hashedPassword,
      slug,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    users.push(user)
    console.log(`   ✅ ${user.name} (${user.role}) - ${user.email}`)
  }
  
  return users
}

// Démonstration de création des boutiques
function demoStores(users) {
  console.log('\n🏪 Création des boutiques:')
  const vendors = users.filter(user => user.role === 'vendor')
  const stores = []
  const usedSlugs = []
  
  defaultStores.forEach((storeData, index) => {
    if (vendors[index]) {
      const slug = createUniqueSlug(storeData.name, usedSlugs)
      const store = {
        ...storeData,
        slug,
        owner: vendors[index].email, // Simule l'ObjectId
        isActive: true,
        analytics: {
          totalSales: 0,
          totalOrders: 0,
          totalProducts: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      stores.push(store)
      console.log(`   ✅ ${store.name} - Propriétaire: ${vendors[index].name}`)
    }
  })
  
  return stores
}

// Démonstration de création des catégories
function demoCategories() {
  console.log('\n📂 Création des catégories:')
  const categories = []
  const usedSlugs = []
  const categoryMap = new Map()
  
  // D'abord les catégories principales
  for (const catData of defaultCategories.filter(cat => !cat.parent)) {
    const slug = createUniqueSlug(catData.name, usedSlugs)
    const category = {
      name: catData.name,
      slug,
      description: catData.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    categories.push(category)
    categoryMap.set(catData.name, category)
    console.log(`   ✅ ${category.name} (catégorie principale)`)
  }
  
  // Ensuite les sous-catégories
  for (const catData of defaultCategories.filter(cat => cat.parent)) {
    const parentCategory = categoryMap.get(catData.parent)
    if (!parentCategory) continue
    
    const slug = createUniqueSlug(catData.name, usedSlugs)
    const category = {
      name: catData.name,
      slug,
      description: catData.description,
      parent: catData.parent, // Simule l'ObjectId
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    categories.push(category)
    categoryMap.set(catData.name, category)
    console.log(`   ✅ ${category.name} (sous-catégorie de ${catData.parent})`)
  }
  
  return categories
}

// Démonstration de transformation des produits
function demoProducts(stores, categories) {
  console.log('\n📦 Transformation des produits existants:')
  
  if (!products1 || products1.length === 0) {
    console.log('   ⚠️ Aucun produit trouvé dans products1')
    return []
  }
  
  const transformedProducts = []
  const usedSlugs = []
  
  // Prendre les 5 premiers produits pour la démo
  const sampleProducts = products1.slice(0, 5)
  
  for (const product of sampleProducts) {
    if (!product.title || !product.price) continue
    
    // Assigner aléatoirement à une boutique
    const randomStore = stores[Math.floor(Math.random() * stores.length)]
    
    // Déterminer la catégorie
    let categoryId = categories.find(c => c.name === 'Vêtements')?.name
    const title = product.title.toLowerCase()
    if (title.includes('tank') || title.includes('top')) {
      categoryId = categories.find(c => c.name === 'Débardeurs')?.name
    } else if (title.includes('shirt')) {
      categoryId = categories.find(c => c.name === 'T-shirts')?.name
    }
    
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
    
    const transformedProduct = {
      name: product.title,
      slug,
      description: `${product.title} - Produit de qualité premium disponible dans notre boutique.`,
      price: parseFloat(product.price),
      images,
      category: categoryId,
      storeId: randomStore.name, // Simule l'ObjectId
      inventory: {
        quantity: Math.floor(Math.random() * 100) + 20,
        lowStockThreshold: 5
      },
      tags: product.filterCategories || [],
      brand: product.brand || 'Ecomus',
      isActive: product.isAvailable !== false,
      seo: {
        title: product.title,
        description: `Achetez ${product.title} - Livraison gratuite et retours faciles`,
        keywords: [product.title, product.brand || 'Ecomus', 'mode', 'qualité']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    transformedProducts.push(transformedProduct)
    console.log(`   ✅ ${transformedProduct.name} - ${transformedProduct.price}€ (${randomStore.name})`)
  }
  
  return transformedProducts
}

// Fonction principale de démonstration
async function runDemo() {
  try {
    const users = await demoUsers()
    const stores = demoStores(users)
    const categories = demoCategories()
    const products = demoProducts(stores, categories)
    
    console.log('\n🎉 Démonstration terminée!')
    console.log('📊 Résumé des données qui seraient créées:')
    console.log(`   👤 ${users.length} utilisateurs`)
    console.log(`   🏪 ${stores.length} boutiques`)
    console.log(`   📂 ${categories.length} catégories`)
    console.log(`   📦 ${products.length} produits (échantillon de ${products1?.length || 0} disponibles)`)
    
    console.log('\n🔑 Comptes de test qui seraient créés:')
    console.log('   Admin: admin@ecomus.com / admin123')
    console.log('   Vendor: vendor1@ecomus.com / vendor123')
    console.log('   Client: client@ecomus.com / client123')
    
    console.log('\n📝 Structure des données:')
    console.log('   - Tous les mots de passe sont hashés avec bcrypt')
    console.log('   - Tous les slugs sont uniques et SEO-friendly')
    console.log('   - Les produits sont répartis entre les boutiques')
    console.log('   - Les images Unsplash sont conservées')
    console.log('   - Les catégories suivent une hiérarchie parent/enfant')
    
    console.log('\n🚀 Pour lancer le seed réel avec MongoDB:')
    console.log('   1. Démarrer MongoDB: ./scripts/start-mongodb.sh')
    console.log('   2. Configurer .env.local avec l\'URI MongoDB')  
    console.log('   3. Lancer: node scripts/seed-complete.js')
    
  } catch (error) {
    console.error('❌ Erreur lors de la démonstration:', error)
  }
}

// Exécuter la démonstration
if (require.main === module) {
  runDemo()
}

module.exports = { runDemo }
