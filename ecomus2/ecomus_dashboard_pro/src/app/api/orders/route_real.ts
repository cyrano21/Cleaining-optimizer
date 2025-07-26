import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Support pour récupérer uniquement le nombre de commandes
    const countOnly = searchParams.get('count') === 'true';
    
    await connectDB();

    const user = await User.findById(session.user.id);
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
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Récupérer les commandes avec pagination
    const [orders, total] = await Promise.all([
      Order.find(matchQuery)
        .populate('user', 'name email phone')
        .populate('items.productId', 'title sku images price')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(matchQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Client anonyme',
        customerEmail: order.user?.email || '',
        customerPhone: order.user?.phone || '',
        products: order.items?.map((item: any) => ({
          name: item.productId?.title || 'Produit supprimé',
          sku: item.productId?.sku || '',
          quantity: item.quantity,
          price: item.price,
          image: item.productId?.images?.[0] || '/images/placeholder.svg'
        })) || [],
        total: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
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
