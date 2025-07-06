// pages/api/admin/delete-campaign.js
import dbConnect from "../../../utils/dbConnect";
import Campaign from "../../../models/Campaign";
import { isAuthenticated, isAdmin } from "../../../middleware/auth";

export default isAuthenticated(isAdmin(async function handler(req, res) {
  try {
    // Vérifier que la méthode est DELETE
    if (req.method !== 'DELETE') {
      return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
    }

    // Connexion à la base de données
    await dbConnect();

    const { campaignId } = req.body;

    // Vérification du paramètre requis
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'ID de campagne requis'
      });
    }

    // Récupération de la campagne
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campagne non trouvée'
      });
    }

    // Vérification que la campagne peut être supprimée
    if (campaign.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une campagne en cours d\'exécution. Veuillez d\'abord suspendre la campagne.'
      });
    }

    // Suppression de la campagne
    await Campaign.deleteOne({ _id: campaignId });

    return res.status(200).json({
      success: true,
      message: 'Campagne supprimée avec succès'
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la campagne:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de la campagne"
    });
  }
}));