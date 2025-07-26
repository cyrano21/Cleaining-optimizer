import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Récupérer les statistiques en parallèle
    const [
      totalUsers,
      totalStores,
      activeStores,
      pendingStores,
      totalOrders,
      totalRevenue,
      lastMonthUsers,
      lastMonthRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Store.countDocuments({ status: "active" }),
      Store.countDocuments({ status: "pending" }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
    ]);

    // Calculer la croissance mensuelle
    const previousMonthUsers = totalUsers - lastMonthUsers;
    const monthlyGrowth = previousMonthUsers > 0 ? 
      ((lastMonthUsers / previousMonthUsers) * 100) : 0;

    // Calculer la note moyenne des boutiques
    const storeRatings = await Store.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const stats = {
      totalUsers,
      totalStores,
      activeStores,
      pendingStores,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      avgRating: storeRatings[0]?.avgRating || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Erreur API admin stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
