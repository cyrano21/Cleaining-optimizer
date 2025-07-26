/**
 * Configuration des abonnements et fonctionnalités pour les templates
 */

import { SUBSCRIPTION_TIERS, type SubscriptionTier } from './subscription-tiers';

export { SUBSCRIPTION_TIERS };
export type { SubscriptionTier };

/**
 * Fonctionnalités disponibles par niveau d'abonnement
 */
export const SUBSCRIPTION_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxStores: 1,
    maxProducts: 10,
    maxTemplates: 3,
    customDomain: false,
    analytics: false,
    multiVendor: false,
    support: 'community',
    storage: '1GB'
  },
  [SUBSCRIPTION_TIERS.BASIC]: {
    maxStores: 3,
    maxProducts: 100,
    maxTemplates: 10,
    customDomain: true,
    analytics: true,
    multiVendor: false,
    support: 'email',
    storage: '5GB'
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxStores: 10,
    maxProducts: 1000,
    maxTemplates: 50,
    customDomain: true,
    analytics: true,
    multiVendor: true,
    support: 'priority',
    storage: '20GB'
  },
  [SUBSCRIPTION_TIERS.ENTERPRISE]: {
    maxStores: -1, // Unlimited
    maxProducts: -1, // Unlimited
    maxTemplates: -1, // Unlimited
    customDomain: true,
    analytics: true,
    multiVendor: true,
    support: 'dedicated',
    storage: '100GB'
  }
} as const;

/**
 * Prix des abonnements (en USD/mois)
 */
export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.BASIC]: 29,
  [SUBSCRIPTION_TIERS.PREMIUM]: 99,
  [SUBSCRIPTION_TIERS.ENTERPRISE]: 299
} as const;

/**
 * Description des fonctionnalités
 */
export const FEATURE_DESCRIPTIONS = {
  maxStores: 'Nombre maximum de boutiques',
  maxProducts: 'Nombre maximum de produits',
  maxTemplates: 'Nombre maximum de templates',
  customDomain: 'Domaine personnalisé',
  analytics: 'Analytics avancées',
  multiVendor: 'Support multi-vendeur',
  support: 'Type de support',
  storage: 'Espace de stockage'
} as const;

/**
 * Vérifie si une fonctionnalité est disponible pour un niveau d'abonnement
 */
export function hasFeature(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_FEATURES[typeof SUBSCRIPTION_TIERS.FREE]
): boolean {
  return SUBSCRIPTION_FEATURES[tier][feature] !== false;
}

/**
 * Obtient la limite d'une fonctionnalité pour un niveau d'abonnement
 */
export function getFeatureLimit(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_FEATURES[typeof SUBSCRIPTION_TIERS.FREE]
): number | string | boolean {
  return SUBSCRIPTION_FEATURES[tier][feature];
}
