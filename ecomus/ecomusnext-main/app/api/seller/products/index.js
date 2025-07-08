
import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Vérifier l'authentification et les permissions
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est un vendeur approuvé
  if (session.user.sellerStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé. Votre compte vendeur n\'est pas approuvé.' });
  }

  await dbConnect();
  const sellerId = session.user.id;

  // GET - Récupérer les produits du vendeur
  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 10, 
        filter = 'all',
        sort = 'createdAt',
        order = 'desc',
        search = '' 
      } = req.query;
      
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Construire le filtre de base pour ne voir que les produits du vendeur
      let query = { seller: sellerId };

      // Appliquer des filtres supplémentaires si spécifiés
      if (filter === 'active') {
        query.isActive = true;
      } else if (filter === 'inactive') {
        query.isActive = false;
      } else if (filter === 'low_stock') {
        query.stock = { $lte: 10, $gt: 0 };
      } else if (filter === 'out_of_stock') {
        query.stock = { $lte: 0 };
      }

      // Ajouter la recherche si elle est fournie
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Construire l'ordre de tri
      const sortOptions = {};
      sortOptions[sort] = order === 'asc' ? 1 : -1;

      // Compter le nombre total de produits pour la pagination
      const total = await Product.countDocuments(query);

      // Récupérer les produits avec pagination et tri
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);

      // Calculer le nombre total de pages
      const totalPages = Math.ceil(total / limitNumber);

      return res.status(200).json({
        success: true,
        data: {
          products,
          currentPage: pageNumber,
          totalPages,
          totalProducts: total
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // POST - Créer un nouveau produit
  if (req.method === 'POST') {
    try {
      const productData = {
        ...req.body,
        seller: sellerId,
        createdAt: new Date()
      };

      const newProduct = await Product.create(productData);

      return res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: newProduct
      });
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
