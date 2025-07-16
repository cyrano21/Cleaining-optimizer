const lesson1 = {
  id: '16-1',
  title: 'Préparation du Projet Final - Analyse et Planification',
  description:
    'Planifiez et définissez votre projet final pour démontrer toutes vos compétences Next.js acquises.',
  duration: '60 minutes',
  theory: `
    <p>Félicitations ! Vous avez parcouru un long chemin dans votre apprentissage de Next.js. Il est maintenant temps de mettre en pratique toutes vos connaissances dans un <strong>projet final complet</strong>.</p>
    
    <h3>Objectifs du Projet Final</h3>
    <p>Votre projet final doit démontrer :</p>
    <ul>
      <li><strong>Maîtrise technique</strong> : Utilisation avancée de Next.js et de son écosystème</li>
      <li><strong>Architecture solide</strong> : Structure de code maintenable et scalable</li>
      <li><strong>Bonnes pratiques</strong> : Sécurité, performance, accessibilité</li>
      <li><strong>Innovation</strong> : Solutions créatives aux problèmes réels</li>
    </ul>

    <h3>Types de Projets Recommandés</h3>
    <div class="bg-blue-50 p-4 rounded-lg mt-4">
      <h4>🚀 Applications SaaS</h4>
      <p>Plateforme avec authentification, abonnements, tableau de bord utilisateur</p>
      <ul>
        <li>Gestionnaire de projet collaboratif</li>
        <li>Plateforme d'apprentissage en ligne</li>
        <li>CRM ou outil de gestion d'équipe</li>
      </ul>
    </div>

    <div class="bg-green-50 p-4 rounded-lg mt-4">
      <h4>🛒 E-commerce Avancé</h4>
      <p>Boutique en ligne complète avec fonctionnalités avancées</p>
      <ul>
        <li>Multi-vendeurs avec commissions</li>
        <li>Marketplace de services</li>
        <li>Système de réservation en ligne</li>
      </ul>
    </div>

    <div class="bg-purple-50 p-4 rounded-lg mt-4">
      <h4>📱 Applications Sociales</h4>
      <p>Plateformes d'interaction et de partage</p>
      <ul>
        <li>Réseau social spécialisé</li>
        <li>Plateforme de partage de contenu</li>
        <li>Forum communautaire avancé</li>
      </ul>
    </div>

    <h3>Technologies à Intégrer</h3>
    <p>Votre projet doit inclure au minimum :</p>
    <ul>
      <li><strong>Next.js 14+</strong> avec App Router</li>
      <li><strong>Base de données</strong> (PostgreSQL, MongoDB, ou Prisma)</li>
      <li><strong>Authentification</strong> (NextAuth.js ou solution personnalisée)</li>
      <li><strong>API REST/GraphQL</strong> avec validation</li>
      <li><strong>Interface utilisateur</strong> responsive (Tailwind CSS recommandé)</li>
      <li><strong>Tests</strong> unitaires et d'intégration</li>
      <li><strong>Déploiement</strong> sur plateforme cloud</li>
    </ul>
  `,
  example: {
    title: 'Structure de Planification de Projet',
    code: `// 📋 TEMPLATE DE PLANIFICATION DE PROJET

## 🎯 Concept du Projet
**Nom :** [Nom de votre application]
**Elevator Pitch :** [Décrivez en 1-2 phrases ce que fait votre app]

## 👥 Public Cible
- **Utilisateur principal :** [Qui utilisera votre app ?]
- **Cas d'usage :** [Quels problèmes résout-elle ?]
- **Valeur ajoutée :** [Pourquoi choisir votre solution ?]

## 🏗️ Architecture Technique

### Frontend
- ✅ Next.js 14 avec App Router
- ✅ TypeScript (recommandé)
- ✅ Tailwind CSS + shadcn/ui
- ✅ React Hook Form + Zod
- ✅ TanStack Query pour l'état serveur

### Backend
- ✅ API Routes Next.js
- ✅ Prisma ORM + PostgreSQL
- ✅ NextAuth.js pour l'authentification
- ✅ Uploadthing pour les fichiers
- ✅ Stripe pour les paiements (si applicable)

### Infrastructure
- ✅ Vercel pour le déploiement
- ✅ Railway/Supabase pour la DB
- ✅ GitHub Actions pour CI/CD
- ✅ Sentry pour le monitoring

## 🎨 Design & UX
- **Style :** [Moderne, Minimaliste, Coloré...]
- **Navigation :** [Structure des pages]
- **Responsive :** Mobile-first design
- **Accessibilité :** WCAG 2.1 AA

## 📊 Fonctionnalités Principales

### MVP (Version 1.0)
1. [ ] Authentification utilisateur
2. [ ] Dashboard personnalisé
3. [ ] CRUD des entités principales
4. [ ] Recherche et filtrage
5. [ ] Interface responsive

### Fonctionnalités Avancées (V2.0)
1. [ ] Notifications en temps réel
2. [ ] Système de permissions
3. [ ] Analytics intégrées
4. [ ] API publique
5. [ ] Intégrations tierces

## 🗓️ Planning (4 semaines)

### Semaine 1 : Foundation
- [ ] Setup projet et environnement
- [ ] Architecture de base
- [ ] Authentification
- [ ] Design system

### Semaine 2 : Core Features
- [ ] Modèles de données
- [ ] CRUD operations
- [ ] Interface utilisateur principale
- [ ] Tests unitaires

### Semaine 3 : Advanced Features  
- [ ] Fonctionnalités avancées
- [ ] Optimisations performance
- [ ] Tests d'intégration
- [ ] Documentation

### Semaine 4 : Polish & Deploy
- [ ] Tests utilisateur
- [ ] Corrections et améliorations
- [ ] Déploiement production
- [ ] Présentation finale`,
    language: 'markdown',
    explanation:
      'Template complet pour planifier votre projet final. Adaptez-le selon vos besoins et objectifs.'
  },
  exercise: {
    title: 'Définir Votre Projet Final',
    description:
      'Complétez la planification de votre projet final en utilisant le template fourni.',
    initialCode: `// 🎯 MON PROJET FINAL - PLANIFICATION

## Concept du Projet
**Nom :** 
**Description :** 

## Public Cible
**Utilisateurs :** 
**Problème résolu :** 

## Stack Technique Choisie
Frontend:
- [ ] Next.js 14
- [ ] TypeScript
- [ ] Tailwind CSS
- [ ] Autre: ___________

Backend:
- [ ] API Routes
- [ ] Base de données: ___________
- [ ] ORM: ___________
- [ ] Authentification: ___________

## Fonctionnalités Principales (MVP)
1. [ ] 
2. [ ] 
3. [ ] 
4. [ ] 
5. [ ] 

## Timeline Personnel
Semaine 1: 
Semaine 2: 
Semaine 3: 
Semaine 4: `,
    solution: `// 🎯 EXEMPLE DE PROJET FINAL COMPLÉTÉ

## Concept du Projet
**Nom :** DevCollab - Plateforme de collaboration pour développeurs
**Description :** Une plateforme permettant aux développeurs de collaborer sur des projets open-source, partager des ressources et se former mutuellement.

## Public Cible
**Utilisateurs :** Développeurs débutants à intermédiaires cherchant à collaborer
**Problème résolu :** Difficulté à trouver des projets collaboratifs et à recevoir du feedback constructif

## Stack Technique Choisie
Frontend:
- [x] Next.js 14 avec App Router
- [x] TypeScript pour la type safety
- [x] Tailwind CSS + Radix UI
- [x] React Hook Form + Zod validation

Backend:
- [x] API Routes Next.js
- [x] Base de données: PostgreSQL
- [x] ORM: Prisma
- [x] Authentification: NextAuth.js + GitHub OAuth

## Fonctionnalités Principales (MVP)
1. [x] Authentification GitHub
2. [x] Création et gestion de projets
3. [x] Système de collaboration (invitations)
4. [x] Chat en temps réel
5. [x] Portfolio des contributions

## Timeline Personnel
Semaine 1: Setup, auth, database, design system
Semaine 2: CRUD projets, interface principale
Semaine 3: Chat temps réel, notifications, tests
Semaine 4: Optimisations, déploiement, documentation`,
    tasks: [
      'Choisir un concept de projet qui vous passionne',
      'Définir clairement le public cible et les problèmes résolus',
      'Sélectionner votre stack technique selon vos préférences',
      'Lister les fonctionnalités essentielles pour le MVP',
      'Créer un planning réaliste sur 4 semaines'
    ]
  },
  quiz: {
    title: 'Quiz sur la Planification de Projet',
    questions: [
      {
        question:
          "Quelle est la première étape essentielle dans la planification d'un projet ?",
        options: [
          'Choisir les technologies',
          'Définir le concept et le public cible',
          'Créer la base de données',
          'Dessiner les maquettes'
        ],
        correctAnswer: 'Définir le concept et le public cible'
      },
      {
        question: 'Que signifie MVP dans le contexte du développement ?',
        options: [
          'Most Valuable Player',
          'Minimum Viable Product',
          'Maximum Value Proposition',
          'Minimal Visual Prototype'
        ],
        correctAnswer: 'Minimum Viable Product'
      },
      {
        question: 'Combien de temps est recommandé pour le projet final ?',
        options: [
          '1-2 semaines',
          '2-3 semaines',
          '3-4 semaines',
          '4-6 semaines'
        ],
        correctAnswer: '3-4 semaines'
      },
      {
        question: 'Quels éléments DOIVENT être inclus dans le projet final ?',
        options: [
          'Seulement Next.js et une base de données',
          'Next.js, authentification, API, tests et déploiement',
          "Uniquement l'interface utilisateur",
          'Seulement le backend'
        ],
        correctAnswer: 'Next.js, authentification, API, tests et déploiement'
      }
    ]
  },
  project: {
    title: 'Validation de Votre Plan de Projet Final',
    description:
      'Présentez votre planification de projet final pour validation avant de commencer le développement.',
    requirements: [
      'Document de planification complet utilisant le template fourni',
      'Concept de projet clairement défini avec public cible',
      'Stack technique justifiée et réaliste',
      'Liste de fonctionnalités priorisées (MVP vs features avancées)',
      'Timeline de développement sur 3-4 semaines',
      'Identification des défis potentiels et solutions',
      'Critères de succès mesurables'
    ],
    tips: [
      'Choisissez un projet qui vous passionne - la motivation est clé',
      "Soyez réaliste sur le scope - mieux vaut un MVP parfait qu'un projet inachevé",
      'Prévoyez du temps pour les tests et le debugging',
      'Documentez vos choix techniques pour la présentation finale',
      "N'hésitez pas à itérer sur votre concept initial"
    ],
    bonus: [
      'Créez des wireframes ou maquettes de votre interface',
      'Préparez un pitch de 2 minutes pour présenter votre projet',
      "Identifiez des projets similaires pour s'inspirer des bonnes pratiques",
      'Planifiez votre stratégie de déploiement et de monitoring'
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson1;
