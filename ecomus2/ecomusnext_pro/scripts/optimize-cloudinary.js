// Script d'optimisation Cloudinary pour produits existants
const mongoose = require('mongoose')
const { v2: cloudinary } = require('cloudinary')
require('dotenv').config({ path: '.env.local' })

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Modèle Product
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

// Cache pour éviter de re-uploader
const imageCache = new Map()

// Fonction pour uploader une image vers Cloudinary
const uploadImageToCloudinary = async (imageUrl, folder = 'ecomus/products') => {
  if (imageCache.has(imageUrl)) {
    console.log(`📎 Image en cache: ${imageUrl.slice(0, 50)}...`)
    return imageCache.get(imageUrl)
  }

  try {
    console.log(`📤 Upload vers Cloudinary: ${imageUrl.slice(0, 60)}...`)
    
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
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return result.secure_url
  } catch (error) {
    console.error(`❌ Erreur upload ${imageUrl.slice(0, 50)}:`, error.message)
    return imageUrl // Fallback vers l'URL originale
  }
}

// Fonction d'optimisation des produits
const optimizeProductImages = async (limit = 10) => {
  try {
    console.log('🚀 Optimisation des images produits avec Cloudinary...\n')
    
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connecté')
    
    // Test de connexion Cloudinary
    try {
      const cloudinaryTest = await cloudinary.api.ping()
      console.log('✅ Cloudinary connecté:', cloudinaryTest.status)
    } catch (error) {
      console.warn('⚠️ Avertissement Cloudinary:', error.message)
    }
    
    // Trouver les produits qui n'ont pas encore d'images Cloudinary
    const productsToOptimize = await Product.find({
      $and: [
        { images: { $exists: true, $not: { $size: 0 } } },
        { images: { $not: { $regex: 'cloudinary.com' } } }
      ]
    }).limit(limit)
    
    console.log(`📦 ${productsToOptimize.length} produits à optimiser...\n`)
    
    let optimizedCount = 0
    let errorCount = 0
    
    for (let i = 0; i < productsToOptimize.length; i++) {
      const product = productsToOptimize[i]
      console.log(`🔄 Optimisation ${i + 1}/${productsToOptimize.length}: ${product.title}`)
      
      try {
        const updatedImages = []
        
        // Optimiser chaque image du produit
        for (const imageUrl of product.images) {
          if (imageUrl && imageUrl.includes('unsplash.com')) {
            const optimizedUrl = await uploadImageToCloudinary(imageUrl, 'ecomus/products')
            updatedImages.push(optimizedUrl)
          } else {
            updatedImages.push(imageUrl)
          }
        }
        
        // Optimiser les images des variants
        const updatedVariants = []
        if (product.variants && Array.isArray(product.variants)) {
          for (const variant of product.variants) {
            if (variant.image && variant.image.includes('unsplash.com')) {
              variant.image = await uploadImageToCloudinary(variant.image, 'ecomus/products/variants')
            }
            updatedVariants.push(variant)
          }
        }
        
        // Mettre à jour le produit
        await Product.findByIdAndUpdate(product._id, {
          images: updatedImages,
          variants: updatedVariants
        })
        
        optimizedCount++
        console.log(`✅ Produit optimisé: ${product.title}\n`)
        
      } catch (error) {
        console.error(`❌ Erreur optimisation ${product.title}:`, error.message)
        errorCount++
      }
    }
    
    // Statistiques finales
    const totalProducts = await Product.countDocuments()
    const productsWithCloudinary = await Product.countDocuments({
      images: { $regex: 'cloudinary.com' }
    })
    
    console.log(`\n🎉 Optimisation terminée !`)
    console.log(`📊 Résultats:`)
    console.log(`   ✅ Produits optimisés: ${optimizedCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   ☁️ Total avec Cloudinary: ${productsWithCloudinary}`)
    console.log(`   📈 Taux d'optimisation: ${((productsWithCloudinary / totalProducts) * 100).toFixed(1)}%`)
    console.log(`   🖼️ Images uploadées: ${imageCache.size}`)
    
    return {
      optimized: optimizedCount,
      errors: errorCount,
      totalWithCloudinary: productsWithCloudinary,
      optimizationRate: ((productsWithCloudinary / totalProducts) * 100).toFixed(1)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnexion MongoDB')
  }
}

// Script principal
const main = async () => {
  try {
    const limit = process.argv[2] ? parseInt(process.argv[2]) : 15
    console.log(`🎯 Limite d'optimisation: ${limit} produits\n`)
    
    await optimizeProductImages(limit)
    
  } catch (error) {
    console.error('❌ Erreur script:', error)
    process.exit(1)
  }
}

// Exécution du script
if (require.main === module) {
  main()
}

module.exports = { optimizeProductImages }
