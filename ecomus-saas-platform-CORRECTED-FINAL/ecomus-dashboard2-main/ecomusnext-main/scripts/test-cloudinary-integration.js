// Script de test pour l'intégration Cloudinary
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Modèle Product simplifié
const productSchema = new mongoose.Schema({
  title: String,
  images: [String],
  variants: [{
    name: String,
    type: String,
    value: String,
    image: String,
    price: Number,
    inventory: Number
  }]
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)

// Test de l'intégration Cloudinary
const testCloudinaryIntegration = async () => {
  try {
    console.log('🧪 Test de l\'intégration Cloudinary...\n')
    
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connecté')
    
    // Récupération des produits avec images Cloudinary
    const productsWithCloudinary = await Product.find({
      images: { $regex: 'cloudinary.com' }
    }).limit(10)
    
    console.log(`\n📊 Statistiques:`)
    console.log(`   📦 Produits avec images Cloudinary: ${productsWithCloudinary.length}`)
    
    if (productsWithCloudinary.length > 0) {
      console.log(`\n🖼️ Exemples d'images Cloudinary:`)
      productsWithCloudinary.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title}`)
        console.log(`      🌟 Image principale: ${product.images[0]}`)
        if (product.variants && product.variants.length > 0) {
          const variantWithImage = product.variants.find(v => v.image && v.image.includes('cloudinary'))
          if (variantWithImage) {
            console.log(`      🎨 Variant ${variantWithImage.type}: ${variantWithImage.image}`)
          }
        }
        console.log('')
      })
      
      // Test de métadonnées Cloudinary
      console.log(`\n🔍 Analyse des transformations Cloudinary:`)
      const sampleProduct = productsWithCloudinary[0]
      const cloudinaryUrl = sampleProduct.images[0]
      
      if (cloudinaryUrl.includes('cloudinary.com')) {
        const urlParts = cloudinaryUrl.split('/')
        const cloudName = urlParts[3]
        const resourceType = urlParts[4]
        const transformations = urlParts[6]
        const publicId = urlParts[7]?.split('.')[0]
        
        console.log(`   ☁️ Cloud Name: ${cloudName}`)
        console.log(`   📁 Resource Type: ${resourceType}`)
        console.log(`   🔧 Transformations: ${transformations}`)
        console.log(`   🆔 Public ID: ${publicId}`)
        
        // Test de différentes transformations
        const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
        console.log(`\n🎨 URLs de transformation disponibles:`)
        console.log(`   📐 Thumbnail 150x150: ${baseUrl}/c_fill,w_150,h_150/${publicId}.jpg`)
        console.log(`   🖼️ Medium 400x400: ${baseUrl}/c_fill,w_400,h_400,q_auto/${publicId}.jpg`)
        console.log(`   📱 Mobile 300x400: ${baseUrl}/c_fill,w_300,h_400,q_auto,f_auto/${publicId}.jpg`)
        console.log(`   💻 Desktop 800x800: ${baseUrl}/c_fill,w_800,h_800,q_auto,f_auto/${publicId}.jpg`)
      }
    }
    
    // Statistiques globales
    const totalProducts = await Product.countDocuments()
    const productsWithImages = await Product.countDocuments({ images: { $exists: true, $not: { $size: 0 } } })
    const productsWithVariants = await Product.countDocuments({ 'variants.0': { $exists: true } })
    
    console.log(`\n📈 Statistiques globales:`)
    console.log(`   📦 Total produits: ${totalProducts}`)
    console.log(`   🖼️ Produits avec images: ${productsWithImages}`)
    console.log(`   ☁️ Produits avec Cloudinary: ${productsWithCloudinary.length}`)
    console.log(`   🎨 Produits avec variants: ${productsWithVariants}`)
    console.log(`   📊 Taux d'optimisation Cloudinary: ${((productsWithCloudinary.length / totalProducts) * 100).toFixed(1)}%`)
    
    // Test de requête avec enrichissement
    console.log(`\n🚀 Test d'enrichissement des données produit:`)
    const enrichedProducts = await Product.aggregate([
      { $match: { images: { $exists: true, $not: { $size: 0 } } } },
      { $limit: 5 },
      {
        $addFields: {
          hasCloudinaryImages: {
            $gt: [
              { $size: { $filter: { input: '$images', cond: { $regexMatch: { input: '$$this', regex: 'cloudinary' } } } } },
              0
            ]
          },
          mainImage: { $arrayElemAt: ['$images', 0] },
          hoverImage: { $arrayElemAt: ['$images', 1] },
          totalVariants: { $size: { $ifNull: ['$variants', []] } },
          cloudinaryOptimized: {
            $cond: {
              if: { $regexMatch: { input: { $arrayElemAt: ['$images', 0] }, regex: 'cloudinary' } },
              then: true,
              else: false
            }
          }
        }
      }
    ])
    
    enrichedProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title}`)
      console.log(`      ☁️ Cloudinary: ${product.hasCloudinaryImages ? '✅' : '❌'}`)
      console.log(`      🎨 Variants: ${product.totalVariants}`)
      console.log(`      📱 Optimisé: ${product.cloudinaryOptimized ? '✅' : '❌'}`)
    })
    
    console.log(`\n✅ Test d'intégration Cloudinary terminé avec succès !`)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnexion MongoDB')
    process.exit(0)
  }
}

// Exécution du test
if (require.main === module) {
  testCloudinaryIntegration()
}

module.exports = { testCloudinaryIntegration }
