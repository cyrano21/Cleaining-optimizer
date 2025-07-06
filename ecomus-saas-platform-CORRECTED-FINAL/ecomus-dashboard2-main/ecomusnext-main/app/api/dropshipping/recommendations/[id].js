import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../utils/dbConnect';
import ProductRecommendation from '../../../../models/ProductRecommendation';

/**
 * API pour gérer une recommandation de produit spécifique
 */
export default async function handler(req, res) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    // Récupérer l'ID de la recommandation
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID de recommandation requis' });
    }
    
    // Connexion à la base de données
    await dbConnect();
    
    switch (req.method) {
      case 'GET':
        await getRecommendation(req, res, id);
        break;
        
      case 'PUT':
        await updateRecommendation(req, res, id);
        break;
        
      case 'DELETE':
        await deleteRecommendation(req, res, id);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API des recommandations de produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Récupère une recommandation de produit spécifique
 */
async function getRecommendation(req, res, id) {
  try {
    const recommendation = await ProductRecommendation.findById(id);
    
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommandation non trouvée' });
    }
    
    res.status(200).json(recommendation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la recommandation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Met à jour une recommandation de produit spécifique
 */
async function updateRecommendation(req, res, id) {
  try {
    const updates = req.body;
    
    // Vérifier si la recommandation existe
    const recommendation = await ProductRecommendation.findById(id);
    
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommandation non trouvée' });
    }
    
    // Mettre à jour les champs spécifiés
    if (updates.seen !== undefined) {
      recommendation.seen = updates.seen;
      if (updates.seen && !recommendation.seenAt) {
        recommendation.seenAt = new Date();
      }
    }
    
    if (updates.reviewed !== undefined) {
      recommendation.reviewed = updates.reviewed;
      if (updates.reviewed) {
        recommendation.reviewedAt = new Date();
      }
    }
    
    if (updates.approved !== undefined) {
      recommendation.approved = updates.approved;
    }
    
    if (updates.imported !== undefined) {
      recommendation.imported = updates.imported;
      if (updates.imported && !recommendation.importedAt) {
        recommendation.importedAt = new Date();
      }
    }
    
    if (updates.localProductId) {
      recommendation.localProductId = updates.localProductId;
    }
    
    // Enregistrer les modifications
    await recommendation.save();
    
    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recommandation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Supprime une recommandation de produit spécifique
 */
async function deleteRecommendation(req, res, id) {
  try {
    const recommendation = await ProductRecommendation.findByIdAndDelete(id);
    
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommandation non trouvée' });
    }
    
    res.status(200).json({ success: true, message: 'Recommandation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la recommandation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
