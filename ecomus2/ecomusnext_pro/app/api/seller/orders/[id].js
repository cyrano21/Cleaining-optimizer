
import dbConnect from '../../../../utils/dbConnect';
import Order from '../../../../models/Order';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
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

  // Vérifier que la commande contient des produits du vendeur
  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Commande non trouvée' });
  }

  // Récupérer tous les produits du vendeur
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map(product => product._id.toString());

  // Vérifier si la commande contient au moins un produit du vendeur
  const hasSellerProducts = order.items.some(item => 
    productIds.includes(item.product.toString())
  );

  if (!hasSellerProducts) {
    return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à accéder à cette commande' });
  }

  // GET - Récupérer les détails d'une commande
  if (req.method === 'GET') {
    try {
      // Filtrer les éléments de la commande pour ne montrer que ceux du vendeur
      const sellerItems = order.items.filter(item => 
        productIds.includes(item.product.toString())
      );

      // Enrichir les données des produits
      const enrichedItems = await Promise.all(sellerItems.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          ...item.toObject(),
          productName: product ? product.name : 'Produit inconnu',
          productImage: product ? product.img : null
        };
      }));

      // Calculer le total pour le vendeur
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderDetails = {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: enrichedItems,
        totalAmount: sellerTotal,
        note: order.note
      };

      return res.status(200).json({ success: true, data: orderDetails });
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour le statut d'une commande
  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      // Vérifier que le statut est valide
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Statut de commande invalide' });
      }

      // Mettre à jour seulement le statut de la commande
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { 
          status,
          updatedAt: new Date() 
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Statut de commande mis à jour avec succès',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
