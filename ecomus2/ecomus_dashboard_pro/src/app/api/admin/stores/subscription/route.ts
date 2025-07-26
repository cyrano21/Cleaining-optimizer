import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';
import { SUBSCRIPTION_TIERS, SUBSCRIPTION_FEATURES } from '@/config/template-subscriptions';

type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_FEATURES;

/**
 * API pour l'assignation des vendeurs aux stores
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

    const { storeId, plan, duration } = await request.json();

    if (!storeId || !plan || !duration) {
      return NextResponse.json({ error: 'storeId, plan et duration sont requis' }, { status: 400 });
    }

    await dbConnect();

    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store non trouvée' }, { status: 404 });
    }

    // Vérifier que le plan est valide
    if (!(Object.values(SUBSCRIPTION_TIERS) as string[]).includes(plan)) {
      return NextResponse.json({ error: "Plan d'abonnement invalide" }, { status: 400 });
    }

    // Calculer les fonctionnalités du plan
    const planFeatures = SUBSCRIPTION_FEATURES[plan as SubscriptionPlanKey];

    // Helper pour parser la taille de stockage
    const parseStorageSize = (size: string) => {
      const value = parseInt(size.replace(/[^0-9]/g, ''));
      if (size.includes('GB')) return value;
      if (size.includes('MB')) return value / 1024;
      return value;
    };

    const maxProductsValue = planFeatures.maxProducts === -1 ? 999999 : planFeatures.maxProducts;

    const subscriptionDetails: {
      plan: string;
      isActive: boolean;
      startDate: Date;
      duration: string;
      features: {
        maxStores: number;
        maxProducts: number;
        maxStorage: number;
        maxOrders: number;
      };
      expirationDate?: Date | null;
    } = {
      plan: plan,
      isActive: true,
      startDate: new Date(),
      duration: duration,
      features: {
        maxStores: planFeatures.maxStores,
        maxProducts: maxProductsValue,
        maxStorage: parseStorageSize(planFeatures.storage),
        maxOrders: planFeatures.maxProducts === -1 ? 999999 : maxProductsValue * 2
      }
    };

    // Calculer la date d'expiration si non fournie
    if (duration === '1_month') {
      subscriptionDetails.expirationDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    } else if (duration === '1_year') {
      subscriptionDetails.expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    } else if (duration === 'lifetime') {
      subscriptionDetails.expirationDate = null; // Pas de date d'expiration pour le forfait à vie
    }

    store.subscription = subscriptionDetails;
    await store.save();

    return NextResponse.json({ message: 'Abonnement mis à jour avec succès', subscription: store.subscription });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
