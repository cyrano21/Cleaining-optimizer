import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DropshippingProduct, DropshippingSupplier } from '@/models/DropshippingProduct';
import { dropshippingService } from '@/services/dropshippingService';
import { connectDB } from '@/lib/mongodb';

// Types pour les filtres et données
interface ProductFilters {
  supplier?: string;
  dropshippingStatus?: string;
}

interface StoreFilters {
  store?: string;
}

interface UserWithStore {
  storeId?: string;
}

// GET /api/dropshipping/products - Récupérer les produits dropshipping
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplier');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const storeId = searchParams.get('store');

    // Construire les filtres
    const filters: ProductFilters = {};
    if (supplierId) filters.supplier = supplierId;
    if (status) filters.dropshippingStatus = status;

    // Filtrer par store pour les vendors
    const productFilters: StoreFilters = {};
    if (session.user.role === 'vendor' || storeId) {
      const targetStoreId = storeId || (session.user as UserWithStore)?.storeId;
      if (targetStoreId) {
        productFilters.store = targetStoreId;
      }
    }

    const skip = (page - 1) * limit;

    // Pipeline d'agrégation pour joindre avec les produits
    const pipeline: any[] = [
      { $match: filters },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      ...(Object.keys(productFilters).length > 0 ? [{ $match: { 'productInfo.store': productFilters.store } }] : []),
      {
        $lookup: {
          from: 'dropshippingsuppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $addFields: {
          'supplierInfo.apiCredentials': '$$REMOVE' // Supprimer les credentials sensibles
        }
      }
    ];

    // Ajouter la recherche textuelle si nécessaire
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'productInfo.title': { $regex: search, $options: 'i' } },
            { 'productInfo.description': { $regex: search, $options: 'i' } },
            { 'supplierInfo.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Pagination
    const [products, totalCount] = await Promise.all([
      DropshippingProduct.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      DropshippingProduct.aggregate([
        ...pipeline,
        { $count: 'total' }
      ])
    ]);

    const total = totalCount[0]?.total || 0;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits dropshipping:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/dropshipping/products - Importer des produits depuis un fournisseur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      supplierId,
      products,
      storeId,
      profitMargin,
      autoSync
    } = body;

    // Validation
    if (!supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' },
        { status: 400 }
      );
    }

    if (!profitMargin || profitMargin < 0) {
      return NextResponse.json(
        { error: 'Marge bénéficiaire invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le fournisseur existe et est vérifié
    const supplier = await DropshippingSupplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Fournisseur non trouvé' },
        { status: 404 }
      );
    }

    if (supplier.status !== 'verified') {
      return NextResponse.json(
        { error: 'Fournisseur non vérifié' },
        { status: 400 }
      );
    }

    // Déterminer le store ID
    const targetStoreId = storeId || (session.user as UserWithStore)?.storeId;
    if (!targetStoreId) {
      return NextResponse.json(
        { error: 'Store ID manquant' },
        { status: 400 }
      );
    }

    // Importer les produits
    const importedProducts = await dropshippingService.importProductsFromSupplier(
      supplierId,
      products,
      targetStoreId,
      session.user.id,
      {
        profitMargin,
        autoSync: autoSync || {
          price: true,
          stock: true,
          description: false,
          images: false
        }
      }
    );

    return NextResponse.json({
      message: `${importedProducts.length} produits importés avec succès`,
      products: importedProducts
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'importation des produits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/dropshipping/products - Synchroniser les produits
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de produits manquants' },
        { status: 400 }
      );
    }

    const results = [];

    for (const productId of productIds) {
      try {
        // Simuler la récupération des données du fournisseur
        const supplierData = {
          price: Math.random() * 100 + 10, // Prix aléatoire pour la démo
          stock: Math.floor(Math.random() * 100)
        };

        const result = await dropshippingService.syncProductData(productId, supplierData);
        results.push({
          productId,
          success: true,
          changes: result.changes
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        results.push({
          productId,
          success: false,
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Synchronisation terminée: ${successCount} succès, ${failureCount} échecs`,
      results
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}