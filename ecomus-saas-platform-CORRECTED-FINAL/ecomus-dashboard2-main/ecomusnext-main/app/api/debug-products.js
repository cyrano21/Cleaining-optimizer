import dbConnect from '../../lib/dbConnect'
import Product from '../../models/Product'
import Category from '../../models/Category'
import mongoose from 'mongoose'

/**
 * API de diagnostic pour comprendre pourquoi les produits de la catégorie "bag" ne sont pas retournés
 */
export default async function handler (req, res) {
  console.log('🔍 Démarrage du diagnostic API debug-products...')

  try {
    // Connexion à la base de données
    await dbConnect()
    console.log('✅ Connecté à MongoDB')

    // 1. Récupérer la catégorie "bag"
    const bagCategory = await Category.findOne({ slug: 'bag' })
    if (!bagCategory) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie "bag" non trouvée'
      })
    }

    console.log(
      `📦 Catégorie "bag": ID=${bagCategory._id}, Nom=${
        bagCategory.name
      }, Type=${typeof bagCategory._id}`
    )

    // 2. Tester différentes façons de récupérer les produits de cette catégorie
    const results = {}

    // 2.1 Avec l'ID tel quel
    results.withOriginalId = await Product.find({
      category: bagCategory._id
    }).countDocuments()

    // 2.2 Avec l'ID converti en string puis en ObjectId
    const categoryObjectId = new mongoose.Types.ObjectId(
      bagCategory._id.toString()
    )
    results.withNewObjectId = await Product.find({
      category: categoryObjectId
    }).countDocuments()

    // 2.3 Avec l'ID en string
    results.withStringId = await Product.find({
      category: bagCategory._id.toString()
    }).countDocuments()

    // 2.4 Avec l'opérateur $eq explicite
    results.withEqOperator = await Product.find({
      category: { $eq: bagCategory._id }
    }).countDocuments()

    // 2.5 Avec une requête $or combinant toutes les approches
    results.withOrQuery = await Product.find({
      $or: [
        { category: bagCategory._id },
        { category: categoryObjectId },
        { category: bagCategory._id.toString() }
      ]
    }).countDocuments()

    // 3. Récupérer quelques exemples de produits pour analyser
    const allProducts = await Product.find({})
      .limit(5)
      .select('_id name category')

    // Transformation pour l'affichage
    const productsInfo = allProducts.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      categoryType: typeof p.category,
      categoryConstructor: p.category
        ? p.category.constructor.name
        : 'undefined'
    }))

    // 4. Récupérer les produits de la catégorie "bag" directement
    const bagProducts = await Product.find({ category: bagCategory._id }).limit(
      5
    )
    const bagProductsInfo = bagProducts.map(p => ({
      id: p._id,
      name: p.name
    }))

    // 5. Récupérer tous les produits puis filtrer côté application
    const allProductsFull = await Product.find({})
    const filteredClientSide = allProductsFull.filter(
      p => p.category && p.category.toString() === bagCategory._id.toString()
    )

    // Résultats complets
    const diagnosticResults = {
      categoryInfo: {
        id: bagCategory._id,
        name: bagCategory.name,
        slug: bagCategory.slug,
        idType: typeof bagCategory._id,
        idConstructor: bagCategory._id.constructor.name
      },
      queryResults: results,
      sampleProductsStructure: productsInfo,
      bagProductsFound: bagProductsInfo,
      clientSideFilteredCount: filteredClientSide.length,
      totalProductCount: await Product.countDocuments({}),
      apiInfo: {
        nodeVersion: process.version,
        mongooseVersion: mongoose.version
      }
    }

    return res.status(200).json({
      success: true,
      results: diagnosticResults
    })
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
