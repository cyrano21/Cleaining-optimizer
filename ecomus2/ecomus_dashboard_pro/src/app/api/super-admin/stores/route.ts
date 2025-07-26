import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est super admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Construction de la requête de filtrage
    const filter: any = {};
    
    if (status) {
      if (status === 'pending') {
        filter.status = 'pending';
      } else if (status === 'active') {
        filter.isActive = true;
        filter.status = 'approved';
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'owner.name': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    // Récupération des boutiques avec informations du propriétaire
    const stores = await Store.find(filter)
      .populate('ownerId', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalStores = await Store.countDocuments(filter);
    const totalPages = Math.ceil(totalStores / limit);

    // Statistiques des boutiques
    const storeStats = await Store.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
        }
      }
    ]);

    // Revenus par boutique (30 derniers jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const storeRevenues = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {          _id: "$storeId",
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]);

    // Enrichir les données des boutiques avec les revenus
    const enrichedStores = stores.map(store => {
      const storeDoc = store as any; // Cast pour éviter les erreurs de typage
      const revenueData = storeRevenues.find(r => r._id?.toString() === storeDoc._id.toString());
      return {
        ...storeDoc,
        revenue: revenueData?.revenue || 0,
        orderCount: revenueData?.orders || 0
      };
    });

    const result = {
      stores: enrichedStores,
      pagination: {
        currentPage: page,
        totalPages,
        totalStores,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: storeStats[0] || {
        total: 0,
        active: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      revenueData: storeRevenues
    };

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur API super-admin stores:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour approuver/rejeter une boutique
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { storeId, action, reason } = body;

    if (!storeId || !action) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {
      updatedAt: new Date(),
      reviewedBy: session.user.id,
      reviewedAt: new Date()
    };

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.isActive = true;
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData.isActive = false;
        if (reason) updateData.rejectionReason = reason;
        break;
      case 'suspend':
        updateData.isActive = false;
        updateData.suspensionReason = reason;
        break;
      case 'activate':
        updateData.isActive = true;
        updateData.suspensionReason = null;
        break;
      default:
        return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true }
    ).populate('ownerId', 'name email');

    if (!updatedStore) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: `Boutique ${action === 'approve' ? 'approuvée' : action === 'reject' ? 'rejetée' : 'mise à jour'} avec succès`
    });

  } catch (error) {
    console.error("Erreur API super-admin stores PATCH:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
