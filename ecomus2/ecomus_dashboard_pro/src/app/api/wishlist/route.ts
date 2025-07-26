import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import WishlistItem from "@/models/Wishlist";
import Product from "@/models/Product";
import User from "@/models/User";

// GET - Récupérer les items de wishlist de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = token.id || token.sub;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: { user: userId }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $unwind: '$productData'
      }
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'productData.title': { $regex: search, $options: 'i' } },
            { 'productData.brand': { $regex: search, $options: 'i' } },
            { 'productData.description': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add category filter
    if (category && category !== 'all') {
      pipeline.push({
        $match: { 'productData.category': category }
      });
    }

    // Add availability filter
    if (availability && availability !== 'all') {
      const availabilityMap = {
        'in-stock': { 'productData.stock': { $gt: 0 }, 'productData.status': 'active' },
        'out-of-stock': { 'productData.stock': { $lte: 0 } },
        'limited': { 'productData.stock': { $lte: 10, $gt: 0 } }
      };
      pipeline.push({
        $match: availabilityMap[availability as keyof typeof availabilityMap] || {}
      });
    }

    // Add sorting
    const sortObj: any = {};
    if (sortBy === 'dateAdded') {
      sortObj.dateAdded = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sortObj['productData.title'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'price') {
      sortObj['productData.price'] = sortOrder === 'desc' ? -1 : 1;
    }

    pipeline.push({ $sort: sortObj });

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Add final projection
    pipeline.push({
      $project: {
        _id: 1,
        dateAdded: 1,
        notes: 1,
        priority: 1,
        product: {
          id: '$productData._id',
          title: '$productData.title',
          brand: '$productData.brand',
          price: '$productData.price',
          originalPrice: '$productData.originalPrice',
          images: '$productData.images',
          rating: '$productData.rating',
          reviews: '$productData.reviews',
          stock: '$productData.stock',
          status: '$productData.status',
          category: '$productData.category',
          description: '$productData.description',
          sku: '$productData.sku'
        }
      }
    });

    // Execute aggregation
    const wishlistItems = await WishlistItem.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, and project
    countPipeline.push({ $count: "total" });
    const countResult = await WishlistItem.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedItems = wishlistItems.map((item: any) => ({
      id: item._id,
      name: item.product.title,
      brand: item.product.brand || 'Unknown Brand',
      price: item.product.price,
      originalPrice: item.product.originalPrice,
      image: item.product.images?.[0] || '/images/placeholder.svg',
      rating: item.product.rating || 0,
      reviews: item.product.reviews || 0,
      availability: item.product.stock > 0 ? 
        (item.product.stock <= 10 ? 'limited' : 'in-stock') : 'out-of-stock',
      category: item.product.category,
      dateAdded: item.dateAdded,
      notes: item.notes,
      priority: item.priority,
      productId: item.product.id,
      sku: item.product.sku,
      stock: item.product.stock
    }));

    return NextResponse.json({
      success: true,
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        totalItems: total,
        inStock: formattedItems.filter(item => item.availability === 'in-stock').length,
        outOfStock: formattedItems.filter(item => item.availability === 'out-of-stock').length,
        limited: formattedItems.filter(item => item.availability === 'limited').length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un produit à la wishlist
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = token.id || token.sub;
    const { productId, notes, priority } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 });
    }

    await connectDB();

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Vérifier si l'item n'existe pas déjà
    const existingItem = await WishlistItem.findOne({ user: userId, product: productId });
    if (existingItem) {
      return NextResponse.json({ error: 'Produit déjà dans la wishlist' }, { status: 409 });
    }

    // Créer le nouvel item
    const newItem = await WishlistItem.create({
      user: userId,
      product: productId,
      notes: notes || '',
      priority: priority || 'medium'
    });

    return NextResponse.json({
      success: true,
      message: 'Produit ajouté à la wishlist',
      item: newItem
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout à la wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit de la wishlist
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = token.id || token.sub;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const productId = searchParams.get('productId');

    if (!itemId && !productId) {
      return NextResponse.json({ error: 'ID de l\'item ou du produit requis' }, { status: 400 });
    }

    await connectDB();

    let result;
    if (itemId) {
      result = await WishlistItem.findOneAndDelete({ _id: itemId, user: userId });
    } else {
      result = await WishlistItem.findOneAndDelete({ user: userId, product: productId });
    }

    if (!result) {
      return NextResponse.json({ error: 'Item non trouvé dans la wishlist' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé de la wishlist'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
