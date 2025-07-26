import dbConnect from '../../../utils/dbConnect';
import Shipping from '../../../models/Shipping';
import Order from '../../../models/Order';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  await dbConnect();

  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // GET - Obtenir un envoi spécifique (accessible aux utilisateurs)
  if (req.method === 'GET') {
    try {
      const shipping = await Shipping.findById(id).populate('order');
      
      if (!shipping) {
        return res.status(404).json({ success: false, message: 'Envoi non trouvé' });
      }

      // Vérifier si l'utilisateur est autorisé (admin, vendeur ou propriétaire de la commande)
      const isAdmin = session.user.role === 'admin';
      const isSeller = session.user.role === 'seller';
      const isOwner = shipping.order.user && shipping.order.user.toString() === session.user.id;
      
      if (!isAdmin && !isSeller && !isOwner) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      return res.status(200).json({ success: true, data: shipping });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'envoi:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour un envoi (admin uniquement)
  if (req.method === 'PUT') {
    try {
      // Vérifier les permissions (admin ou vendeur uniquement)
      if (session.user.role !== 'admin' && session.user.role !== 'seller') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const shipping = await Shipping.findById(id);
      
      if (!shipping) {
        return res.status(404).json({ success: false, message: 'Envoi non trouvé' });
      }
      
      // Mettre à jour les champs
      const { status, trackingNumber, carrier, estimatedDelivery } = req.body;
      
      if (status) shipping.status = status;
      if (trackingNumber) shipping.trackingNumber = trackingNumber;
      if (carrier) shipping.carrier = carrier;
      if (estimatedDelivery) shipping.estimatedDelivery = estimatedDelivery;
      
      // Si une mise à jour de l'historique de tracking est incluse
      if (req.body.trackingEvent) {
        const { eventStatus, location, description } = req.body.trackingEvent;
        
        shipping.trackingHistory.push({
          status: eventStatus,
          location,
          description,
          timestamp: new Date()
        });
        
        shipping.status = eventStatus;
        
        // Si le statut est "delivered", mettre à jour la date de livraison réelle
        if (eventStatus === 'delivered') {
          shipping.actualDelivery = new Date();
          
          // Mettre également à jour le statut de la commande
          await Order.findByIdAndUpdate(shipping.order, { status: 'delivered' });
        }
      }
      
      await shipping.save();
      
      return res.status(200).json({ success: true, data: shipping });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'envoi:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer un envoi (admin uniquement)
  if (req.method === 'DELETE') {
    try {
      // Vérifier les permissions (admin uniquement)
      if (session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const shipping = await Shipping.findById(id);
      
      if (!shipping) {
        return res.status(404).json({ success: false, message: 'Envoi non trouvé' });
      }
      
      await Shipping.findByIdAndDelete(id);
      
      return res.status(200).json({ success: true, message: 'Envoi supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'envoi:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
