// filepath: g:\ewebsite2\pages\api\admin\reviews.js
import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';
import { isAuthenticated, isAdmin } from '../../../middleware/auth';

const handler = async (req, res) => {
  console.log(
    '[API reviews] Méthode:', req.method,
    'Authorization header:', req.headers.authorization,
    'Cookies:', req.headers.cookie
  );

  if (req.method !== 'GET') {
    console.log('[API reviews] Méthode non autorisée');
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    await dbConnect();
    console.log('[API reviews] Connexion DB réussie');

    // Récupérer tous les produits qui ont des avis
    const productsWithReviews = await Product.find({
      'reviews': { $exists: true, $not: { $size: 0 } }
    })
    .select('name slug reviews')
    .populate('reviews.user', 'name email avatar');

    console.log('[API reviews] Nombre de produits avec avis :', productsWithReviews.length);
    
    // Extraction des avis
    let allReviews = [];
    productsWithReviews.forEach(product => {
      const productReviews = product.reviews
        .map(r => ({
          ...r.toObject(),
          productName: product.name,
          productId: product._id,
          productSlug: product.slug
        }));
      allReviews.push(...productReviews);
    });

    // Tri des avis par date (les plus récents d'abord)
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`[API reviews] ${allReviews.length} avis au total`);
    return res.status(200).json({
      success: true,
      count: allReviews.length,
      data: allReviews
    });

  } catch (error) {
    console.error('[API reviews] Erreur serveur :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// On applique d'abord isAuthenticated puis isAdmin
export default isAuthenticated(isAdmin(handler));