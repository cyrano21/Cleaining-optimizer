import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';
import { isAuthenticated } from '../../../../middleware/auth';

/**
 * API alternative pour les avis de produits
 * Fournit un point d'accès alternatif au format /api/products/reviews/[id]
 */
const handler = async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID de produit manquant' 
    });
  }

  try {
    await dbConnect();

    if (req.method === 'GET') {
      try {
        // Récupérer le produit avec ses avis
        const product = await Product.findById(id)
          .select('reviews')
          .populate('reviews.user', 'name email');
        
        if (!product) {
          return res.status(404).json({ 
            success: false, 
            message: 'Produit non trouvé' 
          });
        }
        
        // Pour les utilisateurs non-admin, ne renvoyer que les avis approuvés
        let reviews = product.reviews || [];
        if (!req.user || req.user.role !== 'admin') {
          reviews = reviews.filter(review => review.approved);
        }
        
        return res.status(200).json({
          success: true,
          count: reviews.length,
          data: reviews
        });
        
      } catch (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la récupération des avis',
          error: error.message
        });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ 
        success: false, 
        message: `Méthode ${req.method} non autorisée` 
      });
    }
  } catch (error) {
    console.error('Erreur dans l\'API des avis (route alternative):', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// API en lecture seule, pas besoin d'authentification pour GET
export default handler;