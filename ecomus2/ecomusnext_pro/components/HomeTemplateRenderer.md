# HomeTemplateRenderer - Documentation

## Vue d'ensemble

Le composant `HomeTemplateRenderer` est un système de rendu dynamique de templates pour les pages d'accueil. Il a été entièrement refactorisé pour améliorer la qualité du code, les performances et la maintenabilité.

## Améliorations apportées

### 🔧 Types et TypeScript

- **Types stricts** : Utilisation de `const assertions` et types union pour une sécurité de type maximale
- **Interfaces complètes** : Définition précise de toutes les props et états
- **Type guards** : Fonction `isValidTemplate()` pour la validation de types à l'exécution

```typescript
type TemplateId = typeof AVAILABLE_TEMPLATES[number];

interface HomeTemplateProps {
  storeSlug?: string;
  templateId?: TemplateId;
  vitrineConfig?: VitrineConfig;
  fallbackTemplate?: TemplateId;
}
```

### ⚡ Performance et Optimisation

- **Memoization** : Utilisation de `React.memo`, `useMemo` et `useCallback`
- **Cache de templates** : Système de cache pour éviter les rechargements
- **Lazy loading optimisé** : Chargement différé avec fallback intelligent
- **Props optimisées** : Calcul memoïsé des props pour éviter les re-renders

```typescript
const templateCache = new Map<TemplateId, React.ComponentType<any>>();

const templateProps: TemplateComponentProps = useMemo(() => ({
  ...(storeData && { store: storeData }),
  ...(vitrineConfig && { vitrineConfig }),
  templateId,
  isStore: !!storeSlug,
  isVitrine: !!vitrineConfig
}), [storeData, vitrineConfig, templateId, storeSlug]);
```

### 🛡️ Gestion d'erreurs robuste

- **Fallback en cascade** : Template par défaut → Template de fallback → Erreur
- **Logger structuré** : Système de logging pour le développement et la production
- **Retry automatique** : Possibilité de réessayer en cas d'échec
- **Messages d'erreur contextuels** : Erreurs spécifiques selon le contexte

```typescript
const logger = {
  templateLoad: (templateId: TemplateId, success: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Template] ${success ? 'Loaded' : 'Failed'}: ${templateId}`);
    }
  },
  templateError: (templateId: TemplateId, error: Error) => {
    console.error(`[Template Error] ${templateId}:`, error);
  }
};
```

### ♿ Accessibilité (A11y)

- **Attributs ARIA** : `role`, `aria-label`, `aria-hidden` appropriés
- **Navigation clavier** : Support complet du clavier
- **Lecteurs d'écran** : Annonces contextuelles pour les états de chargement
- **Focus management** : Gestion du focus pour les interactions

```typescript
<div className="flex items-center justify-center min-h-screen" 
     role="status" 
     aria-label="Chargement du template">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
         aria-hidden="true" />
    <p className="text-gray-600">Chargement du template...</p>
  </div>
</div>
```

### 🎣 Hooks personnalisés

- **useTemplateLogic** : Logique métier centralisée
- **useTemplate** : Hook réutilisable pour charger des templates
- **Séparation des responsabilités** : UI, logique et état séparés

```typescript
const useTemplateLogic = ({
  storeSlug,
  propTemplateId,
  fallbackTemplate = DEFAULT_TEMPLATE
}) => {
  // Logique centralisée...
  return {
    storeData,
    storeLoading,
    storeError,
    refetch,
    templateId,
    TemplateComponent
  };
};
```

### 🔧 Utilitaires avancés

- **Normalisation d'ID** : Conversion automatique `home-01` → `home-1`
- **Mapping de thèmes** : Association thèmes → templates
- **Catégorisation** : Groupement des templates par catégorie
- **Validation** : Vérification de l'existence des templates

## Utilisation

### Utilisation de base

```typescript
// Template par défaut
<HomeTemplateRenderer />

// Avec une boutique spécifique
<HomeTemplateRenderer storeSlug="ma-boutique" />

// Avec un template forcé
<HomeTemplateRenderer templateId="home-electronic" />

// Avec configuration de vitrine
<HomeTemplateRenderer 
  vitrineConfig={{
    theme: 'modern',
    customization: { primaryColor: '#ff6b6b' },
    features: ['cart', 'wishlist']
  }} 
/>
```

### Hook useTemplate

```typescript
function MonComposant() {
  const { Component, loading, error, retry } = useTemplate('home-fashion');
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error} <button onClick={retry}>Réessayer</button></div>;
  if (!Component) return null;
  
  return <Component />;
}
```

### Utilitaires

```typescript
// Lister tous les templates
const templates = getAvailableTemplates();

// Vérifier la validité d'un template
if (isValidTemplate('home-1')) {
  // Template valide
}

// Grouper par catégorie
const categories = getTemplatesByCategory();
console.log(categories.Fashion); // ['home-fashion', 'home-men', ...]
```

## Architecture

### Structure des fichiers

```
components/
├── HomeTemplateRenderer.tsx     # Composant principal
├── HomeTemplateRenderer.md      # Documentation
├── __tests__/
│   └── HomeTemplateRenderer.test.tsx  # Tests unitaires
└── homes/
    ├── home-1/
    ├── home-electronic/
    └── ...
```

### Flux de données

1. **Props** → Validation et normalisation
2. **Store Hook** → Récupération des données boutique
3. **Template Logic** → Détermination du template à utiliser
4. **Cache Check** → Vérification du cache de templates
5. **Dynamic Import** → Chargement lazy du composant
6. **Render** → Rendu avec fallback et gestion d'erreurs

## Tests

Le composant est entièrement testé avec :

- **Tests unitaires** : Logique métier et utilitaires
- **Tests d'intégration** : Interaction entre composants
- **Tests d'accessibilité** : Conformité A11y
- **Tests de performance** : Memoization et optimisations

```bash
# Lancer les tests
npm test HomeTemplateRenderer

# Tests avec couverture
npm test -- --coverage HomeTemplateRenderer
```

## Bonnes pratiques

### Performance

- Utilisez `templateId` pour forcer un template spécifique
- Évitez de changer `vitrineConfig` fréquemment
- Préférez la memoization pour les props complexes

### Accessibilité

- Testez avec un lecteur d'écran
- Vérifiez la navigation au clavier
- Utilisez des couleurs contrastées

### Maintenance

- Ajoutez de nouveaux templates dans `AVAILABLE_TEMPLATES`
- Mettez à jour les mappings de thèmes si nécessaire
- Documentez les nouveaux templates

## Migration depuis l'ancienne version

### Changements breaking

1. **Types stricts** : `templateId` doit être un `TemplateId` valide
2. **Props renommées** : Certaines props ont été renommées pour plus de clarté
3. **Fallback amélioré** : Le système de fallback est plus robuste

### Guide de migration

```typescript
// Avant
<HomeTemplateRenderer templateId="home-01" />

// Après (automatiquement normalisé)
<HomeTemplateRenderer templateId="home-1" />

// Avant
<HomeTemplateRenderer fallback="home-default" />

// Après
<HomeTemplateRenderer fallbackTemplate="home-1" />
```

## Contribution

Pour contribuer au composant :

1. Ajoutez des tests pour toute nouvelle fonctionnalité
2. Respectez les types TypeScript stricts
3. Documentez les changements dans ce fichier
4. Vérifiez l'accessibilité des nouveaux composants
5. Testez les performances avec de gros datasets

## Roadmap

- [ ] Support des templates dynamiques depuis une API
- [ ] Système de thèmes avancé
- [ ] Prévisualisation en temps réel
- [ ] Analytics et métriques de performance
- [ ] Support des Progressive Web Apps (PWA)