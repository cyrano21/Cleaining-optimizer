// API pour déboguer la connexion à la base de données et les catégories
import dbConnect from '../../lib/dbConnect';
import Category from '../../models/Category';

// Catégories par défaut à utiliser si la base de données n'est pas disponible
const DEFAULT_CATEGORIES = [
  {
    name: "Men's Sneaker",
    slug: 'mens-sneaker',
    description: 'Sneakers et chaussures de sport pour hommes',
    imageUrl: '/assets/images/category/01.jpg',
    isActive: true
  },
  {
    name: "Men's Pants",
    slug: 'mens-pants',
    description: 'Pantalons et jeans pour hommes',
    imageUrl: '/assets/images/category/02.jpg',
    isActive: true
  },
  {
    name: "Men's Boot",
    slug: 'mens-boot',
    description: 'Bottes et chaussures de ville pour hommes',
    imageUrl: '/assets/images/category/03.jpg',
    isActive: true
  }
];

export default async function handler(req, res) {
  // Désactiver le cache pour cette API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    mongodb: {
      uri: process.env.MONGODB_URI ? "Configuré" : "Non configuré",
      // Ne pas afficher l'URI complet pour des raisons de sécurité
      uriPartial: process.env.MONGODB_URI ? 
        `${process.env.MONGODB_URI.split('@')[0].substring(0, 10)}...` : 
        "Non disponible"
    },
    connectionAttempt: null,
    categories: {
      fetched: false,
      count: 0,
      data: null,
      error: null
    }
  };
  
  try {
    console.log('🔍 [DEBUG-DB] Tentative de connexion à MongoDB...');
    // Tentative de connexion avec timeout pour éviter les blocages
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de connexion MongoDB après 5000ms')), 5000)
    );
    
    try {
      await Promise.race([dbConnect(), timeoutPromise]);
      debug.connectionAttempt = "success";
      console.log('🔍 [DEBUG-DB] Connexion à MongoDB réussie');
      
      // Recherche des catégories
      try {
        const categories = await Category.find({}).sort({ name: 1 });
        debug.categories.fetched = true;
        debug.categories.count = categories.length;
        debug.categories.data = categories.map(cat => ({
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          isActive: cat.isActive
        }));
      } catch (catError) {
        debug.categories.error = catError.message;
        console.error('🔍 [DEBUG-DB] Erreur lors de la récupération des catégories:', catError);
      }
    } catch (dbError) {
      debug.connectionAttempt = "timeout";
      debug.mongodb.error = dbError.message;
      console.error('🔍 [DEBUG-DB] Erreur de connexion à MongoDB (timeout):', dbError);
      
      // Utiliser les catégories par défaut
      debug.categories.data = DEFAULT_CATEGORIES;
      debug.categories.count = DEFAULT_CATEGORIES.length;
      debug.categories.fromFallback = true;
    }
  } catch (error) {
    debug.connectionAttempt = "error";
    debug.error = error.message;
    console.error('🔍 [DEBUG-DB] Erreur générale:', error);
  }
  
  // Renvoyer les informations de débogage
  return res.status(200).json(debug);
}
