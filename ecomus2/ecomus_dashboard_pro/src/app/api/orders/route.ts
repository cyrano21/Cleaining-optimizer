import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request: NextRequest) {  try {    // Connexion à la base de données d'abord
    await connectDB();
    
    // Force l'enregistrement des modèles pour éviter MissingSchemaError
    Category; // Ceci force l'import et l'enregistrement du modèle
    User; // Force l'enregistrement du modèle User
    
    const token = await getToken({ req: request });
    
    console.log("🔍 TOKEN COMPLET:", JSON.stringify(token, null, 2));
    
    const currentUserId = token?.id || token?.sub;
    if (!token || !currentUserId) {
      console.log("❌ USER ID MANQUANT - Token:", !!token, "ID:", token?.id, "SUB:", token?.sub);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
      // Support pour récupérer uniquement le nombre de commandes
    const countOnly = searchParams.get('count') === 'true';

    const user = await User.findById(currentUserId);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const isVendor = ['vendor', 'VENDOR'].includes(user.role);
    const isAdmin = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (countOnly) {
      let matchQuery = {};
      
      if (isVendor) {
        matchQuery = { vendor: user._id };
      } else if (!isAdmin) {
        matchQuery = { user: user._id };
      }
      
      const count = await Order.countDocuments(matchQuery);
      return NextResponse.json({
        success: true,
        count
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construction de la requête
    const matchQuery: any = {};
    
    if (isVendor) {
      matchQuery.vendor = user._id;
    } else if (!isAdmin) {
      matchQuery.user = user._id;
    }
    
    if (status) matchQuery.status = status;
    if (paymentStatus) matchQuery.paymentStatus = paymentStatus;
    if (userId && isAdmin) matchQuery.user = userId;
    
    if (search) {
      matchQuery.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;
    
    // Construire le sort
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;    // Récupérer les commandes avec pagination
    const [orders, total] = await Promise.all([      Order.find(matchQuery)
        .populate('customer', 'name email phone') // customer fait référence à User
        .setOptions({ strictPopulate: false }) // Désactive la vérification stricte
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(matchQuery)
    ]);

    const totalPages = Math.ceil(total / limit);    // Récupérer manuellement les produits pour éviter l'erreur de populate
    // Gestion des deux formats possibles : item.productId OU item.product
    const productIds = orders.flatMap(order => 
      order.items?.map((item: any) => {
        // Essayer d'abord productId, puis product
        return item.productId || item.product;
      }).filter(Boolean) || []
    );
    
    console.log("🔍 [DEBUG] ProductIds extracted:", productIds.slice(0, 5)); // Premiers 5 IDs
    console.log("🔍 [DEBUG] First order items:", orders[0]?.items?.slice(0, 2)); // Premiers 2 items
    console.log("🔍 [DEBUG] Sample item structure:", orders[0]?.items?.[0] ? Object.keys(orders[0].items[0]) : 'No items');
      const products = await Product.find({ 
      _id: { $in: productIds } 
    }).populate('category', 'name').select('title sku images price category').lean();
    
    const productMap = new Map(products.map(p => [p._id?.toString(), p]));    console.log("📊 [API ORDERS] Query results:", {
      matchQuery,
      ordersFound: orders.length,
      total,
      page,
      limit,
      totalPages,
      productsFound: products.length,      firstOrder: orders[0] ? {
        id: orders[0]._id,
        user: orders[0].user,
        customer: orders[0].customer,
        userPopulated: {
          name: orders[0].user?.name,
          email: orders[0].user?.email
        },
        customerData: {
          name: orders[0].customer?.name,
          email: orders[0].customer?.email
        },
        totals: orders[0].totals,
        total: orders[0].total,
        subtotal: orders[0].subtotal,
        paymentMethod: orders[0].paymentMethod,
        itemsCount: orders[0].items?.length,
        allFields: Object.keys(orders[0])
      } : null
    });

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,        user: {
          name: (order.user?.name || order.customer?.name) || 'Client anonyme',
          email: (order.user?.email || order.customer?.email) || '',
          phone: (order.user?.phone || order.customer?.phone) || ''
        },items: order.items?.map((item: any) => {
          // Gestion des deux formats possibles : item.productId OU item.product
          const productId = item.productId || item.product;
          const product = productMap.get(productId?.toString());
          return {
            productId: product ? {
              title: product.title || 'Produit supprimé',
              sku: product.sku || '',
              images: product.images || ['/images/placeholder.svg'],
              price: product.price || 0,
              category: product.category?.name || 'Non catégorisé'
            } : {
              title: 'Produit supprimé',
              sku: '',
              images: ['/images/placeholder.svg'],
              price: 0,
              category: 'Non catégorisé'
            },
            quantity: item.quantity,
            price: item.price
          };
        }) || [],        total: order.totals?.total || order.total || 0,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.totals?.paymentMethod || order.paymentMethod || 'Not specified',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress ? 
          `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}` : 
          'Adresse non fournie',
        notes: order.notes || ''
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
