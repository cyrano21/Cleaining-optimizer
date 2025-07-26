import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET() {
  try {
    await connectDB();

    // Compter le nombre total de boutiques
    const storeCount = await Store.countDocuments();
    
    // Récupérer toutes les boutiques avec leurs informations de base
    const stores = await Store.find({})
      .select('name slug status createdAt owner')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📊 ${storeCount} boutique(s) trouvée(s) dans la base de données`);
    
    stores.forEach((store, index) => {
      console.log(`${index + 1}. 🏪 ${store.name} (${store.slug}) - Status: ${store.status}`);
    });

    // Si aucune boutique, créer une boutique de test
    if (storeCount === 0) {
      console.log('🏪 Création d\'une boutique de test...');
      
      const testStore = new Store({
        name: 'Ecomus Store',
        slug: 'ecomus-store',
        description: 'Boutique officielle Ecomus - Mode et lifestyle de qualité',
        status: 'active',
        featured: true,
        address: {
          street: '123 Fashion Street',
          city: 'Paris',
          state: 'Île-de-France',
          postalCode: '75001',
          country: 'France'
        },
        contact: {
          email: 'contact@ecomus-store.com',
          phone: '+33 1 23 45 67 89',
        },
        settings: {
          allowReviews: true,
          autoApproveProducts: true,
          minOrderAmount: 0,
          shippingFee: 5.99,
          freeShippingThreshold: 50,
          taxRate: 20,
          currency: 'EUR',
          timezone: 'Europe/Paris'
        },
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          documents: []
        },
        metrics: {
          totalProducts: 45,
          totalOrders: 128,
          totalRevenue: 12456.78,
          averageRating: 4.5,
          totalReviews: 89
        }
      });

      await testStore.save();
      console.log('✅ Boutique de test créée');
      
      return NextResponse.json({
        success: true,
        message: 'Boutique de test créée',
        store: {
          name: testStore.name,
          slug: testStore.slug,
          status: testStore.status
        }
      });
    }

    return NextResponse.json({
      success: true,
      count: storeCount,
      stores: stores.map(store => ({
        id: store._id,
        name: store.name,
        slug: store.slug,
        status: store.status,
        owner: store.owner ? {
          id: store.owner._id,
          name: store.owner.name,
          email: store.owner.email
        } : null,
        createdAt: store.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Erreur debug stores:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
