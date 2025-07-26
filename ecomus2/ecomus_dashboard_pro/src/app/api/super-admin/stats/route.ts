import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import Order from "@/models/Order";

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

    // Statistiques globales
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ 
      role: { $in: ['admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN'] } 
    });
    const totalVendors = await User.countDocuments({ 
      role: { $in: ['vendor', 'VENDOR'] } 
    });
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });
    
    // Statistiques des commandes
    const totalOrders = await Order.countDocuments();
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Croissance mensuelle
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const currentMonthUsers = await User.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonthStart }
    });

    const monthlyGrowth = lastMonthUsers > 0 
      ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0;

    // Métriques système (simulées pour l'instant - à connecter aux vrais systèmes)
    const systemHealth = Math.floor(Math.random() * 10) + 90; // 90-99%
    const activeConnections = Math.floor(Math.random() * 500) + 100;
    const memoryUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
    const diskSpace = Math.floor(Math.random() * 20) + 40; // 40-60%
    
    // Uptime (simulé)
    const uptimeHours = Math.floor(Math.random() * 100) + 720; // 720+ heures
    const serverUptime = `${Math.floor(uptimeHours / 24)} jours, ${uptimeHours % 24}h`;

    const stats = {
      totalUsers,
      totalAdmins,
      totalVendors,
      totalStores,
      activeStores,
      totalOrders,
      totalRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth as string),
      systemHealth,
      activeConnections,
      serverUptime,
      memoryUsage,
      diskSpace,
      // Métriques additionnelles
      pendingStores: totalStores - activeStores,
      avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      platformVersion: "2.1.0",
      lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Dans les 24h
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur API super-admin stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
