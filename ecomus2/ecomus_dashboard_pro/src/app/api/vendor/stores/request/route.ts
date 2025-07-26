import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/api-helpers';

/**
 * API pour les vendeurs - Gestion des demandes de stores
 * GET /api/vendor/stores/request - Liste des stores disponibles
 * POST /api/vendor/stores/request - Demander une store
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Vérifier si le vendeur a déjà une store
    const existingStore = await Store.findOne({ vendor: session.user.id });

    // Construction du filtre pour les stores disponibles
    const filter: any = {
      vendor: { $exists: false }, // Pas encore assignée
      isActive: false // Pas encore activée (en attente d'assignation)
    };

    if (category) {
      filter.homeTheme = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { homeName: { $regex: search, $options: 'i' } },
        { homeDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const availableStores = await Store.find(filter)
      .select('name slug homeTheme homeName homeDescription homeTemplate')
      .sort({ homeName: 1 })
      .lean();

    // Obtenir les catégories disponibles
    const categories = await Store.distinct('homeTheme', { vendor: { $exists: false } });

    const formattedStores = availableStores.map((store: any) => ({
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      homeTheme: store.homeTheme,
      homeName: store.homeName,
      homeDescription: store.homeDescription,
      homeTemplate: store.homeTemplate,
      previewUrl: `/preview/store/${store.slug}` // URL de preview
    }));

    return createApiResponse({
      currentStore: existingStore ? {
        id: existingStore._id.toString(),
        name: existingStore.name,
        slug: existingStore.slug,
        homeName: existingStore.homeName,
        vendorStatus: existingStore.vendorStatus,
        isActive: existingStore.isActive
      } : null,
      availableStores: formattedStores,
      categories,
      canRequest: !existingStore || existingStore.vendorStatus === 'rejected'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stores:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    const { storeId, message } = await request.json();

    if (!storeId) {
      return createApiError('storeId requis', 400);
    }

    // Vérifier si le vendeur a déjà une store en cours
    const existingRequest = await Store.findOne({ 
      vendor: session.user.id,
      vendorStatus: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return createApiError('Vous avez déjà une demande en cours ou une store assignée', 400);
    }

    // Vérifier que la store existe et est disponible
    const store = await Store.findById(storeId);
    if (!store) {
      return createApiError('Store non trouvée', 404);
    }

    if (store.vendor) {
      return createApiError('Cette store est déjà assignée', 400);
    }

    // Créer la demande
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        vendor: session.user.id,
        vendorStatus: 'pending',
        vendorRequestedAt: new Date(),
        vendorMessage: message || null
      },
      { new: true, runValidators: true }
    ).populate('vendor', 'name email');

    // Log de la demande
    console.log(`[VENDOR REQUEST] ${session.user.email} requested store: ${store.name}`);

    return createApiResponse({
      message: 'Demande de store envoyée avec succès',
      store: {
        id: updatedStore._id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        homeName: updatedStore.homeName,
        vendorStatus: updatedStore.vendorStatus,
        vendorRequestedAt: updatedStore.vendorRequestedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la demande de store:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

/**
 * DELETE /api/vendor/stores/request - Annuler une demande de store
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    // Trouver la demande en cours du vendeur
    const currentRequest = await Store.findOne({ 
      vendor: session.user.id,
      vendorStatus: 'pending'
    });

    if (!currentRequest) {
      return createApiError('Aucune demande en cours à annuler', 404);
    }

    // Annuler la demande
    await Store.findByIdAndUpdate(
      currentRequest._id,
      {
        $unset: { 
          vendor: 1,
          vendorRequestedAt: 1,
          vendorMessage: 1
        },
        vendorStatus: 'none'
      }
    );

    // Log de l'annulation
    console.log(`[VENDOR CANCEL] ${session.user.email} cancelled store request: ${currentRequest.name}`);

    return createApiResponse({
      message: 'Demande annulée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}
