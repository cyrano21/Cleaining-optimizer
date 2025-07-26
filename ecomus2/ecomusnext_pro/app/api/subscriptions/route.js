import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import { UserSubscription, SubscriptionPlan } from '../../../models/SaasModels';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

// GET /api/subscriptions - Récupérer les abonnements
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
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = {};

    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres abonnements
    if (session.user.role === 'user' || session.user.role === 'vendor') {
      query.userId = session.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const subscriptions = await UserSubscription.find(query)
      .populate('userId', 'name email')
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Erreur API subscriptions:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des abonnements",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/subscriptions - Créer un nouvel abonnement
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
    const { planId, billingCycle = 'monthly', userId } = body;

    // Déterminer l'utilisateur cible
    const targetUserId = userId || session.user.id;

    // Vérifier les permissions
    if (targetUserId !== session.user.id && !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        message: "Accès non autorisé"
      }, { status: 401 });
    }

    // Vérifier que le plan existe
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({
        success: false,
        message: "Plan d'abonnement introuvable ou inactif"
      }, { status: 404 });
    }

    // Vérifier que l'utilisateur n'a pas déjà un abonnement actif
    const existingSubscription = await UserSubscription.findOne({
      userId: targetUserId,
      status: 'active'
    });

    if (existingSubscription) {
      return NextResponse.json({
        success: false,
        message: "L'utilisateur a déjà un abonnement actif"
      }, { status: 400 });
    }

    // Calculer les dates
    const startDate = new Date();
    const endDate = new Date();
    const nextBillingDate = new Date();

    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Créer l'abonnement
    const subscriptionData = {
      userId: targetUserId,
      planId,
      billingCycle,
      startDate,
      endDate,
      nextBillingDate,
      status: 'active',
      usage: {
        stores: 0,
        products: 0,
        orders: 0,
        storage: 0,
        bandwidth: 0
      },
      history: [{
        action: 'created',
        date: new Date(),
        details: { planName: plan.name, billingCycle }
      }]
    };

    const subscription = await UserSubscription.create(subscriptionData);

    // Mettre à jour le rôle de l'utilisateur si nécessaire
    if (plan.allowedRoles && plan.allowedRoles.length > 0) {
      const user = await User.findById(targetUserId);
      if (user && !plan.allowedRoles.includes(user.role)) {
        // Assigner le premier rôle autorisé du plan
        await User.findByIdAndUpdate(targetUserId, {
          role: plan.allowedRoles[0],
          subscriptionPlan: planId
        });
      }
    }

    // Populer les données pour la réponse
    await subscription.populate('planId');
    await subscription.populate('userId', 'name email');

    return NextResponse.json({
      success: true,
      data: subscription,
      message: "Abonnement créé avec succès"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création abonnement:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création de l'abonnement",
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/subscriptions - Mettre à jour un abonnement
export async function PUT(request) {
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
    const { id, action, ...updateData } = body;

    if (!id || !action) {
      return NextResponse.json({
        success: false,
        message: "ID de l'abonnement et action requis"
      }, { status: 400 });
    }

    const subscription = await UserSubscription.findById(id);
    if (!subscription) {
      return NextResponse.json({
        success: false,
        message: "Abonnement introuvable"
      }, { status: 404 });
    }

    // Vérifier les permissions
    if (subscription.userId.toString() !== session.user.id && !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        message: "Accès non autorisé"
      }, { status: 401 });
    }

    let updatedSubscription;

    switch (action) {
      case 'cancel':
        updatedSubscription = await cancelSubscription(subscription);
        break;
      
      case 'reactivate':
        updatedSubscription = await reactivateSubscription(subscription);
        break;
      
      case 'upgrade':
        updatedSubscription = await upgradeSubscription(subscription, updateData.newPlanId);
        break;
      
      case 'update_usage':
        updatedSubscription = await updateUsage(subscription, updateData.usage);
        break;
      
      default:
        return NextResponse.json({
          success: false,
          message: "Action non reconnue"
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: "Abonnement mis à jour avec succès"
    });

  } catch (error) {
    console.error('Erreur mise à jour abonnement:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la mise à jour de l'abonnement",
      error: error.message
    }, { status: 500 });
  }
}

// Fonctions utilitaires
async function cancelSubscription(subscription) {
  const updatedSubscription = await UserSubscription.findByIdAndUpdate(
    subscription._id,
    {
      status: 'cancelled',
      autoRenew: false,
      $push: {
        history: {
          action: 'cancelled',
          date: new Date(),
          details: { reason: 'User requested cancellation' }
        }
      }
    },
    { new: true }
  ).populate('planId').populate('userId', 'name email');

  return updatedSubscription;
}

async function reactivateSubscription(subscription) {
  if (subscription.status !== 'cancelled') {
    throw new Error('Seuls les abonnements annulés peuvent être réactivés');
  }

  const updatedSubscription = await UserSubscription.findByIdAndUpdate(
    subscription._id,
    {
      status: 'active',
      autoRenew: true,
      $push: {
        history: {
          action: 'reactivated',
          date: new Date(),
          details: { reason: 'User requested reactivation' }
        }
      }
    },
    { new: true }
  ).populate('planId').populate('userId', 'name email');

  return updatedSubscription;
}

async function upgradeSubscription(subscription, newPlanId) {
  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan || !newPlan.isActive) {
    throw new Error('Nouveau plan introuvable ou inactif');
  }

  const updatedSubscription = await UserSubscription.findByIdAndUpdate(
    subscription._id,
    {
      planId: newPlanId,
      $push: {
        history: {
          action: 'upgraded',
          date: new Date(),
          details: { 
            oldPlan: subscription.planId,
            newPlan: newPlanId,
            newPlanName: newPlan.name
          }
        }
      }
    },
    { new: true }
  ).populate('planId').populate('userId', 'name email');

  return updatedSubscription;
}

async function updateUsage(subscription, newUsage) {
  const updatedSubscription = await UserSubscription.findByIdAndUpdate(
    subscription._id,
    {
      usage: { ...subscription.usage, ...newUsage },
      updatedAt: new Date()
    },
    { new: true }
  ).populate('planId').populate('userId', 'name email');

  return updatedSubscription;
}

