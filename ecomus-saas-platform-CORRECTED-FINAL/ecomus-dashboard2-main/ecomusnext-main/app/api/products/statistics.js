import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'
import Category from '../../../models/Category'
import mongoose from 'mongoose'

/**
 * API pour obtenir les statistiques des produits par catégorie
 * Beaucoup plus légère que de charger tous les produits
 */
export default async function handler(req, res) {
  const { method } = req

  console.log(`[API Statistics] Méthode: ${method}`)

  // Connexion à la base de données
  try {
    await dbConnect()
    console.log('[API Statistics] Connexion à la base de données réussie')
  } catch (error) {
    console.error('[API Statistics] Erreur de connexion à la base de données:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur de connexion à la base de données'
    })
  }

  if (method === 'GET') {
    try {
      console.log('[API Statistics] Récupération des statistiques de produits par catégorie')
      
      // D'abord récupérer toutes les catégories
      const categories = await Category.find({}).lean()
      console.log(`[API Statistics] ${categories.length} catégories trouvées`)
      
      // Utiliser l'agrégation MongoDB pour compter les produits par catégorie
      const productCountsByCategory = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
      
      console.log(`[API Statistics] Statistiques générées pour ${productCountsByCategory.length} catégories`)
      
      // Créer un mapping pour faciliter l'accès aux compteurs
      const categoryCounts = {}
      productCountsByCategory.forEach(stat => {
        if (stat._id) {
          categoryCounts[stat._id.toString()] = stat.count
        }
      })
      
      // Enrichir chaque catégorie avec son nombre de produits
      const enrichedCategories = categories.map(cat => {
        const catId = cat._id.toString()
        return {
          ...cat,
          productCount: categoryCounts[catId] || 0
        }
      })
      
      // Ajouter des informations globales
      const totalProducts = await Product.countDocuments({})
      
      return res.status(200).json({
        success: true,
        data: {
          categories: enrichedCategories,
          totalProducts,
          uncategorizedCount: totalProducts - Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
        }
      })
    } catch (error) {
      console.error('[API Statistics] Erreur:', error)
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, error: `Méthode ${method} non autorisée` })
  }
}
