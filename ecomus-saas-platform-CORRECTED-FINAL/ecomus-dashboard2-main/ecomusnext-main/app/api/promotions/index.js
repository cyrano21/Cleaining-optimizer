import dbConnect from '../../../utils/dbConnect';
import mongoose from 'mongoose';
import Promotion from '../../../models/Promotion';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  try {
    // Vérifier l'état de la connexion MongoDB avant toute opération
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB non connecté, tentative de connexion...');
      const conn = await dbConnect();
      if (!conn || mongoose.connection.readyState !== 1) {
        console.error('Erreur: Impossible de se connecter à MongoDB');
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur de connexion à la base de données',
          error: 'MongoDB connection failed' 
        });
      }
      console.log('Connexion à MongoDB établie avec succès');
    } else {
      console.log('MongoDB déjà connecté');
    }
    
    // GET - Liste toutes les promotions
    if (req.method === 'GET') {
      try {
        const session = await getSession({ req });
        // Vérifier l'authentification pour les détails complets
        const isAdmin = session && session.user && session.user.role === 'admin';
        
        // Filtres
        const { active, code } = req.query;
        let query = {};
        
        // Si l'utilisateur n'est pas admin, renvoyer uniquement les promotions actives
        if (!isAdmin) {
          query.isActive = true;
          query.startDate = { $lte: new Date() };
          query.endDate = { $gte: new Date() };
        } else if (active === 'true') {
          query.isActive = true;
        } else if (active === 'false') {
          query.isActive = false;
        }
        
        if (code) {
          query.code = code.toUpperCase();
        }
        
        // Double vérification de l'état de la connexion MongoDB juste avant d'exécuter la requête
        if (mongoose.connection.readyState !== 1) {
          console.error('Erreur: MongoDB toujours non connecté avant d\'exécuter Promotion.find()');
          return res.status(500).json({ 
            success: false, 
            message: 'Base de données non connectée',
            error: 'MongoDB not connected' 
          });
        }
        
        console.log('Exécution de la requête Promotion.find() avec:', JSON.stringify(query));
        const promotions = await Promotion.find(query)
          .populate('applicableProducts', 'name price imageUrl')
          .populate('applicableCategories', 'name')
          .sort({ createdAt: -1 });
        
        console.log(`${promotions.length} promotions trouvées`);
        return res.status(200).json({ success: true, data: promotions });
      } catch (error) {
        console.error('Erreur lors de la récupération des promotions:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
    }

    // POST - Créer une nouvelle promotion (admin uniquement)
    if (req.method === 'POST') {
      try {
        const session = await getSession({ req });
        // Vérifier les permissions (admin uniquement)
        if (!session || !session.user || session.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const promotionData = {
          ...req.body,
          createdBy: session.user.id
        };
        
        // Validation supplémentaire
        if (promotionData.type === 'percentage' && (promotionData.value < 0 || promotionData.value > 100)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Le pourcentage de réduction doit être compris entre 0 et 100'
          });
        }
        
        if (new Date(promotionData.startDate) > new Date(promotionData.endDate)) {
          return res.status(400).json({ 
            success: false, 
            message: 'La date de début doit être antérieure à la date de fin'
          });
        }

        // Vérifier l'état de la connexion MongoDB avant d'exécuter la requête
        if (mongoose.connection.readyState !== 1) {
          await dbConnect();
          if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ 
              success: false, 
              message: 'Base de données non connectée',
              error: 'MongoDB not connected' 
            });
          }
        }
        
        // Vérifier si le code existe déjà
        const existingPromotion = await Promotion.findOne({ code: promotionData.code.toUpperCase() });
        if (existingPromotion) {
          return res.status(400).json({ 
            success: false, 
            message: 'Ce code de promotion existe déjà'
          });
        }
        
        // Créer la nouvelle promotion
        const newPromotion = await Promotion.create(promotionData);
        
        return res.status(201).json({
          success: true,
          message: 'Promotion créée avec succès',
          data: newPromotion
        });
      } catch (error) {
        console.error('Erreur lors de la création de la promotion:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
    }

    // Pour toutes les autres méthodes HTTP
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  } catch (connError) {
    console.error('Erreur critique dans le handler API:', connError);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur de connexion à la base de données',
      error: connError.message 
    });
  }
}
