// pages/api/admin/pending-reviews.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';

const handler = async (req, res) => {
  // Vérification d'authentification avec next-auth
  const session = await getServerSession(req, res, authOptions);
  
  console.log(
    '[API pending-reviews] Méthode:', req.method,
    'Session existe:', !!session,
    'Role:', session?.user?.role
  );

  // Vérifier que l'utilisateur est connecté et qu'il est administrateur
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }

  if (req.method !== 'GET') {
    console.log('[API pending-reviews] Méthode non autorisée');
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    await dbConnect();
    console.log('[API pending-reviews] Connexion DB réussie');

    // Utiliser $elemMatch pour trouver les produits avec au moins un avis non approuvé
    const productsWithPendingReviews = await Product.find({
      'reviews': { $elemMatch: { 'approved': false } }
    })
    .select('name slug reviews')
    .populate('reviews.user', 'name email avatar');

    console.log('[API pending-reviews] Nombre de produits avec avis en attente :', productsWithPendingReviews.length);
    
    // Debug: afficher les détails des produits trouvés
    productsWithPendingReviews.forEach(product => {
      const pendingCount = product.reviews.filter(r => !r.approved).length;
      console.log(`[API pending-reviews] Produit: ${product.name}, ID: ${product._id}, Avis en attente: ${pendingCount}`);
    });

    // Extraction des avis
    let pendingReviews = [];
    productsWithPendingReviews.forEach(product => {
      const productPending = product.reviews
        .filter(r => !r.approved)
        .map(r => ({
          ...r.toObject(),
          productName: product.name,
          productId: product._id,
          productSlug: product.slug
        }));
      pendingReviews.push(...productPending);
    });

    console.log(`[API pending-reviews] ${pendingReviews.length} avis en attente`);
    return res.status(200).json({
      success: true,
      count: pendingReviews.length,
      data: pendingReviews
    });

  } catch (error) {
    console.error('[API pending-reviews] Erreur serveur :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Exporter directement le handler avec l'authentification intégrée
export default handler;
