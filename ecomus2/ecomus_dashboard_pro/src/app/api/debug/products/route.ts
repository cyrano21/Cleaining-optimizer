import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Compter les produits
    const totalProducts = await Product.countDocuments();
    
    // Récupérer quelques produits sans authentification (pour debug)
    const products = await Product.find().limit(5).lean();
    
    return NextResponse.json({
      success: true,
      totalProducts,
      sampleProducts: products.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        sku: p.sku,
        status: p.status
      }))
    });
    
  } catch (error: any) {
    console.error('Erreur debug products:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      totalProducts: 0,
      sampleProducts: []
    });
  }
}
