import dbConnect from '../../../utils/dbConnect';
import Advertisement from '../../../models/Advertisement';

export default async function handler(req, res) {
  const { method } = req;
  
  // Connexion à la base de données
  await dbConnect();

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Méthode ${method} non autorisée` });
  }

  try {
    // Récupérer les paramètres de filtrage et de pagination
    const { 
      status, type, position, isActive, limit = 10, 
      sortBy = 'createdAt', sortOrder = 'desc', currentDate,
      targetContext, tags
    } = req.query;
    
    // Construire le filtre de requête
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (position) query.position = position;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Support du ciblage contextuel
    if (targetContext) {
      query['targetContext'] = targetContext;
    }
    
    // Support du ciblage par mots-clés
    if (tags) {
      const tagsList = Array.isArray(tags) ? tags : tags.split(',');
      query['tags'] = { $in: tagsList };
    }
    
    // Si currentDate est fourni, filtrer par date de validité
    if (currentDate) {
      const now = new Date(currentDate);
      query.$and = [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
      ];
    }
    
    // Déterminer le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Récupérer les publicités avec tri et limite
    const advertisements = await Advertisement.find(query)
      .sort(sort)
      .limit(parseInt(limit));
      
    // Incrémenter les compteurs d'impressions pour chaque publicité
    const adsWithImpressions = advertisements.map(ad => {
      // Créer une copie de l'objet pour éviter de modifier directement le document Mongoose
      const adObject = ad.toObject();
      
      // Préparer l'opération d'incrémentation d'impression (sera exécuté en arrière-plan)
      Advertisement.findByIdAndUpdate(ad._id, {
        $inc: { 'metrics.impressions': 1 },
        $push: { 
          'metrics.contextualImpressions': { 
            context: targetContext || 'default',
            timestamp: new Date()
          }
        }
      }).catch(err => console.error('Erreur lors de l\'incrémentation des impressions:', err));
      
      return adObject;
    });
    
    // Appliquer la logique de rotation si nécessaire
    let resultAds = adsWithImpressions;
    const rotationSettings = req.query.rotation;
    
    if (rotationSettings) {
      const strategy = rotationSettings.split(':')[0] || 'sequential';
      
      switch(strategy) {
        case 'random':
          // Mélanger les publicités de manière aléatoire
          resultAds = [...resultAds].sort(() => Math.random() - 0.5);
          break;
        case 'balanced':
          // Tri par nombre d'impressions (du moins au plus)
          resultAds = [...resultAds].sort((a, b) => 
            (a.metrics?.impressions || 0) - (b.metrics?.impressions || 0)
          );
          break;
        case 'fixed':
          // Pas de changement dans l'ordre
          break;
        case 'temporal':
          // Priorité aux publicités plus récentes
          resultAds = [...resultAds].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        // Par défaut: séquentiel (pas de changement spécial)
      }
    }
    
    res.status(200).json({
      success: true,
      count: resultAds.length,
      data: resultAds
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des publicités publiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
