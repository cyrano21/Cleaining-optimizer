import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userRole = user.role.toLowerCase();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    let gamificationData;

    switch (userRole) {
      case 'vendor':
        gamificationData = await getVendorGamificationData(user._id, startOfDay, startOfWeek);
        break;
      case 'admin':
      case 'super_admin':
        gamificationData = await getAdminGamificationData(user._id, startOfDay, startOfWeek);
        break;
      default:
        gamificationData = await getCustomerGamificationData(user._id, startOfDay, startOfWeek);
        break;
    }

    return NextResponse.json({
      success: true,
      data: gamificationData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données gamification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function getVendorGamificationData(userId: string, startOfDay: Date, startOfWeek: Date) {
  // Statistiques réelles du vendeur
  const [orderStats, productStats] = await Promise.all([
    Order.aggregate([
      { $match: { vendor: userId } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
          todayOrders: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfDay] }, 1, 0]
            }
          },
          weekOrders: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfWeek] }, 1, 0]
            }
          }
        }
      }
    ]),
    Product.aggregate([
      { $match: { vendor: userId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          avgRating: { $avg: '$averageRating' },
          totalReviews: { $sum: '$totalReviews' }
        }
      }
    ])
  ]);

  const orders = orderStats[0] || {};
  const products = productStats[0] || {};

  // Calculer le niveau basé sur les ventes
  const level = Math.floor((orders.totalSales || 0) / 1000) + 1;
  const xp = Math.floor((orders.totalSales || 0) / 10);
  const xpToNextLevel = (level * 1000);

  const userStats = {
    level: Math.min(level, 50),
    xp,
    xpToNextLevel,
    totalSales: orders.totalSales || 0,
    ordersCompleted: orders.totalOrders || 0,
    customerSatisfaction: Math.round((products.avgRating || 0) * 20), // Convertir sur 100
    streak: Math.min(orders.weekOrders || 0, 30) // Streak basé sur les commandes de la semaine
  };

  // Générer les achievements basés sur les vraies données
  const achievements = generateVendorAchievements(userStats, products, orders);
  
  // Tâches quotidiennes basées sur les performances
  const dailyTasks = generateDailyTasks(userStats, orders);
  
  // Objectifs hebdomadaires
  const weeklyGoals = generateWeeklyGoals(userStats, orders, products);

  // Leaderboard - Top 10 vendeurs
  const leaderboard = await generateLeaderboard('vendor');

  return {
    userStats,
    achievements,
    dailyTasks,
    weeklyGoals,
    leaderboard
  };
}

async function getAdminGamificationData(userId: string, startOfDay: Date, startOfWeek: Date) {
  // Stats système pour les admins
  const [systemStats] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalVendors: { $sum: { $cond: [{ $eq: ['$role', 'vendor'] }, 1, 0] } },
          newUsersToday: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfDay] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const stats = systemStats[0] || {};
  
  const userStats = {
    level: 99, // Admin level max
    xp: 99999,
    xpToNextLevel: 100000,
    totalSales: 0, // Pas applicable pour admin
    ordersCompleted: stats.totalUsers || 0,
    customerSatisfaction: 100,
    streak: 365 // Admin streak permanent
  };

  return {
    userStats,
    achievements: generateAdminAchievements(stats),
    dailyTasks: generateAdminDailyTasks(stats),
    weeklyGoals: generateAdminWeeklyGoals(stats),
    leaderboard: await generateLeaderboard('admin')
  };
}

async function getCustomerGamificationData(userId: string, startOfDay: Date, startOfWeek: Date) {
  // Stats client
  const [orderStats] = await Promise.all([
    Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          recentOrders: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfWeek] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const orders = orderStats[0] || {};
  
  const level = Math.floor((orders.totalSpent || 0) / 500) + 1;
  const xp = Math.floor((orders.totalSpent || 0) / 5);
  
  const userStats = {
    level: Math.min(level, 20),
    xp,
    xpToNextLevel: level * 500,
    totalSales: orders.totalSpent || 0,
    ordersCompleted: orders.totalOrders || 0,
    customerSatisfaction: 90, // Score de satisfaction par défaut
    streak: orders.recentOrders || 0
  };

  return {
    userStats,
    achievements: generateCustomerAchievements(userStats, orders),
    dailyTasks: generateCustomerDailyTasks(userStats),
    weeklyGoals: generateCustomerWeeklyGoals(userStats),
    leaderboard: await generateLeaderboard('customer')
  };
}

function generateVendorAchievements(userStats: any, products: any, orders: any) {
  const achievements = [
    {
      id: "first-sale",
      title: "Première Vente",
      description: "Réalisez votre première vente",
      icon: "🎯",
      xpReward: 100,
      unlocked: orders.totalOrders > 0,
      category: "sales"
    },
    {
      id: "sales-master",
      title: "Maître des Ventes",
      description: "Atteignez 10 000€ de chiffre d'affaires",
      icon: "💰",
      xpReward: 500,
      unlocked: orders.totalSales >= 10000,
      category: "sales"
    },
    {
      id: "product-creator",
      title: "Créateur de Produits",
      description: "Ajoutez 10 produits à votre catalogue",
      icon: "📦",
      xpReward: 200,
      unlocked: (products.totalProducts || 0) >= 10,
      category: "product"
    },
    {
      id: "customer-favorite",
      title: "Favori des Clients",
      description: "Obtenez une note moyenne de 4.5/5",
      icon: "⭐",
      xpReward: 300,
      unlocked: (products.avgRating || 0) >= 4.5,
      category: "customer"
    }
  ];

  return achievements;
}

function generateDailyTasks(userStats: any, orders: any) {
  return [
    {
      id: "daily-check",
      title: "Vérification Quotidienne",
      description: "Consultez vos statistiques du jour",
      xpReward: 10,
      completed: true, // Automatiquement complété en consultant
      category: "engagement"
    },
    {
      id: "process-orders",
      title: "Traiter les Commandes",
      description: "Traitez au moins 3 commandes aujourd'hui",
      xpReward: 50,
      completed: (orders.todayOrders || 0) >= 3,
      category: "sales"
    }
  ];
}

function generateWeeklyGoals(userStats: any, orders: any, products: any) {
  return [
    {
      id: "weekly-sales",
      title: "Objectif de Ventes",
      description: "Réalisez 2000€ de ventes cette semaine",
      progress: Math.min((orders.totalSales || 0), 2000),
      target: 2000,
      xpReward: 200,
      type: "sales"
    },
    {
      id: "product-updates",
      title: "Mise à Jour Produits",
      description: "Mettez à jour 5 produits cette semaine",
      progress: Math.min((products.activeProducts || 0), 5),
      target: 5,
      xpReward: 100,
      type: "products"
    }
  ];
}

function generateAdminAchievements(stats: any) {
  return [
    {
      id: "user-manager",
      title: "Gestionnaire d'Utilisateurs",
      description: "Gérez plus de 100 utilisateurs",
      icon: "👥",
      xpReward: 1000,
      unlocked: (stats.totalUsers || 0) >= 100,
      category: "management"
    },
    {
      id: "system-guardian",
      title: "Gardien du Système",
      description: "Maintenez le système opérationnel",
      icon: "🛡️",
      xpReward: 500,
      unlocked: true,
      category: "system"
    }
  ];
}

function generateAdminDailyTasks(stats: any) {
  return [
    {
      id: "system-check",
      title: "Vérification Système",
      description: "Vérifiez l'état du système",
      xpReward: 50,
      completed: true,
      category: "system"
    },
    {
      id: "user-support",
      title: "Support Utilisateur",
      description: "Répondez aux demandes de support",
      xpReward: 30,
      completed: false,
      category: "engagement"
    }
  ];
}

function generateAdminWeeklyGoals(stats: any) {
  return [
    {
      id: "user-growth",
      title: "Croissance Utilisateurs",
      description: "Atteindre 10 nouveaux utilisateurs",
      progress: stats.newUsersToday || 0,
      target: 10,
      xpReward: 300,
      type: "growth"
    }
  ];
}

function generateCustomerAchievements(userStats: any, orders: any) {
  return [
    {
      id: "first-purchase",
      title: "Premier Achat",
      description: "Effectuez votre premier achat",
      icon: "🛒",
      xpReward: 50,
      unlocked: orders.totalOrders > 0,
      category: "purchases"
    },
    {
      id: "loyal-customer",
      title: "Client Fidèle",
      description: "Effectuez 10 achats",
      icon: "💎",
      xpReward: 200,
      unlocked: orders.totalOrders >= 10,
      category: "loyalty"
    }
  ];
}

function generateCustomerDailyTasks(userStats: any) {
  return [
    {
      id: "browse-products",
      title: "Découvrir des Produits",
      description: "Parcourez les nouveaux produits",
      xpReward: 10,
      completed: false,
      category: "engagement"
    }
  ];
}

function generateCustomerWeeklyGoals(userStats: any) {
  return [
    {
      id: "weekly-shopping",
      title: "Shopping Hebdomadaire",
      description: "Effectuez un achat cette semaine",
      progress: 0,
      target: 1,
      xpReward: 50,
      type: "purchases"
    }
  ];
}

async function generateLeaderboard(type: string) {
  try {
    let pipeline = [];
    
    if (type === 'vendor') {
      pipeline = [
        { $match: { role: 'vendor' } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'vendor',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalSales: { $sum: '$orders.totalAmount' },
            totalOrders: { $size: '$orders' }
          }
        },        { $sort: { totalSales: -1 as const } },
        { $limit: 10 }
      ];
    } else {
      pipeline = [
        { $match: { status: 'active' } },
        { $sort: { createdAt: -1 as const } },
        { $limit: 10 }
      ];
    }

    const users = await User.aggregate(pipeline);
    
    return users.map((user, index) => ({
      id: user._id.toString(),
      name: user.name || 'Utilisateur',
      avatar: user.avatar || '/images/placeholder.svg',
      level: Math.floor((user.totalSales || 0) / 1000) + 1,
      xp: Math.floor((user.totalSales || 0) / 10),
      position: index + 1,
      change: 'same' as const
    }));
  } catch (error) {
    console.error('Erreur génération leaderboard:', error);
    return [];
  }
}
