import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Store from '../../../../models/Store';
import Product from '../../../../models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/dashboard/switch-store - Changer de boutique active
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentification requise" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({
        success: false,
        message: "ID de boutique requis"
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    let store;
    if (['admin', 'super_admin'].includes(session.user.role)) {
      // Admin peut accéder à toutes les boutiques
      store = await Store.findById(storeId);
    } else {
      // Utilisateur normal ne peut accéder qu'à ses boutiques
      store = await Store.findOne({ 
        _id: storeId, 
        ownerId: session.user.id 
      });
    }

    if (!store) {
      return NextResponse.json({
        success: false,
        message: "Boutique introuvable ou accès non autorisé"
      }, { status: 404 });
    }

    // Récupérer les statistiques de la boutique
    const stats = await getStoreStats(storeId);

    return NextResponse.json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          status: store.status,
          settings: store.settings,
          metrics: store.metrics
        },
        stats,
        permissions: getStorePermissions(session.user.role, store, session.user.id)
      },
      message: "Boutique sélectionnée avec succès"
    });

  } catch (error) {
    console.error('Erreur changement boutique:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors du changement de boutique",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/dashboard/switch-store - Créer une nouvelle boutique
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentification requise" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, description, category, template } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Nom de boutique requis"
      }, { status: 400 });
    }

    // Vérifier les limites d'abonnement
    const currentStoreCount = await Store.countDocuments({ 
      ownerId: session.user.id 
    });

    const userLimits = await getUserLimits(session.user.id);
    if (currentStoreCount >= userLimits.maxStores) {
      return NextResponse.json({
        success: false,
        message: `Limite de boutiques atteinte (${userLimits.maxStores}). Mettez à niveau votre abonnement.`,
        code: 'STORE_LIMIT_REACHED'
      }, { status: 403 });
    }

    // Générer un slug unique
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Store.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer la boutique avec template
    const storeData = {
      name,
      slug,
      description: description || `Boutique ${name} - Découvrez notre sélection unique`,
      category: category || 'Général',
      ownerId: session.user.id,
      
      // Configuration par défaut selon le template
      settings: getTemplateSettings(template),
      
      // Métriques initiales
      metrics: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        monthlyVisitors: 0
      },
      
      status: 'active',
      isActive: true,
      createdAt: new Date()
    };

    const store = await Store.create(storeData);

    // Créer des produits de démonstration si template sélectionné
    if (template && template !== 'blank') {
      await createDemoProducts(store._id, template);
    }

    return NextResponse.json({
      success: true,
      data: store,
      message: "Boutique créée avec succès"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création boutique:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création de la boutique",
      error: error.message
    }, { status: 500 });
  }
}

// Fonctions utilitaires
async function getStoreStats(storeId) {
  try {
    // Statistiques des produits
    const totalProducts = await Product.countDocuments({ storeId });
    const activeProducts = await Product.countDocuments({ 
      storeId, 
      isActive: true 
    });
    const lowStockProducts = await Product.countDocuments({ 
      storeId, 
      stock: { $lt: 10 } 
    });

    // Statistiques des commandes (si le modèle Order existe)
    let orderStats = {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0
    };

    try {
      const Order = require('../../../../models/Order').default;
      
      const orders = await Order.find({ storeId });
      orderStats.totalOrders = orders.length;
      orderStats.pendingOrders = orders.filter(o => o.status === 'pending').length;
      orderStats.completedOrders = orders.filter(o => o.status === 'completed').length;
      orderStats.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    } catch (error) {
      // Modèle Order n'existe pas encore
    }

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts
      },
      orders: orderStats,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Erreur récupération stats boutique:', error);
    return null;
  }
}

function getStorePermissions(userRole, store, userId) {
  const isOwner = store.ownerId.toString() === userId;
  const isAdmin = ['admin', 'super_admin'].includes(userRole);

  return {
    canEdit: isOwner || isAdmin,
    canDelete: isOwner || userRole === 'super_admin',
    canManageProducts: isOwner || isAdmin,
    canManageOrders: isOwner || isAdmin,
    canViewAnalytics: isOwner || isAdmin,
    canManageSettings: isOwner || isAdmin,
    canManageUsers: isAdmin,
    isOwner,
    isAdmin
  };
}

async function getUserLimits(userId) {
  try {
    const { UserSubscription } = require('../../../../models/SaasModels');
    
    const subscription = await UserSubscription.findOne({
      userId,
      status: 'active'
    }).populate('planId');

    if (subscription && subscription.planId) {
      return {
        maxStores: subscription.planId.features.maxStores,
        maxProducts: subscription.planId.features.maxProducts,
        features: subscription.planId.features
      };
    }

    // Limites par défaut pour utilisateur sans abonnement
    return {
      maxStores: 1,
      maxProducts: 100,
      features: {}
    };
  } catch (error) {
    console.error('Erreur récupération limites:', error);
    return {
      maxStores: 1,
      maxProducts: 100,
      features: {}
    };
  }
}

function getTemplateSettings(template) {
  const templates = {
    fashion: {
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#ff6b6b',
        font: 'Inter'
      },
      layout: {
        headerStyle: 'minimal',
        footerStyle: 'detailed',
        productGridColumns: 3
      },
      features: {
        wishlist: true,
        quickView: true,
        colorSwatches: true,
        sizeGuide: true
      }
    },
    
    electronics: {
      theme: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#f8f9fa',
        accentColor: '#007bff',
        font: 'Roboto'
      },
      layout: {
        headerStyle: 'tech',
        footerStyle: 'minimal',
        productGridColumns: 4
      },
      features: {
        compareProducts: true,
        specifications: true,
        reviews: true,
        warranty: true
      }
    },
    
    home: {
      theme: {
        primaryColor: '#8b4513',
        secondaryColor: '#f5f5dc',
        accentColor: '#daa520',
        font: 'Playfair Display'
      },
      layout: {
        headerStyle: 'elegant',
        footerStyle: 'detailed',
        productGridColumns: 3
      },
      features: {
        roomVisualization: true,
        materialGuide: true,
        careInstructions: true
      }
    },
    
    blank: {
      theme: {
        primaryColor: '#333333',
        secondaryColor: '#ffffff',
        accentColor: '#6366f1',
        font: 'Inter'
      },
      layout: {
        headerStyle: 'simple',
        footerStyle: 'simple',
        productGridColumns: 3
      },
      features: {}
    }
  };

  return templates[template] || templates.blank;
}

async function createDemoProducts(storeId, template) {
  const demoProducts = {
    fashion: [
      {
        name: 'Robe d\'été élégante',
        description: 'Robe légère parfaite pour les journées ensoleillées',
        price: 79.99,
        category: 'Robes',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'],
        tags: ['robe', 'été', 'élégant']
      },
      {
        name: 'Jean slim moderne',
        description: 'Jean confortable avec coupe moderne',
        price: 89.99,
        category: 'Pantalons',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        tags: ['jean', 'pantalon', 'moderne']
      }
    ],
    
    electronics: [
      {
        name: 'Casque Bluetooth Premium',
        description: 'Casque sans fil avec réduction de bruit active',
        price: 199.99,
        category: 'Audio',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        tags: ['casque', 'bluetooth', 'audio']
      }
    ],
    
    home: [
      {
        name: 'Coussin décoratif',
        description: 'Coussin en velours pour salon moderne',
        price: 29.99,
        category: 'Décoration',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
        tags: ['coussin', 'décoration', 'salon']
      }
    ]
  };

  const products = demoProducts[template] || [];
  
  for (const productData of products) {
    const slug = productData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await Product.create({
      ...productData,
      slug,
      storeId,
      sku: `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      stock: Math.floor(Math.random() * 100) + 10,
      isActive: true,
      createdAt: new Date()
    });
  }
}

