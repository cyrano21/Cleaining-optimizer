import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { checkAdminAccess } from '@/lib/role-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
      if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a les droits admin
    if (!session.user.role || !checkAdminAccess(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    // Calculer les métriques avancées
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Statistiques des utilisateurs
    const [totalUsers, newUsersThisMonth, activeUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: currentMonth } }),
      User.countDocuments({ lastLoginAt: { $gte: lastWeek } })
    ]);

    // Statistiques des commandes
    const [totalOrders, ordersThisMonth, ordersLastMonth] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ createdAt: { $gte: currentMonth } }),
      Order.countDocuments({ 
        createdAt: { $gte: lastMonth, $lt: currentMonth } 
      })
    ]);

    // Statistiques des revenus
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const revenueThisMonthAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const revenueLastMonthAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: lastMonth, $lt: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Statistiques des produits
    const [totalProducts, lowStockProducts] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ stock: { $lt: 10 } })
    ]);

    // Calculer les tendances
    const orderGrowth = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100)
      : ordersThisMonth > 0 ? 100 : 0;

    const currentRevenue = revenueThisMonthAgg[0]?.revenue || 0;
    const lastRevenue = revenueLastMonthAgg[0]?.revenue || 0;
    const revenueGrowth = lastRevenue > 0 
      ? ((currentRevenue - lastRevenue) / lastRevenue * 100)
      : currentRevenue > 0 ? 100 : 0;

    // Statistiques par statut de commande
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const statusStats = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        revenue: item.revenue
      };
      return acc;
    }, {});

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const avgOrderValue = revenueAggregation[0]?.avgOrderValue || 0;

    const advancedStats = {
      overview: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        userGrowth: newUsersThisMonth, // Croissance ce mois
        totalOrders,
        ordersThisMonth,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        totalRevenue,
        revenueThisMonth: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalProducts,
        lowStockProducts
      },
      orders: {
        total: totalOrders,
        pending: statusStats.pending?.count || 0,
        processing: statusStats.processing?.count || 0,
        shipped: statusStats.shipped?.count || 0,
        delivered: statusStats.delivered?.count || 0,
        cancelled: statusStats.cancelled?.count || 0,
        returned: statusStats.returned?.count || 0
      },
      revenue: {
        total: totalRevenue,
        thisMonth: currentRevenue,
        lastMonth: lastRevenue,
        pending: statusStats.pending?.revenue || 0,
        processing: statusStats.processing?.revenue || 0,
        shipped: statusStats.shipped?.revenue || 0,
        delivered: statusStats.delivered?.revenue || 0
      },
      performance: {
        conversionRate: totalUsers > 0 ? (totalOrders / totalUsers * 100) : 0,
        customerRetention: activeUsers / totalUsers * 100,
        averageOrderValue: avgOrderValue,
        totalTransactions: totalOrders
      }
    };

    return NextResponse.json({
      success: true,
      data: advancedStats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques avancées:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
