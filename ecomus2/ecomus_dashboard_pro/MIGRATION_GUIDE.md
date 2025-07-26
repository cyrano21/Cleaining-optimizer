# Guide de Migration des Collections - Système Dynamique

## 🎯 Objectif

Ce guide vous accompagne dans la migration de votre système de collections statiques vers un système dynamique complet, connecté à la base de données MongoDB avec gestion via le dashboard administrateur.

## 📋 Résumé des Changements

### ✅ Fichiers Créés

1. **Composants Partagés**
   - `components/shared/DynamicCollections.tsx` - Composant principal pour les collections dynamiques
   - `hooks/useCollections.ts` - Hook personnalisé pour la gestion des collections

2. **Pages Dashboard**
   - `app/dashboard/collections/page.tsx` - Liste et gestion des collections
   - `app/dashboard/collections/new/page.tsx` - Création de nouvelles collections
   - `app/dashboard/collections/[id]/edit/page.tsx` - Édition des collections

3. **API Routes**
   - `src/app/api/collections/[id]/route.ts` - API pour CRUD des collections individuelles

4. **Scripts et Configuration**
   - `scripts/migrate-collections.js` - Migration des données statiques vers MongoDB
   - `scripts/update-collection-components.js` - Mise à jour automatique des composants
   - `config/collections.js` - Configuration globale des collections

5. **Exemples de Composants Dynamiques**
   - `components/homes/home-headphone/DynamicCollections.tsx` - Exemple pour les casques

## 🚀 Étapes de Migration

### Étape 1: Préparation de l'Environnement

```bash
# Assurez-vous que MongoDB est configuré dans .env.local
MONGODB_URI=mongodb://localhost:27017/ecomus
# ou votre URI MongoDB Atlas

# Installez les dépendances si nécessaire
npm install
```

### Étape 2: Migration des Données

```bash
# Exécuter la migration des données statiques vers MongoDB
node scripts/migrate-collections.js

# Pour nettoyer et recréer toutes les collections (optionnel)
node scripts/migrate-collections.js --clean
```

Cette étape va :
- Créer les catégories de base (headphones, electronics, furniture, plants, etc.)
- Créer les magasins de base
- Migrer les collections statiques vers la base de données

### Étape 3: Mise à Jour des Composants (Optionnel)

```bash
# Mise à jour automatique des composants existants
node scripts/update-collection-components.js
```

⚠️ **Attention**: Ce script modifie vos fichiers existants. Des sauvegardes sont créées automatiquement.

### Étape 4: Vérification

1. **Démarrez votre serveur**
   ```bash
   npm run dev
   ```

2. **Vérifiez le Dashboard**
   - Allez sur `/dashboard/collections`
   - Vérifiez que les collections migrées apparaissent
   - Testez la création d'une nouvelle collection

3. **Vérifiez les Pages d'Accueil**
   - Visitez les différentes pages d'accueil
   - Vérifiez que les collections s'affichent correctement

## 🏗️ Architecture du Système

### Composant DynamicCollections

Le composant principal `DynamicCollections` accepte une configuration flexible :

```typescript
interface CollectionConfig {
  category?: string;        // Filtrer par catégorie
  store?: string;          // Filtrer par magasin
  featured?: boolean;      // Afficher uniquement les collections vedettes
  limit?: number;          // Nombre maximum de collections
  layout?: 'grid' | 'carousel' | 'masonry' | 'list';
  variant?: string;        // Style visuel
}
```

### Hook useCollections

Fournit toutes les fonctionnalités CRUD :

```typescript
const {
  collections,
  loading,
  error,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleActive,
  toggleFeatured
} = useCollections(filters);
```

## 📝 Configuration par Home

### Configurations Prédéfinies

| Home | Catégorie | Variante | Layout | Limite | Vedette |
|------|-----------|----------|--------|--------|---------|
| home-headphone | headphones | electronics | carousel | 6 | ✅ |
| home-electronic | electronics | electronics | grid | 8 | ✅ |
| home-furniture-02 | furniture | furniture | grid | 6 | ✅ |
| home-plant | plants | nature | carousel | 4 | ✅ |
| home-pod-store | electronics | electronics | carousel | 5 | ✅ |
| home-5 | fashion | fashion | grid | 6 | ✅ |
| home-book-store | books | minimal | grid | 8 | ✅ |
| home-gaming-accessories | gaming | gaming | carousel | 6 | ✅ |

### Personnalisation

Modifiez `config/collections.js` pour ajuster les configurations :

```javascript
export const collectionsConfig = {
  'home-headphone': {
    category: 'headphones',
    variant: 'electronics',
    layout: 'carousel',
    limit: 6,
    featured: true
  },
  // ... autres configurations
};
```

## 🎨 Variantes de Style

Le système supporte plusieurs variantes visuelles :

- **default** - Style standard
- **electronics** - Thème bleu pour l'électronique
- **fashion** - Thème rose pour la mode
- **furniture** - Thème ambre pour les meubles
- **nature** - Thème vert pour les plantes
- **minimal** - Style épuré
- **gaming** - Thème violet pour le gaming
- **luxury** - Thème doré pour le luxe

## 🔧 Utilisation Manuelle

### Remplacer un Composant Existant

```jsx
// Ancien composant statique
import { collections3 } from '@/data/categories';

// Nouveau composant dynamique
import DynamicCollections from '@/components/shared/DynamicCollections';

const MyCollections = () => {
  return (
    <DynamicCollections
      config={{
        category: 'electronics',
        featured: true,
        limit: 6,
        layout: 'carousel',
        variant: 'electronics'
      }}
    />
  );
};
```

### Avec Rendu Personnalisé

```jsx
const CustomRenderer = ({ collections, isLoading, error }) => {
  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <div className="my-custom-layout">
      {collections.map(collection => (
        <div key={collection._id} className="my-collection-item">
          <h3>{collection.title}</h3>
          <p>{collection.description}</p>
        </div>
      ))}
    </div>
  );
};

const MyCollections = () => {
  return (
    <DynamicCollections
      config={{ category: 'electronics' }}
      customRenderer={CustomRenderer}
    />
  );
};
```

## 📊 Gestion via Dashboard

### Créer une Collection

1. Allez sur `/dashboard/collections`
2. Cliquez sur "Nouvelle Collection"
3. Remplissez les informations :
   - **Informations de base** : titre, description, images
   - **Produits** : associez des produits existants
   - **SEO** : métadonnées pour le référencement
   - **Configuration** : statut, vedette, catégorie, magasin

### Modifier une Collection

1. Dans la liste des collections, cliquez sur "Modifier"
2. Mettez à jour les informations nécessaires
3. Sauvegardez les changements

### Actions Rapides

- **Activer/Désactiver** : Contrôle la visibilité publique
- **Mettre en vedette** : Affiche dans les sections "featured"
- **Supprimer** : Suppression définitive (avec confirmation)

## 🔄 Système de Fallback

Chaque composant dynamique inclut un système de fallback :

1. **Chargement** : Affichage de squelettes pendant le chargement
2. **Erreur** : Retour automatique aux données statiques
3. **Vide** : Affichage d'un message ou de contenu par défaut

## 🐛 Dépannage

### Collections ne s'affichent pas

1. **Vérifiez la connexion MongoDB**
   ```bash
   # Testez la connexion
   node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(console.error)"
   ```

2. **Vérifiez les collections dans la base**
   - Connectez-vous au dashboard
   - Allez sur `/dashboard/collections`
   - Vérifiez que les collections existent et sont actives

3. **Vérifiez la configuration**
   - Assurez-vous que la catégorie existe
   - Vérifiez les filtres (featured, active)

### Erreurs de compilation

1. **Imports manquants**
   ```bash
   npm install
   ```

2. **Types TypeScript**
   - Vérifiez que tous les types sont correctement importés
   - Redémarrez le serveur TypeScript

### Performance

1. **Pagination** : Utilisez la limite appropriée
2. **Cache** : Les données sont mises en cache côté client
3. **Images** : Optimisez les images des collections

## 🔙 Rollback

### Restaurer les Composants Statiques

```bash
# Si vous avez utilisé le script de mise à jour automatique
find components/homes -name "*.backup.jsx" -exec sh -c 'mv "$1" "${1%.backup.jsx}.jsx"' _ {} \;
```

### Supprimer les Collections Dynamiques

```bash
# Supprimer les collections de la base de données
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => require('./src/models/Collection').deleteMany({})).then(() => process.exit())"
```

## 📈 Optimisations Futures

### Performance
- Mise en cache Redis
- Optimisation des images
- Lazy loading

### Fonctionnalités
- Collections personnalisées par utilisateur
- A/B testing des collections
- Analytics des collections

### SEO
- Sitemap automatique
- Structured data
- Meta tags dynamiques

## 🆘 Support

En cas de problème :

1. **Consultez les logs** de la console navigateur et serveur
2. **Vérifiez la base de données** via le dashboard
3. **Testez les API** directement (`/api/collections`)
4. **Utilisez les fallbacks** en cas d'urgence

---

**✅ Migration terminée avec succès !**

Votre système de collections est maintenant entièrement dynamique et gérable via le dashboard administrateur.