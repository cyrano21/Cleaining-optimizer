# NextMimo - Application d'apprentissage Next.js interactive et gamifiée

Cette application est une plateforme d'apprentissage interactive et gamifiée pour Next.js, inspirée par Mimo. Elle permet aux utilisateurs d'apprendre Next.js de manière engageante, du niveau débutant au niveau expert, tout en construisant un portfolio professionnel.

## Table des matières
1. [Fonctionnalités principales](#fonctionnalités-principales)
2. [Structure de l'application](#structure-de-lapplication)
3. [Routes et pages](#routes-et-pages)
4. [Modules d'apprentissage](#modules-dapprentissage)
5. [Système de gamification](#système-de-gamification)
6. [Fonctionnalités IA](#fonctionnalités-ia)
7. [Composants UI](#composants-ui)
8. [API et services backend](#api-et-services-backend)
9. [Déploiement](#déploiement)

## Fonctionnalités principales

- **Visualisation du code en temps réel** : Possibilité de voir immédiatement le résultat du code pendant les exercices
- **Parcours d'apprentissage progressif** : Contenus adaptés du niveau débutant au niveau expert
- **Système de gamification** : Points XP, badges, niveaux et récompenses pour maintenir la motivation
- **Générateur de portfolio** : Création automatique d'un portfolio à partir des projets réalisés pendant l'apprentissage
- **Section d'administration** : Interface pour créer et gérer différents types de cours
- **Interface moderne et intuitive** : Design responsive inspiré par Mimo
- **Système d'authentification** : Gestion des profils utilisateurs et des permissions
- **Assistant IA** : Aide contextuelle et recommandations personnalisées

## Structure de l'application

L'application suit l'architecture recommandée par Next.js avec l'App Router :

```
src/
├── app/                    # Pages de l'application (App Router)
│   ├── admin/              # Administration des cours
│   ├── api/                # API Routes
│   ├── dashboard/          # Tableau de bord utilisateur
│   ├── exercises/          # Exercices pratiques
│   ├── javascript/         # Leçons JavaScript
│   ├── javascript-fundamentals/  # Fondamentaux JavaScript
│   ├── learning-path/      # Parcours d'apprentissage
│   ├── lessons/            # Leçons et modules
│   │   └── module/         
│   │       └── [moduleId]/ # Détail d'un module
│   │           └── lesson/ # Leçons d'un module
│   ├── login/              # Authentification
│   ├── portfolio/          # Générateur de portfolio
│   ├── profile/            # Profil utilisateur
│   ├── react-fundamentals/ # Fondamentaux React
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil
│
├── components/             # Composants réutilisables
│   ├── admin/              # Composants d'administration
│   ├── auth/               # Authentification
│   ├── dashboard/          # Tableau de bord
│   ├── editor/             # Éditeur de code
│   ├── gamification/       # Système de points et badges
│   ├── javascript/         # Composants spécifiques JavaScript
│   ├── layouts/            # Layouts réutilisables
│   ├── learning/           # Composants d'apprentissage
│   │   └── AIAssistant.js  # Assistant IA
│   ├── lessons/            # Gestion des leçons
│   ├── portfolio/          # Composants de portfolio
│   ├── profile/            # Gestion du profil
│   └── ui/                 # Composants UI génériques
│
├── contexts/               # Contextes React
├── hooks/                  # Hooks personnalisés
├── lib/                    # Fonctions utilitaires
└── tests/                  # Tests unitaires
```

## Routes et pages

L'application utilise les routes suivantes :

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec introduction à la plateforme |
| `/login` | Authentification utilisateur |
| `/dashboard` | Tableau de bord personnel avec progression et recommandations |
| `/learning-path` | Vue d'ensemble du parcours d'apprentissage |
| `/lessons` | Liste de tous les modules disponibles |
| `/lessons/module/[moduleId]` | Détail d'un module de cours spécifique |
| `/lessons/module/[moduleId]/lesson/[lessonId]` | Contenu d'une leçon spécifique |
| `/javascript-fundamentals` | Cours sur les fondamentaux JavaScript |
| `/react-fundamentals` | Cours sur les fondamentaux React |
| `/exercises` | Exercices pratiques à réaliser |
| `/portfolio` | Générateur et éditeur de portfolio |
| `/profile` | Profil utilisateur et paramètres |
| `/admin` | Interface d'administration (réservée) |

### API Routes

| Route API | Description |
|-----------|-------------|
| `/api/ai-assistant/analyze` | Analyse des requêtes par l'assistant IA |
| `/api/analyze-code` | Analyse de code pour feedback automatique |
| `/api/tech-radar` | Tendances technologiques |
| `/api/modules` | Liste des modules disponibles |
| `/api/modules/[moduleId]` | Informations sur un module spécifique |
| `/api/portfolio` | Gestion des données de portfolio |
| `/api/profile` | Gestion du profil utilisateur |
| `/api/user-projects` | Projets créés par l'utilisateur |

## Modules d'apprentissage

L'application propose plusieurs modules d'apprentissage :

### 1. Introduction à Next.js
- Qu'est-ce que Next.js
- Avantages de Next.js par rapport à React
- Installation et configuration

### 2. Fondamentaux de Next.js
- Structure des fichiers et dossiers
- Système de routage
- Pages et composants
- Data fetching (getStaticProps, getServerSideProps)

### 3. Fondamentaux de JavaScript
- Variables et types
- Fonctions
- Objets et tableaux
- Asynchrone et Promesses
- Fonctionnalités ES6+

### 4. Fondamentaux de React
- Components et Props
- State et Cycle de vie
- Gestion des événements
- Listes et clés

### 5. Fonctionnalités Avancées Next.js
- API Routes
- Middleware
- Optimisation des images
- Internationalisation

### 6. Patterns React avancés
- Compound Components
- Render Props
- Hooks personnalisés

### 7. Tests
- Tests unitaires
- Tests d'intégration
- Tests E2E

## Système de gamification

Le système de gamification comprend :

### Points XP et Niveaux
- Points attribués pour chaque leçon complétée
- Points bonus pour réussite rapide ou sans erreur
- Niveaux de compétence débloqués avec les points

### Badges et Récompenses
- Badges pour les jalons atteints
- Badges de compétence spécifiques
- Déblocage de contenus exclusifs

### Suivi de Progression
- Tableau de bord visuel de progression
- Statistiques d'apprentissage
- Calendrier de constance (streaks)

## Fonctionnalités IA

L'application intègre plusieurs fonctionnalités d'intelligence artificielle :

### Assistant d'apprentissage IA
- Dialogue conversationnel pour répondre aux questions
- Accessible depuis toutes les pages via un bouton flottant
- Aide contextuelle basée sur la leçon actuelle

### Analyse de code
- Vérification automatique des exercices
- Suggestions d'amélioration du code
- Détection des erreurs et anti-patterns

### Recommandations personnalisées
- Suggestions de leçons basées sur les performances
- Identification des points faibles à travailler
- Adaptation du parcours d'apprentissage

### Tech Radar
- Veille technologique automatisée
- Recommandations de technologies à explorer
- Mise en évidence des tendances du marché

## Composants UI

L'application utilise un ensemble riche de composants UI personnalisés :

- **Éditeur de code** : Monaco Editor avec coloration syntaxique
- **Playground de code** : Environnement d'exécution sécurisé avec prévisualisation
- **Système de cartes** : Pour les modules, leçons et badges
- **Tableaux de bord** : Visualisation de la progression
- **Composants d'exercices** : Interface pour tester les connaissances
- **Composants de quiz** : Questions à choix multiples interactives
- **Constructeur de portfolio** : Interface drag-and-drop
- **Interface administrateur** : Pour la gestion des cours

## API et services backend

### Authentification
- Gestion des sessions utilisateurs
- Protection des routes sensibles
- Niveaux de permission (admin, instructeur, apprenant)

### Stockage des données
- Progression des utilisateurs
- Projets réalisés
- Badges et récompenses obtenues
- Contenus des cours

### API externes
- Intégration avec des services d'IA
- Récupération de données pour le Tech Radar
- Stockage des projets (GitHub integration)

## Déploiement

L'application est configurée pour un déploiement facile sur :
- Replit pour le développement et les tests
- Services Replit pour la production

Paramètres de déploiement :
- Serveur Node.js
- Port 3005 pour le développement
- Build optimisé pour la production