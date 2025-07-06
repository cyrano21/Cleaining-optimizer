// pages/api/admin/email-campaigns.js
import dbConnect from "../../../utils/dbConnect";
import Campaign from "../../../models/Campaign";
import { isAuthenticated, isAdmin } from "../../../middleware/auth";

export default isAuthenticated(isAdmin(async function handler(req, res) {
  try {
    // Connexion à la base de données
    await dbConnect();

    // Récupération de toutes les campagnes, triées par date de création (les plus récentes d'abord)
    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    // Renvoie la réponse
    return res.status(200).json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des campagnes"
    });
  }
}));