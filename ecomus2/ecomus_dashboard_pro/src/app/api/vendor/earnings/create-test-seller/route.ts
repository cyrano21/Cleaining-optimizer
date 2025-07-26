import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/dbConnect';
import Seller from '@/models/Seller';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test seller...');
    
    await dbConnect();
    
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 });
    }

    console.log('User ID:', session.user.id);

    // Vérifier si l'utilisateur existe
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Vérifier si un vendeur existe déjà pour cet utilisateur
    const existingSeller = await Seller.findOne({ user: session.user.id });
    if (existingSeller) {
      return NextResponse.json({ 
        message: 'Seller already exists',
        sellerId: existingSeller._id.toString()
      });
    }

    // Créer un vendeur de test
    const testSeller = new Seller({
      user: session.user.id,
      businessName: `Business ${user.firstName || user.email}`,
      businessType: 'individual',
      bankAccount: {
        accountNumber: '1234567890',
        routingNumber: '123456789',
        bankName: 'Test Bank'
      },
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country'
      },
      phone: '+1234567890',
      isVerified: true,
      commission: 10,
      totalEarnings: 0,
      status: 'approved'
    });

    await testSeller.save();
    console.log('Test seller created:', testSeller._id.toString());

    return NextResponse.json({ 
      message: 'Test seller created successfully',
      sellerId: testSeller._id.toString(),
      businessName: testSeller.businessName
    });
    
  } catch (error) {
    console.error('Error creating test seller:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 