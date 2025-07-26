import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';
import Store from '@/models/Store';

// S'assurer que tous les modèles sont enregistrés
const ensureModelsRegistered = () => {
  // Force l'enregistrement des modèles si pas déjà fait
  if (!Category) {
    console.error('Category model not registered');
  }
  if (!Store) {
    console.error('Store model not registered');
  }
  if (!User) {
    console.error('User model not registered');
  }
  if (!Product) {
    console.error('Product model not registered');
  }
};

interface CategoryType { _id: string; name: string; slug: string; }
interface VendorType { _id: string; name: string; email: string; }
interface StoreType { _id: string; name: string; slug: string; }

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [PRODUCTS API] Début de la requête GET');
    
    // S'assurer que tous les modèles sont enregistrés
    ensureModelsRegistered();
    
    const token = await getToken({ req: request });
    console.log('🔑 [PRODUCTS API] Token récupéré:', !!token, 'sub:', token?.sub);
    
    if (!token || !token.sub) {
      console.log('❌ [PRODUCTS API] Token manquant ou invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    console.log('🔍 [PRODUCTS API] Paramètres de recherche:', Object.fromEntries(searchParams));
    
    await connectDB();
    console.log('✅ [PRODUCTS API] Connexion MongoDB établie');

    // Convertir le token.sub en ObjectId pour MongoDB
    const userId = new mongoose.Types.ObjectId(token.sub);
    const user = await User.findById(userId);
    console.log('👤 [PRODUCTS API] Utilisateur trouvé:', {
      found: !!user,
      id: user?._id,
      email: user?.email,
      role: user?.role,
      tokenSub: token.sub,
      convertedId: userId.toString()
    });
    
    if (!user) {
      console.log('⚠️ [PRODUCTS API] Utilisateur non trouvé avec ID:', token.sub, '- Retour liste vide');
      // Au lieu de retourner une erreur 404, on retourne une liste vide
      // pour éviter de casser le frontend
      return NextResponse.json({
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }, { status: 200 });
    }    const isVendor = ['vendor', 'VENDOR'].includes(user.role);
    const isAdmin = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
    console.log('🔐 [PRODUCTS API] Rôles utilisateur:', { isVendor, isAdmin, userRole: user.role });

    // Paramètres de requête
    const selectedStoreId = searchParams.get("storeId");
    const storeSlug = searchParams.get("storeSlug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    console.log('📋 [PRODUCTS API] Paramètres traités:', {
      selectedStoreId, storeSlug, category, status, search, page, limit, sortBy, sortOrder
    });

    // Construction de la requête
    const matchQuery: any = {};    // Filtrage par rôle
    if (isVendor) {
      // Vendeur ne voit que ses produits
      matchQuery.vendor = user._id;
      console.log('👤 [PRODUCTS API] Filtrage vendeur - vendor ID:', user._id);
    } else if (!isAdmin && selectedStoreId) {
      // Utilisateur normal avec filtre boutique
      matchQuery.store = selectedStoreId;
    }

    // Filtrage par slug de boutique (pour les pages publiques)
    if (storeSlug) {
      const store = await Store.findOne({ slug: storeSlug });
      if (store) {
        matchQuery.store = store._id;
      }
    }

    // Filtrage par boutique pour admin
    if (isAdmin && selectedStoreId) {
      matchQuery.store = selectedStoreId;
    }

    // Filtres additionnels
    if (category) {
      matchQuery.category = category;
    }

    if (status) {
      matchQuery.status = status;
    }

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;
    
    // Construire le sort
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('🔍 [PRODUCTS API] Query MongoDB finale:', JSON.stringify(matchQuery, null, 2));
    console.log('📊 [PRODUCTS API] Pagination et tri:', { skip, limit, sortObj });

    // Récupérer les produits avec pagination (sans populate pour éviter les erreurs de schéma)
    const [products, total] = await Promise.all([
      Product.find(matchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(matchQuery)
    ]);
    
    console.log('📦 [PRODUCTS API] Résultats bruts:', {
      totalInDB: total,
      productsReturned: products.length,
      sampleIds: products.slice(0, 3).map(p => p._id)
    });

    // Optimisation : Récupération groupée pour éviter les N+1 queries
    const categoryIds = [...new Set(products.map(p => p.category).filter(c => c && mongoose.Types.ObjectId.isValid(c)))];
    const vendorIds = [...new Set(products.map(p => p.vendor).filter(v => v && mongoose.Types.ObjectId.isValid(v)))];
    const storeIds = [...new Set(products.map(p => p.store).filter(s => s && mongoose.Types.ObjectId.isValid(s)))];

    // Requêtes groupées (3 requêtes au lieu de 462!)
    const [categories, vendors, stores]: [CategoryType[], VendorType[], StoreType[]] = await Promise.all([
      categoryIds.length > 0 ? Category.find({ _id: { $in: categoryIds } }).select('name slug').lean() : Promise.resolve([]),
      vendorIds.length > 0 ? User.find({ _id: { $in: vendorIds } }).select('name email').lean() : Promise.resolve([]),
      storeIds.length > 0 ? Store.find({ _id: { $in: storeIds } }).select('name slug').lean() : Promise.resolve([])
    ]) as [CategoryType[], VendorType[], StoreType[]];

    // Créer des maps pour les lookups rapides
    const categoryMap = new Map(categories.map((c: CategoryType) => [c._id.toString(), c]));
    const vendorMap = new Map(vendors.map((v: VendorType) => [v._id.toString(), v]));
    const storeMap = new Map(stores.map((s: StoreType) => [s._id.toString(), s]));

    // Enrichir les produits avec les données pré-chargées
    const enrichedProducts = products.map((product: any) => {
      try {
        // Associer la catégorie
        if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
          product.category = categoryMap.get(product.category.toString()) || null;
        }
        
        // Associer le vendor
        if (product.vendor && mongoose.Types.ObjectId.isValid(product.vendor)) {
          product.vendor = vendorMap.get(product.vendor.toString()) || null;
        }
        
        // Associer le store
        if (product.store && mongoose.Types.ObjectId.isValid(product.store)) {
          product.store = storeMap.get(product.store.toString()) || null;
        }
        
        return product;
      } catch (error) {
        console.log(`Erreur lors de l'enrichissement du produit ${product._id}:`, error);
        return product;
      }
    });
    
    console.log('✨ [PRODUCTS API] Produits enrichis:', {
      enrichedCount: enrichedProducts.length,
      sampleTitles: enrichedProducts.slice(0, 3).map(p => p.title)
    });

    const totalPages = Math.ceil(total / limit);

    // Statistiques optimisées - seulement si c'est la première page
    let statistics = {
      totalProducts: total,
      activeProducts: 0,
      inactiveProducts: 0,
      draftProducts: 0,
      totalValue: 0,
      avgPrice: 0,
      totalStock: 0,
      lowStockCount: 0
    };

    // Calculer les stats détaillées seulement si page 1 pour économiser des ressources
    if (page === 1) {
      try {
        const stats = await Product.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              inactiveProducts: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
              draftProducts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
              totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
              avgPrice: { $avg: '$price' },
              totalStock: { $sum: '$quantity' },
              lowStockCount: { $sum: { $cond: [{ $lte: ['$quantity', '$lowStockAlert'] }, 1, 0] } }
            }
          }
        ]);
        
        if (stats[0]) {
          statistics = stats[0];
        }
      } catch (error) {
        console.log('⚠️ Erreur stats (non bloquante):', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedProducts.map(product => ({
        id: product._id,
        name: product.title || product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.comparePrice,
        discount: product.discountPercentage,
        sku: product.sku,
        stock: product.quantity,
        rating: product.averageRating || 0,
        reviewCount: product.totalReviews || 0,
        images: product.images || ['/images/placeholder.svg'],
        category: product.category || 'Non catégorisé',
        brand: product.brand || 'Sans marque',
        tags: product.tags || [],
        isActive: product.status === 'active',
        isFeatured: product.featured || false,
        storeId: product.store?._id,
        store: product.store,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      products: enrichedProducts.map(product => ({
        id: product._id,
        name: product.title || product.name,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        discountPercentage: product.discountPercentage,
        sku: product.sku,
        barcode: product.barcode,
        stock: product.quantity,
        quantity: product.quantity,
        lowStockAlert: product.lowStockAlert,
        category: product.category?.name,
        categoryId: product.category?._id,        images: product.images,
        media3D: product.media3D,
        videos: product.videos,
        views360: product.views360,
        tags: product.tags,
        status: product.status,
        featured: product.featured,
        storeId: product.store?._id,
        storeName: product.store?.name,
        vendorId: product.vendor?._id,
        vendorName: product.vendor?.name,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1      },
      stats: statistics,
      filters: {
        categories: await getAvailableCategories(matchQuery),
        stores: isAdmin ? await getAvailableStores() : null,
        statuses: ['active', 'inactive', 'draft']
      }
    });

    console.log('🎉 [PRODUCTS API] Réponse finale envoyée avec', enrichedProducts.length, 'produits');

  } catch (error: any) {
    console.error('❌ [PRODUCTS API] Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function getAvailableCategories(baseQuery: any) {
  try {
    const categories = await Product.aggregate([
      { $match: baseQuery },
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
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          slug: { $first: '$categoryInfo.slug' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
}

async function getAvailableStores() {
  try {
    const stores = await Store.find({ status: 'active' })
      .select('name slug')
      .sort({ name: 1 })
      .lean();
    
    return stores.map(store => ({
      id: store._id,
      name: store.name,
      slug: store.slug
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques:', error);
    return [];
  }
}

// POST pour créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await User.findById(token.sub);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const isVendor = ['vendor', 'VENDOR'].includes(user.role);
    const isAdmin = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!isVendor && !isAdmin) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const productData = await request.json();

    await connectDB();

    // Validation des données requises
    if (!productData.title?.trim()) {
      return NextResponse.json({ error: 'Le titre du produit est requis' }, { status: 400 });
    }
    
    if (!productData.price || productData.price <= 0) {
      return NextResponse.json({ error: 'Le prix doit être supérieur à 0' }, { status: 400 });
    }
    
    if (!productData.sku?.trim()) {
      return NextResponse.json({ error: 'Le SKU est requis' }, { status: 400 });
    }
    
    if (!productData.store && !productData.storeId) {
      return NextResponse.json({ error: 'Une boutique doit être sélectionnée' }, { status: 400 });
    }
    
    if (!productData.category) {
      return NextResponse.json({ error: 'Une catégorie doit être sélectionnée' }, { status: 400 });
    }

    // Préparer les données du produit
    const productToCreate = {
      title: productData.title.trim(),
      description: productData.description || '',
      price: Number(productData.price),
      comparePrice: productData.comparePrice ? Number(productData.comparePrice) : 0,
      sku: productData.sku.trim(),
      barcode: productData.barcode || '',
      quantity: Number(productData.quantity) || 0,
      lowStockAlert: Number(productData.lowStockAlert) || 10,
      images: productData.images || [],
      media3D: productData.media3D || [],
      videos: productData.videos || [],
      views360: productData.views360 || [],
      category: productData.category,
      tags: productData.tags || [],
      vendor: user._id,
      store: productData.store || productData.storeId,
      status: productData.status || 'draft',
      featured: Boolean(productData.featured),
      weight: productData.weight ? Number(productData.weight) : undefined,
      dimensions: productData.dimensions || {},
      seoTitle: productData.seoTitle || '',
      seoDescription: productData.seoDescription || '',
      variant: productData.variant || {},
      attributes: productData.attributes || {},
      slug: productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    // Créer le produit
    const product = new Product(productToCreate);

    await product.save();

    // Populate les relations
    await product.populate('category', 'name slug');
    await product.populate('vendor', 'name email');
    await product.populate('store', 'name slug');    return NextResponse.json({
      success: true,
      message: 'Produit créé avec succès',
      product: {
        id: product._id,
        name: product.title,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        discountPercentage: product.discountPercentage,
        sku: product.sku,
        barcode: product.barcode,
        quantity: product.quantity,
        lowStockAlert: product.lowStockAlert,
        category: product.category?.name,
        categoryId: product.category?._id,
        images: product.images,
        media3D: product.media3D,
        videos: product.videos,
        views360: product.views360,
        tags: product.tags,
        status: product.status,
        featured: product.featured,
        weight: product.weight,
        dimensions: product.dimensions,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        variant: product.variant,
        attributes: product.attributes,
        storeId: product.store?._id,
        storeName: product.store?.name,
        vendorId: product.vendor?._id,
        vendorName: product.vendor?.name,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création du produit:', error);
    
    // Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Erreur de validation',
          details: validationErrors,
          message: validationErrors.join(', ')
        },
        { status: 400 }
      );
    }
    
    // Gestion des erreurs de duplication (SKU unique, etc.)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          error: 'Conflit de données',
          message: `Ce ${field === 'sku' ? 'SKU' : field} existe déjà`,
          field
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: 'Une erreur inattendue s\'est produite lors de la création du produit'
      },
      { status: 500 }
    );
  }
}
