import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import User, { IUser } from "@/models/User";
import Order, { IOrder } from "@/models/Order";
import Product, { IProduct } from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 403 });
    }

    await connectDB();
    
    const { id } = await params;
    const store = await Store.findById(id)
      .populate('owner', 'name email avatar');

    if (!store) {
      return NextResponse.json({ 
        success: false, 
        message: "Boutique non trouvée" 
      }, { status: 404 });
    }

    // Typage explicite pour éviter les erreurs TypeScript
    const storeDoc = store as any;

    // Récupérer les statistiques détaillées
    const [products, orders, totalRevenue] = await Promise.all([      Product.countDocuments({ storeId: storeDoc._id }),
      Order.countDocuments({ storeId: storeDoc._id }),
      Order.aggregate([
        { $match: { storeId: storeDoc._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Récupérer les commandes récentes
    const recentOrders = await Order.find({ storeId: storeDoc._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Récupérer les produits les plus vendus
    const topProducts = await Order.aggregate([
      { $match: { storeId: storeDoc._id, status: 'completed' } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
      }},
      { $unwind: '$product' }
    ]);

    const storeDetails = {
      ...store,
      stats: {
        totalProducts: products,
        totalOrders: orders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers: await User.countDocuments({ 
          role: 'customer',
          'purchaseHistory.storeId': storeDoc._id 
        })
      },
      recentOrders,
      topProducts
    };

    return NextResponse.json({
      success: true,
      store: storeDetails
    });

  } catch (error) {
    console.error("Error fetching store details:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur serveur" 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 403 });
    }

    await connectDB();
    
    const { action, ...updateData } = await request.json();

    let update = {};

    switch (action) {
      case 'activate':
        update = { status: 'active', updatedAt: new Date() };
        break;
      case 'suspend':
        update = { status: 'suspended', updatedAt: new Date() };
        break;
      case 'deactivate':
        update = { status: 'inactive', updatedAt: new Date() };
        break;
      case 'update':
        update = { ...updateData, updatedAt: new Date() };
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          message: "Action non valide" 
        }, { status: 400 });
    }

    const { id } = await params;
    const store = await Store.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('owner', 'name email avatar');

    if (!store) {
      return NextResponse.json({ 
        success: false, 
        message: "Boutique non trouvée" 
      }, { status: 404 });
    }

    // Envoyer une notification au propriétaire de la boutique
    // TODO: Implémenter le système de notifications

    return NextResponse.json({
      success: true,
      message: `Boutique ${action === 'update' ? 'mise à jour' : action === 'activate' ? 'activée' : action === 'suspend' ? 'suspendue' : 'désactivée'} avec succès`,
      store
    });

  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur serveur" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 403 });
    }

    await connectDB();
    
    const { id } = await params;
    const store = await Store.findById(id);

    if (!store) {
      return NextResponse.json({ 
        success: false, 
        message: "Boutique non trouvée" 
      }, { status: 404 });
    }

    // Vérifier s'il y a des commandes en cours
    const pendingOrders = await Order.countDocuments({ 
      storeId: store._id, 
      status: { $in: ['pending', 'processing', 'shipped'] } 
    });

    if (pendingOrders > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Impossible de supprimer une boutique avec des commandes en cours" 
      }, { status: 400 });
    }

    // Supprimer tous les produits associés
    await Product.deleteMany({ storeId: store._id });
    
    // Supprimer toutes les commandes terminées
    await Order.deleteMany({ storeId: store._id });
    
    // Supprimer la boutique
    await Store.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Boutique supprimée avec succès"
    });

  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur serveur" 
    }, { status: 500 });
  }
}
