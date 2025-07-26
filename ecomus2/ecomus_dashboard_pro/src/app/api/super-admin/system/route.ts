import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";

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

    await connectDB();    // Récupérer les paramètres système ou créer les valeurs par défaut
    let systemSettings = await SystemConfig.findOne();
    
    if (!systemSettings) {
      systemSettings = new SystemConfig({
        maintenance: {
          enabled: false,
          message: "Le site est en maintenance. Nous reviendrons bientôt !",
          allowedRoles: ['super_admin', 'admin']
        },
        security: {
          maxLoginAttempts: 5,
          lockoutDuration: 15, // minutes
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          sessionTimeout: 24 // heures
        },
        features: {
          userRegistration: true,
          vendorRegistration: true,
          guestCheckout: true,
          reviews: true,
          wishlist: true,
          multiStore: true
        },
        notifications: {
          email: {
            enabled: true,
            smtp: {
              host: process.env.SMTP_HOST || '',
              port: parseInt(process.env.SMTP_PORT || '587'),
              secure: false,
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || ''
            }
          },
          push: {
            enabled: false,
            webPushVapidKey: process.env.VAPID_PUBLIC_KEY || ''
          }        },
        limits: {
          maxStoresPerVendor: 5,
          maxProductsPerStore: 1000,
          maxImageSizeMB: 10,
          maxFileUploads: 20,
          rateLimit: {
            enabled: true,
            maxRequests: 100,
            windowMs: 900000 // 15 minutes
          }
        },
        integrations: {
          payment: {
            stripe: {
              enabled: !!process.env.STRIPE_SECRET_KEY,
              publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
            },
            paypal: {
              enabled: !!process.env.PAYPAL_CLIENT_ID,
              clientId: process.env.PAYPAL_CLIENT_ID || ''
            }
          },
          analytics: {
            googleAnalytics: {
              enabled: !!process.env.GOOGLE_ANALYTICS_ID,
              trackingId: process.env.GOOGLE_ANALYTICS_ID || ''
            }
          },          storage: {
            cloudinary: {
              enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
              cloudName: process.env.CLOUDINARY_CLOUD_NAME || ''
            }
          }
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600 // 1 heure
        }
      });
      await systemSettings.save();
    }

    // Statistiques système supplémentaires
    const systemStats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Logs système récents (simulé - à connecter aux vrais logs)
    const recentLogs = [
      {
        id: Date.now() + 1,
        level: 'info',
        message: 'Système démarré avec succès',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        service: 'core'
      },
      {
        id: Date.now() + 2,
        level: 'warning',
        message: 'Utilisation mémoire élevée détectée',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        service: 'monitoring'
      },
      {
        id: Date.now() + 3,
        level: 'info',
        message: 'Sauvegarde automatique terminée',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        service: 'backup'
      }
    ];

    const result = {
      settings: systemSettings,
      stats: systemStats,
      logs: recentLogs
    };    return NextResponse.json({
      success: true,
      settings: systemSettings,
      stats: systemStats,
      logs: recentLogs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur API super-admin system:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour mettre à jour les paramètres système
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
    const { section, settings } = body;

    if (!section || !settings) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    await connectDB();

    // Construire l'objet de mise à jour
    const updateData: any = {};
    updateData[section] = settings;    updateData.updatedAt = new Date();
    updateData.updatedBy = session.user.id;

    const updatedSettings = await SystemConfig.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Paramètres système mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur API super-admin system PATCH:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour mettre à jour tous les paramètres système
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await connectDB();

    // Mettre à jour les paramètres complets
    const updateData = {
      ...settings,
      updatedAt: new Date(),
      updatedBy: session.user.id    };

    const updatedSettings = await SystemConfig.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Paramètres système sauvegardés avec succès"
    });

  } catch (error) {
    console.error("Erreur API super-admin system PUT:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
