
import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Shipping from '../../../models/Shipping';
import Supplier from '../../../models/Supplier';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  await dbConnect();

  // Vérifier l'authentification pour toutes les routes
  if (!session || (!session.user.isAdmin && !session.user.isSeller)) {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { orderId } = req.body;
    
    // Récupérer la commande
    const order = await Order.findById(orderId).populate({
      path: 'items.product',
      model: 'Product',
      populate: {
        path: 'supplier',
        model: 'Supplier'
      }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    
    // Identifier les produits en dropshipping
    const dropshippingItems = order.items.filter(item => 
      item.product.isDropshipping && item.product.supplier
    );
    
    if (dropshippingItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun produit en dropshipping dans cette commande' 
      });
    }
    
    // Regrouper les produits par fournisseur
    const itemsBySupplier = {};
    for (const item of dropshippingItems) {
      const supplierId = item.product.supplier._id.toString();
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = {
          supplier: item.product.supplier,
          items: []
        };
      }
      itemsBySupplier[supplierId].items.push(item);
    }
    
    // Créer une expédition pour chaque fournisseur
    const shippingResults = [];
    for (const supplierId in itemsBySupplier) {
      const supplierInfo = itemsBySupplier[supplierId];
      
      // Créer une expédition
      const shipping = await Shipping.create({
        order: order._id,
        isDropshipping: true,
        supplier: supplierInfo.supplier._id,
        trackingNumber: `DS-${Date.now().toString().slice(-8)}-${supplierId.slice(-4)}`,
        carrier: 'Dropshipping',
        status: 'processing',
        shippingAddress: order.shippingAddress,
        trackingHistory: [{
          status: 'processing',
          location: 'Entrepôt du fournisseur',
          description: 'Commande transmise au fournisseur pour traitement.'
        }],
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      
      shippingResults.push({
        supplierId,
        shipping: shipping._id,
        status: 'processing',
        trackingNumber: shipping.trackingNumber,
        items: supplierInfo.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity
        }))
      });
    }
    
    // Mettre à jour le statut de la commande
    order.status = 'processing';
    order.updatedAt = new Date();
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Commandes dropshipping traitées avec succès',
      data: shippingResults
    });
    
  } catch (error) {
    console.error('Erreur lors du traitement de la commande dropshipping:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la commande dropshipping',
      error: error.message
    });
  }
}
