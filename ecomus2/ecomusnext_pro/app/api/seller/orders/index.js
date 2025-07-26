
import dbConnect from '../../../../utils/dbConnect';
import Order from '../../../../models/Order';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Vérifier l'authentification et les permissions
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est un vendeur approuvé
  if (session.user.sellerStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé. Votre compte vendeur n\'est pas approuvé.' });
  }

  await dbConnect();
  const sellerId = session.user.id;

  // GET - Récupérer les commandes du vendeur
  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 10, 
        filter = 'all',
        sort = 'createdAt',
        order = 'desc',
        search = '' 
      } = req.query;
      
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Récupérer d'abord tous les produits du vendeur
      const products = await Product.find({ seller: sellerId });
      const productIds = products.map(product => product._id);

      // Requête de base pour les commandes contenant des produits du vendeur
      let query = { 'items.product': { $in: productIds } };

      // Ajouter des filtres basés sur le statut
      if (filter !== 'all') {
        query.status = filter;
      }

      // Ajouter la recherche si elle est fournie
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'customerName': { $regex: search, $options: 'i' } },
          { 'customerEmail': { $regex: search, $options: 'i' } }
        ];
      }

      // Construire l'ordre de tri
      const sortOptions = {};
      sortOptions[sort] = order === 'asc' ? 1 : -1;

      // Compter le nombre total de commandes pour la pagination
      const total = await Order.countDocuments(query);

      // Récupérer les commandes avec pagination et tri
      const orders = await Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);

      // Filtrer les commandes pour ne garder que les items des produits du vendeur
      // et calculer le montant total pour le vendeur
      const filteredOrders = orders.map(order => {
        const sellerItems = order.items.filter(item => 
          productIds.some(id => id.toString() === item.product.toString())
        );
        
        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.name,
          customerEmail: order.email,
          status: order.status,
          createdAt: order.createdAt,
          itemCount: sellerItems.length,
          items: sellerItems,
          totalAmount: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
      });

      // Calculer le nombre total de pages
      const totalPages = Math.ceil(total / limitNumber);

      return res.status(200).json({
        success: true,
        data: {
          orders: filteredOrders,
          currentPage: pageNumber,
          totalPages,
          totalOrders: total
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
