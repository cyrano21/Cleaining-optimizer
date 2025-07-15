export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  role: 'FREE' | 'PRO' | 'COACH';
  stripePriceId?: string;
  popular?: boolean;
  badge?: string;
  savings?: string;
  highlight?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour découvrir notre plateforme',
    price: 0,
    interval: 'month',
    features: [
      '1 CV professionnel',
      '3 lettres de motivation',
      'Recherche d\'emploi de base',
      'Profil public simple',
      'Support par email',
      'Accès aux templates de base'
    ],
    role: 'FREE',
    badge: 'Idéal pour débuter'
  },
  {
    id: 'pro',
    name: 'Professionnel',
    description: 'Pour une recherche d\'emploi optimisée',
    price: 9.99,
    interval: 'month',
    features: [
      '✨ CV illimités avec tous les templates',
      '✨ Lettres de motivation illimitées',
      '🤖 Recherche d\'emploi alimentée par IA',
      '🗺️ Géolocalisation et temps de trajet',
      '📄 Export PDF/Docx haute qualité',
      '🌐 Profil public personnalisé',
      '⚡ Génération instantanée par IA',
      '🔒 Support prioritaire 24/7'
    ],
    role: 'PRO',
    stripePriceId: 'price_pro_monthly',
    popular: true,
    badge: 'Le plus populaire',
    savings: 'Économisez 120€/an',
    highlight: true
  },
  {
    id: 'coach',
    name: 'Coach Premium',
    description: 'Pour maximiser vos chances de succès',
    price: 19.99,
    interval: 'month',
    features: [
      '🎯 Tout ce qui est inclus dans Pro',
      '🤖 Coach IA personnel avancé',
      '🎭 Simulateur d\'entretien réaliste',
      '✏️ Corrections CV/lettre par IA experte',
      '📊 Analyse de performance détaillée',
      '🔔 Alertes emploi personnalisées',
      '📈 Statistiques de candidature avancées',
      '🏆 Conseils de carrière personnalisés',
      '⚡ Accès anticipé aux nouvelles fonctionnalités'
    ],
    role: 'COACH',
    stripePriceId: 'price_coach_monthly',
    badge: 'Pour les professionnels exigeants',
    savings: 'Économisez 240€/an'
  }
];
