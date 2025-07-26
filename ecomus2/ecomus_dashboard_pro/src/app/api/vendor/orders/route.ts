import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }    await connectDB();

    // Vérifier que l'utilisateur est un vendeur, admin ou super admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin', 'super_admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const countOnly = searchParams.get('count') === 'true';    // Construire la requête de base
    const query: any = {};

    // Si c'est un vendeur (non admin), filtrer par vendeur
    if (user.role.name === 'vendor') {
      query.vendor = user._id;
    }

    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }

    // Filtrer par recherche si spécifiée
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Définir l'ordre de tri
    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Si on demande seulement le count, retourner juste le nombre
    if (countOnly) {
      const count = await Order.countDocuments(query);
      return NextResponse.json({
        success: true,
        count
      });
    }    // Exécuter la requête simple d'abord pour déboguer
    const orders = await Order.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`Trouvé ${orders.length} commandes`);
    if (orders.length > 0) {
      console.log("Première commande:", orders[0]);
    }

    // Compter le total pour la pagination
    const total = await Order.countDocuments(query);

    // Calculer les statistiques
    const allOrders = await Order.find(query).lean();
    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      confirmedOrders: allOrders.filter(o => o.status === 'confirmed').length,
      processingOrders: allOrders.filter(o => o.status === 'processing').length,
      shippedOrders: allOrders.filter(o => o.status === 'shipped').length,
      deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
      cancelledOrders: allOrders.filter(o => o.status === 'cancelled').length,
      totalRevenue: allOrders
        .filter(o => ['delivered', 'shipped'].includes(o.status))
        .reduce((sum: number, order) => {
          const orderTotal = order.items?.reduce((total: number, item: { price: number; quantity: number }) => total + (item.price * item.quantity), 0) || 0;
          return sum + orderTotal;
        }, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }    await connectDB();

    // Vérifier que l'utilisateur est un vendeur, admin ou super admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin', 'super_admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const orderData = await request.json();

    // Générer un numéro de commande unique
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Créer la nouvelle commande
    const newOrder = new Order({
      ...orderData,
      orderNumber,
      vendor: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrder.save();

    // Populate les références avant de retourner
    await newOrder.populate([
      {
        path: 'customer',
        select: 'name email phone'
      },
      {
        path: 'items.product',
        select: 'title sku images price category'
      }
    ]);

    return NextResponse.json({
      success: true,
      data: newOrder
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}
