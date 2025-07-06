import dbConnect from '../../../../utils/dbConnect';
import Advertisement from '../../../../models/Advertisement';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'POST':
      try {
        const { 
          advertisementId, 
          context, 
          keywords, 
          rotationGroup
        } = req.body;
        
        // Vérifier que les champs requis sont présents
        if (!advertisementId || !context) {
          return res.status(400).json({ 
            success: false, 
            message: 'Tous les champs requis ne sont pas fournis' 
          });
        }
        
        // Récupérer la publicité
        const advertisement = await Advertisement.findById(advertisementId);
        
        if (!advertisement) {
          return res.status(404).json({ 
            success: false, 
            message: 'Publicité non trouvée' 
          });
        }
        
        // Initialiser l'objet d'analytics s'il n'existe pas
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
        
        // Tracking par contexte
        if (!advertisement.analytics.contexts) {
          advertisement.analytics.contexts = {};
        }
        
        if (!advertisement.analytics.contexts[context]) {
          advertisement.analytics.contexts[context] = { 
            impressions: 0, 
            clicks: 0 
          };
        }
        advertisement.analytics.contexts[context].impressions += 1;
        
        // Tracking par mot-clé si disponible
        if (keywords && keywords.length > 0) {
          if (!advertisement.analytics.keywords) {
            advertisement.analytics.keywords = {};
          }
          
          keywords.forEach(keyword => {
            if (!advertisement.analytics.keywords[keyword]) {
              advertisement.analytics.keywords[keyword] = { 
                impressions: 0, 
                clicks: 0 
              };
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
            advertisement.analytics.rotationGroups[rotationGroup] = { 
              impressions: 0, 
              clicks: 0 
            };
          }
          advertisement.analytics.rotationGroups[rotationGroup].impressions += 1;
        }
        
        // Mise à jour de la dernière impression pour la rotation
        advertisement.lastImpression = new Date();
        
        // Enregistrer les données de ciblage contextuel
        await advertisement.save();
        
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des données contextuelles:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
      
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
