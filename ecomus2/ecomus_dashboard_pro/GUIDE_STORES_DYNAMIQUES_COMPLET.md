# GUIDE COMPLET - SYSTÈME STORES DYNAMIQUES

## 📋 Vue d'ensemble

Le système de transformation **homes → stores** permet de convertir chaque template "home" d'Ecomus en une "store" indépendante que les vendeurs peuvent demander, personnaliser et gérer via le dashboard admin.

## 🏗️ Architecture

### Frontend (ecomusnext-main/app/)
```
/stores/                    → Liste de toutes les stores actives
/stores/[category]/         → Stores filtrées par catégorie
/store/[slug]/              → Page dynamique de chaque store individuelle
```

### Backend (src/app/api/)
```
/api/stores/public/active/     → API publique: liste des stores actives
/api/stores/public/[slug]/     → API publique: données d'une store spécifique
/api/admin/stores/activate/    → Admin: activer/désactiver une store
/api/admin/stores/assign/      → Admin: assigner une store à un vendeur
/api/vendor/stores/request/    → Vendeur: demander une store
/api/vendor/stores/customize/  → Vendeur: personnaliser sa store
```

## 🚀 Utilisation

### Pour les Visiteurs

1. **Parcourir les stores** : Visitez `/stores` pour voir toutes les stores disponibles
2. **Filtrer par catégorie** : Utilisez `/stores/cosmetic`, `/stores/electronics`, etc.
3. **Visiter une store** : Cliquez sur une store ou allez à `/store/[slug]`

### Pour les Vendeurs

1. **Demander une store** :
   ```javascript
   POST /api/vendor/stores/request
   {
     "storeId": "store_id_from_list",
     "message": "Pourquoi je veux cette store"
   }
   ```

2. **Personnaliser sa store** (après approbation) :
   ```javascript
   POST /api/vendor/stores/customize
   {
     "storeId": "assigned_store_id",
     "customizations": {
       "colors": {
         "primary": "#ff6b35",
         "secondary": "#f7931e",
         "accent": "#2e8b57"
       },
       "branding": {
         "storeName": "Ma Boutique Cosmétique",
         "logo": "https://example.com/logo.png"
       },
       "layout": {
         "style": "modern",
         "headerType": "centered"
       }
     },
     "seo": {
       "title": "Ma Boutique Cosmétique - Les meilleurs produits",
       "description": "Découvrez notre sélection de cosmétiques naturels",
       "keywords": ["cosmétique", "beauté", "naturel"]
     }
   }
   ```

### Pour les Administrateurs

1. **Activer/Désactiver une store** :
   ```javascript
   POST /api/admin/stores/activate
   {
     "storeId": "store_id",
     "isActive": true,
     "reason": "Store validée et prête"
   }
   ```

2. **Assigner une store à un vendeur** :
   ```javascript
   POST /api/admin/stores/assign
   {
     "storeId": "store_id",
     "vendorId": "vendor_user_id",
     "reason": "Vendeur approuvé pour cette thématique"
   }
   ```

## 🎨 Personnalisation des Thèmes

### Structure des Customisations

```javascript
{
  "colors": {
    "primary": "#007bff",      // Couleur principale (boutons, liens)
    "secondary": "#6c757d",    // Couleur secondaire (textes, bordures)
    "accent": "#28a745"        // Couleur d'accent (highlights, badges)
  },
  "branding": {
    "storeName": "Ma Boutique",           // Nom affiché
    "logo": "https://example.com/logo.png", // URL du logo
    "favicon": "https://example.com/favicon.ico" // URL du favicon
  },
  "layout": {
    "style": "default|modern|minimal",    // Style général
    "headerType": "classic|centered|split", // Type d'en-tête
    "footerType": "simple|detailed|minimal" // Type de pied de page
  }
}
```

### Variables CSS Disponibles

Les couleurs personnalisées sont injectées comme variables CSS :
```css
:root {
  --store-primary: #007bff;
  --store-secondary: #6c757d;
  --store-accent: #28a745;
}

/* Utilisées dans les composants */
.btn-primary { background-color: var(--store-primary); }
.text-primary { color: var(--store-primary); }
.bg-primary { background-color: var(--store-primary); }
```

## 🔧 Configuration SEO

### Métadonnées Dynamiques

Chaque store peut avoir ses propres métadonnées SEO :
```javascript
{
  "seo": {
    "title": "Ma Boutique Cosmétique - Produits Naturels",
    "description": "Découvrez notre sélection de cosmétiques bio et naturels pour tous types de peau.",
    "keywords": ["cosmétique", "bio", "naturel", "beauté", "skincare"],
    "ogImage": "https://example.com/og-image.jpg"
  }
}
```

### URLs et Slugs

- **URL publique** : `https://yoursite.com/store/ma-boutique-cosmetique`
- **Slug** : Généré automatiquement depuis le nom (caractères spéciaux supprimés)
- **Redirection** : Les stores inactives redirigent vers `/stores`

## 📊 Analytics et Métriques

### Données Trackées Automatiquement

```javascript
{
  "analytics": {
    "visitorsCount": 1250,        // Nombre de visiteurs uniques
    "conversionRate": 3.2,        // Taux de conversion (%)
    "averageOrderValue": 45.50,   // Panier moyen (€)
    "topProducts": ["prod1", "prod2"] // IDs des produits populaires
  }
}
```

### Accès aux Métriques

- **Vendeur** : Peut voir ses propres métriques dans le dashboard
- **Admin** : Peut voir toutes les métriques de toutes les stores

## 🛠️ Développement

### Ajouter un Nouveau Template Home

1. **Créer le composant** dans `ecomusnext-main/app/(homes)/home-nouveau/page.jsx`

2. **Ajouter l'import** dans `ecomusnext-main/app/store/[slug]/page.tsx` :
   ```javascript
   const HomeNouveau = dynamic(() => import('../../(homes)/home-nouveau/page'), { ssr: false });
   ```

3. **Ajouter au mapping** :
   ```javascript
   const HOME_COMPONENTS = {
     'home-nouveau': HomeNouveau,
     '/home-nouveau': HomeNouveau,
     // ... autres mappings
   };
   ```

4. **Créer la store** dans la base de données :
   ```javascript
   {
     name: "Nouveau Template",
     slug: "nouveau-template",
     homeTheme: "nouveau",
     homeTemplate: "home-nouveau",
     homeName: "Nouveau Thème",
     homeDescription: "Description du nouveau thème",
     isActive: false // Sera activé par l'admin
   }
   ```

### Middleware Personnalisé

Le middleware gère automatiquement :
- ✅ Vérification de l'existence de la store
- ✅ Vérification du statut d'activation
- ✅ Cache des données stores (5 min TTL)
- ✅ Headers personnalisés pour le debugging
- ✅ Redirections intelligentes

## 🧪 Tests

### Test Automatique Complet
```bash
cd scripts
node test-stores-frontend-complete.js
```

### Test Manuel

1. **Base de données** :
   ```bash
   node scripts/check-existing-stores.js
   ```

2. **APIs** :
   ```bash
   curl http://localhost:3000/api/stores/public/active
   curl http://localhost:3000/api/stores/public/ma-boutique-cosmetique
   ```

3. **Frontend** :
   - Visitez `http://localhost:3000/stores`
   - Testez `http://localhost:3000/store/[slug-existant]`

## 🚨 Dépannage

### Erreurs Communes

#### "Store non trouvée"
- Vérifiez que le slug existe dans la base de données
- Vérifiez que `isActive: true`
- Vérifiez la connexion MongoDB

#### "Template non trouvé"
- Vérifiez que le composant home existe
- Vérifiez l'import dans `page.tsx`
- Vérifiez le mapping `HOME_COMPONENTS`

#### "Erreur de personnalisation"
- Vérifiez la structure des `customizations`
- Vérifiez les permissions du vendeur
- Vérifiez que la store est assignée au vendeur

### Logs de Debug

#### Backend
```javascript
// Dans les APIs, activez les logs
console.log('Store data:', storeData);
console.log('Customizations:', customizations);
```

#### Frontend
```javascript
// Dans la page store, vérifiez les headers
console.log('Store headers:', response.headers);
console.log('Store data:', storeData);
```

#### Middleware
```javascript
// Vérifiez les logs middleware dans la console serveur
console.log('Middleware store check:', slug, storeData);
```

## 📈 Performance

### Cache Strategy
- **Store data** : Cache 5 minutes dans le middleware
- **Components** : Import dynamique avec SSR désactivé
- **Images** : Optimisation automatique Next.js

### Optimisations
- ✅ Code splitting par store
- ✅ Import lazy des composants
- ✅ Cache API avec TTL
- ✅ Headers compression
- ✅ Images responsive

## 🔒 Sécurité

### Contrôles d'Accès
- **API publique** : Lecture seule, stores actives uniquement
- **API vendor** : Accès limité aux stores assignées
- **API admin** : Accès complet avec vérification de rôle

### Validation des Données
- **Slugs** : Validation regex, caractères autorisés
- **Customisations** : Validation des couleurs, URLs
- **SEO** : Sanitisation des métadonnées

## 📞 Support

### Documentation Technique
- `PLAN_HOMES_TO_STORES_TRANSFORMATION.md` - Plan détaillé
- `RAPPORT_IMPLEMENTATION_PHASE1_COMPLETE.md` - Rapport backend
- `ANTI_STUPIDITE_UNIVERSELLE.md` - Règles de développement

### Scripts Utiles
- `scripts/migrate-homes-to-stores.js` - Migration initiale
- `scripts/check-existing-stores.js` - Vérification stores
- `scripts/test-stores-frontend-complete.js` - Test complet
