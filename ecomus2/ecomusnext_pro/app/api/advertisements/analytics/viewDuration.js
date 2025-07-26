import dbConnect from '../../../../utils/dbConnect';
import Advertisement from '../../../../models/Advertisement';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'POST':
      try {
        const { advertisementId, position, type, page, duration, timestamp, deviceType, viewportSize } = req.body;
        
        // Vérifier que tous les champs requis sont présents
        if (!advertisementId || !duration || !position || !type || !page) {
          return res.status(400).json({ success: false, message: 'Tous les champs requis ne sont pas fournis' });
        }
        
        // Récupérer la publicité
        const advertisement = await Advertisement.findById(advertisementId);
        
        if (!advertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }
        
        // Initialiser l'objet analytics si nécessaire
        if (!advertisement.analytics) {
          advertisement.analytics = {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            viewDurations: [],
            devices: {},
            positions: {},
            pages: {}
          };
        }
        
        // Ajouter la durée de visionnage
        advertisement.analytics.viewDurations.push({
          duration: duration,
          timestamp: timestamp,
          deviceType: deviceType,
          position: position,
          page: page,
          viewportSize: viewportSize
        });
        
        // Limiter le tableau à 1000 entrées pour éviter une croissance excessive
        if (advertisement.analytics.viewDurations.length > 1000) {
          advertisement.analytics.viewDurations = advertisement.analytics.viewDurations.slice(-1000);
        }
        
        // Enregistrer les modifications
        await advertisement.save();
        
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la durée de visionnage:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
      
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
