import { NextRequest, NextResponse } from 'next/server';

// API publique pour récupérer les produits (sans authentification)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de la requête
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const storeId = searchParams.get('storeId');
    
    // Construire l'URL vers l'API du dashboard
    const dashboardApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const apiUrl = new URL('/api/public/products', dashboardApiUrl);
    
    // Ajouter les paramètres
    apiUrl.searchParams.append('page', page);
    apiUrl.searchParams.append('limit', limit);
    if (category) apiUrl.searchParams.append('category', category);
    if (search) apiUrl.searchParams.append('search', search);
    if (featured) apiUrl.searchParams.append('featured', featured);
    if (storeId) apiUrl.searchParams.append('storeId', storeId);
    
    console.log('🔗 Frontend API - Forwarding to:', apiUrl.toString());
    
    // Faire l'appel vers l'API du dashboard
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Error from dashboard API:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits', status: response.status },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Frontend Products API Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
