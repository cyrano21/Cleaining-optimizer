import dbConnect from '../../../utils/dbConnect';
import Seller from '../../../models/Seller';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  await dbConnect();

  // GET - Liste tous les vendeurs (admin uniquement)
  if (req.method === 'GET') {
    try {
      // Vérifier les permissions
      if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const { status } = req.query;
      let query = {};
      
      // Filtrer par statut si spécifié
      if (status) {
        query.status = status;
      }

      const sellers = await Seller.find(query).populate('user', 'name email profileImage');
      return res.status(200).json({ success: true, data: sellers });
    } catch (error) {
      console.error('Erreur lors de la récupération des vendeurs:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // POST - Soumettre une demande de vendeur
  if (req.method === 'POST') {
    try {
      // Vérifier que l'utilisateur est connecté
      if (!session) {
        return res.status(401).json({ success: false, message: 'Vous devez être connecté pour soumettre une demande' });
      }

      const userId = session.user.id;
      
      // Vérifier si l'utilisateur a déjà soumis une demande
      const existingSeller = await Seller.findOne({ user: userId });
      if (existingSeller) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vous avez déjà soumis une demande de vendeur',
          status: existingSeller.status
        });
      }

      // Créer la nouvelle demande
      const sellerData = {
        ...req.body,
        user: userId,
        status: 'pending'
      };

      const newSeller = await Seller.create(sellerData);

      // Mettre à jour le rôle de l'utilisateur à "seller_pending"
      await User.findByIdAndUpdate(userId, {
        $set: { sellerStatus: 'pending' }
      });

      return res.status(201).json({
        success: true,
        message: 'Demande de vendeur soumise avec succès',
        data: newSeller
      });
    } catch (error) {
      console.error('Erreur lors de la création de la demande vendeur:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
