import dbConnect from '../../../utils/dbConnect';
import Seller from '../../../models/Seller';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';
import { sendSellerStatusEmail } from '../../../utils/mailer';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  await dbConnect();

  // Vérifier les permissions (admin ou le vendeur lui-même)
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const isAdmin = session.user.role === 'admin';
  const isSeller = session.user.id === id;

  if (!isAdmin && !isSeller) {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }

  // GET - Obtenir les détails d'un vendeur
  if (req.method === 'GET') {
    try {
      const seller = await Seller.findOne({ user: id }).populate('user', 'name email profileImage');
      
      if (!seller) {
        return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
      }

      return res.status(200).json({ success: true, data: seller });
    } catch (error) {
      console.error('Erreur lors de la récupération du vendeur:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour un vendeur
  if (req.method === 'PUT') {
    try {
      // Si c'est un admin qui fait la mise à jour, vérifier s'il y a un changement de statut
      if (isAdmin && req.body.status) {
        const seller = await Seller.findOne({ user: id }).populate('user', 'name email');
        const newStatus = req.body.status;
        const adminMessage = req.body.adminMessage || '';
        
        // Mettre à jour le statut du vendeur dans la table User
        if (seller && seller.status !== newStatus) {
          // Mettre à jour le statut du vendeur
          if (newStatus === 'approved') {
            await User.findByIdAndUpdate(id, { role: 'seller', sellerStatus: 'approved' });
            req.body.approvedAt = new Date();
          } else if (newStatus === 'rejected') {
            await User.findByIdAndUpdate(id, { sellerStatus: 'rejected' });
          } else if (newStatus === 'suspended') {
            await User.findByIdAndUpdate(id, { sellerStatus: 'suspended' });
          }
          
          // Envoyer un email au vendeur pour l'informer du changement de statut
          if (seller.user && seller.user.email) {
            try {
              await sendSellerStatusEmail(
                seller.user.email,
                seller.companyName || seller.user.name,
                newStatus,
                adminMessage
              );
              console.log(`Email de notification de statut '${newStatus}' envoyé à ${seller.user.email}`);
            } catch (emailError) {
              console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
              // Ne pas bloquer la mise à jour si l'envoi d'email échoue
            }
          }
        }
      }

      // Mettre à jour les données du vendeur
      const updatedSeller = await Seller.findOneAndUpdate(
        { user: id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedSeller) {
        return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
      }

      return res.status(200).json({ success: true, data: updatedSeller });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du vendeur:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer un vendeur (admin uniquement)
  if (req.method === 'DELETE') {
    try {
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Seuls les administrateurs peuvent supprimer des vendeurs' });
      }

      const deletedSeller = await Seller.findOneAndDelete({ user: id });
      
      if (!deletedSeller) {
        return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
      }

      // Réinitialiser le rôle de l'utilisateur à "user"
      await User.findByIdAndUpdate(id, { role: 'user', sellerStatus: null });

      return res.status(200).json({ success: true, message: 'Vendeur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du vendeur:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
