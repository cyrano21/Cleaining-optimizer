import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    // Récupérer toutes les statistiques des stores
    const stores = await Store.find({ isActive: true }).select('stats');
    
    // Calculer les statistiques globales
    const totalStats = stores.reduce((acc, store) => {
      const stats = store.stats || {};
      return {
        totalOrders: acc.totalOrders + (stats.totalOrders || 0),
        totalProducts: acc.totalProducts + (stats.totalProducts || 0),
        totalRevenue: acc.totalRevenue + (stats.totalRevenue || 0),
        totalStores: acc.totalStores + 1
      };
    }, {
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      totalStores: 0
    });

    // Calculer les statistiques par statut (simulé pour l'exemple)
    const orderStats = {
      total: totalStats.totalOrders,
      inTransit: Math.floor(totalStats.totalOrders * 0.3),
      returned: Math.floor(totalStats.totalOrders * 0.05),
      pending: Math.floor(totalStats.totalOrders * 0.15)
    };

    // Calculer le revenu par catégorie
    const revenueStats = {
      total: `$${totalStats.totalRevenue.toLocaleString()}`,
      inTransit: `$${Math.floor(totalStats.totalRevenue * 0.3).toLocaleString()}`,
      returned: `$${Math.floor(totalStats.totalRevenue * 0.05).toLocaleString()}`,
      pending: `$${Math.floor(totalStats.totalRevenue * 0.15).toLocaleString()}`
    };

    const dashboardStats = {
      orders: {
        total: orderStats.total,
        inTransit: orderStats.inTransit,
        returned: orderStats.returned,
        pending: orderStats.pending
      },
      revenue: revenueStats,
      stores: {
        total: totalStats.totalStores,
        active: stores.filter(store => store.isActive).length
      },
      products: {
        total: totalStats.totalProducts
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}