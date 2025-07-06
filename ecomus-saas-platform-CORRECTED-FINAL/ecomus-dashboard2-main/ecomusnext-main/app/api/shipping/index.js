import dbConnect from '../../../utils/dbConnect';
import Shipping from '../../../models/Shipping';
import Order from '../../../models/Order';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  await dbConnect();

  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier les permissions (admin uniquement)
  if (session.user.role !== 'admin' && session.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }

  // GET - Liste tous les envois
  if (req.method === 'GET') {
    try {
      const { status, orderId } = req.query;
      
      let query = {};
      if (status) query.status = status;
      if (orderId) query.order = orderId;
      
      const shippings = await Shipping.find(query)
        .populate('order', 'orderNumber totalAmount')
        .sort({ createdAt: -1 });
      
      return res.status(200).json({ success: true, data: shippings });
    } catch (error) {
      console.error('Erreur lors de la récupération des envois:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // POST - Créer un nouvel envoi
  if (req.method === 'POST') {
    try {
      const { orderId, trackingNumber, carrier, estimatedDelivery, shippingAddress } = req.body;
      
      if (!orderId || !trackingNumber || !carrier) {
        return res.status(400).json({ 
          success: false, 
          message: 'Les champs orderId, trackingNumber et carrier sont obligatoires'
        });
      }
      
      // Vérifier si la commande existe
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      
      // Vérifier si un envoi existe déjà pour cette commande
      const existingShipping = await Shipping.findOne({ order: orderId });
      if (existingShipping) {
        return res.status(400).json({ 
          success: false, 
          message: 'Un envoi existe déjà pour cette commande',
          data: existingShipping
        });
      }
      
      // Créer le nouvel envoi
      const newShipping = await Shipping.create({
        order: orderId,
        trackingNumber,
        carrier,
        status: 'processing',
        estimatedDelivery: estimatedDelivery || null,
        shippingAddress: shippingAddress || order.shippingAddress,
        trackingHistory: [{
          status: 'processing',
          location: 'Entrepôt',
          description: 'Commande en cours de traitement'
        }]
      });
      
      // Mettre à jour le statut de la commande
      await Order.findByIdAndUpdate(orderId, { status: 'processing' });
      
      return res.status(201).json({
        success: true,
        message: 'Envoi créé avec succès',
        data: newShipping
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'envoi:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
