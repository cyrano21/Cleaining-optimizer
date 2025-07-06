// Fichier pour gérer les notifications d'administration
import dbConnect from '../../../utils/dbConnect';
import Notification from '../../../models/Notification';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Vérification que l'utilisateur est un administrateur
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }

  await dbConnect();

  // GET - Récupérer les notifications pour l'administrateur
  if (req.method === 'GET') {
    try {
      const { type, limit = 10, read } = req.query;

      // Construire la requête
      const query = { 
        recipientId: session.user.id,
      };

      // Filtrer par type si spécifié
      if (type) {
        query.type = type;
      }

      // Filtrer par statut de lecture si spécifié
      if (read !== undefined) {
        query.read = read === 'true';
      }

      // Trouver les notifications et les trier par date
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      // Compter les notifications non lues
      const unreadCount = await Notification.countDocuments({
        recipientId: session.user.id,
        read: false
      });

      return res.status(200).json({
        success: true,
        data: notifications,
        unreadCount
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // PUT - Marquer les notifications comme lues
  if (req.method === 'PUT') {
    try {
      const { ids, all } = req.body;

      if (all) {
        // Marquer toutes les notifications comme lues
        await Notification.updateMany(
          { recipientId: session.user.id, read: false },
          { $set: { read: true, readAt: new Date() } }
        );

        return res.status(200).json({
          success: true,
          message: 'Toutes les notifications ont été marquées comme lues'
        });
      } else if (ids && ids.length > 0) {
        // Marquer les notifications spécifiées comme lues
        await Notification.updateMany(
          { _id: { $in: ids }, recipientId: session.user.id },
          { $set: { read: true, readAt: new Date() } }
        );

        return res.status(200).json({
          success: true,
          message: 'Notifications marquées comme lues'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Aucune notification spécifiée'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // DELETE - Supprimer des notifications
  if (req.method === 'DELETE') {
    try {
      const { ids, all } = req.body;

      if (all) {
        // Supprimer toutes les notifications de l'utilisateur
        await Notification.deleteMany({ recipientId: session.user.id });

        return res.status(200).json({
          success: true,
          message: 'Toutes les notifications ont été supprimées'
        });
      } else if (ids && ids.length > 0) {
        // Supprimer les notifications spécifiées
        await Notification.deleteMany({ 
          _id: { $in: ids }, 
          recipientId: session.user.id 
        });

        return res.status(200).json({
          success: true,
          message: 'Notifications supprimées avec succès'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Aucune notification spécifiée'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}