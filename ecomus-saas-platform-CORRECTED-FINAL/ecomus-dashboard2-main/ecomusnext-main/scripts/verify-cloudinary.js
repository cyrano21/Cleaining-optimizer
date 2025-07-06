// Script de vérification des données MongoDB avec Cloudinary
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Schémas simplifiés pour la vérification
const userSchema = new mongoose.Schema({}, { strict: false })
const storeSchema = new mongoose.Schema({}, { strict: false })
const categorySchema = new mongoose.Schema({}, { strict: false })
const productSchema = new mongoose.Schema({}, { strict: false })
const orderSchema = new mongoose.Schema({}, { strict: false })

const User = mongoose.model('User', userSchema)
const Store = mongoose.model('Store', storeSchema)
const Category = mongoose.model('Category', categorySchema) 
const Product = mongoose.model('Product', productSchema)
const Order = mongoose.model('Order', orderSchema)

const verifyData = async () => {
  try {
    console.log('🔍 Vérification des données MongoDB...')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connexion MongoDB réussie')
    
    // Vérification des utilisateurs
    const users = await User.find({})
    console.log(`\n👤 Utilisateurs: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rôle: ${user.role}`)
    })
    
    // Vérification des boutiques
    const stores = await Store.find({})
    console.log(`\n🏪 Boutiques: ${stores.length}`)
    stores.forEach(store => {
      console.log(`   - ${store.name} (ID: ${store._id})`)
    })
    
    // Vérification des catégories
    const categories = await Category.find({})
    console.log(`\n📂 Catégories: ${categories.length}`)
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.slug})`)
    })
    
    // Vérification des produits avec images Cloudinary
    const products = await Product.find({})
    console.log(`\n📦 Produits: ${products.length}`)
    products.slice(0, 5).forEach(product => {
      console.log(`   - ${product.title}`)
      console.log(`     Prix: ${product.price}€`)
      console.log(`     Images (${product.images?.length || 0}):`)
      product.images?.forEach((img, index) => {
        const isCloudinary = img.includes('cloudinary.com')
        console.log(`       ${index + 1}. ${isCloudinary ? '☁️' : '🌐'} ${img}`)
      })
      console.log('')
    })
    
    if (products.length > 5) {
      console.log(`   ... et ${products.length - 5} autres produits`)
    }
    
    // Vérification des commandes
    const orders = await Order.find({})
    console.log(`\n🛒 Commandes: ${orders.length}`)
    orders.forEach(order => {
      console.log(`   - ${order.orderNumber} - ${order.total}€ (Status: ${order.status})`)
    })
    
    // Statistiques Cloudinary
    const productsWithCloudinary = await Product.find({
      images: { $regex: 'cloudinary.com' }
    })
    
    console.log(`\n☁️ Statistiques Cloudinary:`)
    console.log(`   Produits avec images Cloudinary: ${productsWithCloudinary.length}`)
    
    const totalCloudinaryImages = productsWithCloudinary.reduce((sum, product) => {
      return sum + (product.images?.filter(img => img.includes('cloudinary.com')).length || 0)
    }, 0)
    
    console.log(`   Total d'images Cloudinary: ${totalCloudinaryImages}`)
    
    // Test d'une URL Cloudinary
    if (productsWithCloudinary.length > 0) {
      const sampleProduct = productsWithCloudinary[0]
      const sampleImage = sampleProduct.images?.find(img => img.includes('cloudinary.com'))
      if (sampleImage) {
        console.log(`   Exemple d'URL: ${sampleImage}`)
      }
    }
    
    console.log('\n✅ Vérification terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnexion MongoDB')
  }
}

if (require.main === module) {
  verifyData()
}

module.exports = { verifyData }
