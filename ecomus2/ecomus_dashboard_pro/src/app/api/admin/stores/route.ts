import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';

// Interface pour la requête de recherche MongoDB
interface StoreSearchQuery {
  [key: string]: any;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    slug?: { $regex: string; $options: string };
  }>;
  'subscription.plan'?: string;
}

/**
 * GET /api/admin/stores
 * Récupère tous les stores (admin seulement)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    console.log('[API Admin Stores] Session debug:', {
      hasSession: !!session,
      user: session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });
    // Vérifier les permissions admin
    if (!session?.user?.id || !['admin', 'super_admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';

    // Construire la requête de recherche
    const query: StoreSearchQuery = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    if (plan) {
      query['subscription.plan'] = plan;
    }

    // Récupérer les stores avec pagination
    const skip = (page - 1) * limit;
    const stores = await Store.find(query)
      .populate('owner', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalStores = await Store.countDocuments(query);
    const totalPages = Math.ceil(totalStores / limit);

    return NextResponse.json({
      success: true,
      stores,
      pagination: {
        currentPage: page,
        totalPages,
        totalStores,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error: unknown) {
    console.error('Erreur récupération stores admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des boutiques', details: errorMessage },
      { status: 500 }
    );
  }
}
