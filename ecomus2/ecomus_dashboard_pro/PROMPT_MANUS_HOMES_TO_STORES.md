# 🤖 PROMPT POUR MANUS - TRANSFORMATION HOMES → STORES

## 📋 **MISSION PRINCIPALE**

Salut Manus ! 👋

J'ai besoin de ton aide pour implémenter une transformation majeure du système Ecomus. Voici la mission complète :

**🎯 OBJECTIF** : Transformer les 47 "homes" thématiques existantes en stores individuelles avec système d'assignation vendeur et contrôle admin.

---

## 📊 **CONTEXTE TECHNIQUE**

### **Situation Actuelle**
- **47 homes thématiques** dans `ecomusnext-main/ecomusnext2/app/(homes)/`
- Chaque home = thème spécialisé (cosmetic, electronics, furniture, etc.)
- Toutes les homes sont publiques et accessibles librement
- Aucun système de contrôle ou d'assignation

### **Situation Cible**
- **47 stores individuelles** avec URLs uniques `/store/[slug]`
- **Système d'activation** : Admin contrôle quelles stores sont actives
- **Assignation vendeur** : Chaque vendeur peut demander UNE store spécifique
- **Customisation** : Vendeurs peuvent personnaliser leur store (couleurs, logo, etc.)
- **Analytics** : Suivi des performances par store

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **Base de Données (MongoDB)**
Extension du modèle Store existant avec ces nouveaux champs :

```typescript
interface IStore extends Document {
  // NOUVEAUX CHAMPS HOMES → STORES
  homeTheme: string;           // 'cosmetic', 'electronics', 'furniture'
  homeTemplate: string;        // '/home-cosmetic', '/home-electronics'
  homeName: string;           // 'Cosmétiques & Beauté', 'Électronique'
  homeDescription: string;    // Description détaillée de la thématique
  
  // SYSTÈME D'ACTIVATION
  isActive: boolean;          // Admin activation status
  activatedAt?: Date;         // Date d'activation
  activatedBy?: ObjectId;     // Admin qui a activé
  
  // ASSIGNMENT VENDEUR
  vendor?: ObjectId;          // Vendeur assigné (nullable)
  vendorRequestedAt?: Date;   // Date demande vendeur
  vendorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  
  // CUSTOMISATION THEME
  customizations: {
    colors: {
      primary: string;        // Couleur principale
      secondary: string;      // Couleur secondaire
      accent: string;         // Couleur d'accent
    };
    branding: {
      logo?: string;          // Logo custom store
      favicon?: string;       // Favicon custom
      storeName?: string;     // Nom affiché custom
    };
    layout: {
      style: 'default' | 'modern' | 'minimal';
      headerType: 'classic' | 'centered' | 'split';
      footerType: 'simple' | 'detailed' | 'minimal';
    };
  };
  
  // SEO PAR STORE
  seo: {
    title: string;            // Titre SEO
    description: string;      // Meta description
    keywords: string[];       // Mots-clés SEO
    ogImage?: string;         // Image Open Graph
  };
  
  // ANALYTICS PAR STORE
  analytics: {
    visitorsCount: number;    // Nombre de visiteurs
    conversionRate: number;   // Taux de conversion
    averageOrderValue: number; // Panier moyen
    topProducts: ObjectId[];  // Top produits
  };
}
```

---

## 📋 **PLAN D'IMPLÉMENTATION**

### **🚀 PHASE 1 : FONDATIONS DATABASE** (Priorité 1)

#### **Tâche 1.1 : Extension Modèle Store**
```bash
# Fichier à modifier : src/models/Store.ts
```
- [ ] Ajouter tous les nouveaux champs listés ci-dessus
- [ ] Créer les enums et validations Mongoose appropriés
- [ ] Tester le schéma avec quelques documents

#### **Tâche 1.2 : Script de Migration**
```bash
# Fichier à créer : scripts/migrate-homes-to-stores.js
```
- [ ] Mapper les 47 homes existantes vers les stores
- [ ] Générer automatiquement les slugs, SEO et données par défaut
- [ ] Créer script de vérification `scripts/check-stores.js`

**Mapping des homes principales :**
```javascript
const homesMapping = [
  {
    homeFolder: 'home-cosmetic',
    name: 'Cosmétiques & Beauté',
    slug: 'cosmetiques-beaute',
    homeTheme: 'cosmetic',
    homeTemplate: '/home-cosmetic',
    description: 'Découvrez notre sélection de produits cosmétiques et de beauté premium...',
    seo: {
      title: 'Cosmétiques & Beauté - Boutique Spécialisée',
      keywords: ['cosmétique', 'beauté', 'maquillage', 'soins']
    }
  },
  {
    homeFolder: 'home-electronic',
    name: 'Électronique & High-Tech',
    slug: 'electronique-hightech',
    homeTheme: 'electronic',
    homeTemplate: '/home-electronic',
    description: 'Produits électroniques dernière génération, smartphones, ordinateurs...',
    seo: {
      title: 'Électronique & High-Tech - Boutique Spécialisée',
      keywords: ['électronique', 'hightech', 'smartphone', 'ordinateur']
    }
  },
  // ... (continuer pour les 45 autres)
];
```

#### **Tâche 1.3 : Seeder Automatique**
```bash
# Commande : node scripts/migrate-homes-to-stores.js
```
- [ ] Exécuter la migration complète
- [ ] Vérifier la création des 47 stores
- [ ] Valider l'intégrité des données

---

### **🚀 PHASE 2 : APIs BACKEND** (Priorité 2)

#### **Tâche 2.1 : API Admin - Store Management**
```typescript
// Fichiers à créer/modifier :
// - src/app/api/admin/stores/route.ts
// - src/app/api/admin/stores/[id]/activate/route.ts
// - src/app/api/admin/stores/[id]/assign/route.ts
```

**APIs à implémenter :**
- [ ] `GET /api/admin/stores` - Liste complète des stores avec filtres
- [ ] `POST /api/admin/stores/[id]/activate` - Activer/désactiver une store
- [ ] `POST /api/admin/stores/[id]/assign` - Assigner un vendeur à une store
- [ ] `PUT /api/admin/stores/[id]` - Modifier les paramètres d'une store
- [ ] `DELETE /api/admin/stores/[id]` - Supprimer une store

#### **Tâche 2.2 : API Vendor - Store Assignment**
```typescript
// Fichiers à créer :
// - src/app/api/vendor/store-request/route.ts
// - src/app/api/vendor/my-store/route.ts
```

**APIs à implémenter :**
- [ ] `GET /api/vendor/store-request` - Stores disponibles pour le vendeur
- [ ] `POST /api/vendor/store-request` - Demander assignation à une store
- [ ] `GET /api/vendor/my-store` - Store assignée du vendeur connecté
- [ ] `PUT /api/vendor/my-store` - Customiser sa store (couleurs, branding)

#### **Tâche 2.3 : API Public - Store Access**
```typescript
// Fichiers à créer :
// - src/app/api/stores/public/route.ts
// - src/app/api/stores/public/[slug]/route.ts
```

**APIs à implémenter :**
- [ ] `GET /api/stores/public` - Stores actives pour le public
- [ ] `GET /api/stores/public/[slug]` - Détails d'une store par slug
- [ ] `GET /api/stores/public/[slug]/products` - Produits d'une store
- [ ] `GET /api/stores/public/categories` - Stores groupées par catégorie

---

### **🚀 PHASE 3 : DASHBOARD ADMIN** (Priorité 3)

#### **Tâche 3.1 : Interface Store Management**
```bash
# Fichiers à créer/modifier :
# - src/app/(dashboard)/super-admin/stores/page.tsx
# - src/components/admin/StoreManagement.tsx
```
- [ ] Interface de liste des 47 stores avec statut visuel
- [ ] Filtres : actives/inactives, assignées/libres, par catégorie
- [ ] Actions en 1 clic : activer/désactiver
- [ ] Modal de détails par store

#### **Tâche 3.2 : Système d'Assignment**
```bash
# Composants à créer :
# - src/components/admin/VendorAssignment.tsx
# - src/components/admin/StoreRequestsPanel.tsx
```
- [ ] Interface drag & drop vendeur → store
- [ ] Panel des demandes d'assignation en attente
- [ ] Historique des assignations
- [ ] Notifications temps réel

#### **Tâche 3.3 : Analytics par Store**
```bash
# Composant à créer :
# - src/components/admin/StoreAnalytics.tsx
```
- [ ] Graphiques de performance par store
- [ ] Comparaison des stores
- [ ] Export des données CSV

---

### **🚀 PHASE 4 : DASHBOARD VENDOR** (Priorité 4)

#### **Tâche 4.1 : Store Selection Interface**
```bash
# Fichiers à créer :
# - src/app/(dashboard)/vendor/store-selection/page.tsx
# - src/components/vendor/StoreGallery.tsx
```
- [ ] Galerie des stores disponibles avec preview
- [ ] Système de demande d'assignation
- [ ] Suivi du statut de la demande

#### **Tâche 4.2 : Dashboard "Ma Store"**
```bash
# Fichiers à créer :
# - src/app/(dashboard)/vendor/my-store/page.tsx
# - src/components/vendor/StoreCustomizer.tsx
```
- [ ] Interface de customisation (couleurs, logo, nom)
- [ ] Preview en temps réel des modifications
- [ ] Analytics de performance de la store

---

### **🚀 PHASE 5 : FRONTEND ECOMUSNEXT** (Priorité 5)

#### **Tâche 5.1 : Routes Dynamiques**
```bash
# Fichiers à créer dans ecomusnext-main/ecomusnext2/ :
# - app/store/[slug]/page.tsx
# - app/stores/page.tsx
# - components/StoreResolver.tsx
```
- [ ] Route dynamique `/store/[slug]` qui mappe vers les homes existantes
- [ ] Middleware de vérification : store active ou redirection 404
- [ ] Page listing des stores actives `/stores`

#### **Tâche 5.2 : Store Resolver**
```bash
# Composant à créer :
# - components/store/StoreResolver.tsx
# - middleware/storeResolver.ts
```
- [ ] Résolution slug → homeTemplate → composants home
- [ ] Injection des customisations (couleurs, branding)
- [ ] Tracking analytics par store

#### **Tâche 5.3 : Customisation Injection**
```bash
# Utils à créer :
# - utils/storeCustomization.ts
# - hooks/useStoreTheme.ts
```
- [ ] Injection dynamique des couleurs CSS
- [ ] Remplacement des logos et noms
- [ ] Application des styles de layout

---

## 🔧 **INSTRUCTIONS TECHNIQUES SPÉCIFIQUES**

### **Gestion des Permissions**
```typescript
// Permissions à ajouter au système existant
enum StorePermissions {
  STORE_VIEW_ALL = 'stores:view:all',           // Admin
  STORE_ACTIVATE = 'stores:activate',           // Admin
  STORE_ASSIGN = 'stores:assign',               // Admin
  STORE_REQUEST = 'stores:request',             // Vendor
  STORE_CUSTOMIZE = 'stores:customize',         // Vendor (sa store)
  STORE_VIEW_PUBLIC = 'stores:view:public'      // Public
}
```

### **Validation des Données**
```typescript
// Schémas Zod pour validation API
const StoreActivationSchema = z.object({
  storeId: z.string().min(24).max(24),
  isActive: z.boolean(),
  activatedBy: z.string().min(24).max(24)
});

const StoreAssignmentSchema = z.object({
  storeId: z.string().min(24).max(24),
  vendorId: z.string().min(24).max(24),
  assignedBy: z.string().min(24).max(24)
});
```

### **Sécurité**
- [ ] Vérifier que chaque vendeur ne peut être assigné qu'à UNE seule store
- [ ] Valider que seules les stores actives sont accessibles publiquement
- [ ] Audit trail de toutes les actions admin (activation, assignation)
- [ ] Rate limiting sur les APIs publiques de stores

---

## 🎯 **CRITÈRES DE SUCCÈS**

### **Tests de Validation**
1. **Database** : 47 stores créées avec toutes les données
2. **APIs** : Toutes les endpoints testées avec Postman
3. **Admin Interface** : Activation/assignation fonctionnelle
4. **Vendor Interface** : Sélection et customisation opérationnelle
5. **Frontend** : Toutes les stores accessibles via `/store/[slug]`

### **Performance**
- [ ] Temps de chargement < 2s par page de store
- [ ] Migration des 47 stores < 30 secondes
- [ ] APIs admin < 500ms de response time

### **UX/UI**
- [ ] Interface intuitive sans formation nécessaire
- [ ] Feedback visuel clair sur tous les statuts
- [ ] Actions en temps réel sans rechargement de page

---

## 🚨 **CONTRAINTES IMPORTANTES**

### **À NE PAS CASSER**
- [ ] **Système existant** : Ne pas impacter les fonctionnalités actuelles
- [ ] **Données utilisateurs** : Préserver tous les utilisateurs/commandes existants
- [ ] **URLs existantes** : Maintenir la compatibilité avec les URLs actuelles

### **Priorités**
1. **PHASE 1** : Base de données - CRITIQUES
2. **PHASE 2** : APIs - ESSENTIELLES  
3. **PHASE 3** : Admin Interface - IMPORTANTES
4. **PHASE 4** : Vendor Interface - IMPORTANTES
5. **PHASE 5** : Frontend - FINITION

---

## 📞 **RESSOURCES DISPONIBLES**

### **Fichiers de Référence**
- `PLAN_HOMES_TO_STORES_TRANSFORMATION.md` - Plan complet
- `src/models/Store.ts` - Modèle Store existant
- `ecomusnext-main/ecomusnext2/app/(homes)/` - 47 homes à transformer

### **Documentation**
- Architecture technique dans le plan principal
- Exemples de code TypeScript fournis
- Mapping complet des 47 homes → stores

---

## ❓ **QUESTIONS À CLARIFIER**

1. **Quelle phase veux-tu que je commence en premier ?**
2. **As-tu accès aux deux bases de code (dashboard + ecomusnext) ?**
3. **Préfères-tu que je procède étape par étape ou par phase complète ?**
4. **Y a-t-il des contraintes de délai spécifiques ?**

---

**🎯 TL;DR : Transformer 47 homes en stores individuelles avec contrôle admin, assignation vendeur et customisation. Commencer par la base de données, puis APIs, puis interfaces.**

Dis-moi par quelle phase tu veux commencer ! 🚀
