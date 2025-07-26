import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '../../../../utils/dbConnect';
import ProductRecommendation from '../../../../models/ProductRecommendation';

/**
 * API pour gérer les recommandations de produits de dropshipping
 */
export default async function handler(req, res) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    // Connexion à la base de données
    await dbConnect();
    
    switch (req.method) {
      case 'GET':
        await getRecommendations(req, res);
        break;
        
      case 'POST':
        await createRecommendations(req, res);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API des recommandations de produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Récupère les recommandations de produits
 */
async function getRecommendations(req, res) {
  try {
    const { seen, approved, imported, limit = 20, sort = 'score' } = req.query;
    
    // Construire la requête
    const query = {};
    if (seen !== undefined) query.seen = seen === 'true';
    if (approved !== undefined) query.approved = approved === 'true';
    if (imported !== undefined) query.imported = imported === 'true';
    
    // Déterminer le tri
    let sortOption = {};
    switch (sort) {
      case 'score':
        sortOption = { score: -1 };
        break;
      case 'profit':
        sortOption = { potentialProfit: -1 };
        break;
      case 'date':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { score: -1 };
    }
    
    // Récupérer les recommandations
    const recommendations = await ProductRecommendation.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Crée de nouvelles recommandations de produits
 */
async function createRecommendations(req, res) {
  try {
    const { recommendations } = req.body;
    
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucune recommandation fournie' 
      });
    }
    
    const results = [];
    
    // Traiter chaque recommandation
    for (const recommendation of recommendations) {
      try {
        // Vérifier les champs obligatoires
        if (!recommendation.externalId || !recommendation.provider || !recommendation.name) {
          results.push({
            success: false,
            message: 'Champs obligatoires manquants: externalId, provider, name',
            data: recommendation
          });
          continue;
        }
        
        // Vérifier si la recommandation existe déjà
        const existingRecommendation = await ProductRecommendation.findOne({
          provider: recommendation.provider,
          externalId: recommendation.externalId
        });
        
        if (existingRecommendation) {
          // Mettre à jour la recommandation existante
          Object.assign(existingRecommendation, {
            name: recommendation.name,
            price: recommendation.price,
            potentialPrice: recommendation.potentialPrice,
            potentialProfit: recommendation.potentialProfit,
            score: recommendation.score,
            imageUrl: recommendation.imageUrl,
            detailUrl: recommendation.detailUrl,
            category: recommendation.category
          });
          
          await existingRecommendation.save();
          
          results.push({
            success: true,
            message: 'Recommandation mise à jour',
            data: existingRecommendation
          });
        } else {
          // Créer une nouvelle recommandation
          const newRecommendation = new ProductRecommendation(recommendation);
          await newRecommendation.save();
          
          results.push({
            success: true,
            message: 'Recommandation créée',
            data: newRecommendation
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: `Erreur: ${error.message}`,
          data: recommendation
        });
      }
    }
    
    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Erreur lors de la création des recommandations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
