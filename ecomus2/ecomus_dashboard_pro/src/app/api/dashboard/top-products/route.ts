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

    // Pour l'instant, on retourne des données simulées basées sur les stores
    // Dans une vraie application, ces données viendraient d'une collection Products
    const stores = await Store.find({ isActive: true }).select('name stats').limit(10);
    
    const topProducts = stores.map((store, index) => {
      const baseRevenue = store.stats?.totalRevenue || 1000;
      const baseSales = store.stats?.totalOrders || 50;
      
      return {
        rank: `#${String(index + 100).padStart(3, '0')}`,
        product: `Produit ${store.name}`,
        category: ['Vêtements', 'Chaussures', 'Accessoires', 'Électronique'][index % 4],
        seller: store.name.substring(0, 3).toUpperCase(),
        sales: baseSales + Math.floor(Math.random() * 1000),
        revenue: `$${(baseRevenue + Math.floor(Math.random() * 5000)).toLocaleString()}`
      };
    });

    // Trier par ventes décroissantes
    topProducts.sort((a, b) => b.sales - a.sales);

    // Réassigner les rangs après tri
    topProducts.forEach((product, index) => {
      product.rank = `#${String(index + 1).padStart(3, '0')}`;
    });

    return NextResponse.json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des top produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}