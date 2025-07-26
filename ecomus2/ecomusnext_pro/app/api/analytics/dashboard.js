// pages/api/analytics/dashboard.js
// Route API pour les données du dashboard admin

import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import User from '../../../models/User';
import Category from '../../../models/Category';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Méthode ${method} non autorisée` });
  }

  // Vérification de l'authentification admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || !['admin', 'seller'].includes(session.user.role)) {
    return res.status(401).json({
      success: false,
      error: 'Accès non autorisé. Rôle admin ou seller requis.'
    });
  }

  // Connexion à la base de données
  await dbConnect();

  try {
    const { period = '30', type = 'overview' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    switch (type) {
      case 'overview':
        return await getDashboardOverview(req, res, startDate);
      case 'sales':
        return await getSalesAnalytics(req, res, startDate);
      case 'products':
        return await getProductAnalytics(req, res, startDate);
      case 'customers':
        return await getCustomerAnalytics(req, res, startDate);
      default:
        return await getDashboardOverview(req, res, startDate);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des analytics'
    });
  }
}

// Vue d'ensemble du dashboard
async function getDashboardOverview(req, res, startDate) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const isAdmin = session.user.role === 'admin';
    
    // Filtres basés sur le rôle
    const orderFilter = isAdmin ? {} : { sellerId: session.user.id };
    const productFilter = isAdmin ? {} : { createdBy: session.user.id };

    // Statistiques générales
    const [totalProducts, totalOrders, totalUsers, totalCategories] = await Promise.all([
      Product.countDocuments({ ...productFilter, isActive: true }),
      Order.countDocuments(orderFilter),
      isAdmin ? User.countDocuments({ role: 'customer' }) : 0,
      isAdmin ? Category.countDocuments({ isActive: true }) : 0
    ]);

    // Statistiques de la période
    const [recentOrders, recentRevenue, newCustomers] = await Promise.all([
      Order.countDocuments({ ...orderFilter, createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { ...orderFilter, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      isAdmin ? User.countDocuments({ role: 'customer', createdAt: { $gte: startDate } }) : 0
    ]);

    // Évolution des ventes par jour
    const salesTrend = await Order.aggregate([
      { $match: { ...orderFilter, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top produits
    const topProducts = await Order.aggregate([
      { $match: { ...orderFilter, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Répartition par catégorie
    const categoryStats = await Product.aggregate([
      { $match: { ...productFilter, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Commandes récentes
    const recentOrdersList = await Order.find(orderFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalCategories,
          recentOrders,
          revenue: recentRevenue[0]?.total || 0,
          newCustomers
        },
        charts: {
          salesTrend,
          topProducts,
          categoryStats
        },
        recentOrders: recentOrdersList
      }
    });
  } catch (error) {
    throw error;
  }
}

// Analytics des ventes
async function getSalesAnalytics(req, res, startDate) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const orderFilter = session.user.role === 'admin' ? {} : { sellerId: session.user.id };

    // Ventes par mois
    const monthlySales = await Order.aggregate([
      { $match: { ...orderFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Répartition par statut
    const statusDistribution = await Order.aggregate([
      { $match: { ...orderFilter, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Méthodes de paiement
    const paymentMethods = await Order.aggregate([
      { $match: { ...orderFilter, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        monthlySales,
        statusDistribution,
        paymentMethods
      }
    });
  } catch (error) {
    throw error;
  }
}

// Analytics des produits
async function getProductAnalytics(req, res, startDate) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const productFilter = session.user.role === 'admin' ? {} : { createdBy: session.user.id };

    // Produits les plus vendus
    const bestSellers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Produits en rupture de stock
    const lowStock = await Product.find({
      ...productFilter,
      stock: { $lte: 5 },
      isActive: true
    })
    .select('name stock category price')
    .sort({ stock: 1 })
    .limit(10)
    .lean();

    // Performance par catégorie
    const categoryPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bestSellers,
        lowStock,
        categoryPerformance
      }
    });
  } catch (error) {
    throw error;
  }
}

// Analytics des clients
async function getCustomerAnalytics(req, res, startDate) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      });
    }

    // Nouveaux clients
    const newCustomers = await User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Clients les plus actifs
    const topCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        newCustomers,
        topCustomers
      }
    });
  } catch (error) {
    throw error;
  }
}