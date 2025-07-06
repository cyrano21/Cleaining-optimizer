// API pour gérer les produits récemment consultés
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../config/db';
import User from '../../../models/User';
import Product from '../../../models/Product';
import mongoose from 'mongoose';

// Cette API gère les produits récemment consultés pour les utilisateurs connectés
// ou via un cookie pour les visiteurs anonymes
export default async function handler(req, res) {
  // Autorise uniquement GET (récupérer) et POST (ajouter)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
  } catch (dbErr) {
    console.error('Erreur de connexion à la base de données:', dbErr);
    return res.status(500).json({ 
      error: 'Erreur de connexion à la base de données', 
      details: process.env.NODE_ENV === 'development' ? dbErr.message : null 
    });
  }

  // Récupérer la session de l'utilisateur si connecté
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id || null;

  // Obtenir l'ID du visiteur anonyme depuis les cookies si pas connecté
  const visitorId = !userId ? (req.cookies.visitorId || null) : null;

  // POST: Ajouter un produit aux récemment consultés
  if (req.method === 'POST') {
    console.log('==== API POST recently-viewed ====');
    const { productId } = req.body;
    console.log('Produit ID reçu:', productId);
    
    if (!productId) {
      console.log('Erreur: ID du produit manquant');
      return res.status(400).json({ error: 'ID du produit requis' });
    }

    try {
      // Vérifier que le produit existe
      let productExists;
      
      if (mongoose.isValidObjectId(productId)) {
        productExists = await Product.exists({ _id: productId });
      }
      
      if (!productExists) {
        // Fallback pour les IDs non-MongoDB (données statiques)
        // Vérification légère pour éviter d'ajouter des IDs invalides
        if (!/^[a-zA-Z0-9_-]{3,40}$/.test(productId)) {
          return res.status(400).json({ error: 'ID de produit invalide' });
        }
      }

      // Utilisateur connecté: stocker dans le profil
      if (userId) {
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Initialiser le tableau s'il n'existe pas
        if (!user.recentlyViewedProducts) {
          user.recentlyViewedProducts = [];
        }
        
        // Supprimer si le produit est déjà dans la liste
        user.recentlyViewedProducts = user.recentlyViewedProducts.filter(
          id => id.toString() !== productId.toString()
        );
        
        // Ajouter en tête de liste
        user.recentlyViewedProducts.unshift(productId);
        
        // Limiter à 10 produits maximum
        if (user.recentlyViewedProducts.length > 10) {
          user.recentlyViewedProducts = user.recentlyViewedProducts.slice(0, 10);
        }
        
        await user.save();
        
        return res.status(200).json({ 
          success: true,
          message: 'Produit ajouté aux produits récemment consultés',
          recentlyViewed: user.recentlyViewedProducts
        });
      } 
      // Visiteur anonyme: utiliser un cookie
      else {
        // Pour cette version initiale, nous utilisons un cookie simple
        // En production, cela pourrait être amélioré
        
        // Récupérer la liste actuelle
        const currentList = req.cookies.recentlyViewed 
          ? JSON.parse(req.cookies.recentlyViewed) 
          : [];
          
        // Supprimer si présent
        const updatedList = currentList.filter(id => id !== productId);
        
        // Ajouter en tête
        updatedList.unshift(productId);
        
        // Limiter à 10
        const limitedList = updatedList.slice(0, 10);
        
        // Définir le cookie
        res.setHeader('Set-Cookie', `recentlyViewed=${JSON.stringify(limitedList)}; Path=/; Max-Age=${60*60*24*30}`);
        
        return res.status(200).json({ 
          success: true,
          message: 'Produit ajouté aux produits récemment consultés',
          recentlyViewed: limitedList
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit aux récemment consultés:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
  
  // GET: Récupérer les produits récemment consultés
  if (req.method === 'GET') {
    console.log('==== API GET recently-viewed ====');
    const excludeId = req.query.exclude; // ID du produit actuel à exclure
    const limit = parseInt(req.query.limit) || 3; // Nombre de produits à récupérer
    console.log(`Paramètres: excludeId=${excludeId}, limit=${limit}`);
    
    try {
      let productIds = [];
      console.log('Session user ID:', userId);
      
      // Utilisateur connecté: récupérer depuis le profil
      if (userId) {
        console.log('Recherche des produits récents pour l\'utilisateur:', userId);
        const user = await User.findById(userId);
        
        if (user && user.recentlyViewedProducts) {
          productIds = user.recentlyViewedProducts;
          console.log(`Trouvé ${productIds.length} produits récents dans le profil utilisateur`);
        } else {
          console.log('Aucun produit récent trouvé dans le profil utilisateur');
        }
      } 
      // Visiteur anonyme: récupérer depuis le cookie
      else if (req.cookies.recentlyViewed) {
        console.log('Recherche des produits récents dans les cookies');
        try {
          productIds = JSON.parse(req.cookies.recentlyViewed);
          console.log(`Trouvé ${productIds.length} produits récents dans les cookies`);
        } catch (e) {
          console.error('Erreur lors de la lecture du cookie:', e);
        }
      } else {
        console.log('Aucun cookie recentlyViewed trouvé');
      }
      
      // Filtrer le produit actuel si nécessaire
      if (excludeId) {
        console.log(`Filtrage du produit actuel: ${excludeId}`);
        const oldLength = productIds.length;
        productIds = productIds.filter(id => id.toString() !== excludeId.toString());
        console.log(`Après filtrage: ${oldLength} -> ${productIds.length} produits`);
      }
      
      // Limiter le nombre
      const originalLength = productIds.length;
      productIds = productIds.slice(0, limit);
      console.log(`Limitation du nombre: ${originalLength} -> ${productIds.length} produits (limite: ${limit})`);
      
      // Si pas de produits récents, retourner tableau vide
      if (productIds.length === 0) {
        console.log('Aucun produit récent trouvé après filtrage');
        return res.status(200).json({ 
          success: true,
          data: []
        });
      }
      console.log('IDs des produits récemment consultés:', productIds);
      
      // Récupérer les données complètes des produits depuis MongoDB
      const validMongoIds = productIds.filter(id => mongoose.isValidObjectId(id));
      console.log('IDs MongoDB valides pour récupération:', validMongoIds);
      
      if (validMongoIds.length === 0) {
        console.log('Aucun ID MongoDB valide, retour tableau vide');
        return res.status(200).json({ 
          success: true,
          data: []
        });
      }
      
      let products = [];
      
      if (validMongoIds.length > 0) {
        products = await Product.find({ _id: { $in: validMongoIds } })
          .select('name price salePrice discountPrice img image imageUrl thumbnails thumbnail images gallery category rating ratingsCount stock')
          .populate('category', 'name')
          .lean();
          
        console.log(`Récupéré ${products.length} produits récents depuis MongoDB`);
        if (products.length > 0) {
          // Vérifier si les produits ont des attributs d'image
          products.forEach(product => {
            console.log(`Produit récent [${product._id}] ${product.name}:`, {
              img: product.img ? 'Oui' : 'Non',
              image: product.image ? 'Oui' : 'Non',
              images: product.images ? `${Array.isArray(product.images) ? product.images.length : 'Non tableau'}` : 'Non',
              galerie: product.gallery ? `${Array.isArray(product.gallery) ? product.gallery.length : 'Non tableau'}` : 'Non'
            });
          });
        }
      }
      
      // Pour les IDs non-MongoDB (produits statiques), on peut compléter ici
      // avec une recherche dans les données statiques si nécessaire
      
      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des produits récemment consultés:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
}
