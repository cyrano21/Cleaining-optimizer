import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/dbConnect';
import Earning from '@/models/Earning';
import Seller from '@/models/Seller';

export async function POST(request: NextRequest) {
  try {
    console.log('Cleaning test data...');
    
    await dbConnect();
    
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le vendeur
    const seller = await Seller.findOne({ user: session.user.id });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Supprimer uniquement les earnings de test (ceux avec orderNumber commençant par "TEST-")
    const result = await Earning.deleteMany({
      seller: seller._id,
      orderNumber: { $regex: '^TEST-' }
    });

    console.log(`Deleted ${result.deletedCount} test earnings records`);

    // Mettre à jour le total des earnings du vendeur
    const remainingEarnings = await Earning.aggregate([
      { $match: { seller: seller._id } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const newTotal = remainingEarnings.length > 0 ? remainingEarnings[0].total : 0;
    await Seller.findByIdAndUpdate(seller._id, { totalEarnings: newTotal });

    return NextResponse.json({ 
      message: 'Test data cleaned successfully',
      deletedCount: result.deletedCount,
      remainingEarnings: newTotal,
      sellerId: seller._id.toString()
    });
    
  } catch (error) {
    console.error('Error cleaning test data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 