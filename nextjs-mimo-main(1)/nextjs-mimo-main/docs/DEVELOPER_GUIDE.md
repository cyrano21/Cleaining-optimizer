# Guide de développement - Application d'Apprentissage Next.js

Ce guide est destiné aux développeurs qui souhaitent contribuer à l'application d'apprentissage Next.js interactive et gamifiée. Il fournit des informations techniques sur la structure du code, les conventions et les bonnes pratiques à suivre.

## Configuration de l'environnement de développement

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

## Structure du code

### Conventions de nommage

- Les noms de fichiers pour les composants React utilisent le PascalCase (ex: `Button.js`)
- Les noms de fichiers pour les utilitaires utilisent le camelCase (ex: `formatDate.js`)
- Les noms de dossiers utilisent le camelCase (ex: `components/ui`)

### Organisation des imports

Organisez vos imports dans cet ordre :
1. Imports de bibliothèques externes (React, Next.js, etc.)
2. Imports de composants internes
3. Imports d'utilitaires et de hooks
4. Imports de styles

Exemple :
```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Button from '../ui/Button';
import Card from '../ui/Card';

import { useGamification } from '../../hooks/useGamification';
import { formatDate } from '../../utils/formatDate';

import styles from './Component.module.css';
```

## Composants

### Composants client vs serveur

- Tous les composants qui utilisent des hooks React doivent être marqués avec la directive `"use client"` en haut du fichier
- Les composants serveur ne doivent pas utiliser de hooks React ou d'état local
- Utilisez le chargement dynamique (`next/dynamic`) pour les composants client complexes

### Création de nouveaux composants

Lors de la création d'un nouveau composant :
1. Créez un fichier dans le dossier approprié (ui, lessons, gamification, etc.)
2. Exportez le composant comme export par défaut
3. Documentez les props avec des commentaires JSDoc
4. Assurez-vous que le composant est responsive

Exemple :
```javascript
"use client";

import { useState } from 'react';

/**
 * Composant de carte pour afficher du contenu structuré
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Le titre de la carte
 * @param {React.ReactNode} props.children - Le contenu de la carte
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {React.ReactNode} [props.footer] - Contenu du pied de la carte
 * @param {boolean} [props.bordered=false] - Si la carte doit avoir une bordure colorée
 */
export default function Card({ 
  title, 
  children, 
  className = '', 
  footer = null,
  bordered = false,
  ...props 
}) {
  // Implémentation du composant
}
```

## Système de gamification

### Ajout de nouvelles fonctionnalités de gamification

Pour ajouter une nouvelle fonctionnalité de gamification :
1. Modifiez le fichier `GamificationContext.js` pour ajouter la logique nécessaire
2. Créez un nouveau composant dans le dossier `gamification` si nécessaire
3. Mettez à jour les composants existants pour utiliser la nouvelle fonctionnalité

### Ajout de nouveaux badges

Pour ajouter un nouveau badge :
1. Ajoutez le badge à la liste `availableBadges` dans `GamificationContext.js`
2. Définissez les conditions pour débloquer le badge
3. Implémentez la logique de vérification dans les fonctions appropriées

## Leçons et contenu éducatif

### Structure des leçons

Chaque leçon doit suivre cette structure :
1. Introduction théorique
2. Exemple pratique
3. Exercice interactif
4. Quiz de vérification

### Ajout de nouvelles leçons

Pour ajouter une nouvelle leçon :
1. Créez un nouveau dossier dans `src/app/lessons/module/[moduleId]/lesson/[lessonId]`
2. Créez un fichier `page.js` avec le contenu de la leçon
3. Ajoutez la leçon à la liste des leçons disponibles

## Tests

### Tests unitaires

Les tests unitaires utilisent Vitest et React Testing Library. Pour créer un nouveau test :
1. Créez un fichier dans le dossier `src/tests` avec le nom du composant suivi de `.test.js`
2. Importez les fonctions nécessaires de Vitest et React Testing Library
3. Écrivez des tests qui vérifient le comportement attendu du composant

Exemple :
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with primary variant', () => {
    render(<Button>Cliquez-moi</Button>);
    const button = screen.getByText('Cliquez-moi');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-600');
  });
});
```

### Tests d'utilisabilité

Les tests d'utilisabilité simulent le parcours utilisateur à travers l'application. Pour créer un nouveau test d'utilisabilité :
1. Créez un fichier dans le dossier `src/tests` avec un nom descriptif suivi de `.js`
2. Simulez le parcours utilisateur en utilisant React Testing Library
3. Vérifiez que l'utilisateur peut accomplir les tâches attendues

## Déploiement

### Processus de déploiement

1. Assurez-vous que tous les tests passent : `npm test`
2. Construisez l'application : `npm run build`
3. Vérifiez que l'application fonctionne correctement en local : `npm run start`
4. Déployez l'application sur la plateforme de votre choix (Vercel, Netlify, Cloudflare Pages)

### Variables d'environnement

Si vous ajoutez des fonctionnalités qui nécessitent des variables d'environnement :
1. Ajoutez les variables dans un fichier `.env.local` pour le développement
2. Documentez les variables dans ce guide
3. Assurez-vous que les variables sont configurées sur la plateforme de déploiement

## Bonnes pratiques

- Utilisez les composants UI existants plutôt que de créer de nouveaux composants similaires
- Suivez les principes de conception responsive pour assurer une bonne expérience sur tous les appareils
- Optimisez les performances en utilisant le chargement dynamique pour les composants lourds
- Documentez votre code avec des commentaires JSDoc
- Écrivez des tests pour toutes les nouvelles fonctionnalités
- Suivez les conventions de style de code établies
