import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';
import { SUBSCRIPTION_TIERS, SUBSCRIPTION_FEATURES } from '@/config/template-subscriptions';

/**
 * POST /api/admin/stores/subscription
 * Met à jour l'abonnement d'un store (admin seulement)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier les permissions admin
    if (!session?.user?.id || !['admin', 'super_admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { storeId, plan, expiresAt, customLimits }: {
      storeId: string;
      plan: string;
      expiresAt?: Date;
      customLimits?: any;
    } = body;

    if (!storeId || !plan) {
      return NextResponse.json({ 
        error: 'Store ID et plan d\'abonnement requis' 
      }, { status: 400 });
    }

    // Vérifier que le plan est valide
    if (!Object.values(SUBSCRIPTION_TIERS).includes(plan)) {
      return NextResponse.json({ 
        error: 'Plan d\'abonnement invalide',
        validPlans: Object.values(SUBSCRIPTION_TIERS)
      }, { status: 400 });
    }

    // Récupérer le store
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store non trouvé' }, { status: 404 });
    }    // Préparer les nouvelles limites selon le plan
    const planFeatures = SUBSCRIPTION_FEATURES[plan];
    const maxProductsValue = planFeatures.maxProducts === 'unlimited' ? 999999 : Number(planFeatures.maxProducts);
    const newLimits = customLimits || {
      maxProducts: maxProductsValue,
      maxStorage: parseStorageSize(planFeatures.storage),
      maxOrders: planFeatures.maxProducts === 'unlimited' ? 999999 : maxProductsValue * 2
    };

    // Calculer la date d'expiration si non fournie
    const defaultExpiresAt = expiresAt || (plan !== SUBSCRIPTION_TIERS.FREE ? 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 jours
      null
    );

    // Mettre à jour l'abonnement
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: {
          'subscription.plan': plan,
          'subscription.limits': newLimits,
          'subscription.expiresAt': defaultExpiresAt,
          'subscription.isActive': true,
          'subscription.startedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    );

    // Log de l'action admin
    console.log(`[ADMIN] ${session.user.email} a mis à jour l'abonnement du store ${store.name} vers ${plan}`);

    return NextResponse.json({
      success: true,
      message: `Abonnement mis à jour vers ${plan}`,
      data: {
        store: updatedStore,
        subscription: updatedStore.subscription,
        features: planFeatures
      }
    });
  } catch (error: unknown) {
    console.error('Erreur mise à jour abonnement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de l\'abonnement', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/stores/subscription
 * Récupère les statistiques des abonnements (admin seulement)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier les permissions admin
    if (!session?.user?.id || !['admin', 'super_admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
    }

    await dbConnect();

    // Statistiques des abonnements
    const subscriptionStats = await Store.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$subscription.isActive', true] },
                  { $or: [
                    { $eq: ['$subscription.expiresAt', null] },
                    { $gt: ['$subscription.expiresAt', new Date()] }
                  ]}
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Abonnements expirant bientôt (7 jours)
    const expiringStores = await Store.find({
      'subscription.expiresAt': {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        $gt: new Date()
      },
      'subscription.isActive': true
    })
    .populate('owner', 'email name')
    .select('name slug subscription owner')
    .limit(20);

    // Stores avec limites dépassées
    const overlimitStores = await Store.find({
      $or: [
        { $expr: { $gt: ['$stats.totalProducts', '$subscription.limits.maxProducts'] } },
        { $expr: { $gt: ['$stats.totalOrders', '$subscription.limits.maxOrders'] } }
      ]
    })
    .populate('owner', 'email name')
    .select('name slug subscription stats owner')
    .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionStats: subscriptionStats.reduce((acc, stat) => {
          acc[stat._id || 'free'] = {
            total: stat.count,
            active: stat.activeCount
          };
          return acc;
        }, {}),
        expiringStores,
        overlimitStores,
        totalStores: await Store.countDocuments(),
        totalActiveStores: await Store.countDocuments({
          'subscription.isActive': true,
          $or: [
            { 'subscription.expiresAt': null },
            { 'subscription.expiresAt': { $gt: new Date() } }
          ]
        })
      }
    });
  } catch (error: unknown) {
    console.error('Erreur récupération stats abonnements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Convertit une taille de stockage en MB
 * @param {string | number} size - Taille avec unité (ex: "2GB", "500MB") ou nombre
 * @returns {number} - Taille en MB
 */
function parseStorageSize(size: string | number): number {
  if (typeof size === 'number') return size;
  
  const match = size.match(/^(\d+)([A-Z]+)$/);
  if (!match) return 1000; // Défaut 1GB
  
  const [, value, unit] = match;
  const numValue = parseInt(value);
  
  switch (unit) {
    case 'MB': return numValue;
    case 'GB': return numValue * 1024;
    case 'TB': return numValue * 1024 * 1024;
    default: return 1000;
  }
}
