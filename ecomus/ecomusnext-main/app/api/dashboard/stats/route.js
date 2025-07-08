import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // TODO: Récupérer les vraies statistiques depuis MongoDB
    // Pour l'instant, stats basiques en attendant l'implémentation complète
    const stats = {
      cloudinaryImages: 0,
      optimizationRate: 0,
      productsWithCloudinary: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      wishlistItems: 0,
      recentActivity: {
        lastOrder: null,
        lastLogin: new Date().toISOString(),
      }
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Erreur API stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
}
