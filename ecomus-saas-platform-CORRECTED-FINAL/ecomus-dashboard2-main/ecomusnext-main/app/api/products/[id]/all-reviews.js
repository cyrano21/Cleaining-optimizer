// Endpoint API alternatif pour récupérer les avis d'un produit
// Conçu pour être plus tolérant avec les différents formats d'ID
import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  // Seulement autoriser les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Méthode non autorisée'
    });
  }

  try {
    console.log(`Requête all-reviews pour ID: ${id}`);
    
    // Aucune validation préalable du format d'ID
    let product = null;
    
    // 1. Essayer d'abord avec findById (pour les ObjectId)
    try {
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        product = await Product.findById(id)
          .select('reviews')
          .populate('reviews.user', 'name email avatar');
      }
    } catch (idError) {
      console.log(`Erreur lors de la recherche par ObjectId: ${idError.message}`);
    }

    // 2. Si non trouvé, chercher par legacyId (UUID)
    if (!product) {
      try {
        product = await Product.findOne({ legacyId: id })
          .select('reviews')
          .populate('reviews.user', 'name email avatar');
      } catch (legacyError) {
        console.log(`Erreur lors de la recherche par legacyId: ${legacyError.message}`);
      }
    }

    // 3. Si toujours non trouvé, chercher par champ id (parfois les UUIDs sont stockés là)
    if (!product) {
      try {
        product = await Product.findOne({ id: id })
          .select('reviews')
          .populate('reviews.user', 'name email avatar');
      } catch (idFieldError) {
        console.log(`Erreur lors de la recherche par champ id: ${idFieldError.message}`);
      }
    }

    // 4. Si toujours non trouvé, essayer la recherche par slug
    if (!product) {
      try {
        product = await Product.findOne({ slug: id })
          .select('reviews')
          .populate('reviews.user', 'name email avatar');
      } catch (slugError) {
        console.log(`Erreur lors de la recherche par slug: ${slugError.message}`);
      }
    }

    // Si aucune méthode n'a fonctionné
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé avec cet identifiant',
        id: id
      });
    }

    // Filtrer pour les avis approuvés
    const approvedReviews = product.reviews.filter(r => r.approved);

    return res.status(200).json({
      success: true,
      count: approvedReviews.length,
      data: approvedReviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis (endpoint all-reviews):', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des avis',
      error: error.message
    });
  }
}
