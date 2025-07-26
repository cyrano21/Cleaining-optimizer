import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { EarningService } from '@/services/earningService';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting earnings init process...');
    
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 });
    }

    console.log('User ID:', session.user.id);

    // Récupérer le vendeur associé à l'utilisateur
    try {
      const Seller = await import('@/models/Seller').then(m => m.default);
      const seller = await Seller.findOne({ user: session.user.id });
      
      console.log('Seller lookup result:', seller ? 'Found' : 'Not found');
      
      if (!seller) {
        console.log('No seller found for user:', session.user.id);
        return NextResponse.json({ 
          error: 'Seller not found - User is not registered as a seller',
          userId: session.user.id 
        }, { status: 404 });
      }

      console.log('Seller ID:', seller._id.toString());

      // Générer des données de test
      console.log('Starting test data generation...');
      await EarningService.generateTestData(seller._id.toString());
      console.log('Test data generation completed');

      return NextResponse.json({ 
        message: 'Test data generated successfully',
        sellerId: seller._id.toString(),
        userId: session.user.id
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Database error during seller lookup',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in earnings init route:', error);
    return NextResponse.json({ 
      error: 'Internal server error during initialization',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 