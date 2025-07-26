# Gestion Multi-Store des Produits

## Vue d'ensemble

Cette application e-commerce dispose d'une architecture multi-store sophistiquée qui permet la gestion de plusieurs boutiques avec des abonnements différents et une gestion flexible des produits et attributs.

## Architecture Multi-Store

### Structure des Stores
- Chaque store a un propriétaire (`owner`)
- Système d'abonnements avec différents plans (free, basic, premium, enterprise)
- Chaque store peut avoir ses propres catégories
- Les produits sont liés à un store spécifique

### Gestion des Catégories
- Les catégories sont gérées au niveau du store
- Chaque store peut définir ses propres catégories
- API: `/api/categories?storeId={storeId}&status=active`

## Système d'Attributs Dual

### 1. Attributs Prédéfinis (Système Principal)
**Localisation**: `src/app/e-commerce/attributes/page.tsx` et `src/app/e-commerce/add-product/page.tsx`

**Fonctionnalités**:
- Gestion centralisée des attributs par catégorie
- Interface d'administration pour créer/modifier les attributs
- Sélection via des composants `Select` dans le formulaire de produit
- Cohérence garantie entre les produits

**Utilisation**:
```typescript
// Les attributs sont filtrés par catégorie
attributes.filter(attr => attr.category === selectedCategory)
```

### 2. Variantes Manuelles (Système Rapide)
**Localisation**: `src/components/modals/ProductCreationModal.tsx`

**Fonctionnalités**:
- Saisie directe pour couleur, taille, matériau
- Création rapide sans configuration préalable
- Flexibilité pour des cas spécifiques

**Structure**:
```typescript
variant: {
  color: string;
  size: string;
  material: string;
}
```

## Nouveau Système Unifié (ProductCreationModal)

### Fonctionnalités Intégrées

1. **Sélection de Store**
   - Liste déroulante des stores accessibles selon l'abonnement
   - Affichage du plan d'abonnement
   - Rechargement automatique des catégories lors du changement

2. **Gestion des Catégories par Store**
   - Chargement dynamique des catégories selon le store sélectionné
   - Validation obligatoire de la catégorie

3. **Système d'Attributs Hybride**
   - **Attributs prédéfinis**: Chargés automatiquement selon la catégorie
   - **Attributs personnalisés**: Création à la volée via bouton "Ajouter attribut"
   - Suppression des attributs personnalisés
   - Distinction visuelle entre les deux types

### Structure des Données

```typescript
interface ProductData {
  // ... autres champs
  store: string;              // ID du store sélectionné
  category: string;           // ID de la catégorie
  attributes: Record<string, string>; // Attributs dynamiques
  variant: {                  // Variantes manuelles (conservées)
    color: string;
    size: string;
    material: string;
  };
}
```

### Flux de Travail

1. **Sélection du Store**
   ```typescript
   handleStoreChange(store) {
     setSelectedStore(store);
     loadCategories(store._id);
     resetProductData();
   }
   ```

2. **Chargement des Catégories**
   ```typescript
   loadCategories(storeId) {
     fetch(`/api/categories?storeId=${storeId}&status=active`)
   }
   ```

3. **Gestion des Attributs**
   ```typescript
   // Attributs prédéfinis
   attributes.filter(attr => attr.category === productData.category)
   
   // Attributs personnalisés
   handleAttributeChange(category, value) {
     setProductData(prev => ({
       ...prev,
       attributes: { ...prev.attributes, [category]: value }
     }));
   }
   ```

## Avantages de cette Approche

### Flexibilité
- **Cohérence**: Utilisation d'attributs prédéfinis pour la standardisation
- **Rapidité**: Création d'attributs personnalisés pour des besoins spécifiques
- **Évolutivité**: Possibilité d'ajouter de nouveaux types d'attributs

### Gestion Multi-Store
- **Isolation**: Chaque store gère ses propres catégories
- **Abonnements**: Respect des limites selon le plan d'abonnement
- **Scalabilité**: Architecture prête pour de nombreux stores

### Expérience Utilisateur
- **Guidage**: Sélection obligatoire du store et de la catégorie
- **Feedback**: Messages d'erreur explicites
- **Efficacité**: Interface unifiée pour tous les types d'attributs

## APIs Utilisées

- `GET /api/categories?storeId={id}&status=active` - Catégories par store
- `GET /api/attributes?status=active` - Attributs prédéfinis
- `POST /api/products` - Création de produit avec store et attributs

## Validation

```typescript
// Champs obligatoires
if (!productData.title || !productData.price || !productData.store || !productData.category) {
  // Erreur de validation
}
```

## Migration et Compatibilité

Le système conserve la compatibilité avec:
- Les variantes manuelles existantes (color, size, material)
- Les produits créés avec l'ancien système
- Les attributs prédéfinis du système principal

Cette architecture permet une transition en douceur tout en offrant une expérience utilisateur améliorée et une gestion plus sophistiquée des produits multi-store.