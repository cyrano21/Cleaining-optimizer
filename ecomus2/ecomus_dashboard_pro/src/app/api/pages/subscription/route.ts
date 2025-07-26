import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import PageSubscription from '@/models/PageSubscription';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, getAccessibleTiers } from '@/config/subscription-tiers';
import { SubscriptionService } from '@/services/subscriptionService';

/**
 * GET /api/pages/subscription
 * Récupère les pages accessibles selon le niveau d'abonnement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') as keyof typeof SUBSCRIPTION_TIERS;
    const category = searchParams.get('category');
    
    // Validation du niveau d'abonnement
    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return NextResponse.json(
        { error: 'Niveau d\'abonnement requis et valide' },
        { status: 400 }
      );
    }
    
    const subscriptionTier = SUBSCRIPTION_TIERS[tier];
    
    let pages = await SubscriptionService.getAccessiblePages(subscriptionTier);
    
    // Filtrage par catégorie si spécifiée
    if (category) {
      pages = pages.filter(page => page.category === category);
    }
    
    return NextResponse.json({
      success: true,
      data: pages,
      tier: subscriptionTier,
      category: category || null
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des pages:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages/subscription
 * Ajoute une nouvelle page avec son niveau d'abonnement
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      pageId,
      name,
      description,
      category,
      subscriptionTier,
      sortOrder
    } = body;
    
    // Validation des champs requis
    if (!pageId || !name || !description || !category || !subscriptionTier) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }
    
    // Validation du niveau d'abonnement
    if (!Object.values(SUBSCRIPTION_TIERS).includes(subscriptionTier)) {
      return NextResponse.json(
        { error: 'Niveau d\'abonnement invalide' },
        { status: 400 }
      );
    }
    
    // Import dynamique du modèle
    const { default: PageSubscription } = await import('@/models/PageSubscription');
    
    // Vérification de l'unicité du pageId
    const existingPage = await PageSubscription.findOne({ pageId });
    if (existingPage) {
      return NextResponse.json(
        { error: 'Une page avec cet ID existe déjà' },
        { status: 409 }
      );
    }
    
    // Création de la nouvelle page
    const newPage = new PageSubscription({
      pageId,
      name,
      description,
      category,
      subscriptionTier,
      sortOrder: sortOrder || 0,
      isActive: true
    });
    
    await newPage.save();
    
    return NextResponse.json({
      success: true,
      data: newPage,
      message: 'Page créée avec succès'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}