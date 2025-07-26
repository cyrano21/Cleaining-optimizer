import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: orderId };

    // Si c'est un vendeur (non admin), vérifier qu'il a des produits dans cette commande
    if (user.role.name === 'vendor') {
      const vendorProducts = await Product.find({ vendor: user._id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    const order = await Order.findOne(query)
      .populate([
        {
          path: 'customer',
          select: 'name email phone'
        },
        {
          path: 'items.product',
          select: 'title sku images price category',
          populate: {
            path: 'category',
            select: 'name'
          }
        }
      ])
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const updateData = await request.json();

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: orderId };

    // Si c'est un vendeur (non admin), vérifier qu'il a des produits dans cette commande
    if (user.role.name === 'vendor') {
      const vendorProducts = await Product.find({ vendor: user._id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    // Vérifier que la commande existe et appartient au vendeur
    const existingOrder = await Order.findOne(query);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Commande non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    // Validation des statuts autorisés
    const allowedTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'returned': []
    };

    if (updateData.status && !allowedTransitions[existingOrder.status]?.includes(updateData.status)) {
      return NextResponse.json(
        { success: false, error: `Transition de statut non autorisée de ${existingOrder.status} vers ${updateData.status}` },
        { status: 400 }
      );
    }

    // Mettre à jour la commande
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    ).populate([
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
      data: updatedOrder
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Vérifier que l'utilisateur est un admin (seuls les admins peuvent supprimer)
    const user = await User.findById(session.user.id).populate('role');
    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits admin requis" },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    // Vérifier que la commande existe
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la commande
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({
      success: true,
      message: "Commande supprimée avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    );
  }
}
