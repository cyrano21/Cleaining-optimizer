import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Store from "@/models/Store";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions admin
    const isAdmin = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(session.user?.role || '');
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    
    // Calculer les dates selon la période
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Analytics système
    const [
      totalUsers,
      totalVendors,
      totalStores,
      totalOrders,
      totalProducts,
      recentOrders,
      systemStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['vendor', 'VENDOR'] } }),
      Store.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Product.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .lean(),
      {
        // Simuler des stats système - à remplacer par de vraies métriques
        systemLoad: Math.floor(Math.random() * 40) + 30, // 30-70%
        activeConnections: Math.floor(Math.random() * 200) + 100,
        serverUptime: '99.9%',
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      }
    ]);

    // Calculer les revenus totaux
    const revenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Analytics par période (derniers 12 mois pour les graphiques)
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 12, 1) },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
          products: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Formater les données pour les graphiques
    const chartData = monthlyData.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
      products: item.products
    }));

    // Top vendeurs
    const topVendors = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.vendor',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $sum: 1 },
          totalProducts: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      { $unwind: '$vendorInfo' },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Analytics utilisateurs
    const userAnalytics = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalStores,
          totalOrders,
          totalProducts,
          totalRevenue,
          systemLoad: systemStats.systemLoad,
          activeConnections: systemStats.activeConnections,
          serverUptime: systemStats.serverUptime,
          memoryUsage: systemStats.memoryUsage
        },
        charts: {
          revenue: chartData.map(d => ({ name: d.name, value: d.revenue })),
          orders: chartData.map(d => ({ name: d.name, value: d.orders })),
          products: chartData.map(d => ({ name: d.name, value: d.products }))
        },
        topVendors: topVendors.map(vendor => ({
          id: vendor._id,
          name: vendor.vendorInfo.name,
          email: vendor.vendorInfo.email,
          revenue: vendor.totalRevenue,
          orders: vendor.totalOrders,
          products: vendor.totalProducts
        })),
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          user: order.user,
          total: order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0,
          status: order.status,
          createdAt: order.createdAt
        })),
        usersByRole: userAnalytics.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        period,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur analytics admin:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des analytics" },
      { status: 500 }
    );
  }
}
