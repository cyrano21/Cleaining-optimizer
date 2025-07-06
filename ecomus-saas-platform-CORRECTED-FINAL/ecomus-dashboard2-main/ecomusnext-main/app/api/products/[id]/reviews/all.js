// pages/api/products/[id]/reviews/all.js
import dbConnect from '../../../../../utils/dbConnect';
import Product from '../../../../../models/Product';
import { isAuthenticated } from '../../../../../middleware/auth';

const handler = async (req, res) => {
  const { id } = req.query; // ID du produit
  
  // Connexion à la base de données
  await dbConnect();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    // Récupérer le produit avec ses avis
    const product = await Product.findById(id)
      .select('reviews')
      .populate('reviews.user', 'name email avatar');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    // Renvoyer tous les avis, y compris ceux qui ne sont pas approuvés
    console.log(`[API reviews/all] ${product.reviews.length} avis au total (approuvés et non-approuvés) pour le produit ${id}`);
    
    return res.status(200).json({
      success: true,
      count: product.reviews.length,
      data: product.reviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Appliquer le middleware d'authentification pour vérifier que l'utilisateur est connecté
export default isAuthenticated(handler);