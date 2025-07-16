# Documentation de l'Application d'Apprentissage Next.js

## Table des matières
1. [Introduction](#introduction)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Guide d'installation](#guide-dinstallation)
4. [Structure des leçons](#structure-des-leçons)
5. [Système de gamification](#système-de-gamification)
6. [Composants UI](#composants-ui)
7. [Déploiement](#déploiement)
8. [Maintenance et évolution](#maintenance-et-évolution)

## Introduction

Cette application est une plateforme d'apprentissage interactive et gamifiée pour Next.js, inspirée par Mimo. Elle permet aux utilisateurs d'apprendre Next.js à travers des leçons interactives, des exercices pratiques et des quiz, tout en bénéficiant d'un système de gamification pour maintenir leur motivation.

L'application a été développée avec Next.js 15.1.4 et utilise Tailwind CSS pour le style. Elle est conçue pour être responsive et fonctionne sur les appareils mobiles et desktop.

## Architecture de l'application

L'application suit l'architecture recommandée par Next.js avec le App Router. Elle est organisée comme suit :

```
nextjs-mimo-clone/
├── docs/                    # Documentation de l'application
├── migrations/              # Fichiers de migration pour la base de données
├── public/                  # Fichiers statiques
├── src/
│   ├── app/                 # Pages de l'application (App Router)
│   │   ├── dashboard/       # Page du tableau de bord
│   │   ├── lessons/         # Pages des leçons
│   │   │   └── module/[moduleId]/
│   │   │       └── lesson/[lessonId]/
│   │   ├── profile/         # Page de profil
│   │   ├── globals.css      # Styles globaux
│   │   ├── layout.js        # Layout principal
│   │   └── page.js          # Page d'accueil
│   ├── components/          # Composants réutilisables
│   │   ├── dashboard/       # Composants spécifiques au tableau de bord
│   │   ├── editor/          # Éditeur de code interactif
│   │   ├── gamification/    # Système de gamification
│   │   ├── lessons/         # Composants pour les leçons
│   │   ├── profile/         # Composants pour le profil
│   │   └── ui/              # Composants UI génériques
│   └── tests/               # Tests unitaires et d'utilisabilité
└── wrangler.toml            # Configuration Cloudflare
```

## Guide d'installation

### Prérequis
- Node.js 18.0.0 ou supérieur
- npm ou pnpm

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-utilisateur/nextjs-mimo-clone.git
cd nextjs-mimo-clone
```

2. Installez les dépendances :
```bash
npm install
# ou
pnpm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
# ou
pnpm dev
```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure des leçons

Les leçons sont organisées en modules, chaque module contenant plusieurs leçons. Chaque leçon peut contenir différents types de contenu :

- **Théorie** : Explication des concepts
- **Exemples** : Démonstration pratique
- **Exercices** : Application des connaissances
- **Quiz** : Vérification de la compréhension

### Ajouter une nouvelle leçon

Pour ajouter une nouvelle leçon, suivez ces étapes :

1. Créez un nouveau dossier dans `src/app/lessons/module/[moduleId]/lesson/[lessonId]` avec l'ID approprié.
2. Créez un fichier `page.js` dans ce dossier avec le contenu de la leçon.
3. Ajoutez la leçon à la liste des leçons disponibles dans le module correspondant.

## Système de gamification

Le système de gamification est géré par le contexte `GamificationContext` qui fournit les fonctionnalités suivantes :

- **Points XP** : Les utilisateurs gagnent des points en complétant des leçons et des exercices.
- **Niveaux** : Les utilisateurs montent de niveau en accumulant des points XP.
- **Badges** : Les utilisateurs débloquent des badges en accomplissant certaines actions.
- **Suivi de progression** : Les utilisateurs peuvent suivre leur progression dans les différents modules.

### Ajouter un nouveau badge

Pour ajouter un nouveau badge, modifiez le fichier `src/components/gamification/GamificationContext.js` et ajoutez le badge à la liste `availableBadges`.

## Composants UI

L'application utilise plusieurs composants UI réutilisables :

- **Button** : Bouton personnalisable avec différentes variantes
- **Card** : Conteneur pour afficher du contenu structuré
- **Navbar** : Barre de navigation responsive
- **Footer** : Pied de page cohérent
- **Input** : Champ de saisie avec gestion des erreurs
- **Modal** : Fenêtre modale pour les interactions
- **Tabs** : Système d'onglets pour organiser le contenu
- **Alert** : Notifications et messages d'alerte

Ces composants sont disponibles dans le dossier `src/components/ui/`.

## Déploiement

L'application peut être déployée sur différentes plateformes, notamment Vercel, Netlify ou Cloudflare Pages.

### Déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un.
2. Connectez votre dépôt GitHub à Vercel.
3. Configurez les variables d'environnement nécessaires.
4. Déployez l'application.

### Déploiement sur Netlify

1. Créez un compte sur [Netlify](https://netlify.com) si vous n'en avez pas déjà un.
2. Connectez votre dépôt GitHub à Netlify.
3. Configurez les paramètres de build :
   - Build command : `npm run build`
   - Publish directory : `.next`
4. Déployez l'application.

### Déploiement sur Cloudflare Pages

1. Créez un compte sur [Cloudflare](https://cloudflare.com) si vous n'en avez pas déjà un.
2. Connectez votre dépôt GitHub à Cloudflare Pages.
3. Configurez les paramètres de build :
   - Build command : `npm run build`
   - Build output directory : `.next`
4. Déployez l'application.

## Maintenance et évolution

### Mises à jour

Pour mettre à jour les dépendances de l'application, exécutez :

```bash
npm update
# ou
pnpm update
```

### Ajout de fonctionnalités

Voici quelques idées pour faire évoluer l'application :

- **Authentification** : Ajouter un système d'authentification pour permettre aux utilisateurs de sauvegarder leur progression.
- **Projets pratiques** : Ajouter des projets pratiques plus complexes pour appliquer les connaissances acquises.
- **Communauté** : Ajouter des fonctionnalités sociales pour permettre aux utilisateurs de partager leur progression et de s'entraider.
- **Contenu premium** : Ajouter du contenu premium accessible via un abonnement.
- **Intégration avec GitHub** : Permettre aux utilisateurs de sauvegarder leurs projets sur GitHub.

### Tests

Pour exécuter les tests, utilisez la commande :

```bash
npm test
# ou
pnpm test
```

Les tests sont organisés dans le dossier `src/tests/` et utilisent Vitest et React Testing Library.
