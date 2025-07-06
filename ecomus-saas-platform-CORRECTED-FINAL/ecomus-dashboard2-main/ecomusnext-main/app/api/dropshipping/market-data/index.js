import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../utils/dbConnect';

/**
 * API pour récupérer les données du marché pour l'analyse des prix
 */
export default async function handler(req, res) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    // Connexion à la base de données
    await dbConnect();
    
    if (req.method === 'GET') {
      // Récupérer les données du marché
      const marketData = await getMarketData();
      res.status(200).json(marketData);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API des données du marché:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Récupère les données du marché
 * @returns {Promise<Object>} Données du marché
 */
async function getMarketData() {
  try {
    // Dans une implémentation réelle, ces données proviendraient d'une base de données
    // ou d'une API externe avec des données à jour sur le marché
    
    return {
      // Markup moyen par catégorie (%)
      categoryMarkups: {
        'Électronique': 35,
        'Maison & Jardin': 45,
        'Beauté & Bien-être': 60,
        'Mode & Accessoires': 50,
        'Sports & Loisirs': 40,
        'Jouets & Jeux': 55,
        'Bijoux & Accessoires': 70,
        'Automobile': 30,
        'Animaux': 50,
        'Alimentation': 40
      },
      
      // Markup moyen global (%)
      averageMarkup: 45,
      
      // Niveaux de concurrence et fourchettes de markup recommandées
      competitionLevels: {
        'high': { 
          minMarkup: 20, 
          maxMarkup: 40,
          description: 'Concurrence élevée: de nombreux vendeurs proposent des produits similaires'
        },
        'medium': { 
          minMarkup: 30, 
          maxMarkup: 60,
          description: 'Concurrence moyenne: quelques vendeurs proposent des produits similaires'
        },
        'low': { 
          minMarkup: 50, 
          maxMarkup: 100,
          description: 'Concurrence faible: peu de vendeurs proposent des produits similaires'
        }
      },
      
      // Taux de commission moyens par fournisseur (%)
      commissionRates: {
        'aliexpress': 8,
        'bigbuy': 5,
        'spocket': 15,
        'average': 10
      },
      
      // Frais de transaction moyens par méthode de paiement (%)
      paymentFees: {
        'creditCard': 2.9,
        'paypal': 3.4,
        'stripe': 2.9,
        'bankTransfer': 0.5,
        'average': 2.5
      },
      
      // Frais d'expédition moyens par région (€)
      shippingCosts: {
        'europe': 5,
        'northAmerica': 15,
        'asia': 12,
        'restOfWorld': 20,
        'average': 8
      },
      
      // Taux de conversion moyen (%)
      averageConversionRate: 2.5,
      
      // Taux de retour moyen (%)
      averageReturnRate: 3,
      
      // Tendances actuelles du marché
      trends: {
        hotCategories: [
          'Maison & Jardin',
          'Beauté & Bien-être',
          'Électronique'
        ],
        risingCategories: [
          'Produits écologiques',
          'Fitness & Bien-être',
          'Produits pour animaux'
        ]
      },
      
      // Recommandations générales
      recommendations: {
        minimumMargin: 20, // Marge minimale recommandée (%)
        targetMargin: 40, // Marge cible recommandée (%)
        psychologicalPricing: true, // Utiliser des prix psychologiques (ex: 19,99 € au lieu de 20 €)
        bundleDiscount: 15 // Réduction recommandée pour les lots (%)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données du marché:', error);
    throw error;
  }
}
