import dbConnect from '../../../utils/dbConnect';
import Shop from '../../../models/Shop';
import Seller from '../../../models/Seller';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  await dbConnect();

  // GET - Liste toutes les boutiques
  if (req.method === 'GET') {
    try {
      const { active, featured, category, search } = req.query;
      
      let query = {};
      
      // Filtres
      if (active === 'true') query.isActive = true;
      else if (active === 'false') query.isActive = false;
      
      if (featured === 'true') query.isFeatured = true;
      
      if (category) query.categories = category;
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const shops = await Shop.find(query)
        .populate('seller', 'businessName logo')
        .populate('categories', 'name')
        .sort({ isFeatured: -1, createdAt: -1 });
      
      return res.status(200).json({ success: true, data: shops });
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // POST - Créer une nouvelle boutique (vendeur ou admin uniquement)
  if (req.method === 'POST') {
    try {
      // Vérifier l'authentification
      if (!session) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }
      
      // Vérifier les permissions
      const isAdmin = session.user.role === 'admin';
      const isSeller = session.user.role === 'seller';
      
      if (!isAdmin && !isSeller) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      
      // Vérifier si le vendeur existe
      const sellerId = req.body.seller || session.user.id;
      
      if (!isAdmin && sellerId !== session.user.id) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      
      const seller = await Seller.findOne({ user: sellerId });
      
      if (!seller) {
        return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
      }
      
      if (seller.status !== 'approved') {
        return res.status(403).json({ success: false, message: 'Le vendeur doit être approuvé pour créer une boutique' });
      }
      
      // Vérifier si le nom de boutique est déjà utilisé
      const existingShop = await Shop.findOne({ name: req.body.name });
      if (existingShop) {
        return res.status(400).json({ success: false, message: 'Ce nom de boutique est déjà utilisé' });
      }
      
      // Créer la boutique
      const shopData = {
        ...req.body,
        seller: seller._id,
        isActive: isAdmin ? req.body.isActive : true,
        isFeatured: isAdmin ? req.body.isFeatured : false,
        isVerified: isAdmin ? req.body.isVerified : false
      };
      
      const newShop = await Shop.create(shopData);
      
      return res.status(201).json({
        success: true,
        message: 'Boutique créée avec succès',
        data: newShop
      });
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
