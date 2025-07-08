import dbConnect from '../../../utils/dbConnect';
import FavoriteShop from '../../../models/FavoriteShop';
import Shop from '../../../models/Shop';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  await dbConnect();
  
  // GET - Récupérer les boutiques favorites de l'utilisateur
  if (req.method === 'GET') {
    try {
      const userId = session.user.id;
      
      const favoriteShops = await FavoriteShop.find({ user: userId })
        .populate({
          path: 'shop',
          populate: [
            { path: 'seller', select: 'businessName' },
            { path: 'categories', select: 'name' }
          ]
        })
        .sort({ addedAt: -1 });
      
      return res.status(200).json({ success: true, data: favoriteShops });
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques favorites:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
  
  // POST - Ajouter une boutique aux favoris
  if (req.method === 'POST') {
    try {
      const userId = session.user.id;
      const { shopId, notes } = req.body;
      
      if (!shopId) {
        return res.status(400).json({ success: false, message: 'ID de boutique requis' });
      }
      
      // Vérifier si la boutique existe
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Boutique non trouvée' });
      }
      
      // Vérifier si la boutique est déjà dans les favoris
      const existingFavorite = await FavoriteShop.findOne({ user: userId, shop: shopId });
      if (existingFavorite) {
        return res.status(400).json({ success: false, message: 'Cette boutique est déjà dans vos favoris' });
      }
      
      // Ajouter aux favoris
      const newFavorite = await FavoriteShop.create({
        user: userId,
        shop: shopId,
        notes: notes || ''
      });
      
      return res.status(201).json({
        success: true,
        message: 'Boutique ajoutée aux favoris',
        data: newFavorite
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
  
  // DELETE - Supprimer toutes les boutiques favorites (non recommandé)
  if (req.method === 'DELETE') {
    return res.status(405).json({ success: false, message: 'Utilisez /api/favorite-shops/[id] pour supprimer une boutique favorite spécifique' });
  }
  
  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
