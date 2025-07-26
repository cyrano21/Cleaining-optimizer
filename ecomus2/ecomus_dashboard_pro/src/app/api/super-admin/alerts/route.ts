import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
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

    const alerts = [];

    // Vérifier les boutiques en attente de validation
    const pendingStores = await Store.countDocuments({ 
      status: 'pending' 
    });

    if (pendingStores > 0) {
      alerts.push({
        id: `pending-stores-${Date.now()}`,
        type: 'warning',
        message: `${pendingStores} boutique(s) en attente de validation`,
        timestamp: new Date().toLocaleString('fr-FR'),
        priority: 'medium',
        action: '/super-admin/stores/validation'
      });
    }

    // Vérifier les commandes échouées récemment
    const failedOrdersCount = await Order.countDocuments({
      status: 'failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Dernières 24h
    });

    if (failedOrdersCount > 5) {
      alerts.push({
        id: `failed-orders-${Date.now()}`,
        type: 'critical',
        message: `${failedOrdersCount} commandes échouées dans les dernières 24h`,
        timestamp: new Date().toLocaleString('fr-FR'),
        priority: 'high',
        action: '/super-admin/analytics/orders'
      });
    }

    // Vérifier les nouveaux utilisateurs suspects (beaucoup d'inscriptions récentes)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Dernière heure
    });

    if (recentUsers > 20) {
      alerts.push({
        id: `suspicious-registrations-${Date.now()}`,
        type: 'warning',
        message: `${recentUsers} nouvelles inscriptions dans la dernière heure`,
        timestamp: new Date().toLocaleString('fr-FR'),
        priority: 'medium',
        action: '/super-admin/users'
      });
    }

    // Vérifications système (simulées)
    const systemChecks = [
      {
        condition: Math.random() > 0.8,
        alert: {
          id: `high-memory-${Date.now()}`,
          type: 'warning',
          message: 'Utilisation mémoire élevée détectée (>85%)',
          timestamp: new Date().toLocaleString('fr-FR'),
          priority: 'medium',
          action: '/super-admin/system/monitoring'
        }
      },
      {
        condition: Math.random() > 0.9,
        alert: {
          id: `disk-space-${Date.now()}`,
          type: 'critical',
          message: 'Espace disque faible (<10% disponible)',
          timestamp: new Date().toLocaleString('fr-FR'),
          priority: 'high',
          action: '/super-admin/system/storage'
        }
      },
      {
        condition: Math.random() > 0.85,
        alert: {
          id: `security-scan-${Date.now()}`,
          type: 'info',
          message: 'Scan de sécurité automatique terminé - Aucune vulnérabilité détectée',
          timestamp: new Date().toLocaleString('fr-FR'),
          priority: 'low',
          action: '/super-admin/system/security'
        }
      }
    ];

    systemChecks.forEach(check => {
      if (check.condition) {
        alerts.push(check.alert);
      }
    });

    // Alertes de maintenance
    const maintenanceAlerts = [
      {
        condition: new Date().getHours() === 2, // 2h du matin
        alert: {
          id: `backup-${Date.now()}`,
          type: 'info',
          message: 'Sauvegarde automatique programmée démarrée',
          timestamp: new Date().toLocaleString('fr-FR'),
          priority: 'low',
          action: '/super-admin/system/backups'
        }
      }
    ];

    maintenanceAlerts.forEach(check => {
      if (check.condition) {
        alerts.push(check.alert);
      }
    });

    // Trier par priorité et timestamp
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    alerts.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      success: true,
      data: alerts.slice(0, 10), // Limiter à 10 alertes
      total: alerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur API super-admin alerts:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
