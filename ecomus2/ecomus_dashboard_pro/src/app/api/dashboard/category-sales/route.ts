import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Générer des données de ventes par catégorie dynamiques
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ];
    
    const borderColors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)'
    ];

    // Générer des pourcentages aléatoires qui totalisent 100%
    let percentages = categories.map(() => Math.random());
    const sum = percentages.reduce((a, b) => a + b, 0);
    percentages = percentages.map(p => Math.round((p / sum) * 100));
    
    // Ajuster pour que la somme soit exactement 100
    const currentSum = percentages.reduce((a, b) => a + b, 0);
    if (currentSum !== 100) {
      percentages[0] += 100 - currentSum;
    }

    const categoryData = {
      labels: categories,
      datasets: [
        {
          data: percentages,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: borderColors.slice(0, categories.length),
          borderWidth: 2,
        },
      ],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Category sales API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}