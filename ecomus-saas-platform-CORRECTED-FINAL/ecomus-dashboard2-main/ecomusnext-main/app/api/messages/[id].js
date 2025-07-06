import dbConnect from '../../../utils/dbConnect';
import Message from '../../../models/Message';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { id } = req.query;
  await dbConnect();

  // GET - Récupérer un message spécifique
  if (req.method === 'GET') {
    try {
      const userId = session.user.id;
      
      // Récupérer le message
      const message = await Message.findById(id)
        .populate('sender', 'name email profileImage role')
        .populate('recipient', 'name email profileImage role');
      
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message non trouvé' });
      }

      // Vérifier que l'utilisateur est autorisé à voir ce message
      if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à ce message' });
      }

      // Marquer comme lu si c'est le destinataire qui le consulte
      if (message.recipient._id.toString() === userId && !message.read) {
        message.read = true;
        message.readAt = new Date();
        await message.save();
      }

      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour le statut de lecture d'un message
  if (req.method === 'PUT') {
    try {
      const userId = session.user.id;
      const { read } = req.body;
      
      // Récupérer le message
      const message = await Message.findById(id);
      
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message non trouvé' });
      }

      // Vérifier que l'utilisateur est le destinataire
      if (message.recipient.toString() !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Seul le destinataire peut modifier le statut de lecture' 
        });
      }

      // Mettre à jour le statut de lecture
      message.read = read;
      if (read) {
        message.readAt = new Date();
      } else {
        message.readAt = null;
      }
      
      await message.save();

      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer un message
  if (req.method === 'DELETE') {
    try {
      const userId = session.user.id;
      
      // Récupérer le message
      const message = await Message.findById(id);
      
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message non trouvé' });
      }

      // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
      if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à ce message' });
      }

      await message.remove();

      return res.status(200).json({ success: true, message: 'Message supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}