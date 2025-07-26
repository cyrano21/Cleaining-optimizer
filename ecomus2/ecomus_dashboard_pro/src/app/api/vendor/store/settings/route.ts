import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Store, { StoreDocument } from '@/models/Store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    // Trouver la boutique du vendor
    const store = await Store.findOne({ 
      vendors: session.user.id,
      status: { $in: ['active', 'pending'] }
    }).lean() as StoreDocument | null;

    if (!store) {
      return NextResponse.json({ success: false, error: 'Boutique non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: store.name,
        description: store.description,
        logo: store.logo || store.logoUrl,
        banner: store.banner,
        email: store.email || store.contact?.email,
        phone: store.phone || store.contact?.phone,
        address: store.address,
        primaryColor: store.primaryColor || store.customizations?.colors?.primary,
        accentColor: store.accentColor || store.customizations?.colors?.accent,
        secondaryColor: store.secondaryColor || store.customizations?.colors?.secondary,
        socialMedia: store.socialMedia,
        currency: store.settings?.currency,
        taxRate: store.settings?.taxRate,
        freeShippingThreshold: store.settings?.freeShippingThreshold,
        isPublic: store.isPublic,
        featured: store.featured,
        seo: store.seo
      }
    });

  } catch (error) {
    console.error('Erreur GET store settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Trouver la boutique du vendor
    const store = await Store.findOne({ 
      vendors: session.user.id,
      status: { $in: ['active', 'pending'] }
    }) as StoreDocument | null;

    if (!store) {
      return NextResponse.json({ success: false, error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Mettre à jour les paramètres
    const updateData: any = {};

    // Informations de base
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.banner !== undefined) updateData.banner = body.banner;

    // Contact
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;

    // Personnalisation
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
    if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor;

    // Réseaux sociaux
    if (body.socialMedia !== undefined) updateData.socialMedia = body.socialMedia;

    // Paramètres commerciaux
    if (body.currency !== undefined || body.taxRate !== undefined || body.freeShippingThreshold !== undefined) {
      updateData.settings = {
        ...store.settings,
        currency: body.currency !== undefined ? body.currency : store.settings?.currency,
        taxRate: body.taxRate !== undefined ? body.taxRate : store.settings?.taxRate,
        freeShippingThreshold: body.freeShippingThreshold !== undefined ? body.freeShippingThreshold : store.settings?.freeShippingThreshold
      };
    }

    // Paramètres de visibilité
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
    if (body.featured !== undefined) updateData.featured = body.featured;

    // SEO
    if (body.seo !== undefined) updateData.seo = body.seo;

    // Mettre à jour la boutique
    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: updatedStore.name,
        description: updatedStore.description,
        logo: updatedStore.logo || updatedStore.logoUrl,
        banner: updatedStore.banner,
        email: updatedStore.email || updatedStore.contact?.email,
        phone: updatedStore.phone || updatedStore.contact?.phone,
        address: updatedStore.address,
        primaryColor: updatedStore.primaryColor || updatedStore.customizations?.colors?.primary,
        accentColor: updatedStore.accentColor || updatedStore.customizations?.colors?.accent,
        secondaryColor: updatedStore.secondaryColor || updatedStore.customizations?.colors?.secondary,
        socialMedia: updatedStore.socialMedia,
        currency: updatedStore.settings?.currency,
        taxRate: updatedStore.settings?.taxRate,
        freeShippingThreshold: updatedStore.settings?.freeShippingThreshold,
        isPublic: updatedStore.isPublic,
        featured: updatedStore.featured,
        seo: updatedStore.seo
      }
    });

  } catch (error) {
    console.error('Erreur PUT store settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
} 