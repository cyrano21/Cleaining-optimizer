import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { UserSubscription, SubscriptionPlan } from '../../../../models/SaasModels';
import User from '../../../../models/User';
import Store from '../../../../models/Store';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/dashboard/permissions - Vérifier les permissions utilisateur
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
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Utilisateur introuvable"
      }, { status: 404 });
    }

    // Récupérer l'abonnement actuel
    const subscription = await UserSubscription.findOne({
      userId: user._id,
      status: 'active'
    }).populate('planId');

    // Définir les permissions par rôle
    const rolePermissions = {
      super_admin: {
        canAccessAllStores: true,
        canManageUsers: true,
        canManagePlans: true,
        canManageSuppliers: true,
        canViewAnalytics: true,
        canManageSystem: true,
        maxStores: Infinity,
        maxProducts: Infinity,
        features: ['all']
      },
      
      admin: {
        canAccessAllStores: true,
        canManageUsers: true,
        canManagePlans: false,
        canManageSuppliers: true,
        canViewAnalytics: true,
        canManageSystem: false,
        maxStores: subscription?.planId?.features?.maxStores || 10,
        maxProducts: subscription?.planId?.features?.maxProducts || 10000,
        features: subscription?.planId?.features ? Object.keys(subscription.planId.features).filter(key => subscription.planId.features[key]) : []
      },
      
      vendor: {
        canAccessAllStores: false,
        canManageUsers: false,
        canManagePlans: false,
        canManageSuppliers: false,
        canViewAnalytics: true,
        canManageSystem: false,
        maxStores: subscription?.planId?.features?.maxStores || 3,
        maxProducts: subscription?.planId?.features?.maxProducts || 1000,
        features: subscription?.planId?.features ? Object.keys(subscription.planId.features).filter(key => subscription.planId.features[key]) : []
      },
      
      user: {
        canAccessAllStores: false,
        canManageUsers: false,
        canManagePlans: false,
        canManageSuppliers: false,
        canViewAnalytics: false,
        canManageSystem: false,
        maxStores: subscription?.planId?.features?.maxStores || 1,
        maxProducts: subscription?.planId?.features?.maxProducts || 100,
        features: subscription?.planId?.features ? Object.keys(subscription.planId.features).filter(key => subscription.planId.features[key]) : []
      }
    };

    const permissions = rolePermissions[user.role] || rolePermissions.user;

    // Vérifier une permission spécifique si demandée
    let hasPermission = true;
    if (action && resource) {
      hasPermission = checkSpecificPermission(permissions, action, resource, user);
    }

    // Récupérer les boutiques accessibles
    const accessibleStores = await getAccessibleStores(user, permissions);

    // Calculer l'utilisation actuelle
    const currentUsage = await getCurrentUsage(user._id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        subscription: subscription ? {
          plan: subscription.planId.name,
          status: subscription.status,
          features: subscription.planId.features,
          usage: subscription.usage
        } : null,
        permissions,
        hasPermission,
        accessibleStores,
        currentUsage,
        limits: {
          stores: permissions.maxStores,
          products: permissions.maxProducts,
          features: permissions.features
        }
      }
    });

  } catch (error) {
    console.error('Erreur vérification permissions:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la vérification des permissions",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/dashboard/permissions - Mettre à jour les permissions
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { userId, newRole, permissions } = body;

    if (!userId || !newRole) {
      return NextResponse.json({
        success: false,
        message: "ID utilisateur et nouveau rôle requis"
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Utilisateur introuvable"
      }, { status: 404 });
    }

    // Seul le super admin peut modifier les rôles admin
    if (user.role === 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: "Seul le super admin peut modifier les rôles admin"
      }, { status: 403 });
    }

    // Mettre à jour le rôle et les permissions
    const updateData = {
      role: newRole,
      updatedAt: new Date()
    };

    if (permissions) {
      updateData.permissions = permissions;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Permissions mises à jour avec succès"
    });

  } catch (error) {
    console.error('Erreur mise à jour permissions:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la mise à jour des permissions",
      error: error.message
    }, { status: 500 });
  }
}

// Fonctions utilitaires
function checkSpecificPermission(permissions, action, resource, user) {
  const permissionMap = {
    'view_stores': permissions.canAccessAllStores || resource === user._id.toString(),
    'manage_stores': permissions.canAccessAllStores,
    'view_users': permissions.canManageUsers,
    'manage_users': permissions.canManageUsers,
    'view_analytics': permissions.canViewAnalytics,
    'manage_suppliers': permissions.canManageSuppliers,
    'manage_plans': permissions.canManagePlans,
    'system_settings': permissions.canManageSystem
  };

  const permissionKey = `${action}_${resource}`;
  return permissionMap[permissionKey] !== undefined ? permissionMap[permissionKey] : false;
}

async function getAccessibleStores(user, permissions) {
  if (permissions.canAccessAllStores) {
    // Admin/Super Admin peuvent voir toutes les boutiques
    return await Store.find({ isActive: true })
      .select('name slug description logo metrics')
      .lean();
  } else {
    // Utilisateurs normaux ne voient que leurs boutiques
    return await Store.find({ 
      ownerId: user._id,
      isActive: true 
    })
    .select('name slug description logo metrics')
    .lean();
  }
}

async function getCurrentUsage(userId) {
  try {
    // Compter les boutiques
    const storeCount = await Store.countDocuments({ ownerId: userId });
    
    // Compter les produits
    const stores = await Store.find({ ownerId: userId }).select('_id');
    const storeIds = stores.map(store => store._id);
    
    const Product = require('../../../../models/Product').default;
    const productCount = await Product.countDocuments({ 
      storeId: { $in: storeIds } 
    });

    // Compter les commandes du mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const Order = require('../../../../models/Order').default;
    const orderCount = await Order.countDocuments({
      storeId: { $in: storeIds },
      createdAt: { $gte: startOfMonth }
    });

    return {
      stores: storeCount,
      products: productCount,
      orders: orderCount,
      storage: 0, // À implémenter selon les besoins
      bandwidth: 0 // À implémenter selon les besoins
    };
  } catch (error) {
    console.error('Erreur calcul utilisation:', error);
    return {
      stores: 0,
      products: 0,
      orders: 0,
      storage: 0,
      bandwidth: 0
    };
  }
}

