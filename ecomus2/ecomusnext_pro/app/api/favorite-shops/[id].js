import dbConnect from '../../../utils/dbConnect';
import FavoriteShop from '../../../models/FavoriteShop';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  await dbConnect();
  
  // GET - Obtenir une boutique favorite spécifique
  if (req.method === 'GET') {
    try {
      const userId = session.user.id;
      
      const favoriteShop = await FavoriteShop.findOne({ _id: id, user: userId })
        .populate({
          path: 'shop',
          populate: [
            { path: 'seller', select: 'businessName contactEmail contactPhone' },
            { path: 'categories', select: 'name' }
          ]
        });
      
      if (!favoriteShop) {
        return res.status(404).json({ success: false, message: 'Boutique favorite non trouvée' });
      }
      
      return res.status(200).json({ success: true, data: favoriteShop });
    } catch (error) {
      console.error('Erreur lors de la récupération de la boutique favorite:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
  
  // PUT - Mettre à jour les notes d'une boutique favorite
  if (req.method === 'PUT') {
    try {
      const userId = session.user.id;
      const { notes } = req.body;
      
      const favoriteShop = await FavoriteShop.findOne({ _id: id, user: userId });
      
      if (!favoriteShop) {
        return res.status(404).json({ success: false, message: 'Boutique favorite non trouvée' });
      }
      
      // Mettre à jour les notes
      favoriteShop.notes = notes || '';
      await favoriteShop.save();
      
      return res.status(200).json({
        success: true,
        message: 'Notes mises à jour avec succès',
        data: favoriteShop
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
  
  // DELETE - Supprimer une boutique des favoris
  if (req.method === 'DELETE') {
    try {
      const userId = session.user.id;
      
      const favoriteShop = await FavoriteShop.findOne({ _id: id, user: userId });
      
      if (!favoriteShop) {
        return res.status(404).json({ success: false, message: 'Boutique favorite non trouvée' });
      }
      
      await FavoriteShop.deleteOne({ _id: id, user: userId });
      
      return res.status(200).json({
        success: true,
        message: 'Boutique supprimée des favoris'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
  
  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
