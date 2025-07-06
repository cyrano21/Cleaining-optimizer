import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/api-helpers';

/**
 * API pour l'activation/désactivation des stores par l'admin
 * POST /api/admin/stores/activate
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return createApiError('Accès non autorisé - Admin requis', 403);
    }

    const { storeId, isActive, note } = await request.json();

    if (!storeId || typeof isActive !== 'boolean') {
      return createApiError('storeId et isActive sont requis', 400);
    }

    // Trouver la store
    const store = await Store.findById(storeId);
    if (!store) {
      return createApiError('Store non trouvée', 404);
    }

    // Mettre à jour le statut d'activation
    const updateData: any = {
      isActive,
      updatedAt: new Date()
    };

    if (isActive) {
      updateData.activatedAt = new Date();
      updateData.activatedBy = session.user.id;
    }

    if (note) {
      updateData.adminNote = note;
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendor', 'name email');

    // Log de l'action admin
    console.log(`[ADMIN ACTION] ${session.user.email} ${isActive ? 'activated' : 'deactivated'} store: ${store.name}`);

    return createApiResponse({
      message: `Store ${isActive ? 'activée' : 'désactivée'} avec succès`,
      store: {
        id: updatedStore._id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        isActive: updatedStore.isActive,
        activatedAt: updatedStore.activatedAt,
        activatedBy: updatedStore.activatedBy,
        vendor: updatedStore.vendor
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'activation de la store:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

/**
 * GET /api/admin/stores/activate - Liste des stores avec statut d'activation
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return createApiError('Accès non autorisé - Admin requis', 403);
    }    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '20';
    
    // Permettre d'afficher tous les stores avec limit=all
    let limit: number;
    if (limitParam === 'all') {
      limit = 0; // 0 signifie pas de limite
    } else {
      limit = Math.min(parseInt(limitParam), 100); // Augmenter la limite max à 100
    }

    // Construction du filtre
    const filter: any = {};
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }    const skip = (page - 1) * limit;

    // Construire la requête avec ou sans limite
    let storeQuery = Store.find(filter)
      .populate('vendor', 'name email')
      .populate('activatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip);

    // Appliquer la limite seulement si elle n'est pas 0
    if (limit > 0) {
      storeQuery = storeQuery.limit(limit);
    }

    const [stores, total] = await Promise.all([
      storeQuery.lean(),
      Store.countDocuments(filter)
    ]);

    const formattedStores = stores.map((store: any) => ({
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      homeTheme: store.homeTheme,
      homeName: store.homeName,
      homeDescription: store.homeDescription,
      isActive: store.isActive,
      activatedAt: store.activatedAt,
      activatedBy: store.activatedBy,
      vendor: store.vendor,
      vendorStatus: store.vendorStatus,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt
    }));    return createApiResponse({
      stores: formattedStores,
      pagination: {
        page,
        limit: limit || total, // Si pas de limite, retourner le total
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1
      },
      stats: {
        totalStores: await Store.countDocuments(),
        activeStores: await Store.countDocuments({ isActive: true }),
        inactiveStores: await Store.countDocuments({ isActive: false }),
        assignedStores: await Store.countDocuments({ vendor: { $exists: true } })
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stores:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}
