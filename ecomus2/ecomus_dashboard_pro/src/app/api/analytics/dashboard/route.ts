import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import Store from "@/models/Store";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const period = searchParams.get("period") || "30d";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await connectDB();

    // Calculer les dates de début et fin
    let startDate: Date;
    let endDate = new Date();

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      switch (period) {
        case "7d":
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Construire le filtre de base
    const baseFilter: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (storeId) {
      baseFilter.store = new mongoose.Types.ObjectId(storeId);
    }

    // Agrégations pour les métriques principales
    const [
      orderStats,
      productStats,
      customerStats,
      salesByDay,
      topProducts,
      topCategories,
      customerAcquisition,
      trafficSources
    ] = await Promise.all([
      // Statistiques des commandes
      Order.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: "$total" }
          }
        }
      ]),

      // Statistiques des produits
      Product.aggregate([
        { $match: storeId ? { store: new mongoose.Types.ObjectId(storeId) } : {} },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }
          }
        }
      ]),

      // Statistiques des clients
      User.aggregate([
        { $match: { ...baseFilter, role: "customer" } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 }
          }
        }
      ]),

      // Ventes par jour
      Order.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            visitors: { $sum: 1 } // Approximation
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            revenue: 1,
            orders: 1,
            visitors: 1,
            _id: 0
          }
        }
      ]),

      // Top produits
      Order.aggregate([
        { $match: baseFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $project: {
            id: "$_id",
            name: "$productInfo.title",
            sales: 1,
            revenue: 1,
            image: { $arrayElemAt: ["$productInfo.images", 0] }
          }
        }
      ]),

      // Top catégories
      Product.aggregate([
        { $match: storeId ? { store: new mongoose.Types.ObjectId(storeId) } : {} },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        { $unwind: "$categoryInfo" },
        {
          $group: {
            _id: "$categoryInfo.name",
            value: { $sum: 1 }
          }
        },
        { $sort: { value: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: "$_id",
            value: 1,
            color: "#0088FE", // Couleur par défaut
            _id: 0
          }
        }
      ]),

      // Acquisition de clients
      User.aggregate([
        { $match: { ...baseFilter, role: "customer" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            newCustomers: { $sum: 1 },
            returningCustomers: { $sum: 0 } // À implémenter avec la logique métier
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            newCustomers: 1,
            returningCustomers: 1,
            _id: 0
          }
        }
      ]),

      // Sources de trafic (données simulées)
      Promise.resolve([
        { source: "Google", visitors: 2450, conversions: 78, revenue: 7800 },
        { source: "Facebook", visitors: 1230, conversions: 45, revenue: 4500 },
        { source: "Direct", visitors: 890, conversions: 67, revenue: 6700 },
        { source: "Instagram", visitors: 567, conversions: 23, revenue: 2300 },
        { source: "Email", visitors: 345, conversions: 34, revenue: 3400 }
      ])
    ]);

    // Calculer les métriques de croissance (comparaison avec la période précédente)
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousPeriodFilter = {
      ...baseFilter,
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    };

    const [previousOrderStats] = await Promise.all([
      Order.aggregate([
        { $match: previousPeriodFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculer les taux de croissance
    const currentRevenue = orderStats[0]?.totalRevenue || 0;
    const previousRevenue = previousOrderStats[0]?.totalRevenue || 0;
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const currentOrders = orderStats[0]?.totalOrders || 0;
    const previousOrders = previousOrderStats[0]?.totalOrders || 0;
    const ordersGrowth = previousOrders > 0 
      ? ((currentOrders - previousOrders) / previousOrders) * 100 
      : 0;

    // Commandes récentes
    const recentOrders = await Order.find(baseFilter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Construire la réponse
    const analyticsData = {
      overview: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrders,
        totalCustomers: customerStats[0]?.totalCustomers || 0,
        totalProducts: productStats[0]?.totalProducts || 0,
        conversionRate: 3.2, // À calculer avec les vraies données de trafic
        averageOrderValue: orderStats[0]?.averageOrderValue || 0,
        revenueGrowth,
        ordersGrowth
      },
      salesData: salesByDay,
      topProducts: topProducts,
      topCategories: topCategories,
      customerData: customerAcquisition,
      trafficSources: trafficSources,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: order.customer?.name || 'Client anonyme',
        amount: order.total,
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      }))
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Erreur lors de la récupération des analytics:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des analytics" },
      { status: 500 }
    );
  }
}

// Export des données analytics
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { format, period, from, to, storeId } = await request.json();

    // Récupérer les données analytics
    const params = new URLSearchParams({
      period: period || "30d",
      ...(from && { from }),
      ...(to && { to }),
      ...(storeId && { storeId })
    });

    // Simuler l'export (dans un vrai projet, utiliser une librairie comme xlsx ou pdf-lib)
    const exportData = {
      format,
      period,
      generatedAt: new Date().toISOString(),
      data: "Données d'export simulées"
    };

    if (format === 'csv') {
      const csvContent = `Date,Revenus,Commandes,Visiteurs
2025-01-01,1500,25,150
2025-01-02,1800,30,180
2025-01-03,1200,20,120`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${period}.csv"`
        }
      });
    }

    return NextResponse.json(exportData);

  } catch (error) {
    console.error("Erreur lors de l'export des analytics:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'export" },
      { status: 500 }
    );
  }
}

