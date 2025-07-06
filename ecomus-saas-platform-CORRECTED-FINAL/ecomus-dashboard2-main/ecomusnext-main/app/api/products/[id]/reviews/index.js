import dbConnect from '../../../../../utils/dbConnect'
import Product from '../../../../../models/Product'
import { serializeMongoDocuments } from '../../../../../utils/serializeMongoData'

import { isAuthenticated } from '../../../../../middleware/auth'

export default async function handler (req, res) {
  await dbConnect()
  const { id } = req.query // c’est bien “id” (pas productId) :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

  switch (req.method) {
    case 'GET':
      try {
        // Vérifier si l'ID est un ObjectId MongoDB valide
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id)

        // Rechercher le produit soit par son ID MongoDB, soit par son legacy ID (UUID)
        let product = null

        if (isValidObjectId) {
          // Si c'est un ObjectId valide, essayer d'abord avec findById
          product = await Product.findById(id)
            .select('reviews')
            .populate('reviews.user', 'name email avatar')
        }

        // Si produit non trouvé ou si l'ID n'est pas un ObjectId valide
        if (!product) {
          // Essayer avec le champ legacyId qui peut contenir un UUID
          product = await Product.findOne({ legacyId: id })
            .select('reviews')
            .populate('reviews.user', 'name email avatar')

          // Si toujours pas trouvé, essayer avec le champ 'id' qui peut contenir un UUID
          if (!product) {
            product = await Product.findOne({ id: id })
              .select('reviews')
              .populate('reviews.user', 'name email avatar')
          }
        }

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Produit non trouvé'
          })
        }

        // **On ne renvoie que les avis approuvés**
        const approvedReviews = product.reviews.filter(r => r.approved)

        // Sérialiser les objets MongoDB pour la réponse JSON
        const serializedReviews = serializeMongoDocuments(approvedReviews)

        return res.status(200).json({
          success: true,
          count: serializedReviews.length,
          data: serializedReviews
        })
      } catch (error) {
        console.error('Erreur lors de la récupération des avis:', error)
        return res.status(500).json({
          success: false,
          message: 'Erreur serveur',
          error: error.message
        })
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Méthode non autorisée'
      })
  }
}
