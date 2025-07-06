import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { dbConnect } from '../../../../lib/mongodb';
import PricingAnalysis from '../../../../models/PricingAnalysis';

/**
 * API pour gérer les analyses de prix des produits de dropshipping
 * 
 * GET: Récupérer les analyses de prix (filtrage possible)
 * POST: Créer une nouvelle analyse de prix
 */
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }
  
  // Vérifier le rôle d'administrateur
  if (session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }
  
  // Connecter à la base de données
  try {
    await dbConnect();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return res.status(500).json({ success: false, message: 'Erreur de connexion à la base de données' });
  }
  
  // Traiter la requête selon la méthode
  switch (req.method) {
    case 'GET':
      return getPricingAnalyses(req, res, session);
    case 'POST':
      return createPricingAnalysis(req, res, session);
    default:
      return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
}

/**
 * Récupérer les analyses de prix avec filtrage
 */
async function getPricingAnalyses(req, res, session) {
  try {
    const { 
      provider, 
      productId, 
      externalProductId,
      status,
      limit = 20, 
      skip = 0,
      sort = '-createdAt'
    } = req.query;
    
    // Construire le filtre
    const filter = {};
    
    if (provider) {
      filter['externalProduct.provider'] = provider;
    }
    
    if (productId) {
      filter.productId = productId;
    }
    
    if (externalProductId) {
      filter['externalProduct.id'] = externalProductId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Exécuter la requête
    const analyses = await PricingAnalysis
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    // Compter le nombre total pour la pagination
    const total = await PricingAnalysis.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analyses de prix:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analyses de prix',
      error: error.message
    });
  }
}

/**
 * Créer une nouvelle analyse de prix
 */
async function createPricingAnalysis(req, res, session) {
  try {
    const data = req.body;
    
    // Ajouter l'ID de l'utilisateur
    data.userId = session.user.id;
    
    // Créer l'analyse de prix
    const analysis = await PricingAnalysis.create(data);
    
    return res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'analyse de prix:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'analyse de prix',
      error: error.message
    });
  }
}
