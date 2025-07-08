import dbConnect from '../../utils/dbConnect';
import Sponsor from '../../models/Sponsor';

// Sponsors de secours au cas où il y aurait des problèmes avec la base de données
const fallbackSponsors = [
  { imageUrl: '/assets/images/sponsor/ile.png', name: 'ile', isActive: true, order: 1 },
  { imageUrl: '/assets/images/sponsor/nestle.png', name: 'Nestlé', isActive: true, order: 2 },
  { imageUrl: '/assets/images/sponsor/disney.png', name: 'Disney', isActive: true, order: 3 },
  { imageUrl: '/assets/images/sponsor/airbnb.png', name: 'airbnb', isActive: true, order: 4 },
  { imageUrl: '/assets/images/sponsor/grab.png', name: 'Grab', isActive: true, order: 5 },
  { imageUrl: '/assets/images/sponsor/netflix.png', name: 'Netflix', isActive: true, order: 6 }
];

// Handler principal pour les différentes méthodes HTTP
export default async function handler(req, res) {
  const { method } = req;

  // Logger les infos de requête pour le débogage
  console.log(`[API sponsor-banners] Méthode: ${method}`);
  
  // Court-circuit pour les requêtes HEAD - évite toute connexion à MongoDB
  if (method === 'HEAD') {
    console.log('[API sponsor-banners] Requête HEAD détectée, réponse immédiate sans connexion DB');
    return res.status(200).end();
  }

  try {
    // Essayer de se connecter à la base de données
    await dbConnect();
    console.log('[API sponsor-banners] Connexion à la base de données réussie');

    switch (method) {
      case 'GET':
        try {
          const sponsors = await Sponsor.find({}).sort({ order: 1 });
          console.log(`[API sponsor-banners] ${sponsors.length} sponsors récupérés`);
          
          // Si aucun sponsor n'est trouvé, renvoyer les sponsors de secours
          if (!sponsors || sponsors.length === 0) {
            console.log('[API sponsor-banners] Aucun sponsor trouvé, utilisation des sponsors de secours');
            return res.status(200).json(fallbackSponsors);
          }
          
          return res.status(200).json(sponsors);
        } catch (error) {
          console.error('[API sponsor-banners] Erreur lors de la récupération des sponsors:', error);
          // En cas d'erreur, renvoyer les sponsors de secours
          return res.status(200).json(fallbackSponsors);
        }

      case 'POST':
        try {
          // Simple vérification de base - dans une application réelle, utilisez une authentification appropriée
          const { isAdmin } = req.query;
          
          if (isAdmin !== 'true') {
            console.log('[API sponsor-banners] Tentative d\'ajout sans autorisation');
            return res.status(403).json({ 
              success: false, 
              message: 'Accès non autorisé. Seuls les administrateurs peuvent ajouter des sponsors.' 
            });
          }

          const sponsor = await Sponsor.create(req.body);
          console.log('[API sponsor-banners] Sponsor créé avec succès:', sponsor.name);
          return res.status(201).json({ success: true, data: sponsor });
        } catch (error) {
          console.error('[API sponsor-banners] Erreur lors de la création du sponsor:', error);
          
          if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
              success: false, 
              message: messages.join(', ') 
            });
          }
          
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création du sponsor', 
            error: error.message 
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          message: `Méthode ${method} non autorisée` 
        });
    }
  } catch (error) {
    // En cas d'erreur de connexion à la base de données, renvoyer les sponsors de secours pour GET
    console.error('[API sponsor-banners] Erreur de connexion à la base de données:', error);
    
    if (method === 'GET') {
      console.log('[API sponsor-banners] Utilisation des sponsors de secours suite à l\'erreur de connexion');
      return res.status(200).json(fallbackSponsors);
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur de connexion à la base de données', 
      error: error.message 
    });
  }
}
