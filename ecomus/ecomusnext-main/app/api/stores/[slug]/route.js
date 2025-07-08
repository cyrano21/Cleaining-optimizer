import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 });
    }

    // Récupérer la boutique depuis MongoDB
    const store = await Store.findOne({ slug, status: 'active' })
      .select('_id name slug description status settings.homeTemplate settings.theme ownerId')
      .lean();
    
    if (!store) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }
    
    // Mapper les données de la boutique pour le frontend
    const storeData = {
      id: store._id,
      slug: store.slug,
      name: store.name,
      description: store.description,
      status: store.status,
      homeTemplate: store.settings?.homeTemplate || 'home-01',
      homeTheme: store.settings?.theme ? 'custom' : 'fashion',
      ownerId: store.ownerId
    };

    return NextResponse.json({ success: true, store: storeData });
  } catch (error) {
    console.error('Erreur API store:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
}
