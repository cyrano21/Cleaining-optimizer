import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';

/**
 * GET /api/vendor/store/current
 * Récupère le store actuel du vendeur connecté
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    // Chercher le store du vendeur
    const store = await Store.findOne({ owner: session.user.id })
      .populate('owner', 'email name')
      .lean();

    if (!store) {
      // Créer un store par défaut pour l'utilisateur
      const defaultStore = new Store({
        name: 'Ma Boutique',
        slug: `boutique-${session.user.id}`,
        description: 'Ma boutique en ligne',
        owner: session.user.id,
        homeTheme: 'default',
        homeTemplate: 'default',
        homeName: 'Ma Boutique',
        homeDescription: 'Ma boutique en ligne',
        isActive: true,
        status: 'active',
        vendorStatus: 'approved'
      });
      
      await defaultStore.save();
      
      const newStore = await Store.findById(defaultStore._id)
        .populate('owner', 'email name')
        .lean();
      
      return NextResponse.json({
        success: true,
        store: newStore
      });
    }

    return NextResponse.json({
      success: true,
      store
    });
  } catch (error: unknown) {
    console.error('Erreur récupération store:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de la boutique' },
      { status: 500 }
    );
  }
}
