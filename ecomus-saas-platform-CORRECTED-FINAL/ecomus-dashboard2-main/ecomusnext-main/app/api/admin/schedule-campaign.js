// pages/api/admin/schedule-campaign.js
import dbConnect from '../../../utils/dbConnect';
import Campaign from '../../../models/Campaign';
import { isAuthenticated, isAdmin } from '../../../middleware/auth';

// Handler protégé par authentication et vérification admin
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    await dbConnect();
    
    const { campaignId, startDate } = req.body;
    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'ID de campagne requis' });
    }
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvée' });
    }
    
    campaign.status = 'scheduled';
    campaign.startDate = startDate ? new Date(startDate) : new Date();
    await campaign.save();
    
    return res.status(200).json({ success: true, message: 'Campagne programmée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la programmation de la campagne:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export default isAuthenticated(isAdmin(handler));