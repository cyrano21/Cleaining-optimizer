
import dbConnect from '../../../../utils/dbConnect';
import Order from '../../../../models/Order';
import Product from '../../../../models/Product';
import { getFrequentlyBoughtTogether } from '../../../../utils/recommendationEngine';

export default async function handler(req, res) {
  const {
    query: { id, limit = 3 },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // Vérifier si le produit existe
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ success: false, error: 'Produit non trouvé' });
        }

        // Obtenir toutes les commandes contenant ce produit
        const orders = await Order.find({
          'items.product': id
        }).populate('items.product').limit(100); // Limiter à 100 pour performance

        // Utiliser la fonction du moteur de recommandation
        const relatedProductIds = getFrequentlyBoughtTogether(
          { _id: id },
          orders,
          parseInt(limit, 10)
        );

        // Si nous avons des produits connexes
        if (relatedProductIds && relatedProductIds.length > 0) {
          // Récupérer les produits complets
          const relatedProducts = await Product.find({
            _id: { $in: relatedProductIds },
            _id: { $ne: id } // Exclure le produit actuel
          }).limit(parseInt(limit, 10));

          return res.status(200).json({
            success: true,
            products: relatedProducts
          });
        }

        // Si pas de produits connexes, obtenir les produits de la même catégorie
        const similarProducts = await Product.find({
          category: product.category,
          _id: { $ne: id } // Exclure le produit actuel
        }).limit(parseInt(limit, 10));

        return res.status(200).json({
          success: true,
          products: similarProducts
        });
      } catch (error) {
        console.error('Erreur dans bought-together API:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, error: `Méthode ${method} non autorisée` });
  }
}
