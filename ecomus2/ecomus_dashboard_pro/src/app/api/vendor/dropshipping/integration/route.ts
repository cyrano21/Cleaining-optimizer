import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import { DropshippingSupplier, DropshippingProduct, DropshippingOrder } from '@/models/DropshippingProduct';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Récupérer l'utilisateur connecté
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Statistiques d'intégration
    const totalProducts = await Product.countDocuments({ vendor: user._id });
    const dropshippingProducts = await Product.countDocuments({ 
      vendor: user._id, 
      isDropshipping: true 
    });
    
    const dropshippingProductsDetailed = await DropshippingProduct.countDocuments({ 
      importedBy: user._id 
    });

    const totalSuppliers = await DropshippingSupplier.countDocuments({ status: 'verified' });
    const connectedSuppliers = await DropshippingSupplier.countDocuments({ 
      status: 'verified',
      activeStores: { $gt: 0 }
    });

    const totalOrders = await DropshippingOrder.countDocuments();
    const recentOrders = await DropshippingOrder.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 derniers jours
    });

    // Produits avec intégration dropshipping
    const productsWithDropshipping = await Product.find({ 
      vendor: user._id,
      isDropshipping: true 
    })
    .select('title price isDropshipping dropshippingInfo')
    .limit(10);

    // Produits dropshipping détaillés
    const detailedDropshippingProducts = await DropshippingProduct.find({ 
      importedBy: user._id 
    })
    .populate('product', 'title price images')
    .populate('supplier', 'name country')
    .limit(10);

    // Fournisseurs avec le plus de produits
    const topSuppliers = await DropshippingSupplier.aggregate([
      { $match: { status: 'verified' } },
      { $sort: { totalProducts: -1 } },
      { $limit: 5 },
      { $project: { name: 1, totalProducts: 1, country: 1, rating: 1 } }
    ]);

    // Statistiques de performance
    const performanceStats = await DropshippingProduct.aggregate([
      { $match: { importedBy: user._id } },
      {
        $group: {
          _id: null,
          avgProfitMargin: { $avg: '$profitMargin' },
          totalRevenue: { $sum: '$analytics.totalRevenue' },
          totalOrders: { $sum: '$analytics.totalOrders' },
          avgRating: { $avg: '$supplierRating' }
        }
      }
    ]);

    const stats = performanceStats[0] || {
      avgProfitMargin: 0,
      totalRevenue: 0,
      totalOrders: 0,
      avgRating: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        integration: {
          totalProducts,
          dropshippingProducts,
          dropshippingProductsDetailed,
          integrationRate: totalProducts > 0 ? (dropshippingProducts / totalProducts * 100).toFixed(1) : 0
        },
        suppliers: {
          total: totalSuppliers,
          connected: connectedSuppliers,
          connectionRate: totalSuppliers > 0 ? (connectedSuppliers / totalSuppliers * 100).toFixed(1) : 0
        },
        orders: {
          total: totalOrders,
          recent: recentOrders,
          growthRate: totalOrders > 0 ? (recentOrders / totalOrders * 100).toFixed(1) : 0
        },
        performance: {
          avgProfitMargin: stats.avgProfitMargin.toFixed(1),
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          avgRating: stats.avgRating.toFixed(1)
        },
        products: {
          withDropshipping: productsWithDropshipping,
          detailed: detailedDropshippingProducts.map(dp => ({
            id: dp._id.toString(),
            productTitle: (dp.product as any)?.title || 'Produit inconnu',
            supplierName: (dp.supplier as any)?.name || 'Fournisseur inconnu',
            supplierCountry: (dp.supplier as any)?.country || 'Pays inconnu',
            supplierPrice: dp.supplierPrice,
            profitMargin: dp.profitMargin,
            status: dp.dropshippingStatus,
            totalOrders: dp.analytics?.totalOrders || 0,
            totalRevenue: dp.analytics?.totalRevenue || 0
          }))
        },
        topSuppliers
      }
    });

  } catch (error) {
    console.error('Erreur API intégration dropshipping:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { action, productId, dropshippingData } = body;

    await connectDB();

    // Récupérer l'utilisateur connecté
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    switch (action) {
      case 'mark_as_dropshipping':
        // Marquer un produit comme dropshipping
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            isDropshipping: true,
            dropshippingInfo: {
              supplierName: dropshippingData.supplierName,
              supplierPrice: dropshippingData.supplierPrice,
              profitMargin: dropshippingData.profitMargin,
              shippingTime: dropshippingData.shippingTime,
              lastStockSync: new Date()
            }
          },
          { new: true }
        );

        if (!updatedProduct) {
          return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Produit marqué comme dropshipping',
          product: updatedProduct
        });

      case 'remove_dropshipping':
        // Retirer le statut dropshipping d'un produit
        const removedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            isDropshipping: false,
            $unset: { dropshippingInfo: 1 }
          },
          { new: true }
        );

        if (!removedProduct) {
          return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Statut dropshipping retiré',
          product: removedProduct
        });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur API intégration dropshipping POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 