import TemplateSubscription from '@/models/TemplateSubscription';
import PageSubscription from '@/models/PageSubscription';
import { connectDB } from '@/lib/mongodb';
import { 
  SUBSCRIPTION_TIERS, 
  type SubscriptionTier, 
  hasAccess, 
  getAccessibleTiers 
} from '@/config/subscription-tiers';

// Ré-export pour compatibilité
export { SUBSCRIPTION_TIERS, type SubscriptionTier };



/**
 * Service pour gérer les templates et pages selon les abonnements
 */
export class SubscriptionService {
  /**
   * Récupère tous les templates accessibles selon le niveau d'abonnement
   */
  static async getAccessibleTemplates(subscriptionTier: SubscriptionTier) {
    await connectDB();
    
    const accessibleTiers = getAccessibleTiers(subscriptionTier);
    
    const templates = await TemplateSubscription.find({
      subscriptionTier: { $in: accessibleTiers },
      isActive: true
    }).sort({ subscriptionTier: 1, sortOrder: 1 });
    
    return templates;
  }
  
  /**
   * Récupère tous les templates par catégorie selon le niveau d'abonnement
   */
  static async getTemplatesByCategory(subscriptionTier: SubscriptionTier, category?: string) {
    await connectDB();
    
    const accessibleTiers = getAccessibleTiers(subscriptionTier);
    
    const query: any = {
      subscriptionTier: { $in: accessibleTiers },
      isActive: true
    };
    
    if (category) {
      query.category = category;
    }
    
    const templates = await TemplateSubscription.find(query)
      .sort({ category: 1, subscriptionTier: 1, sortOrder: 1 });
    
    return templates;
  }
  
  /**
   * Récupère toutes les pages accessibles selon le niveau d'abonnement
   */
  static async getAccessiblePages(subscriptionTier: SubscriptionTier) {
    await connectDB();
    
    const accessibleTiers = getAccessibleTiers(subscriptionTier);
    
    const pages = await PageSubscription.find({
      subscriptionTier: { $in: accessibleTiers },
      isActive: true
    }).sort({ subscriptionTier: 1, sortOrder: 1 });
    
    return pages;
  }
  
  /**
   * Vérifie si un template est accessible avec un niveau d'abonnement donné
   */
  static async isTemplateAccessible(templateId: string, subscriptionTier: SubscriptionTier): Promise<boolean> {
    await connectDB();
    
    const template = await TemplateSubscription.findOne({
      templateId,
      isActive: true
    });
    
    if (!template) return false;
    
    return hasAccess(subscriptionTier, template.subscriptionTier);
  }
  
  /**
   * Vérifie si une page est accessible avec un niveau d'abonnement donné
   */
  static async isPageAccessible(pageId: string, subscriptionTier: SubscriptionTier): Promise<boolean> {
    await connectDB();
    
    const page = await PageSubscription.findOne({
      pageId,
      isActive: true
    });
    
    if (!page) return false;
    
    return hasAccess(subscriptionTier, page.subscriptionTier);
  }
  
  /**
   * Récupère les informations d'un template spécifique par templateId
   */
  static async getTemplateInfo(templateId: string) {
    await connectDB();
    
    const template = await TemplateSubscription.findOne({
      templateId,
      isActive: true
    });
    
    return template;
  }

  /**
   * Récupère les informations d'un template spécifique par _id MongoDB
   */
  static async getTemplateInfoById(id: string) {
    await connectDB();
    
    try {
      const template = await TemplateSubscription.findOne({
        _id: id,
        isActive: true
      });
      
      return template;
    } catch (error) {
      // Si l'ID n'est pas un ObjectId valide, retourner null
      return null;
    }
  }
  
  /**
   * Récupère les informations d'une page spécifique par pageId
   */
  static async getPageInfo(pageId: string) {
    await connectDB();
    
    const page = await PageSubscription.findOne({
      pageId,
      isActive: true
    });
    
    return page;
  }

  /**
   * Récupère les informations d'une page spécifique par _id MongoDB
   */
  static async getPageInfoById(id: string) {
    await connectDB();
    
    try {
      const page = await PageSubscription.findOne({
        _id: id,
        isActive: true
      });
      
      return page;
    } catch (error) {
      // Si l'ID n'est pas un ObjectId valide, retourner null
      return null;
    }
  }
  
  /**
   * Récupère toutes les catégories disponibles selon le niveau d'abonnement
   */
  static async getAvailableCategories(subscriptionTier: SubscriptionTier) {
    await connectDB();
    
    const accessibleTiers = getAccessibleTiers(subscriptionTier);
    
    const categories = await TemplateSubscription.distinct('category', {
      subscriptionTier: { $in: accessibleTiers },
      isActive: true
    });
    
    return categories;
  }

  /**
   * Récupère tous les templates (pour les admins)
   */
  static async getAllTemplates() {
    await connectDB();
    
    const templates = await TemplateSubscription.find({
      isActive: true
    }).sort({ subscriptionTier: 1, sortOrder: 1 });
    
    return templates;
  }

  /**
   * Récupère toutes les pages (pour les admins)
   */
  static async getAllPages() {
    await connectDB();
    
    const pages = await PageSubscription.find({
      isActive: true
    }).sort({ subscriptionTier: 1, sortOrder: 1 });
    
    return pages;
  }
}

// Fonctions utilitaires pour la compatibilité avec l'ancien système
export async function getAccessibleTemplates(subscriptionTier: SubscriptionTier) {
  return SubscriptionService.getAccessibleTemplates(subscriptionTier);
}

export async function getAccessiblePages(subscriptionTier: SubscriptionTier) {
  return SubscriptionService.getAccessiblePages(subscriptionTier);
}

export async function isTemplateAccessible(templateId: string, subscriptionTier: SubscriptionTier) {
  return SubscriptionService.isTemplateAccessible(templateId, subscriptionTier);
}

export async function isPageAccessible(pageId: string, subscriptionTier: SubscriptionTier) {
  return SubscriptionService.isPageAccessible(pageId, subscriptionTier);
}