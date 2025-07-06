import dbConnect from '../../../../utils/dbConnect';
import Campaign from '../../../../models/Campaign';
import { isAuthenticated, isAdmin } from '../../../../middleware/auth';

// Handler protégé par authentication et vérification admin
const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  try {
    await dbConnect();
    
    const { id } = req.query;
    const campaign = await Campaign.findById(id)
      .populate('createdBy', 'name email')
      .lean();
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvée' });
    }
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error('Erreur récupération détail campagne :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export default isAuthenticated(isAdmin(handler));