// ✅ FICHIER : src/app/api/products/dynamic/route.ts
// API optimisée pour récupérer les produits avec filtrage dynamique et pagination

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Store from "@/models/Store";

interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  status?: string;
  tags?: string[];
  attributes?: { [key: string]: any };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ProductResponse {
  products: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    availableCategories: any[];
    priceRange: { min: number; max: number };
    availableTags: string[];
    availableAttributes: { [key: string]: string[] };
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extraction et validation des paramètres
    const filters: ProductFilters = {
      storeId: searchParams.get('storeId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      categorySlug: searchParams.get('categorySlug') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      featured: searchParams.get('featured') === 'true',
      status: searchParams.get('status') || 'active',
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '12'), 50) // Limite max de 50
    };

    // Construction de la requête MongoDB optimisée
    const query: any = {};
    
    // Filtres de base
    if (filters.storeId) query.store = filters.storeId;
    if (filters.status) query.status = filters.status;
    if (filters.featured) query.featured = true;

    // Filtre par catégorie
    if (filters.categoryId) {
      query.category = filters.categoryId;
    } else if (filters.categorySlug) {
      const category = await Category.findOne({ slug: filters.categorySlug }).select('_id').lean();
      if (category) query.category = category._id;
    }

    // Filtre par prix
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Recherche textuelle
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Filtres par attributs personnalisés
    if (filters.attributes) {
      Object.keys(filters.attributes).forEach(key => {
        query[`attributes.${key}`] = filters.attributes![key];
      });
    }

    // Construction du tri
    const sort: any = {};
    if (filters.search) {
      sort.score = { $meta: 'textScore' };
    }
    sort[filters.sortBy!] = filters.sortOrder === 'asc' ? 1 : -1;

    // Calcul de la pagination
    const skip = (filters.page! - 1) * filters.limit!;

    // Exécution des requêtes en parallèle pour optimiser les performances
    const [products, totalProducts, priceRange, availableCategories, availableTags] = await Promise.all([
      // Requête principale des produits
      Product.find(query)
        .populate('category', 'name slug')
        .populate('store', 'name slug')
        .select('title slug description price comparePrice discountPercentage images averageRating totalReviews featured tags attributes status createdAt')
        .sort(sort)
        .skip(skip)
        .limit(filters.limit!)
        .lean(),
      
      // Comptage total
      Product.countDocuments(query),
      
      // Plage de prix
      Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]),
      
      // Catégories disponibles
      Product.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        { $unwind: '$categoryInfo' },
        {
          $group: {
            _id: '$categoryInfo._id',
            name: { $first: '$categoryInfo.name' },
            slug: { $first: '$categoryInfo.slug' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Tags disponibles
      Product.aggregate([
        { $match: query },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 50 }
      ])
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalProducts / filters.limit!);
    const hasNextPage = filters.page! < totalPages;
    const hasPrevPage = filters.page! > 1;

    // Construction de la réponse optimisée
    const response: ProductResponse = {
      products: products.map(product => ({
        ...product,
        finalPrice: product.discountPercentage > 0 
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price,
        hasDiscount: product.discountPercentage > 0,
        inStock: product.quantity > 0
      })),
      pagination: {
        currentPage: filters.page!,
        totalPages,
        totalProducts,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        availableCategories,
        priceRange: priceRange[0] || { min: 0, max: 1000 },
        availableTags: availableTags.map(tag => tag._id),
        availableAttributes: {} // À implémenter selon les besoins
      }
    };

    // Headers de cache optimisés
    const responseObj = NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

    // Cache différencié selon les filtres
    const cacheTime = filters.search || filters.minPrice || filters.maxPrice ? 60 : 300;
    responseObj.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`);

    return responseObj;

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des produits dynamiques:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la récupération des produits",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Méthode POST pour la recherche avancée avec filtres complexes
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      storeId,
      filters = {},
      search = '',
      sort = { field: 'createdAt', order: 'desc' },
      pagination = { page: 1, limit: 12 }
    } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID requis" },
        { status: 400 }
      );
    }

    // Construction de la requête complexe
    const query: any = { store: storeId, status: 'active' };

    // Filtres avancés
    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories };
    }

    if (filters.priceRange) {
      query.price = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || Number.MAX_SAFE_INTEGER
      };
    }

    if (filters.attributes) {
      Object.keys(filters.attributes).forEach(key => {
        if (filters.attributes[key] && filters.attributes[key].length > 0) {
          query[`attributes.${key}`] = { $in: filters.attributes[key] };
        }
      });
    }

    if (filters.rating) {
      query.averageRating = { $gte: filters.rating };
    }

    if (filters.inStock) {
      query.quantity = { $gt: 0 };
    }

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    // Tri
    const sortObj: any = {};
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }
    sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Exécution de la requête
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .select('title slug description price comparePrice discountPercentage images averageRating totalReviews featured attributes quantity')
        .sort(sortObj)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / pagination.limit);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          finalPrice: product.discountPercentage > 0 
            ? product.price * (1 - product.discountPercentage / 100)
            : product.price,
          inStock: product.quantity > 0
        })),
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalProducts,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur lors de la recherche avancée:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la recherche",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

