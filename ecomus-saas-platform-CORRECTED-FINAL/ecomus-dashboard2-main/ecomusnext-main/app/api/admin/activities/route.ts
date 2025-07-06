import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import Order from "@/models/Order";

// Interface pour les activités
interface Activity {
  id: string;
  type: 'user' | 'store' | 'order';
  action: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    email: string;
  };
  details?: {
    amount?: number;
    status?: string;
    storeName?: string;
    orderNumber?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    // Récupérer les activités récentes depuis différentes collections
    const [recentUsers, recentStores, recentOrders] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .select("name email createdAt"),
      Store.find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .select("name status createdAt"),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .select("orderNumber total status createdAt")
        .populate("store", "name"),
    ]);

    // Formatter les activités
    const activities: Activity[] = [];

    // Ajouter les nouveaux utilisateurs
    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user._id}`,
        type: "user",
        action: "user_registered",
        description: `Nouvel utilisateur inscrit: ${user.name || user.email}`,
        timestamp: user.createdAt,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    });

    // Ajouter les nouvelles boutiques
    recentStores.forEach((store) => {
      activities.push({
        id: `store_${store._id}`,
        type: "store",
        action: "store_created",
        description: `Nouvelle boutique ${store.status === 'pending' ? 'en attente' : 'créée'}: ${store.name}`,
        timestamp: store.createdAt,
        details: {
          status: store.status,
        },
      });
    });

    // Ajouter les nouvelles commandes
    recentOrders.forEach((order) => {
      activities.push({
        id: `order_${order._id}`,
        type: "order",
        action: "order_placed",
        description: `Nouvelle commande #${order.orderNumber} (${order.total}€) - ${order.store?.name || 'Boutique inconnue'}`,
        timestamp: order.createdAt,
        details: {
          amount: order.total,
          status: order.status,
          storeName: order.store?.name,
          orderNumber: order.orderNumber,
        },
      });
    });

    // Trier par date et limiter
    activities.sort((a, b) => {
      // Extraire la date de création depuis l'ID pour le tri
      const getCreatedAt = (activity: Activity) => {
        if (activity.id.startsWith('user_')) {
          const user = recentUsers.find(u => u._id.toString() === activity.id.replace('user_', ''));
          return user?.createdAt || new Date(0);
        }
        if (activity.id.startsWith('store_')) {
          const store = recentStores.find(s => s._id.toString() === activity.id.replace('store_', ''));
          return store?.createdAt || new Date(0);
        }
        if (activity.id.startsWith('order_')) {
          const order = recentOrders.find(o => o._id.toString() === activity.id.replace('order_', ''));
          return order?.createdAt || new Date(0);
        }
        return new Date(0);
      };
      
      return getCreatedAt(b).getTime() - getCreatedAt(a).getTime();
    });

    return NextResponse.json({
      success: true,
      data: activities.slice(0, limit),
    });

  } catch (error) {
    console.error("Erreur API admin activities:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour formater le temps relatif
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "À l'instant";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  return date.toLocaleDateString('fr-FR');
}
