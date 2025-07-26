import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import { DropshippingSupplier, DropshippingProduct, DropshippingOrder } from '@/models/DropshippingProduct';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeMock = searchParams.get('includeMock') === 'true';
    const tab = searchParams.get('tab') || 'overview';

    await connectDB();

    // Récupérer l'utilisateur connecté
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const response: any = {};

    // Données réelles de la base de données
    if (tab === 'suppliers' || tab === 'overview') {
      const suppliers = await DropshippingSupplier.find({ status: 'verified' })
        .select('name country rating totalProducts commission shippingTime minOrder categories joinedDate totalRevenue')
        .limit(10);

      response.suppliers = suppliers.map(supplier => ({
        id: supplier._id.toString(),
        name: supplier.name,
        country: supplier.country,
        rating: supplier.rating,
        products: supplier.totalProducts,
        status: 'connected',
        commission: supplier.commission,
        shippingTime: supplier.shippingTime,
        minOrder: supplier.minOrder,
        website: supplier.website,
        description: supplier.description,
        categories: supplier.categories,
        connectedDate: supplier.joinedDate.toISOString(),
        totalOrders: 0,
        revenue: supplier.totalRevenue
      }));
    }

    if (tab === 'products' || tab === 'overview') {
      const dropshippingProducts = await DropshippingProduct.find({ 
        importedBy: user._id,
        dropshippingStatus: { $ne: 'discontinued' }
      })
        .populate('product', 'name images price')
        .populate('supplier', 'name')
        .limit(20);

      response.products = dropshippingProducts.map(dp => {
        const product = dp.product as any;
        const supplier = dp.supplier as any;
        
        return {
          id: dp._id.toString(),
          title: product?.name || 'Produit inconnu',
          supplier: supplier?.name || 'Fournisseur inconnu',
          supplierPrice: dp.supplierPrice,
          sellingPrice: product?.price || dp.supplierPrice,
          margin: dp.profitMargin,
          stock: dp.supplierStock,
          orders: dp.analytics?.totalOrders || 0,
          status: dp.dropshippingStatus,
          image: product?.images?.[0] || '/api/placeholder/100/100',
          category: 'Dropshipping',
          lastUpdated: dp.lastStockUpdate.toISOString()
        };
      });
    }

    if (tab === 'orders' || tab === 'overview') {
      const dropshippingOrders = await DropshippingOrder.find({ 
        'shippingAddress.firstName': { $exists: true }
      })
        .populate('product', 'name')
        .populate('supplier', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      response.orders = dropshippingOrders.map(dropOrder => {
        const product = dropOrder.product as any;
        const supplier = dropOrder.supplier as any;
        
        return {
          id: dropOrder._id.toString(),
          productTitle: product?.name || 'Produit inconnu',
          supplier: supplier?.name || 'Fournisseur inconnu',
          customer: `${dropOrder.shippingAddress.firstName} ${dropOrder.shippingAddress.lastName}`,
          quantity: dropOrder.quantity,
          total: dropOrder.sellingPrice,
          status: dropOrder.dropshippingStatus,
          orderDate: dropOrder.createdAt.toISOString(),
          shippingDate: dropOrder.shippingInfo?.shippedDate?.toISOString(),
          trackingNumber: dropOrder.shippingInfo?.trackingNumber
        };
      });
    }

    // Calculer les statistiques
    if (tab === 'overview') {
      const totalRevenue = response.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
      const totalOrders = response.orders?.length || 0;
      const activeSuppliers = response.suppliers?.filter((s: any) => s.status === 'connected').length || 0;
      const activeProducts = response.products?.filter((p: any) => p.status === 'active').length || 0;

      response.stats = {
        totalRevenue,
        totalOrders,
        activeSuppliers,
        activeProducts
      };
    }

    // Ajouter les données mockées si demandé
    if (includeMock) {
      response.mockData = {
        suppliers: [
          {
            id: 'mock-1',
            name: 'AliExpress',
            country: 'Chine',
            rating: 4.2,
            products: 1542,
            status: 'connected',
            commission: 8.5,
            shippingTime: '7-15 jours',
            minOrder: 1,
            website: 'https://aliexpress.com',
            description: 'Fournisseur principal pour électronique et gadgets.',
            categories: ['Électronique', 'Gadgets', 'Accessoires'],
            connectedDate: '2023-06-15T00:00:00.000Z',
            totalOrders: 234,
            revenue: 12450
          },
          {
            id: 'mock-2',
            name: 'Oberlo',
            country: 'Global',
            rating: 4.5,
            products: 893,
            status: 'connected',
            commission: 12.0,
            shippingTime: '5-12 jours',
            minOrder: 1,
            website: 'https://oberlo.com',
            description: 'Produits de mode et beauté premium.',
            categories: ['Mode', 'Beauté', 'Accessoires'],
            connectedDate: '2023-08-20T00:00:00.000Z',
            totalOrders: 156,
            revenue: 8930
          }
        ],
        products: [
          {
            id: 'mock-1',
            title: 'Écouteurs Bluetooth Sans Fil',
            supplier: 'AliExpress',
            supplierPrice: 12.50,
            sellingPrice: 29.99,
            margin: 58.3,
            stock: 150,
            orders: 45,
            status: 'active',
            image: '/api/placeholder/100/100',
            category: 'Électronique',
            lastUpdated: '2024-01-20T00:00:00.000Z'
          },
          {
            id: 'mock-2',
            title: 'Montre Connectée Sport',
            supplier: 'Oberlo',
            supplierPrice: 35.00,
            sellingPrice: 79.99,
            margin: 56.3,
            stock: 89,
            orders: 23,
            status: 'active',
            image: '/api/placeholder/100/100',
            category: 'Électronique',
            lastUpdated: '2024-01-19T00:00:00.000Z'
          }
        ],
        orders: [
          {
            id: 'mock-DS001',
            productTitle: 'Écouteurs Bluetooth Sans Fil',
            supplier: 'AliExpress',
            customer: 'Jean Dupont',
            quantity: 2,
            total: 59.98,
            status: 'shipped',
            orderDate: '2024-01-18T00:00:00.000Z',
            shippingDate: '2024-01-19T00:00:00.000Z',
            trackingNumber: 'AE123456789CN'
          },
          {
            id: 'mock-DS002',
            productTitle: 'Montre Connectée Sport',
            supplier: 'Oberlo',
            customer: 'Marie Martin',
            quantity: 1,
            total: 79.99,
            status: 'delivered',
            orderDate: '2024-01-15T00:00:00.000Z',
            shippingDate: '2024-01-16T00:00:00.000Z',
            trackingNumber: 'OB987654321US'
          }
        ]
      };
    }

    return NextResponse.json({
      success: true,
      data: response,
      mockEnabled: includeMock
    });

  } catch (error) {
    console.error('Erreur API dropshipping vendor:', error);
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
    const { action, data } = body;

    await connectDB();

    // Récupérer l'utilisateur connecté
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    switch (action) {
      case 'add_supplier':
        const newSupplier = new DropshippingSupplier({
          ...data,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          status: 'pending',
          joinedDate: new Date(),
          totalRevenue: 0,
          compliance: {
            taxCompliant: false,
            certifications: [],
            lastAudit: new Date()
          },
          contactInfo: {
            email: data.email || 'contact@supplier.com',
            phone: data.phone,
            supportHours: '9h-18h',
            timezone: 'UTC'
          }
        });
        
        await newSupplier.save();
        return NextResponse.json({ success: true, supplier: newSupplier });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur API dropshipping vendor POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 