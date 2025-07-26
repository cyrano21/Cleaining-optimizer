import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé - Admin/Vendor requis'
      }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'analyze'

    switch (action) {
      case 'analyze':
        return await analyzeCloudinaryImages()
      case 'validate':
        return await validateImageUrls()
      case 'optimize':
        return await optimizeImages()
      case 'stats':
        return await getCloudinaryStats()
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non supportée'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur API Cloudinary test:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}

// Analyser toutes les images Cloudinary
async function analyzeCloudinaryImages() {
  const products = await Product.find({ isActive: true }).lean()
  
  const analysis = {
    totalProducts: products.length,
    productsWithImages: 0,
    productsWithCloudinary: 0,
    totalImages: 0,
    cloudinaryImages: 0,
    unsplashImages: 0,
    localImages: 0,
    brokenImages: [],
    cloudinaryUrls: [],
    optimizationSuggestions: []
  }

  for (const product of products) {
    if (product.images && product.images.length > 0) {
      analysis.productsWithImages++
      analysis.totalImages += product.images.length

      let hasCloudinary = false
      
      for (const imageUrl of product.images) {
        if (imageUrl.includes('cloudinary.com')) {
          analysis.cloudinaryImages++
          analysis.cloudinaryUrls.push({
            productId: product._id,
            productTitle: product.title,
            url: imageUrl
          })
          hasCloudinary = true
        } else if (imageUrl.includes('unsplash.com')) {
          analysis.unsplashImages++
          analysis.optimizationSuggestions.push({
            productId: product._id,
            productTitle: product.title,
            suggestion: 'Migrer vers Cloudinary',
            currentUrl: imageUrl
          })
        } else if (imageUrl.startsWith('/images/')) {
          analysis.localImages++
        }
      }

      if (hasCloudinary) {
        analysis.productsWithCloudinary++
      }
    }
  }

  // Calcul des métriques
  analysis.optimizationRate = analysis.totalProducts > 0 
    ? Math.round((analysis.productsWithCloudinary / analysis.totalProducts) * 100)
    : 0

  analysis.summary = {
    message: `${analysis.cloudinaryImages} images sur ${analysis.totalImages} sont optimisées via Cloudinary`,
    optimizationRate: `${analysis.optimizationRate}%`,
    nextSteps: [
      `${analysis.unsplashImages} images Unsplash à migrer`,
      `${analysis.localImages} images locales à vérifier`,
      `${analysis.optimizationSuggestions.length} optimisations possibles`
    ]
  }

  return NextResponse.json({
    success: true,
    data: analysis
  })
}

// Valider que les URLs Cloudinary fonctionnent
async function validateImageUrls() {
  const products = await Product.find({ 
    isActive: true,
    images: { $elemMatch: { $regex: 'cloudinary.com' } }
  }).lean()

  const validation = {
    totalCloudinaryProducts: products.length,
    validUrls: [],
    invalidUrls: [],
    slowUrls: [],
    transformationIssues: []
  }

  for (const product of products) {
    for (const imageUrl of product.images) {
      if (imageUrl.includes('cloudinary.com')) {
        try {
          const startTime = Date.now()
          const response = await fetch(imageUrl, { method: 'HEAD', timeout: 5000 })
          const responseTime = Date.now() - startTime

          if (response.ok) {
            validation.validUrls.push({
              productId: product._id,
              productTitle: product.title,
              url: imageUrl,
              responseTime,
              contentType: response.headers.get('content-type'),
              size: response.headers.get('content-length')
            })

            if (responseTime > 2000) {
              validation.slowUrls.push({
                productId: product._id,
                url: imageUrl,
                responseTime
              })
            }
          } else {
            validation.invalidUrls.push({
              productId: product._id,
              productTitle: product.title,
              url: imageUrl,
              status: response.status,
              statusText: response.statusText
            })
          }
        } catch (error) {
          validation.invalidUrls.push({
            productId: product._id,
            productTitle: product.title,
            url: imageUrl,
            error: error.message
          })
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: validation
  })
}

// Optimiser les images existantes
async function optimizeImages() {
  const products = await Product.find({ 
    isActive: true,
    images: { $elemMatch: { $regex: 'unsplash.com' } }
  }).limit(5).lean()

  const optimization = {
    processed: 0,
    optimized: [],
    errors: [],
    totalSavings: 0
  }

  for (const product of products) {
    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i]
      
      if (imageUrl.includes('unsplash.com')) {
        try {
          console.log(`Optimisation de ${imageUrl}`)
          
          const result = await cloudinary.uploader.upload(imageUrl, {
            folder: 'ecomus/products/optimized',
            transformation: [
              { width: 800, height: 800, crop: 'fill', quality: 'auto:good' },
              { format: 'auto' }
            ]
          })

          optimization.optimized.push({
            productId: product._id,
            productTitle: product.title,
            originalUrl: imageUrl,
            optimizedUrl: result.secure_url,
            originalSize: result.original_filename,
            newSize: result.bytes,
            format: result.format
          })

          optimization.processed++

        } catch (error) {
          optimization.errors.push({
            productId: product._id,
            productTitle: product.title,
            url: imageUrl,
            error: error.message
          })
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: optimization
  })
}

// Statistiques avancées Cloudinary
async function getCloudinaryStats() {
  try {
    // Statistiques de l'API Cloudinary
    const cloudinaryStats = await cloudinary.api.usage()
    
    // Statistiques des produits
    const products = await Product.find({ isActive: true }).lean()
    
    const stats = {
      cloudinary: {
        credits: cloudinaryStats.credits || 0,
        creditsUsed: cloudinaryStats.credits_usage || 0,
        bandwidth: cloudinaryStats.bandwidth || 0,
        storage: cloudinaryStats.storage || 0,
        transformations: cloudinaryStats.transformations || 0,
        requests: cloudinaryStats.requests || 0,
        lastUpdated: new Date().toISOString()
      },
      products: {
        total: products.length,
        withCloudinary: products.filter(p => 
          p.images?.some(img => img.includes('cloudinary.com'))
        ).length,
        withUnsplash: products.filter(p => 
          p.images?.some(img => img.includes('unsplash.com'))
        ).length,
        withLocalImages: products.filter(p => 
          p.images?.some(img => img.startsWith('/images/'))
        ).length
      },
      recommendations: [
        'Migrer les images Unsplash restantes vers Cloudinary',
        'Appliquer des transformations automatiques pour l\'optimisation',
        'Utiliser le format WebP pour de meilleures performances',
        'Implémenter le lazy loading pour toutes les images'
      ]
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Erreur stats Cloudinary:', error)
    return NextResponse.json({
      success: true,
      data: {
        cloudinary: { error: 'Impossible de récupérer les stats Cloudinary' },
        products: {
          total: await Product.countDocuments({ isActive: true })
        }
      }
    })
  }
}
