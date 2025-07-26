import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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

    // Statistiques des utilisateurs par rôle
    const [totalUsers, totalAdmins, totalVendors, totalCustomers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "vendor" }),
      User.countDocuments({ role: "customer" }),
    ]);

    // Statistiques de croissance mensuelle
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const [
      newUsersThisMonth,
      newAdminsThisMonth,
      newVendorsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: lastMonthDate } }),
      User.countDocuments({ role: "admin", createdAt: { $gte: lastMonthDate } }),
      User.countDocuments({ role: "vendor", createdAt: { $gte: lastMonthDate } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalVendors,
        totalCustomers,
        newUsersThisMonth,
        newAdminsThisMonth,
        newVendorsThisMonth,
        userGrowthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100) : 0,
      },
    });

  } catch (error) {
    console.error("Erreur API super admin users stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
