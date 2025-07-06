import dbConnect from '../../../utils/dbConnect';
import Shop from '../../../models/Shop';
// Import de Seller retiré car non utilisé
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  await dbConnect();

  // GET - Obtenir une boutique spécifique
  if (req.method === 'GET') {
    try {
      const shop = await Shop.findById(id)
        .populate('seller', 'businessName contactEmail contactPhone')
        .populate('categories', 'name');
      
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Boutique non trouvée' });
      }

      return res.status(200).json({ success: true, data: shop });
    } catch (error) {
      console.error('Erreur lors de la récupération de la boutique:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour une boutique (vendeur propriétaire ou admin uniquement)
  if (req.method === 'PUT') {
    try {
      // Vérifier l'authentification
      if (!session) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }
      
      const shop = await Shop.findById(id).populate('seller');
      
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Boutique non trouvée' });
      }
      
      // Vérifier les permissions
      const isAdmin = session.user.role === 'admin';
      const isOwner = shop.seller && shop.seller.user.toString() === session.user.id;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      
      // Restreindre certains champs aux admins uniquement
      let updateData = { ...req.body };
      
      if (!isAdmin) {
        // Suppression des champs réservés aux admins
        delete updateData.isVerified;
        delete updateData.isFeatured;
      }
      
      // Mettre à jour la boutique
      const updatedShop = await Shop.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Boutique mise à jour avec succès',
        data: updatedShop
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la boutique:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer une boutique (admin uniquement)
  if (req.method === 'DELETE') {
    try {
      // Vérifier l'authentification
      if (!session) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }
      
      // Vérifier les permissions (admin uniquement)
      if (session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      
      const shop = await Shop.findById(id);
      
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Boutique non trouvée' });
      }
      
      await Shop.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Boutique supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la boutique:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
