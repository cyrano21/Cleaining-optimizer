import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { dbConnect } from '../../../../lib/mongodb';
import PricingAnalysis from '../../../../models/PricingAnalysis';

/**
 * API pour gérer une analyse de prix spécifique
 * 
 * GET: Récupérer une analyse de prix par ID
 * PUT: Mettre à jour une analyse de prix
 * DELETE: Supprimer une analyse de prix
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
  
  // Récupérer l'ID de l'analyse
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID manquant' });
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
      return getPricingAnalysis(req, res, id);
    case 'PUT':
      return updatePricingAnalysis(req, res, id, session);
    case 'DELETE':
      return deletePricingAnalysis(req, res, id, session);
    default:
      return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
}

/**
 * Récupérer une analyse de prix par ID
 */
async function getPricingAnalysis(req, res, id) {
  try {
    const analysis = await PricingAnalysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analyse de prix non trouvée' });
    }
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'analyse de prix:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'analyse de prix',
      error: error.message
    });
  }
}

/**
 * Mettre à jour une analyse de prix
 */
async function updatePricingAnalysis(req, res, id, session) {
  try {
    const data = req.body;
    
    // Vérifier si l'analyse existe
    const existingAnalysis = await PricingAnalysis.findById(id);
    
    if (!existingAnalysis) {
      return res.status(404).json({ success: false, message: 'Analyse de prix non trouvée' });
    }
    
    // Mettre à jour l'analyse
    const updatedAnalysis = await PricingAnalysis.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: updatedAnalysis
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'analyse de prix:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'analyse de prix',
      error: error.message
    });
  }
}

/**
 * Supprimer une analyse de prix
 */
async function deletePricingAnalysis(req, res, id, session) {
  try {
    const deletedAnalysis = await PricingAnalysis.findByIdAndDelete(id);
    
    if (!deletedAnalysis) {
      return res.status(404).json({ success: false, message: 'Analyse de prix non trouvée' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Analyse de prix supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'analyse de prix:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'analyse de prix',
      error: error.message
    });
  }
}
