// pages/api/admin/reports.js
import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';
import { isAuthenticated, isAdmin } from '../../../middleware/auth';

// Fonction pour formater les données par mois
const formatMonthlyData = (data) => {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return {
    month: monthNames[data._id.month - 1],
    year: data._id.year,
    total: parseFloat(data.total.toFixed(2)),
    count: data.count,
    averageBasket: parseFloat((data.total / data.count).toFixed(2)),
    growth: 0 // Sera calculé à l'étape suivante
  };
};

// Fonction principale qui gère les rapports
const handleReports = async (req, res) => {
  try {
    const { type = 'ventes', start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Vérifier que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Dates invalides' });
    }

    endDate.setHours(23, 59, 59, 999); // Inclure tout le jour de fin

    await dbConnect();

    let result = {};

    switch (type) {
      case 'ventes':
        // Obtenir les ventes mensuelles
        const monthlySales = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered', 'shipped'] }
            }
          },
          {
            $group: {
              _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
              total: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Formater les données mensuelles et calculer la croissance
        const monthlyDetails = monthlySales.map(formatMonthlyData);

        // Calculer la croissance d'un mois à l'autre
        for (let i = 1; i < monthlyDetails.length; i++) {
          const prevMonth = monthlyDetails[i - 1];
          const currentMonth = monthlyDetails[i];

          if (prevMonth.total > 0) {
            currentMonth.growth = Math.round(((currentMonth.total - prevMonth.total) / prevMonth.total) * 100);
          }
        }

        // Données pour le graphique des ventes
        const salesData = {
          labels: monthlyDetails.map(item => item.month),
          datasets: [{
            label: 'Ventes mensuelles (€)',
            data: monthlyDetails.map(item => item.total),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };

        // Répartition par catégorie
        const categoryData = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered', 'shipped'] }
            }
          },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          { $unwind: '$productDetails' },
          {
            $group: {
              _id: '$productDetails.category',
              total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $sort: { total: -1 } }
        ]);

        // Formater les données de catégorie pour le graphique
        const productCategoryData = {
          labels: categoryData.map(item => item._id || 'Non catégorisé'),
          datasets: [{
            data: categoryData.map(item => item.total),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ]
          }]
        };

        result = {
          success: true,
          salesData,
          productCategoryData,
          monthlyDetails
        };
        break;

      case 'produits':
        // Produits les plus vendus
        const topProducts = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['completed', 'delivered', 'shipped'] }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              quantity: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $project: {
              id: '$_id',
              name: 1,
              quantity: 1,
              revenue: 1
            }
          }
        ]);

        // Données pour le graphique des produits
        const productData = {
          labels: topProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
          datasets: [
            {
              label: 'Quantité vendue',
              data: topProducts.map(p => p.quantity),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Revenus (€)',
              data: topProducts.map(p => p.revenue),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              yAxisID: 'revenue'
            }
          ]
        };

        result = {
          success: true,
          topProducts,
          productData
        };
        break;

      case 'clients':
        // Statistiques clients
        const customerStats = await User.aggregate([
          {
            $match: {
              createdAt: { $lte: endDate },
              role: 'user'
            }
          },
          {
            $lookup: {
              from: 'orders',
              localField: '_id',
              foreignField: 'user',
              as: 'orders'
            }
          },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              orderCount: { $size: '$orders' }
            }
          },
          {
            $group: {
              _id: null,
              totalCustomers: { $sum: 1 },
              repeatCustomers: { 
                $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
              }
            }
          }
        ]);

        // Nouveaux clients par mois
        const newCustomers = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              role: 'user'
            }
          },
          {
            $group: {
              _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const newCustomersMonthly = newCustomers.map(data => ({
          month: monthNames[data._id.month - 1],
          year: data._id.year,
          count: data.count
        }));

        // Calcul du taux de fidélisation
        const retentionRate = customerStats.length > 0
          ? Math.round((customerStats[0].repeatCustomers / customerStats[0].totalCustomers) * 100)
          : 0;

        // Données pour le graphique de nouveaux clients
        const newCustomersData = {
          labels: newCustomersMonthly.map(item => item.month),
          datasets: [{
            label: 'Nouveaux clients',
            data: newCustomersMonthly.map(item => item.count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
          }]
        };

        result = {
          success: true,
          customerStats: {
            totalCustomers: customerStats.length > 0 ? customerStats[0].totalCustomers : 0,
            repeatCustomers: customerStats.length > 0 ? customerStats[0].repeatCustomers : 0,
            retentionRate
          },
          newCustomersData
        };
        break;

      default:
        return res.status(400).json({ success: false, message: 'Type de rapport non reconnu' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Erreur lors de la génération des rapports:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la génération des rapports', error: error.message });
  }
};

// Middleware d'authentification pour l'API des rapports
export default async function handler(req, res) {
  try {
    // Vérifier la session utilisateur via Next Auth
    const session = await getSession({ req });
    
    // Récupérer le token dans l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!session) {
      // Si pas de session, vérifier le token Authorization
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('[Admin Reports] Authentification manquante');
        return res.status(401).json({ success: false, message: 'Authentification requise' });
      }
      
      // Vérifier le token (ajoutez ici la logique pour vérifier le token si nécessaire)
      // Cette partie dépend de votre système d'authentification
    } else {
      // Vérifier si l'utilisateur est administrateur
      if (session.user.role !== 'admin') {
        console.log(`[Admin Reports] Utilisateur non admin: ${session.user.email || session.user.id}`);
        return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
      }
    }
    
    // Attacher la session à la requête pour qu'elle soit accessible dans handleReports
    req.session = session;
    
    // Méthode GET uniquement
    if (req.method === 'GET') {
      return handleReports(req, res);
    }
    
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  } catch (error) {
    console.error('[Admin Reports] Erreur d\'authentification:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
  
  return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
}