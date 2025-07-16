// src/data/modules.js
// Configuration des modules pour affichage correct dans l'interface

export const MODULES_CONFIG = {
  1: {
    title: 'Introduction à Next.js',
    description: "Découvrez les bases et l'écosystème de Next.js.",
    difficulty: 'débutant'
  },
  2: {
    title: 'Fondamentaux de Next.js',
    description: 'Pages, routage, récupération de données, et composants.',
    difficulty: 'débutant'
  },
  3: {
    title: 'Fonctionnalités Intermédiaires',
    description: 'API Routes, génération statique et dynamique, et plus.',
    difficulty: 'intermédiaire'
  },
  4: {
    title: 'React Avancé avec Next.js',
    description: "Hooks avancés, gestion d'état, et patterns.",
    difficulty: 'intermédiaire'
  },
  5: {
    title: 'API et Bases de Données',
    description: 'Intégration de backends et gestion de données.',
    difficulty: 'avancé'
  },
  6: {
    title: 'Routage Avancé',
    description: 'App Router, migration et techniques avancées.',
    difficulty: 'avancé'
  },
  7: {
    title: 'Authentification et Sécurité',
    description: 'NextAuth.js, sessions utilisateur et sécurisation.',
    difficulty: 'expert'
  },
  8: {
    title: 'Internationalisation',
    description: 'i18n, thèmes, et fonctionnalités avancées de Next.js.',
    difficulty: 'expert'
  },
  9: {
    title: 'Tests et Qualité',
    description: 'Tests unitaires, intégration et E2E pour Next.js.',
    difficulty: 'intermédiaire'
  },
  10: {
    title: 'CMS Headless',
    description: 'Intégration avec Strapi et autres CMS modernes.',
    difficulty: 'avancé'
  },
  11: {
    title: "Architecture d'Entreprise",
    description: 'Projets à grande échelle et design patterns.',
    difficulty: 'expert'
  },
  12: {
    title: 'DevOps et Déploiement',
    description: "Docker, CI/CD et monitoring d'applications Next.js.",
    difficulty: 'expert'
  },
  13: {
    title: 'Sécurité Avancée',
    description: 'Protection API, vulnérabilités et sécurité client.',
    difficulty: 'expert'
  },
  14: {
    title: 'Bases de Données',
    description: 'Intégration, optimisation et gestion en production.',
    difficulty: 'avancé'
  },
  15: {
    title: 'SEO et Performance',
    description: 'Optimisation avancée et métriques de performance.',
    difficulty: 'expert'
  },
  16: {
    title: 'Projet Final',
    description: 'Planification, développement et certification.',
    difficulty: 'expert'
  }
}

// Fonction utilitaire pour obtenir les informations d'un module
export function getModuleInfo (moduleId) {
  return (
    MODULES_CONFIG[moduleId] || {
      title: `Module ${moduleId}`,
      description: 'Description du module à définir.',
      difficulty: 'débutant'
    }
  )
}
