import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { action, storeId } = await request.json();

    if (action === 'activate_ecomus') {
      // Activer la boutique Ecomus Store
      const store = await Store.findOneAndUpdate(
        { slug: 'ecomus-store' },
        { 
          status: 'active',
          featured: true,
          logo: '/images/store-logo.png',
          banner: '/images/store-cover.jpg',
          'verification.isVerified': true,
          'verification.verifiedAt': new Date()
        },
        { new: true }
      );

      if (!store) {
        return NextResponse.json({ error: 'Boutique Ecomus non trouvée' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Boutique Ecomus activée avec succès',
        store: {
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          status: store.status,
          logo: store.logo,
          banner: store.banner
        }
      });
    }

    if (action === 'list_all') {
      // Lister toutes les boutiques avec leurs détails
      const stores = await Store.find({})
        .populate('owner', 'name email')
        .select('name slug status logo banner featured createdAt')
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        count: stores.length,
        stores: stores.map(store => ({
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          status: store.status,
          logo: store.logo,
          banner: store.banner,
          featured: store.featured,
          owner: store.owner ? {
            id: store.owner._id.toString(),
            name: store.owner.name,
            email: store.owner.email
          } : null,
          createdAt: store.createdAt
        }))
      });
    }

    if (action === 'update_status' && storeId) {
      const { status } = await request.json();
      const store = await Store.findByIdAndUpdate(
        storeId,
        { status },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: `Statut mis à jour vers ${status}`,
        store: {
          id: store._id.toString(),
          name: store.name,
          status: store.status
        }
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });

  } catch (error) {
    console.error('Erreur API fix stores:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
