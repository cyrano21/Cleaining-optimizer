// ===== NEXT.JS AVANCÉ (Module 6) =====
const nextjsAdvancedModule = {
  id: "6",
  title: "Next.js Avancé - Fonctionnalités Entreprise",
  description: "Maîtrisez les fonctionnalités avancées de Next.js pour des applications de niveau entreprise",
  level: "Avancé",
  image: "/images/modules/nextjs-advanced.jpg",
  progressPercent: 0,
  duration: "20 heures",
  category: "nextjs",
  prerequisites: ["5"],
  aiSupport: {
    primaryMentor: "nextjs-mentor",
    supportMentor: "devops-mentor",
    features: [
      "Architecture d'application avancée avec ServerSideWizard",
      "Optimisation des performances avec CloudArchitect",
      "Revue de code et bonnes pratiques"
    ]
  },
  outcomes: [
    "Mettre en place l'internationalisation (i18n)",
    "Optimiser les performances avec le préchargement intelligent",
    "Mettre en œuvre des stratégies de mise en cache avancées",
    "Configurer le rendu hybride (SSG + SSR)",
    "Déployer sur différentes plateformes (Vercel, AWS, etc.)"
  ],
  lessons: [
    { 
      id: "6-1", 
      title: "Internationalisation (i18n) avancée", 
      type: "exercise", 
      duration: "120 min", 
      xpReward: 60, 
      completed: false, 
      description: "Mettre en place une solution i18n complète avec routage dynamique",
      content: {
        topics: ["Routage i18n", "Chargement des traductions", "Détection de langue", "SSG avec i18n"],
        challenges: 5,
        realWorldExample: true,
        aiSupport: "ServerSideWizard fournit des exemples de configurations i18n complexes"
      }
    },
    { 
      id: "6-2", 
      title: "Optimisation des performances avancée", 
      type: "workshop", 
      duration: "150 min", 
      xpReward: 70, 
      completed: false, 
      description: "Techniques avancées pour des applications Next.js ultra-rapides",
      content: {
        optimizations: [
          "Préchargement intelligent des routes",
          "Chargement progressif des images",
          "Optimisation des polices",
          "Mise en cache HTTP/2"
        ],
        performanceAudit: true,
        aiSupport: "Analyse des performances avec CloudArchitect et recommandations personnalisées"
      }
    },
    { 
      id: "6-3", 
      title: "Architecture micro-frontend avec Next.js", 
      type: "theory", 
      duration: "90 min", 
      xpReward: 50, 
      completed: false, 
      description: "Concevoir des applications modulaires avec les micro-frontends",
      content: {
        patterns: ["Module Federation", "Micro-frontends autonomes", "Partage d'état"],
        caseStudy: true,
        aiSupport: "Revue d'architecture avec ServerSideWizard"
      }
    },
    { 
      id: "6-4", 
      title: "Sécurité avancée et bonnes pratiques", 
      type: "workshop", 
      duration: "120 min", 
      xpReward: 60, 
      completed: false, 
      description: "Sécurisez votre application Next.js contre les vulnérabilités courantes",
      content: {
        securityMeasures: [
          "Protection CSRF et XSS",
          "Politiques de sécurité du contenu (CSP)",
          "Authentification avancée",
          "Protection des API"
        ],
        securityAudit: true,
        aiSupport: "Analyse de sécurité automatisée avec SecureCoder"
      }
    },
    { 
      id: "6-5", 
      title: "Déploiement et DevOps pour Next.js", 
      type: "tutorial", 
      duration: "180 min", 
      xpReward: 80, 
      completed: false, 
      description: "Mise en place d'un pipeline CI/CD professionnel pour Next.js",
      content: {
        platforms: ["Vercel", "AWS Amplify", "Docker + Kubernetes", "GitHub Actions"],
        deploymentStrategies: ["Blue-Green", "Canary", "A/B Testing"],
        monitoringSetup: true,
        aiSupport: "Configuration automatisée avec CloudArchitect"
      }
    },
    { 
      id: "6-6", 
      title: "Projet : Application SaaS complète", 
      type: "project", 
      duration: "480 min", 
      xpReward: 200, 
      completed: false, 
      description: "Développez une application SaaS complète avec Next.js",
      content: {
        requirements: [
          "Authentification multi-tenant",
          "Tableau de bord analytique",
          "API sécurisée",
          "Déploiement automatisé"
        ],
        codeReview: "auto",
        aiSupport: "Accompagnement personnalisé par ServerSideWizard et l'équipe d'experts"
      }
    }
  ]
};

export default nextjsAdvancedModule;
