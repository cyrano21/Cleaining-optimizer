import dbConnect from '../../../utils/dbConnect';
import Advertisement from '../../../models/Advertisement';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        // Récupérer les paramètres de la requête
        const { position, type, context, rotationGroup } = req.query;
        
        // Requête de base
        const query = { isActive: true };
        
        // Filtre par position si spécifié
        if (position) {
          query.position = position;
        }
        
        // Filtre par type si spécifié
        if (type) {
          query.type = type;
        }
        
        // Filtre par groupe de rotation si spécifié
        if (rotationGroup) {
          query['rotationSettings.group'] = rotationGroup;
        }
        
        // Condition pour le contexte de ciblage
        if (context) {
          query.$or = [
            { 'targetContext.contexts': { $in: [context] } },
            { 'targetContext.contexts': { $exists: false } },
            { 'targetContext.contexts': { $size: 0 } }
          ];
        }
        
        // Assurer que les dates sont valides
        const currentDate = new Date();
        query.startDate = { $lte: currentDate };
        query.endDate = { $gte: currentDate };
        
        // Récupérer les publicités qui correspondent aux critères
        const advertisements = await Advertisement.find(query)
          .sort({
            // Trier d'abord par priorité
            priority: -1,
            // Puis par stratégie de rotation
            'rotationSettings.strategy': 1,
            // Pour la stratégie de temps, utiliser la date de dernière impression
            lastImpression: 1,
            // Pour la stratégie équilibrée, utiliser le ratio impressions/priorité
            'analytics.impressions': 1
          })
          .limit(10); // Limiter le nombre de résultats
        
        if (!advertisements || advertisements.length === 0) {
          return res.status(200).json({ success: true, data: [] });
        }
        
        // Déterminer quelle publicité doit être affichée selon la stratégie de rotation
        let selectedAd;
        
        // Grouper les annonces par stratégie de rotation
        const adsByStrategy = advertisements.reduce((groups, ad) => {
          const strategy = ad.rotationSettings?.strategy || 'sequential';
          if (!groups[strategy]) {
            groups[strategy] = [];
          }
          groups[strategy].push(ad);
          return groups;
        }, {});
        
        // Priorité aux stratégies: fixe > aléatoire > équilibré > séquentiel > temps
        if (adsByStrategy.fixed && adsByStrategy.fixed.length > 0) {
          // Stratégie fixe: toujours prendre l'annonce de plus haute priorité
          selectedAd = adsByStrategy.fixed[0];
        } else if (adsByStrategy.random && adsByStrategy.random.length > 0) {
          // Stratégie aléatoire: prendre une annonce au hasard dans ce groupe
          const randomIndex = Math.floor(Math.random() * adsByStrategy.random.length);
          selectedAd = adsByStrategy.random[randomIndex];
        } else if (adsByStrategy.balanced && adsByStrategy.balanced.length > 0) {
          // Stratégie équilibrée: prendre l'annonce avec le moins d'impressions par rapport à sa priorité
          selectedAd = adsByStrategy.balanced.reduce((least, current) => {
            const leastRatio = (least.analytics?.impressions || 0) / (least.priority || 1);
            const currentRatio = (current.analytics?.impressions || 0) / (current.priority || 1);
            return currentRatio < leastRatio ? current : least;
          }, adsByStrategy.balanced[0]);
        } else if (adsByStrategy.sequential && adsByStrategy.sequential.length > 0) {
          // Stratégie séquentielle: prendre la prochaine annonce dans l'ordre
          selectedAd = adsByStrategy.sequential[0];
        } else if (adsByStrategy.time && adsByStrategy.time.length > 0) {
          // Stratégie de temps: prendre l'annonce qui n'a pas été affichée depuis le plus longtemps
          selectedAd = adsByStrategy.time[0]; // Déjà triée par lastImpression
        } else {
          // Si aucune stratégie n'est définie, prendre la première annonce
          selectedAd = advertisements[0];
        }
        
        // Mise à jour de la dernière impression pour la rotation
        await Advertisement.findByIdAndUpdate(selectedAd._id, {
          $set: { lastImpression: new Date() }
        });
        
        return res.status(200).json({ 
          success: true,
          data: selectedAd
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des publicités en rotation:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
      
    case 'POST':
      try {
        // Pour mettre à jour les paramètres de rotation d'une publicité
        const { advertisementId, rotationSettings } = req.body;
        
        if (!advertisementId || !rotationSettings) {
          return res.status(400).json({ 
            success: false, 
            message: 'ID de publicité et paramètres de rotation requis' 
          });
        }
        
        const advertisement = await Advertisement.findById(advertisementId);
        
        if (!advertisement) {
          return res.status(404).json({ 
            success: false, 
            message: 'Publicité non trouvée' 
          });
        }
        
        // Mise à jour des paramètres de rotation
        advertisement.rotationSettings = {
          ...advertisement.rotationSettings,
          ...rotationSettings
        };
        
        await advertisement.save();
        
        return res.status(200).json({ 
          success: true, 
          data: advertisement 
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres de rotation:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
