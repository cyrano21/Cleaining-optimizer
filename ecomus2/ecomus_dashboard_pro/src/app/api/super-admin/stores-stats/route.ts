import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est super admin
    if (session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Statistiques des boutiques
    const [
      totalStores,
      activeStores,
      pendingStores,
      suspendedStores,
      totalRevenue,
      completedOrders,
    ] = await Promise.all([
      Store.countDocuments(),
      Store.countDocuments({ status: "active" }),
      Store.countDocuments({ status: "pending" }),
      Store.countDocuments({ status: "suspended" }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.countDocuments({ status: "completed" }),
    ]);

    // Statistiques de performance des boutiques
    const topPerformingStores = await Store.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "store",
          as: "orders"
        }
      },
      {
        $addFields: {
          totalRevenue: {
            $sum: {
              $map: {
                input: { $filter: { input: "$orders", cond: { $eq: ["$$this.status", "completed"] } } },
                as: "order",
                in: "$$order.total"
              }
            }
          },
          orderCount: { $size: "$orders" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          totalRevenue: 1,
          orderCount: 1,
          status: 1,
          rating: 1
        }
      }
    ]);

    // Croissance mensuelle
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const [newStoresThisMonth, revenueThisMonth] = await Promise.all([
      Store.countDocuments({ createdAt: { $gte: lastMonthDate } }),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: lastMonthDate }
          }
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalStores,
        activeStores,
        pendingStores,
        suspendedStores,
        totalRevenue: totalRevenue[0]?.total || 0,
        completedOrders,
        topPerformingStores,
        newStoresThisMonth,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        storeGrowthRate: totalStores > 0 ? ((newStoresThisMonth / totalStores) * 100) : 0,
      },
    });

  } catch (error) {
    console.error("Erreur API super admin stores stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
