import dbConnect from '../../../../utils/dbConnect';
import Advertisement from '../../../../models/Advertisement';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'POST':
      try {
        const { advertisementId, position, type, page, deviceType, pageContext, keywords, rotationGroup } = req.body;
        
        // Vérifier que tous les champs requis sont présents
        if (!advertisementId || !position || !type || !page) {
          return res.status(400).json({ success: false, message: 'Tous les champs requis ne sont pas fournis' });
        }
        
        // Récupérer la publicité
        const advertisement = await Advertisement.findById(advertisementId);
        
        if (!advertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }
        
        // Incrémenter le nombre d'impressions
        if (!advertisement.analytics) {
          advertisement.analytics = {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            viewDurations: [],
            devices: {},
            positions: {},
            pages: {},
            contexts: {},
            keywords: {},
            rotationGroups: {}
          };
        }
        
        // Mettre à jour les statistiques
        advertisement.analytics.impressions += 1;
        advertisement.analytics.ctr = (advertisement.analytics.clicks / advertisement.analytics.impressions) * 100;
        
        // Tracking par appareil
        if (!advertisement.analytics.devices[deviceType]) {
          advertisement.analytics.devices[deviceType] = { impressions: 0, clicks: 0 };
        }
        advertisement.analytics.devices[deviceType].impressions += 1;
        
        // Tracking par position
        if (!advertisement.analytics.positions[position]) {
          advertisement.analytics.positions[position] = { impressions: 0, clicks: 0 };
        }
        advertisement.analytics.positions[position].impressions += 1;
        
        // Tracking par page
        if (!advertisement.analytics.pages[page]) {
          advertisement.analytics.pages[page] = { impressions: 0, clicks: 0 };
        }
        advertisement.analytics.pages[page].impressions += 1;
        
        // Tracking par contexte si disponible
        if (pageContext) {
          if (!advertisement.analytics.contexts) {
            advertisement.analytics.contexts = {};
          }
          if (!advertisement.analytics.contexts[pageContext]) {
            advertisement.analytics.contexts[pageContext] = { impressions: 0, clicks: 0 };
          }
          advertisement.analytics.contexts[pageContext].impressions += 1;
        }
        
        // Tracking par mot-clé si disponible
        if (keywords && keywords.length > 0) {
          if (!advertisement.analytics.keywords) {
            advertisement.analytics.keywords = {};
          }
          keywords.forEach(keyword => {
            if (!advertisement.analytics.keywords[keyword]) {
              advertisement.analytics.keywords[keyword] = { impressions: 0, clicks: 0 };
            }
            advertisement.analytics.keywords[keyword].impressions += 1;
          });
        }
        
        // Tracking par groupe de rotation
        if (rotationGroup) {
          if (!advertisement.analytics.rotationGroups) {
            advertisement.analytics.rotationGroups = {};
          }
          if (!advertisement.analytics.rotationGroups[rotationGroup]) {
            advertisement.analytics.rotationGroups[rotationGroup] = { impressions: 0, clicks: 0 };
          }
          advertisement.analytics.rotationGroups[rotationGroup].impressions += 1;
        }

        // Mise à jour de la dernière impression pour la rotation
        advertisement.lastImpression = new Date();
        
        // Enregistrer l'impression
        await advertisement.save();
        
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'impression:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
      
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
