import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { status } = body;

    // Vérifier que le statut is valide
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Statut invalide. Statuts autorisés: " + validStatuses.join(', ') 
      }, { status: 400 });
    }

    // Trouver la boutique
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }

    // Vérifier les permissions
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      const isOwner = store.owner ? store.owner.toString() === session.user.id : false;
      const isVendor = store.vendors ? store.vendors.some((vendorId: mongoose.Types.ObjectId) => vendorId.toString() === session.user.id) : false;
      
      if (!isOwner && !isVendor) {
        return NextResponse.json({ 
          error: "Vous n'avez pas l'autorisation de modifier cette boutique" 
        }, { status: 403 });
      }
    }

    // Mettre à jour le statut
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { 
        status,
        ...(status === 'active' && { 'verification.verifiedAt': new Date() })
      },
      { new: true }
    ).populate('owner', 'name email');

    return NextResponse.json({
      success: true,
      message: `Statut de la boutique mis à jour vers "${status}"`,
      data: {
        id: updatedStore._id.toString(),
        name: updatedStore.name,
        status: updatedStore.status,
        isActive: updatedStore.status === 'active',
        updatedAt: updatedStore.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
