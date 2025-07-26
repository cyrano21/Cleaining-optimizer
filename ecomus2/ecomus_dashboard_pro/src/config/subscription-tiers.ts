/**
 * Configuration des niveaux d'abonnement
 * Remplace les constantes statiques de l'ancien template-subscriptions.js
 */

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic', 
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

/**
 * Hiérarchie des niveaux d'abonnement
 * Utilisée pour déterminer l'accès aux fonctionnalités
 */
export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.BASIC]: 1,
  [SUBSCRIPTION_TIERS.PREMIUM]: 2,
  [SUBSCRIPTION_TIERS.ENTERPRISE]: 3
};

/**
 * Vérifie si un niveau d'abonnement a accès à une fonctionnalité
 * @param userTier - Niveau d'abonnement de l'utilisateur
 * @param requiredTier - Niveau requis pour la fonctionnalité
 * @returns true si l'accès est autorisé
 */
export function hasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Obtient tous les niveaux accessibles pour un niveau donné
 * @param userTier - Niveau d'abonnement de l'utilisateur
 * @returns Array des niveaux accessibles
 */
export function getAccessibleTiers(userTier: SubscriptionTier): SubscriptionTier[] {
  const userLevel = TIER_HIERARCHY[userTier];
  return Object.entries(TIER_HIERARCHY)
    .filter(([_, level]) => level <= userLevel)
    .map(([tier, _]) => tier as SubscriptionTier);
}