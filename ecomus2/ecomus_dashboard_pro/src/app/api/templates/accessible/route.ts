import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';
import { SubscriptionService } from '@/services/subscriptionService';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/config/subscription-tiers';
import { 
  type TemplateInfo, 
  type TemplateType, 
  type TemplateUpdateData
} from '@/types/templates';

/**
 * GET /api/templates/accessible
 * Récupère les templates accessibles selon l'abonnement du store
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const type: TemplateType = (searchParams.get('type') as TemplateType) || 'home';

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID requis' }, { status: 400 });
    }

    // Récupérer les informations du store
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store non trouvé' }, { status: 404 });
    }

    // Vérifier l'autorisation (propriétaire ou admin)
    const isOwner = store.owner?.toString() === session.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role || '');
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les templates accessibles selon l'abonnement (tous pour les admins)
    const subscriptionTier: SubscriptionTier = (store.subscription?.plan as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE;
    
    let accessibleTemplates;
    if (type === 'home') {
      if (isAdmin) {
        // Les admins voient tous les templates
        accessibleTemplates = await SubscriptionService.getAllTemplates();
      } else {
        accessibleTemplates = await SubscriptionService.getAccessibleTemplates(subscriptionTier);
      }
    } else {
      if (isAdmin) {
        // Les admins voient toutes les pages
        accessibleTemplates = await SubscriptionService.getAllPages();
      } else {
        accessibleTemplates = await SubscriptionService.getAccessiblePages(subscriptionTier);
      }
    }

    // Ajouter des informations sur le template actuellement sélectionné
    const currentTemplate = type === 'home' ? store.design?.selectedTemplate : null;

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          plan: subscriptionTier,
          isActive: store.subscription?.isActive ?? true,
          expiresAt: store.subscription?.expiresAt
        },
        currentTemplate: currentTemplate,
        templates: accessibleTemplates,
        totalCount: accessibleTemplates.length
      }
    });
  } catch (error: unknown) {
    console.error('Erreur récupération templates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des templates', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/accessible
 * Met à jour le template sélectionné pour un store
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { storeId, templateId, type = 'home' }: { 
      storeId: string; 
      templateId: string; 
      type: TemplateType;
    } = body;

    if (!storeId || !templateId) {
      return NextResponse.json({ 
        error: 'Store ID et Template ID requis' 
      }, { status: 400 });
    }

    // Récupérer les informations du store
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store non trouvé' }, { status: 404 });
    }

    // Vérifier l'autorisation (propriétaire ou admin)
    const isOwner = store.owner?.toString() === session.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role || '');
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier l'accès au template selon l'abonnement (sauf pour les admins)
    const subscriptionTier: SubscriptionTier = (store.subscription?.plan as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE;
    
    let isAccessible, templateInfo;
    if (type === 'home') {
      // Essayer de trouver le template par _id d'abord, puis par templateId
      templateInfo = await SubscriptionService.getTemplateInfoById(templateId) || await SubscriptionService.getTemplateInfo(templateId);
      // Les admins ont accès à tous les templates
      isAccessible = isAdmin || (templateInfo && await SubscriptionService.isTemplateAccessible(templateInfo.templateId || templateId, subscriptionTier));
    } else {
      // Essayer de trouver la page par _id d'abord, puis par pageId
      templateInfo = await SubscriptionService.getPageInfoById(templateId) || await SubscriptionService.getPageInfo(templateId);
      // Les admins ont accès à toutes les pages
      isAccessible = isAdmin || (templateInfo && await SubscriptionService.isPageAccessible(templateInfo.pageId || templateId, subscriptionTier));
    }
    
    if (!isAccessible) {
      return NextResponse.json({ 
        error: 'Template non accessible avec votre abonnement'
      }, { status: 403 });
    }
    
    if (!templateInfo) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    // Conversion de type sécurisée
    const typedTemplateInfo = templateInfo as TemplateInfo;

    // Mettre à jour le store
    const updateData: TemplateUpdateData = {};
    
    if (type === 'home') {
      updateData['design.selectedTemplate'] = {
        id: typedTemplateInfo.id,
        name: typedTemplateInfo.name,
        category: typedTemplateInfo.category
      };
    } else {
      // Pour les pages additionnelles, ajouter à la liste si pas déjà présent
      const existingPages = store.design?.additionalPages || [];
      const pageExists = existingPages.some((page: any) => page.id === templateId);
      
      if (!pageExists) {
        updateData.$push = {
          'design.additionalPages': {
            id: typedTemplateInfo.id,
            name: typedTemplateInfo.name,
            isEnabled: true
          }
        };
      }
    }const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    );    return NextResponse.json({
      success: true,
      message: `Template ${type === 'home' ? 'homepage' : 'page'} mis à jour avec succès`,
      data: {
        selectedTemplate: type === 'home' ? updatedStore?.design?.selectedTemplate : typedTemplateInfo,
        store: updatedStore
      }
    });

  } catch (error: unknown) {
    console.error('Erreur mise à jour template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du template', details: errorMessage },
      { status: 500 }
    );
  }
}

// Fonction utilitaire supprimée car remplacée par le service dynamique
