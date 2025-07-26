import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Store from '@/models/Store';
import { authOptions } from '@/lib/auth-config';
import { checkAdminAccess, hasRoleOrHigher } from '@/lib/role-utils';

// GET - Récupérer tous les produits du vendeur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';    const order = searchParams.get('order') || 'desc';

    await connectDB();    // Vérifier si l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id);
    if (!user || (!hasRoleOrHigher(user.role, 'MODERATOR') && !checkAdminAccess(user.role))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Construire la requête
    const query: any = { vendor: session.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculer l'offset
    const skip = (page - 1) * limit;

    // Récupérer les produits avec pagination
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('store', 'name')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compter le total
    const total = await Product.countDocuments(query);

    // Calculer les statistiques
    const stats = await Product.aggregate([
      { $match: { vendor: user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          draftProducts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          inactiveProducts: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          totalRevenue: { $sum: { $multiply: ['$price', '$totalSales'] } },
          totalSales: { $sum: '$totalSales' },
          lowStockProducts: { $sum: { $cond: [{ $lte: ['$quantity', '$lowStockAlert'] }, 1, 0] } },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          draftProducts: 0,
          inactiveProducts: 0,
          totalRevenue: 0,
          totalSales: 0,
          lowStockProducts: 0,
          avgRating: 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });    }    await connectDB();

    // Vérifier si l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id);
    if (!user || (!hasRoleOrHigher(user.role, 'MODERATOR') && !checkAdminAccess(user.role))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      comparePrice,
      sku,
      barcode,
      quantity,
      lowStockAlert,
      images,
      category,
      tags,
      status,
      featured,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      variant
    } = body;

    // Générer le slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Vérifier que le SKU est unique
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return NextResponse.json({ error: 'Ce SKU existe déjà' }, { status: 400 });
    }

    // Récupérer le store du vendeur
    const vendorStore = await Store.findOne({ owner: session.user.id });
    if (!vendorStore) {
      return NextResponse.json({ error: 'Aucun magasin trouvé pour ce vendeur' }, { status: 400 });
    }

    // Créer le produit
    const product = new Product({
      title,
      slug: `${slug}-${Date.now()}`, // Assurer l'unicité
      description,
      price,
      comparePrice,
      discountPercentage: comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0,
      sku,
      barcode,
      quantity,
      lowStockAlert: lowStockAlert || 5,
      images,
      category,
      tags: tags || [],
      vendor: session.user.id,
      store: vendorStore._id,
      status: status || 'draft',
      featured: featured || false,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      variant,
      averageRating: 0,
      totalReviews: 0,
      totalSales: 0
    });

    await product.save();

    // Peupler les références pour la réponse
    await product.populate('category', 'name');
    await product.populate('store', 'name');

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      const errors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
