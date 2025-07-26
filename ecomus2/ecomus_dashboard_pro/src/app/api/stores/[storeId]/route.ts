import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import User from '@/models/User';

// PUT - Mettre à jour une boutique spécifique
export async function PUT(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { storeId } = await params;
    const body = await request.json();
    const { ...updateData } = body;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'ID de la boutique requis dans l\'URL' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingStore = await Store.findById(storeId);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';
    const isOwner = existingStore.owner ? existingStore.owner.toString() === session.user.id : false;
    const isVendor = existingStore.vendors ? existingStore.vendors.some((vendorId: string | { toString(): string }) => vendorId.toString() === session.user.id) : false;
    
    if (!isAdmin && !isOwner && !isVendor) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Vous n\'êtes pas autorisé à modifier cette boutique.' },
        { status: 403 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    if (updateData.slug) {
      const existingSlugStore = await Store.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: storeId } 
      });
      
      if (existingSlugStore) {
        return NextResponse.json(
          { success: false, error: 'Ce slug est déjà utilisé par une autre boutique' },
          { status: 409 }
        );
      }
    }

    updateData.updatedAt = new Date();

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );

    if (!updatedStore) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la boutique' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Boutique mise à jour avec succès',
      store: updatedStore
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la boutique:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: `Erreur de validation: ${error.message}` },
        { status: 400 }
      );
    }
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'ID de boutique invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// GET - Récupérer une boutique spécifique
export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'ID de la boutique requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const store = await Store.findById(storeId).lean() as any;
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';
    const isOwner = store.owner ? store.owner.toString() === session.user.id : false;
    const isVendor = store.vendors ? store.vendors.some((vendorId: any) => vendorId.toString() === session.user.id) : false;
    
    if (!isAdmin && !isOwner && !isVendor) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      store
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'ID de boutique invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une boutique spécifique
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'ID de la boutique requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingStore = await Store.findById(storeId);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';
    const isOwner = existingStore.owner ? existingStore.owner.toString() === session.user.id : false;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs et propriétaires peuvent supprimer une boutique.' },
        { status: 403 }
      );
    }

    await Store.findByIdAndDelete(storeId);

    return NextResponse.json({
      success: true,
      message: 'Boutique supprimée avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression de la boutique:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'ID de boutique invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
