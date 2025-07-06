// pages/api/admin/product-reviews/[id].js
import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';
import { isAuthenticated, isAdmin } from '../../../../middleware/auth';

const handler = async (req, res) => {
  console.log(
    '[API product-reviews] Méthode:', req.method,
    'ID produit:', req.query.id
  );

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  const { id } = req.query; // ID du produit
  
  try {
    await dbConnect();
    console.log('[API product-reviews] Connexion DB réussie');

    // Récupérer le produit avec ses avis
    const product = await Product.findById(id)
      .select('name reviews')
      .populate('reviews.user', 'name email');
    
    if (!product) {
      console.log('[API product-reviews] Produit non trouvé:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    // Renvoyer tous les avis, y compris ceux qui ne sont pas approuvés
    console.log(`[API product-reviews] ${product.reviews.length} avis trouvés pour le produit ${product.name}`);
    
    return res.status(200).json({
      success: true,
      count: product.reviews.length,
      data: product.reviews
    });
  } catch (error) {
    console.error('[API product-reviews] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// On applique d'abord isAuthenticated puis isAdmin
export default isAuthenticated(isAdmin(handler));