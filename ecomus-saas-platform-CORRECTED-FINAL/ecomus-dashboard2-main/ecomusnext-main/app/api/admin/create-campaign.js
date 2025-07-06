// pages/api/admin/create-campaign.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Campaign from '../../../models/Campaign';
import { isAuthenticated, isAdmin } from '../../../middleware/auth';
import { sendEmail } from '../../../utils/mailer';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    console.log('[API create-campaign] Connexion DB réussie');

    const { name, description, type, userIds, message } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le type de campagne sont requis'
      });
    }

    // Trouver les utilisateurs à cibler en fonction du type de campagne
    let targetUsers = [];
    let campaignCriteria = {};

    switch (type) {
      case 'positive':
        // Utilisateurs avec avis positifs (4-5 étoiles)
        campaignCriteria = {
          'reviews.rating': { $gte: 4 },
          'reviews.0': { $exists: true }
        };
        targetUsers = await User.find(campaignCriteria)
          .select('_id name email reviews preferredCategories');
        break;

      case 'frequent':
        // Utilisateurs fréquents (3+ avis)
        campaignCriteria = {
          $expr: { $gte: [{ $size: "$reviews" }, 3] }
        };
        targetUsers = await User.find(campaignCriteria)
          .select('_id name email reviews preferredCategories');
        break;

      case 'inactive':
        // Réactivation des utilisateurs inactifs (pas d'avis depuis 3 mois)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        campaignCriteria = {
          'reviews.0': { $exists: true },
          'lastActivity': { $lt: threeMonthsAgo }
        };
        targetUsers = await User.find(campaignCriteria)
          .select('_id name email reviews preferredCategories lastActivity');
        break;

      case 'specific':
        // Utilisateurs spécifiques
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Vous devez sélectionner au moins un utilisateur pour ce type de campagne'
          });
        }
        
        targetUsers = await User.find({ _id: { $in: userIds } })
          .select('_id name email reviews preferredCategories');
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Type de campagne non valide'
        });
    }

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur ne correspond aux critères de cette campagne'
      });
    }

    // Créer la campagne dans la base de données
    const campaign = new Campaign({
      name,
      description,
      type,
      targetUserCount: targetUsers.length,
      message: message || null,
      createdBy: req.user._id,
      status: 'created'
    });

    await campaign.save();

    // Planifier l'envoi des recommandations (en pratique, cela serait fait par un job en arrière-plan)
    // Pour cette implémentation, nous retournons simplement le succès de la création

    return res.status(200).json({
      success: true,
      message: 'Campagne créée avec succès',
      campaignId: campaign._id,
      usersCount: targetUsers.length
    });
  } catch (error) {
    console.error('[API create-campaign] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

export default isAuthenticated(isAdmin(handler));