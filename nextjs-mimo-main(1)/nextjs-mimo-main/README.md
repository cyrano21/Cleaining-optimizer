# NextMimo - Application d'apprentissage Next.js interactive et gamifiée

Cette application est une plateforme d'apprentissage interactive et gamifiée pour Next.js, inspirée par Mimo. Elle permet aux utilisateurs d'apprendre Next.js de manière engageante, du niveau débutant au niveau expert, tout en construisant un portfolio professionnel.

## Fonctionnalités principales

- **Visualisation du code en temps réel** : Voir immédiatement le résultat du code pendant les exercices
- **Parcours d'apprentissage progressif** : Du niveau débutant au niveau expert
- **Système de gamification** : Points XP, badges, niveaux et récompenses
- **Générateur de portfolio** : Création automatique d'un portfolio à partir des projets réalisés
- **Section d'administration** : Création et gestion de différents types de cours
- **Interface moderne et intuitive** : Design responsive inspiré par Mimo
- **Système d'authentification** : Gestion des profils utilisateurs et des permissions

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :
```bash
npm install
```
3. Créez un fichier `.env.local` basé sur `.env.example`
4. Lancez le serveur de développement :
```bash
npm run dev
```

## Identifiants de connexion

Pour accéder à la section d'administration, utilisez les identifiants suivants :
- Email : louiscyrano@gmail.com
- Mot de passe : Figoro21

## Structure du projet

- `/src/app` - Pages Next.js (architecture app/)
- `/src/components` - Composants réutilisables
- `/src/contexts` - Contextes React (Auth, Gamification)
- `/src/hooks` - Hooks personnalisés
- `/docs` - Documentation complète

## Technologies utilisées

- Next.js (app router)
- React
- Tailwind CSS
- Framer Motion
- Context API

## Licence

MIT
