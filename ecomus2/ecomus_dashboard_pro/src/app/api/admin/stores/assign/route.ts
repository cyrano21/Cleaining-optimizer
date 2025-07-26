import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/api-helpers';

/**
 * API pour l'assignation des vendeurs aux stores
 * POST /api/admin/stores/assign
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return createApiError('Accès non autorisé - Admin requis', 403);
    }

    const { storeId, vendorId, action } = await request.json();

    if (!storeId || !action) {
      return createApiError('storeId et action sont requis', 400);
    }

    // Vérifier que la store existe
    const store = await Store.findById(storeId);
    if (!store) {
      return createApiError('Store non trouvée', 404);
    }

    let updateData: any = {};

    switch (action) {
      case 'assign':
        if (!vendorId) {
          return createApiError('vendorId requis pour l\'assignation', 400);
        }

        // Vérifier que le vendeur existe et a le bon rôle
        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== 'vendor') {
          return createApiError('Vendeur non trouvé ou rôle invalide', 404);
        }

        // Vérifier que le vendeur n'a pas déjà une store assignée
        const existingAssignment = await Store.findOne({ vendor: vendorId });
        if (existingAssignment) {
          return createApiError('Ce vendeur a déjà une store assignée', 400);
        }

        updateData = {
          vendor: vendorId,
          vendorStatus: 'approved',
          vendorAssignedAt: new Date(),
          vendorAssignedBy: session.user.id
        };
        break;

      case 'unassign':
        updateData = {
          $unset: { 
            vendor: 1,
            vendorAssignedAt: 1,
            vendorAssignedBy: 1
          },
          vendorStatus: 'none'
        };
        break;

      case 'approve_request':
        if (!store.vendor) {
          return createApiError('Aucune demande de vendeur en attente', 400);
        }
        updateData = {
          vendorStatus: 'approved',
          vendorApprovedAt: new Date(),
          vendorApprovedBy: session.user.id
        };
        break;

      case 'reject_request':
        updateData = {
          vendorStatus: 'rejected',
          vendorRejectedAt: new Date(),
          vendorRejectedBy: session.user.id,
          $unset: { vendor: 1 }
        };
        break;

      default:
        return createApiError('Action non reconnue', 400);
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendor', 'name email')
     .populate('vendorAssignedBy', 'name email');

    // Log de l'action admin
    console.log(`[ADMIN ACTION] ${session.user.email} ${action} store: ${store.name} ${vendorId ? `to vendor: ${vendorId}` : ''}`);

    return createApiResponse({
      message: `Assignation ${action} effectuée avec succès`,
      store: {
        id: updatedStore._id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        vendor: updatedStore.vendor,
        vendorStatus: updatedStore.vendorStatus,
        vendorAssignedAt: updatedStore.vendorAssignedAt,
        vendorAssignedBy: updatedStore.vendorAssignedBy
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

/**
 * GET /api/admin/stores/assign - Vue d'ensemble des assignations
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return createApiError('Accès non autorisé - Admin requis', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'assigned', 'unassigned', 'pending'

    // Construction du filtre
    let filter: any = {};
    if (status === 'assigned') {
      filter = { vendor: { $exists: true }, vendorStatus: 'approved' };
    } else if (status === 'unassigned') {
      filter = { vendor: { $exists: false } };
    } else if (status === 'pending') {
      filter = { vendorStatus: 'pending' };
    }

    const [stores, vendors] = await Promise.all([
      Store.find(filter)
        .populate('vendor', 'name email')
        .populate('vendorAssignedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: 'vendor' })
        .select('name email createdAt')
        .lean()
    ]);

    const formattedStores = stores.map((store: any) => ({
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      homeTheme: store.homeTheme,
      homeName: store.homeName,
      vendor: store.vendor,
      vendorStatus: store.vendorStatus,
      vendorAssignedAt: store.vendorAssignedAt,
      vendorAssignedBy: store.vendorAssignedBy,
      isActive: store.isActive
    }));

    const availableVendors = vendors.filter(vendor => 
      !stores.some((store: any) =>
        store.vendor && (store.vendor._id as { toString(): string }).toString() === (vendor._id as { toString(): string }).toString()
      )
    );

    return createApiResponse({
      stores: formattedStores,
      availableVendors: availableVendors.map((vendor: any) => ({
        id: vendor._id.toString(),
        name: vendor.name,
        email: vendor.email,
        createdAt: vendor.createdAt
      })),
      stats: {
        totalStores: await Store.countDocuments(),
        assignedStores: await Store.countDocuments({ vendor: { $exists: true } }),
        pendingRequests: await Store.countDocuments({ vendorStatus: 'pending' }),
        availableVendors: availableVendors.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des assignations:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}
