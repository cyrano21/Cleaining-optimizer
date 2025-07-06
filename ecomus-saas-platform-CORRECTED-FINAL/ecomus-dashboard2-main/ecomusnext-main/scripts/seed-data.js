const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Import des modèles
const { User } = require('../models/User')
const { Store } = require('../models/Store')
const { Category } = require('../models/Category')
const { Product } = require('../models/Product')

// Import des données existantes
const productsData = require('../data/products')
const categoriesData = require('../data/categories')

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus'

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connexion MongoDB établie')
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error)
    process.exit(1)
  }
}

async function seedUsers() {
  console.log('👥 Création des utilisateurs...')
  
  // Supprimer les utilisateurs existants
  await User.deleteMany({})
  
  const users = [
    {
      name: 'Admin Ecomus',
      email: 'admin@ecomus.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      isActive: true,
      preferences: {
        language: 'fr',
        currency: 'EUR',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    },
    {
      name: 'Boutique Nature',
      email: 'vendor1@ecomus.com',
      password: await bcrypt.hash('vendor123', 12),
      role: 'vendor',
      isActive: true,
      preferences: {
        language: 'fr',
        currency: 'EUR'
      }
    },
    {
      name: 'Éco Produits',
      email: 'vendor2@ecomus.com',
      password: await bcrypt.hash('vendor123', 12),
      role: 'vendor',
      isActive: true,
      preferences: {
        language: 'fr',
        currency: 'EUR'
      }
    },
    {
      name: 'Client Test',
      email: 'client@ecomus.com',
      password: await bcrypt.hash('client123', 12),
      role: 'client',
      isActive: true,
      addresses: [
        {
          type: 'shipping',
          firstName: 'Client',
          lastName: 'Test',
          company: '',
          address1: '123 Rue de la Nature',
          address2: '',
          city: 'Paris',
          state: 'Île-de-France',
          postalCode: '75001',
          country: 'France',
          phone: '+33123456789',
          isDefault: true
        }
      ]
    }
  ]
  
  const createdUsers = await User.insertMany(users)
  console.log(`✅ ${createdUsers.length} utilisateurs créés`)
  return createdUsers
}

async function seedStores(users) {
  console.log('🏪 Création des boutiques...')
  
  // Supprimer les boutiques existantes
  await Store.deleteMany({})
  
  const vendor1 = users.find(u => u.email === 'vendor1@ecomus.com')
  const vendor2 = users.find(u => u.email === 'vendor2@ecomus.com')
  
  const stores = [
    {
      name: 'Boutique Nature',
      slug: 'boutique-nature',
      description: 'Spécialiste des produits naturels et écologiques',
      ownerId: vendor1._id,
      settings: {
        currency: 'EUR',
        language: 'fr',
        timezone: 'Europe/Paris',
        taxRate: 20,
        shippingZones: [
          {
            name: 'France métropolitaine',
            countries: ['FR'],
            rates: [
              { name: 'Standard', price: 5.99, estimatedDays: '3-5' },
              { name: 'Express', price: 9.99, estimatedDays: '1-2' }
            ]
          }
        ]
      },
      contact: {
        email: 'contact@boutique-nature.com',
        phone: '+33123456789',
        address: {
          address1: '123 Rue Verte',
          city: 'Lyon',
          state: 'Rhône-Alpes',
          postalCode: '69001',
          country: 'France'
        }
      },
      social: {
        website: 'https://boutique-nature.com',
        facebook: 'boutique-nature',
        instagram: 'boutique_nature'
      },
      isActive: true,
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    },
    {
      name: 'Éco Produits',
      slug: 'eco-produits',
      description: 'Vente de produits respectueux de l\'environnement',
      ownerId: vendor2._id,
      settings: {
        currency: 'EUR',
        language: 'fr',
        timezone: 'Europe/Paris',
        taxRate: 20,
        shippingZones: [
          {
            name: 'France métropolitaine',
            countries: ['FR'],
            rates: [
              { name: 'Standard', price: 4.99, estimatedDays: '3-5' }
            ]
          }
        ]
      },
      contact: {
        email: 'hello@eco-produits.fr',
        phone: '+33987654321',
        address: {
          address1: '456 Avenue Bio',
          city: 'Marseille',
          state: 'PACA',
          postalCode: '13001',
          country: 'France'
        }
      },
      isActive: true,
      subscription: {
        plan: 'basic',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }
  ]
  
  const createdStores = await Store.insertMany(stores)
  
  // Mettre à jour les utilisateurs avec leur storeId
  await User.findByIdAndUpdate(vendor1._id, { storeId: createdStores[0]._id })
  await User.findByIdAndUpdate(vendor2._id, { storeId: createdStores[1]._id })
  
  console.log(`✅ ${createdStores.length} boutiques créées`)
  return createdStores
}

async function seedCategories() {
  console.log('📂 Création des catégories...')
  
  // Supprimer les catégories existantes
  await Category.deleteMany({})
  
  // Transformer les données existantes
  const categories = categoriesData.map(cat => ({
    name: cat.title || cat.name,
    slug: cat.title ? cat.title.toLowerCase().replace(/\s+/g, '-') : cat.name.toLowerCase().replace(/\s+/g, '-'),
    description: cat.description || `Catégorie ${cat.title || cat.name}`,
    image: cat.img || cat.image,
    isActive: true,
    seo: {
      metaTitle: cat.title || cat.name,
      metaDescription: cat.description || `Découvrez notre sélection ${cat.title || cat.name}`,
      keywords: [cat.title || cat.name, 'écologique', 'naturel', 'bio']
    }
  }))
  
  const createdCategories = await Category.insertMany(categories)
  console.log(`✅ ${createdCategories.length} catégories créées`)
  return createdCategories
}

async function seedProducts(stores, categories) {
  console.log('🛍️  Création des produits...')
  
  // Supprimer les produits existants
  await Product.deleteMany({})
  
  // Limiter à 100 produits pour le test
  const limitedProducts = productsData.slice(0, 100)
  
  const products = limitedProducts.map((prod, index) => {
    const store = stores[index % stores.length]
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    return {
      name: prod.title,
      slug: prod.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: prod.description || `Description du produit ${prod.title}`,
      shortDescription: prod.description ? prod.description.substring(0, 150) + '...' : `${prod.title} - Produit écologique et naturel`,
      price: prod.price || Math.floor(Math.random() * 100) + 10,
      comparePrice: prod.oldPrice || undefined,
      images: prod.imgs ? prod.imgs.slice(0, 5) : [prod.img].filter(Boolean),
      category: category._id,
      storeId: store._id,
      inventory: {
        quantity: Math.floor(Math.random() * 100) + 10,
        sku: `ECO-${String(index + 1).padStart(4, '0')}`,
        barcode: `123456789${String(index).padStart(3, '0')}`,
        trackQuantity: true,
        allowBackorder: false
      },
      shipping: {
        weight: Math.random() * 2 + 0.1,
        dimensions: {
          length: Math.random() * 30 + 5,
          width: Math.random() * 20 + 5,
          height: Math.random() * 15 + 2
        },
        requiresShipping: true
      },
      seo: {
        metaTitle: prod.title,
        metaDescription: `${prod.title} - Produit écologique disponible sur Ecomus`,
        keywords: ['écologique', 'naturel', 'bio', 'durable']
      },
      tags: ['écologique', 'naturel', 'bio'],
      isActive: true,
      isFeatured: Math.random() > 0.8,
      analytics: {
        views: Math.floor(Math.random() * 1000),
        sales: Math.floor(Math.random() * 50),
        revenue: 0
      }
    }
  })
  
  const createdProducts = await Product.insertMany(products)
  console.log(`✅ ${createdProducts.length} produits créés`)
  return createdProducts
}

async function main() {
  try {
    await connectDB()
    
    console.log('🚀 Début de l\'importation des données...\n')
    
    const users = await seedUsers()
    const stores = await seedStores(users)
    const categories = await seedCategories()
    const products = await seedProducts(stores, categories)
    
    console.log('\n🎉 Importation terminée avec succès !')
    console.log('\n📊 Résumé:')
    console.log(`- ${users.length} utilisateurs`)
    console.log(`- ${stores.length} boutiques`)
    console.log(`- ${categories.length} catégories`)
    console.log(`- ${products.length} produits`)
    
    console.log('\n🔐 Comptes de test:')
    console.log('Admin: admin@ecomus.com / admin123')
    console.log('Vendor 1: vendor1@ecomus.com / vendor123')
    console.log('Vendor 2: vendor2@ecomus.com / vendor123')
    console.log('Client: client@ecomus.com / client123')
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'importation:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Connexion fermée')
    process.exit(0)
  }
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { main }
