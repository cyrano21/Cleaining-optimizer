import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est super admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Récupération des données analytiques avancées
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Croissance des utilisateurs (30 derniers jours)
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Revenus par jour (30 derniers jours)
    const revenueGrowth = await Order.aggregate([
      {
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Statistiques par région/pays (si disponible)
    const usersByCountry = await User.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top des boutiques par revenus
    const topStoresByRevenue = await Order.aggregate([
      {
        $match: { 
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$storeId",
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store"
        }
      },
      {
        $project: {
          _id: 1,
          revenue: 1,
          orders: 1,
          storeName: { $arrayElemAt: ["$store.name", 0] }
        }
      }
    ]);

    // Produits les plus vendus
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $match: { 
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          productName: { $arrayElemAt: ["$product.name", 0] },
          productImage: { $arrayElemAt: ["$product.images.0", 0] }
        }
      }
    ]);

    // Taux de conversion (approximation)
    const totalVisits = Math.floor(Math.random() * 50000) + 100000; // Simulé - à connecter à Google Analytics
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const conversionRate = ((totalOrders / totalVisits) * 100).toFixed(2);

    // Performance système sur 7 jours
    const systemPerformance = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        cpuUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        memoryUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
        responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        uptime: 99.9 - Math.random() * 0.5 // 99.4-99.9%
      };
    });

    const analytics = {
      userGrowth,
      revenueGrowth,
      usersByCountry: usersByCountry.filter(item => item._id), // Filtrer les pays null
      topStoresByRevenue,
      topProducts,
      conversionRate: parseFloat(conversionRate),
      totalVisits,
      systemPerformance,
      periodStart: thirtyDaysAgo.toISOString(),
      periodEnd: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur API super-admin analytics:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
