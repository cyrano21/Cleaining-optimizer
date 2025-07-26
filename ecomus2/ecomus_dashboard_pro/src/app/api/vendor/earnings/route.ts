import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { EarningService } from '@/services/earningService';

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le vendeur associé à l'utilisateur
    const seller = await import('@/models/Seller').then(m => m.default.findOne({ user: session.user.id }));
    
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Récupérer les paramètres depuis l'URL
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';
    const includeTest = url.searchParams.get('includeTest') !== 'false'; // Par défaut true

    // Récupérer les données d'earnings via le service
    const earningsData = await EarningService.getSellerEarnings(seller._id.toString(), period, includeTest);

    return NextResponse.json(earningsData);
  } catch (error) {
    console.error('Error fetching vendor earnings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 