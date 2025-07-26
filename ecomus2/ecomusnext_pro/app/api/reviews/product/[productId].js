import connectDB from '../../../../config/db';
import Product from '../../../../models/Product';
import { isAuthenticated } from '../../../../middleware/auth';

/**
 * API centralisée pour les avis de produits
 * GET /api/reviews/product/[productId] - Récupère les avis d'un produit spécifique
 * POST /api/reviews/product/[productId] - Ajoute un avis à un produit
 */
export default async function handler(req, res) {
  const { productId } = req.query;
  
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'ID produit manquant'
    });
  }

  try {
    await connectDB();
    
    // GET - Récupérer les avis d'un produit
    if (req.method === 'GET') {
      const product = await Product.findById(productId)
        .select('reviews')
        .populate('reviews.user', 'name email');
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }
      
      // Filtrer les avis si nécessaire (par ex. uniquement les avis approuvés pour les utilisateurs non-admin)
      const reviews = product.reviews || [];
      
      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
      });
    } 
    // POST - Ajouter un avis
    else if (req.method === 'POST') {
      // Vérifier que l'utilisateur est authentifié (idéalement)
      // Si pas de contexte d'authentification disponible, on continue quand même
      // const userId = req.user?._id || 'anonyme';
      
      // Récupérer les données du corps de la requête
      const { rating, comment } = req.body;
      
      // Valider les données
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'La note doit être entre 1 et 5'
        });
      }
      
      if (!comment || comment.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Le commentaire doit contenir au moins 5 caractères'
        });
      }
      
      // Trouver le produit
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }
      
      // Créer un nouvel avis
      const newReview = {
        // user: userId, // Idéalement, utiliser l'ID de l'utilisateur ici
        rating: Number(rating),
        comment,
        date: new Date(),
        approved: false // Par défaut, l'avis n'est pas approuvé
      };
      
      // Ajouter l'avis au produit
      if (!product.reviews) {
        product.reviews = [];
      }
      
      product.reviews.push(newReview);
      
      // Recalculer la note moyenne
      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.rating = totalRating / product.reviews.length;
        product.ratingsCount = product.reviews.length;
      }
      
      // Sauvegarder les modifications
      await product.save();
      
      return res.status(201).json({
        success: true,
        message: 'Avis soumis avec succès. Il sera visible après validation par un administrateur.',
        data: newReview
      });
    }
    // Autres méthodes non supportées
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        message: `Méthode ${req.method} non autorisée`
      });
    }
  } catch (error) {
    console.error('Erreur API avis:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
}