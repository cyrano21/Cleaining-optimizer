import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import TemplateSubscription from '@/models/TemplateSubscription';
import { SubscriptionService } from '@/services/subscriptionService';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, getAccessibleTiers } from '@/config/subscription-tiers';

/**
 * GET /api/templates/subscription
 * Récupère les templates accessibles selon le niveau d'abonnement
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
    
    let templates;
    if (category) {
      templates = await SubscriptionService.getTemplatesByCategory(subscriptionTier, category);
    } else {
      templates = await SubscriptionService.getAccessibleTemplates(subscriptionTier);
    }
    
    return NextResponse.json({
      success: true,
      data: templates,
      tier: subscriptionTier,
      category: category || null
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/subscription
 * Ajoute un nouveau template avec son niveau d'abonnement
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
      templateId,
      name,
      description,
      category,
      previewUrl,
      features,
      subscriptionTier,
      sortOrder
    } = body;
    
    // Validation des champs requis
    if (!templateId || !name || !description || !category || !subscriptionTier) {
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
    
    // Import dynamique du modèle pour éviter les erreurs de compilation
    const { default: TemplateSubscription } = await import('@/models/TemplateSubscription');
    
    // Vérification de l'unicité du templateId
    const existingTemplate = await TemplateSubscription.findOne({ templateId });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Un template avec cet ID existe déjà' },
        { status: 409 }
      );
    }
    
    // Création du nouveau template
    const newTemplate = new TemplateSubscription({
      templateId,
      name,
      description,
      category,
      previewUrl,
      features: features || [],
      subscriptionTier,
      sortOrder: sortOrder || 0,
      isActive: true
    });
    
    await newTemplate.save();
    
    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template créé avec succès'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}