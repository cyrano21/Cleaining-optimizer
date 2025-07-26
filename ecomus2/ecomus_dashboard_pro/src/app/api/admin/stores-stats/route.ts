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

    // Vérifier si l'utilisateur est admin ou super admin
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();    // Statistiques des boutiques
    const [
      totalStores,
      activeStores,
      inactiveStores,
      vendorPendingStores,
      vendorApprovedStores,
      vendorRejectedStores,
      totalRevenue,
    ] = await Promise.all([
      Store.countDocuments(),
      Store.countDocuments({ isActive: true }),
      Store.countDocuments({ isActive: false }),
      Store.countDocuments({ vendorStatus: "pending" }),
      Store.countDocuments({ vendorStatus: "approved" }),
      Store.countDocuments({ vendorStatus: "rejected" }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
    ]);

    // Statistiques de croissance mensuelle
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
    ]);    return NextResponse.json({
      success: true,
      data: {
        totalStores,
        activeStores,
        inactiveStores,
        pendingStores: vendorPendingStores,    // Compatibility avec frontend
        suspendedStores: vendorRejectedStores, // Compatibility avec frontend
        vendorPendingStores,
        vendorApprovedStores,
        vendorRejectedStores,
        totalRevenue: totalRevenue[0]?.total || 0,
        newStoresThisMonth,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        storeGrowthRate: totalStores > 0 ? ((newStoresThisMonth / totalStores) * 100) : 0,
      },
    });

  } catch (error) {
    console.error("Erreur API admin stores stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
