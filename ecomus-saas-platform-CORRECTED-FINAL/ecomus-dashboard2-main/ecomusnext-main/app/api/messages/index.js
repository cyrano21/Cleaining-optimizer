import dbConnect from '../../../utils/dbConnect';
import Message from '../../../models/Message';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';
import Notification from '../../../models/Notification';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  await dbConnect();

  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // GET - Récupérer les messages de l'utilisateur
  if (req.method === 'GET') {
    try {
      const { type = 'inbox', page = 1, limit = 10, conversationId } = req.query;
      const skip = (page - 1) * parseInt(limit);
      const userId = session.user.id;
      
      let query = {};
      
      // Filtrer par conversation si spécifié
      if (conversationId) {
        query.conversation = conversationId;
      } else {
        // Sinon, filtrer par boîte de réception/envoi
        if (type === 'inbox') {
          query.recipient = userId;
        } else if (type === 'sent') {
          query.sender = userId;
        }
      }

      // Récupérer les messages
      const messages = await Message.find(query)
        .populate('sender', 'name email profileImage role')
        .populate('recipient', 'name email profileImage role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Nombre total de messages pour la pagination
      const total = await Message.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // POST - Créer un nouveau message
  if (req.method === 'POST') {
    try {
      const { recipientId, subject, content, parentMessageId } = req.body;
      const senderId = session.user.id;

      // Vérifier que le destinataire existe
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ success: false, message: 'Destinataire non trouvé' });
      }

      // Déterminer si c'est un nouveau message ou une réponse
      let conversationId = null;
      
      if (parentMessageId) {
        const parentMessage = await Message.findById(parentMessageId);
        if (!parentMessage) {
          return res.status(404).json({ success: false, message: 'Message parent non trouvé' });
        }
        
        // Utiliser la conversation existante ou le message parent comme racine
        conversationId = parentMessage.conversation || parentMessageId;
      }

      // Créer le nouveau message
      const newMessage = new Message({
        sender: senderId,
        recipient: recipientId,
        subject,
        content,
        parentMessage: parentMessageId || null,
        conversation: conversationId
      });

      await newMessage.save();
      
      // Si c'est un nouveau message (pas une réponse), mettre à jour son propre champ conversation
      if (!parentMessageId) {
        await Message.findByIdAndUpdate(newMessage._id, { conversation: newMessage._id });
      }

      // Créer une notification pour le destinataire
      const senderUser = await User.findById(senderId, 'name');
      await Notification.create({
        type: 'system',
        title: 'Nouveau message',
        message: `Vous avez reçu un nouveau message de ${senderUser.name}: ${subject}`,
        recipientId,
        relatedId: newMessage._id,
        onModel: 'Message',
        actionUrl: `/dashboard/messages/${newMessage._id}`
      });

      // Retourner le message créé avec les informations du destinataire et de l'expéditeur
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email profileImage role')
        .populate('recipient', 'name email profileImage role');

      return res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}