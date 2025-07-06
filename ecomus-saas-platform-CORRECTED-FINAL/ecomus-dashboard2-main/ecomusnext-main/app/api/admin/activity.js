
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../config/db';
import AdminActivityLog from '../../../models/AdminActivityLog';
import User from '../../../models/User';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Seller from '../../../models/Seller';

export default async function handler(req, res) {
  try {
    // Vérification d'authentification avec next-auth
    const session = await getServerSession(req, res, authOptions);
    
    console.log('[API activity] Session:', session ? 'Existe' : 'N\'existe pas');
    console.log('[API activity] Role utilisateur:', session?.user?.role || 'Non défini');
    
    // Vérification que l'utilisateur est connecté
    if (!session) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    
    // Vérification que l'utilisateur est un administrateur
    if (session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    // Vérification de la méthode HTTP
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }

    // Connexion à la base de données
    await connectDB();
    // Récupérer les paramètres de filtrage
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      endDate = new Date(), 
      activityType = 'all',
      userType = 'all',
      limit = 50
    } = req.query;

    // Construire le filtre de requête
    const dateFilter = {
      createdAt: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };

    // Récupérer les statistiques de base
    const totalUsers = await User.countDocuments({});
    const totalSellers = await Seller.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    
    const recentRegistrations = await User.countDocuments({
      ...dateFilter
    });
    
    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });
    
    const newSellerApplications = await Seller.countDocuments({
      status: 'pending'
    });

    // Récupérer les logs d'activité récents
    const activityFilter = {};
    
    if (activityType !== 'all') {
      activityFilter.activityType = activityType;
    }
    
    if (userType !== 'all') {
      activityFilter.userType = userType;
    }

    const recentActivities = await AdminActivityLog.find({
      ...dateFilter,
      ...activityFilter
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Récupérer les données de trafic
    const trafficData = await AdminActivityLog.aggregate([
      { $match: { ...dateFilter, activityType: 'visit' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Récupérer les meilleures performances vendeurs
    const sellerPerformance = await Seller.aggregate([
      { $match: { status: 'approved' } },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'seller',
          as: 'products'
        }
      },
      { $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'seller',
          as: 'orders'
        }
      },
      { $project: {
          _id: 1,
          name: 1,
          email: 1,
          shopName: 1,
          productCount: { $size: '$products' },
          totalSales: { $size: '$orders' },
          totalRevenue: { $sum: '$orders.totalAmount' },
          rating: { $ifNull: ['$rating', 0] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Récupérer les produits les plus populaires
    const popularProducts = await Product.aggregate([
      { $match: { isActive: true } },
      { $project: {
          _id: 1,
          name: 1,
          views: { $ifNull: ['$views', 0] },
          sales: { $ifNull: ['$sales', 0] },
          conversionRate: { 
            $cond: [
              { $gt: ['$views', 0] },
              { $multiply: [{ $divide: [{ $ifNull: ['$sales', 0] }, '$views'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // Récupérer les statistiques par pays (simulé pour l'exemple)
    const geoData = [
      { country: 'France', visits: 6234, orders: 845 },
      { country: 'États-Unis', visits: 2158, orders: 246 },
      { country: 'Allemagne', visits: 1258, orders: 178 },
      { country: 'Royaume-Uni', visits: 945, orders: 134 },
      { country: 'Canada', visits: 782, orders: 98 }
    ];

    // Formater les données de réponse
    const responseData = {
      summary: {
        totalUsers,
        totalSellers,
        totalOrders,
        recentRegistrations,
        pendingOrders,
        newSellerApplications,
        totalVisitors: trafficData.reduce((sum, day) => sum + day.count, 0)
      },
      recentActivities,
      trafficData,
      sellerPerformance,
      popularProducts,
      geoData
    };

    // Répondre avec les données
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'activité:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des données d\'activité', error: error.message });
  }
}
