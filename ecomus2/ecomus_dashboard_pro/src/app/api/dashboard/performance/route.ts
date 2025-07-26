import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const metric = searchParams.get('metric') || 'revenue';

    await connectDB();

    // Définir les périodes
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;
    let dateLabels: string[];

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        dateLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        });
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = '%Y-%m';
        dateLabels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now.getFullYear(), i, 1);
          return date.toLocaleDateString('fr-FR', { month: 'short' });
        });
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        groupFormat = '%Y-%m';
        dateLabels = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return date.toLocaleDateString('fr-FR', { month: 'short' });
        });
    }

    // Pipeline d'agrégation pour les revenus et commandes
    const pipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate },
          ...(metric === 'revenue' ? { status: { $in: ['completed', 'delivered'] } } : {})
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const aggregationResult = await Order.aggregate(pipeline);

    // Créer une map des résultats
    const dataMap = new Map();
    aggregationResult.forEach(item => {
      dataMap.set(item._id, item);
    });

    // Construire les données pour le graphique
    const chartData = dateLabels.map((label, index) => {
      let dateKey: string;
      
      if (period === 'week') {
        const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
        dateKey = date.toISOString().split('T')[0];
      } else {
        const date = period === 'year' 
          ? new Date(now.getFullYear(), index, 1)
          : new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const data = dataMap.get(dateKey) || { revenue: 0, orders: 0, avgOrderValue: 0 };
      
      return {
        period: label,
        revenue: Math.round(data.revenue),
        orders: data.orders,
        avgOrderValue: Math.round(data.avgOrderValue || 0),
        date: dateKey
      };
    });

    // Calculer les statistiques générales
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculer la croissance
    const currentPeriod = chartData[chartData.length - 1];
    const previousPeriod = chartData[chartData.length - 2];
    const growth = previousPeriod && previousPeriod.revenue > 0 
      ? ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        labels: chartData.map(item => item.period),
        datasets: [
          {
            label: 'Revenus (€)',
            data: chartData.map(item => item.revenue),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Commandes',
            data: chartData.map(item => item.orders),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ],
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue),
          growth: Math.round(growth * 100) / 100,
          period
        },
        rawData: chartData
      },
      period,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données de performance:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
