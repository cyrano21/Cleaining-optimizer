import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../utils/dbConnect';

/**
 * API pour récupérer les tendances du marché pour le dropshipping
 */
export default async function handler(req, res) {
  try {
    // Utiliser getServerSession au lieu de getSession pour Next.js 13+
    const session = await getServerSession(req, res, authOptions);

    // Vérifier l'authentification
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    // Connexion à la base de données avec gestion du mode démo
    const connection = await dbConnect();

    // Gérer uniquement les requêtes GET
    if (req.method === 'GET') {
      try {
        // Récupérer les paramètres de la requête
        const { provider, category, timeframe = '30d' } = req.query;

        // Simuler la récupération des tendances du marché
        // Dans une implémentation réelle, cela ferait appel à des API externes
        const trends = await getMarketTrends(provider, category, timeframe);

        return res.status(200).json({ success: true, data: trends });
      } catch (error) {
        console.error('Erreur lors de la récupération des tendances du marché:', error);
        
        // Générer des données de secours en cas d'erreur
        const fallbackData = await getMarketTrends(null, null, '30d');
        
        return res.status(200).json({
          success: true,
          data: fallbackData,
          message: 'Données de démonstration affichées en raison d\'une erreur serveur'
        });
      }
    } else {
      return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur générale dans l\'API des tendances du marché:', error);
    
    // Générer des données de secours en cas d'erreur générale
    const fallbackData = await getMarketTrends(null, null, '30d');
    
    return res.status(200).json({
      success: true,
      data: fallbackData,
      message: 'Données de démonstration affichées en raison d\'une erreur serveur'
    });
  }
}

/**
 * Récupère les tendances du marché
 * @param {string} provider - Fournisseur (optionnel)
 * @param {string} category - Catégorie (optionnel)
 * @param {string} timeframe - Période (7d, 30d, 90d)
 * @returns {Promise<Array>} Tendances du marché
 */
async function getMarketTrends(provider, category, timeframe) {
  // Simulation de données de tendances
  // Dans une implémentation réelle, ces données proviendraient d'API externes
  
  const trendingCategories = [
    { name: 'Électronique', growth: 24.5, avgProfit: 18.2 },
    { name: 'Maison & Jardin', growth: 18.7, avgProfit: 22.3 },
    { name: 'Beauté & Bien-être', growth: 32.1, avgProfit: 28.5 },
    { name: 'Mode & Accessoires', growth: 15.3, avgProfit: 19.8 },
    { name: 'Sports & Loisirs', growth: 21.2, avgProfit: 20.7 },
  ];
  
  const trendingProducts = [
    {
      name: 'Écouteurs sans fil',
      category: 'Électronique',
      growth: 35.2,
      avgPrice: 29.99,
      avgProfit: 12.50,
      competitionLevel: 'Élevé',
      providers: ['aliexpress', 'bigbuy', 'cjdropshipping']
    },
    {
      name: 'Organisateur de cuisine',
      category: 'Maison & Jardin',
      growth: 28.7,
      avgPrice: 19.99,
      avgProfit: 8.75,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'bigbuy']
    },
    {
      name: 'Diffuseur d\'huiles essentielles',
      category: 'Beauté & Bien-être',
      growth: 42.3,
      avgPrice: 24.99,
      avgProfit: 11.25,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'spocket', 'bigbuy']
    },
    {
      name: 'Montre connectée',
      category: 'Électronique',
      growth: 31.5,
      avgPrice: 49.99,
      avgProfit: 18.50,
      competitionLevel: 'Élevé',
      providers: ['aliexpress', 'cjdropshipping']
    },
    {
      name: 'Tapis de yoga',
      category: 'Sports & Loisirs',
      growth: 26.8,
      avgPrice: 22.99,
      avgProfit: 9.75,
      competitionLevel: 'Faible',
      providers: ['aliexpress', 'bigbuy', 'printful']
    },
    {
      name: 'Lampe LED',
      category: 'Maison & Jardin',
      growth: 23.4,
      avgPrice: 15.99,
      avgProfit: 7.25,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'bigbuy', 'cjdropshipping']
    },
    {
      name: 'Sac à dos anti-vol',
      category: 'Mode & Accessoires',
      growth: 29.7,
      avgPrice: 39.99,
      avgProfit: 15.50,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'spocket']
    },
    {
      name: 'Brosse nettoyante visage',
      category: 'Beauté & Bien-être',
      growth: 33.6,
      avgPrice: 18.99,
      avgProfit: 8.25,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'bigbuy', 'spocket']
    },
    {
      name: 'Support téléphone voiture',
      category: 'Électronique',
      growth: 22.1,
      avgPrice: 12.99,
      avgProfit: 5.75,
      competitionLevel: 'Élevé',
      providers: ['aliexpress', 'bigbuy', 'cjdropshipping']
    },
    {
      name: 'Bouteille isotherme',
      category: 'Sports & Loisirs',
      growth: 25.3,
      avgPrice: 17.99,
      avgProfit: 7.50,
      competitionLevel: 'Moyen',
      providers: ['aliexpress', 'printful', 'bigbuy']
    }
  ];
  
  // Filtrer par fournisseur si spécifié
  let filteredProducts = trendingProducts;
  if (provider) {
    filteredProducts = trendingProducts.filter(product => 
      product.providers.includes(provider.toLowerCase())
    );
  }
  
  // Filtrer par catégorie si spécifiée
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  return {
    timeframe,
    trendingCategories,
    trendingProducts: filteredProducts,
    lastUpdated: new Date().toISOString()
  };
}
