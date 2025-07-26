import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { checkAdminAccess } from '@/lib/role-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
      if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a un rôle et les droits admin
    if (!session.user.role || !checkAdminAccess(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);    // Activité des utilisateurs récents
    const recentUsers = await User.find({
      $or: [
        { createdAt: { $gte: lastWeek } },
        { lastLogin: { $gte: lastWeek } }
      ]
    })
    .select('firstName lastName email profile.avatar createdAt lastLogin role')
    .sort({ createdAt: -1 })
    .limit(10);    // Utilisateurs les plus actifs (basé sur le nombre de commandes)
    const topUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalSpent: 1,
          lastOrder: 1,
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          avatar: '$user.profile.avatar'
        }
      }
    ]);

    // Statistiques de croissance des utilisateurs
    const userGrowthStats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    // Répartition par rôle
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Activité récente (connexions, inscriptions)
    const [totalUsers, newUsersWeek, activeUsersWeek] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ lastLoginAt: { $gte: lastWeek } })
    ]);

    // Formatter les données pour les graphiques
    const growthData = userGrowthStats.map(item => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      users: item.count,
      label: new Date(item._id.year, item._id.month - 1).toLocaleDateString('fr-FR', { 
        month: 'short', 
        year: 'numeric' 
      })
    }));

    const roleData = roleDistribution.map(item => ({
      role: item._id || 'Non défini',
      count: item.count,
      percentage: Math.round((item.count / totalUsers) * 100)
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersWeek,
          activeUsersWeek,
          growthRate: totalUsers > 0 ? Math.round((newUsersWeek / totalUsers) * 100 * 100) / 100 : 0
        },
        recentUsers: recentUsers.map(user => ({
          id: user._id,
          name: user.name || 'Utilisateur',
          email: user.email,
          avatar: user.avatar || '/images/avatar.webp',
          role: user.role || 'user',
          joinDate: user.createdAt,
          lastLogin: user.lastLoginAt,
          isNew: user.createdAt >= lastWeek,
          isActive: user.lastLoginAt >= lastWeek
        })),
        topUsers: topUsers.map(user => ({
          id: user._id,
          name: user.name || 'Utilisateur',
          email: user.email,
          avatar: user.avatar || '/images/avatar.webp',
          orderCount: user.orderCount,
          totalSpent: user.totalSpent,
          lastOrder: user.lastOrder,
          avgOrderValue: Math.round(user.totalSpent / user.orderCount)
        })),
        growthChart: {
          labels: growthData.map(item => item.label),
          data: growthData.map(item => item.users),
          rawData: growthData
        },
        roleDistribution: roleData,
        activity: {
          signups: newUsersWeek,
          activeUsers: activeUsersWeek,
          inactiveUsers: totalUsers - activeUsersWeek,
          conversionRate: totalUsers > 0 ? Math.round((activeUsersWeek / totalUsers) * 100) : 0
        }
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
