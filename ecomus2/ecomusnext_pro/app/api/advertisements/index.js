import dbConnect from '../../../utils/dbConnect';
import Advertisement from '../../../models/Advertisement';
import { withAuth } from '../../../middleware/authMiddleware';

// Wrapper pour vérifier si l'utilisateur est admin
const withAdminAuth = (handler) => {
  return withAuth(async (req, res) => {
    // Vérifier si l'utilisateur est un admin
    if (req.user && req.user.role === 'admin') {
      return handler(req, res);
    }
    
    // Si l'utilisateur n'est pas admin, renvoyer une erreur
    return res.status(403).json({ 
      success: false, 
      message: 'Accès refusé - Privilèges administrateur requis' 
    });
  });
};

async function handler(req, res) {
  const { method } = req;
  
  // Connexion à la base de données
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // Récupérer les paramètres de filtrage et de pagination
        const { 
          status, type, position, isActive, page = 1, limit = 10, 
          sortBy = 'createdAt', sortOrder = 'desc', search 
        } = req.query;
        
        // Construire le filtre de requête
        const query = {};
        
        if (status) query.status = status;
        if (type) query.type = type;
        if (position) query.position = position;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        
        // Recherche par nom ou par tags
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { 'content.title': { $regex: search, $options: 'i' } }
          ];
        }
        
        // Calculer le nombre à sauter pour la pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Déterminer le tri
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Compter le nombre total de publicités correspondant au filtre
        const total = await Advertisement.countDocuments(query);
        
        // Récupérer les publicités avec pagination et tri
        const advertisements = await Advertisement.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
        
        res.status(200).json({
          success: true,
          count: advertisements.length,
          data: advertisements,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des publicités:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;
    
    case 'POST':
      try {
        // Extraire les données de la requête
        const data = req.body;
        
        // Ajouter l'utilisateur créateur
        data.createdBy = req.user.id;
        
        // Créer une nouvelle publicité
        const advertisement = await Advertisement.create(data);
        
        res.status(201).json({
          success: true,
          data: advertisement,
          message: 'Publicité créée avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de la création de la publicité:', error);
        
        // Gérer les erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
          const validationErrors = {};
          
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          
          return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: validationErrors
          });
        }
        
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;
    
    // Gérer les méthodes HTTP non autorisées
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, message: `Méthode ${method} non autorisée` });
  }
}

export default withAdminAuth(handler);
