import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est super admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }    // Récupérer les paramètres système ou créer les valeurs par défaut
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
          lockoutDuration: 15,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          sessionTimeout: 24
        },
        features: {
          userRegistration: true,
          vendorRegistration: true,
          guestCheckout: true,
          reviews: true,
          wishlist: true,
          multiStore: true
        },
        email: {
          enabled: true,
          provider: "smtp",
          smtp: {
            host: process.env.SMTP_HOST || '',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            user: process.env.SMTP_USER || '',
            password: process.env.SMTP_PASS || ''
          }
        },
        storage: {
          provider: "local",
          maxFileSize: 10,
          allowedTypes: ["image/jpeg", "image/png", "image/webp"]
        },
        api: {
          rateLimit: {
            enabled: true,
            maxRequests: 100,
            windowMs: 900000
          }
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600
        }
      });
      await systemSettings.save();
    }    // Récupérer les stats de la base de données
    await connectDB();
    
    let dbStats: any = { dataSize: 0, objects: 0 };
    let collections: any[] = [];
    
    try {
      if (mongoose.connection.db) {
        const stats = await mongoose.connection.db.stats();
        dbStats = stats as any; // Cast pour éviter le problème de typage
        collections = await mongoose.connection.db.listCollections().toArray();
      }
    } catch (error) {
      console.warn('Impossible de récupérer les stats de la base:', error);
      // Garder les valeurs par défaut en cas d'erreur
    }

    // Formater les données pour l'interface
    const settings = {
      general: {
        siteName: process.env.SITE_NAME || "Ecomus Dashboard",
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        adminEmail: process.env.ADMIN_EMAIL || "admin@ecomus.com",
        timezone: process.env.TIMEZONE || "Europe/Paris",
        language: process.env.LANGUAGE || "fr",
        maintenanceMode: systemSettings.maintenance?.enabled || false
      },
      security: {
        requireTwoFactor: systemSettings.security?.requireTwoFactor || false,
        sessionTimeout: systemSettings.security?.sessionTimeout || 24,
        maxLoginAttempts: systemSettings.security?.maxLoginAttempts || 5,
        passwordMinLength: systemSettings.security?.passwordPolicy?.minLength || 8,
        enforceStrongPasswords: systemSettings.security?.passwordPolicy?.requireSpecialChars || false
      },
      database: {
        connectionStatus: 'connected' as const,
        version: process.env.MONGODB_VERSION || "6.0",
        totalCollections: collections.length,
        totalDocuments: Math.floor(dbStats.objects || 0),
        storageSize: `${Math.round((dbStats.dataSize || 0) / 1024 / 1024 * 100) / 100} MB`
      },
      email: {
        enabled: systemSettings.email?.enabled || false,
        provider: systemSettings.email?.provider || "smtp",
        host: systemSettings.email?.host || "",
        port: systemSettings.email?.port || 587,
        secure: systemSettings.email?.secure || false
      },
      notifications: {
        systemAlerts: systemSettings.notifications?.systemAlerts || true,
        userRegistrations: systemSettings.notifications?.userRegistrations || true,
        orderNotifications: systemSettings.notifications?.orderNotifications || true,
        securityAlerts: systemSettings.notifications?.securityAlerts || true
      },
      performance: {
        cacheEnabled: systemSettings.performance?.cacheEnabled || true,
        compressionEnabled: systemSettings.performance?.compressionEnabled || true,
        cdnEnabled: systemSettings.performance?.cdnEnabled || false,
        analyticsEnabled: systemSettings.performance?.analyticsEnabled || true
      }
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est super admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    await connectDB();    // Récupérer les paramètres existants
    let systemSettings = await SystemConfig.findOne();
    
    if (!systemSettings) {
      systemSettings = new SystemConfig();
    }

    // Mettre à jour les paramètres
    if (settings.general) {
      systemSettings.maintenance = systemSettings.maintenance || {};
      systemSettings.maintenance.enabled = settings.general.maintenanceMode;
    }

    if (settings.security) {
      systemSettings.security = systemSettings.security || {};
      systemSettings.security.sessionTimeout = settings.security.sessionTimeout;
      systemSettings.security.maxLoginAttempts = settings.security.maxLoginAttempts;
      systemSettings.security.requireTwoFactor = settings.security.requireTwoFactor;
      
      systemSettings.security.passwordPolicy = systemSettings.security.passwordPolicy || {};
      systemSettings.security.passwordPolicy.minLength = settings.security.passwordMinLength;
      systemSettings.security.passwordPolicy.requireSpecialChars = settings.security.enforceStrongPasswords;
    }

    if (settings.email) {
      systemSettings.email = systemSettings.email || {};
      systemSettings.email.enabled = settings.email.enabled;
      systemSettings.email.provider = settings.email.provider;
      systemSettings.email.host = settings.email.host;
      systemSettings.email.port = settings.email.port;
      systemSettings.email.secure = settings.email.secure;
    }

    if (settings.notifications) {
      systemSettings.notifications = systemSettings.notifications || {};
      systemSettings.notifications.systemAlerts = settings.notifications.systemAlerts;
      systemSettings.notifications.userRegistrations = settings.notifications.userRegistrations;
      systemSettings.notifications.orderNotifications = settings.notifications.orderNotifications;
      systemSettings.notifications.securityAlerts = settings.notifications.securityAlerts;
    }

    if (settings.performance) {
      systemSettings.performance = systemSettings.performance || {};
      systemSettings.performance.cacheEnabled = settings.performance.cacheEnabled;
      systemSettings.performance.compressionEnabled = settings.performance.compressionEnabled;
      systemSettings.performance.cdnEnabled = settings.performance.cdnEnabled;
      systemSettings.performance.analyticsEnabled = settings.performance.analyticsEnabled;
    }

    await systemSettings.save();

    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
