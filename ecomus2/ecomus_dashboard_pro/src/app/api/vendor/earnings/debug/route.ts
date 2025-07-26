import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/dbConnect';
import Seller from '@/models/Seller';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug route called');
    
    await dbConnect();
    
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions);
    
    // Compter les vendeurs
    const sellersCount = await Seller.countDocuments();
    const usersCount = await User.countDocuments();
    
    // Récupérer tous les vendeurs
    const sellers = await Seller.find().populate('user', 'email name').limit(5);
    
    const debugInfo = {
      session: session ? {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: session.user?.role
      } : null,
      database: {
        sellersCount,
        usersCount,
        sellers: sellers.map(s => ({
          id: s._id,
          businessName: s.businessName,
          userId: s.user,
          commission: s.commission,
          totalEarnings: s.totalEarnings
        }))
      }
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({ 
      error: 'Debug route error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 