import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    await connectDB();

    // Générer des données de revenus dynamiques basées sur la période
    let labels: string[] = [];
    let data: number[] = [];

    if (period === 'month') {
      labels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      // Générer des données aléatoires mais réalistes
      data = labels.map(() => Math.floor(Math.random() * 30000) + 15000);
    } else if (period === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = labels.map(() => Math.floor(Math.random() * 5000) + 2000);
    } else if (period === 'year') {
      const currentYear = new Date().getFullYear();
      labels = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
      data = labels.map(() => Math.floor(Math.random() * 500000) + 200000);
    }

    const revenueData = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
      period,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Revenue chart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}