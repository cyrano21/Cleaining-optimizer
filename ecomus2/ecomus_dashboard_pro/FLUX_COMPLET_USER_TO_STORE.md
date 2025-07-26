# 🔄 FLUX COMPLET - Du User au Store Public

## 📋 Vue d'ensemble du processus

Ce document décrit le parcours complet depuis l'inscription d'un utilisateur jusqu'à l'affichage public de sa boutique avec templates.

## 🚀 ÉTAPE 1 : INSCRIPTION UTILISATEUR → VENDEUR

### 1.1 Inscription initiale
```javascript
// Utilisateur s'inscrit via /auth/register
{
  email: "vendeur@example.com",
  password: "password123",
  name: "Jean Dupont",
  role: "user" // Rôle par défaut
}
```

### 1.2 Demande de devenir vendeur
```javascript
// Via /api/vendor/request ou upgrade automatique
POST /api/user/upgrade-to-vendor
{
  businessName: "Ma Super Boutique",
  businessType: "fashion",
  description: "Boutique de mode tendance"
}

// Résultat : role change de "user" → "vendor"
```

### 1.3 Création automatique du store
```javascript
// Auto-création lors de l'upgrade vendeur
{
  name: "Ma Super Boutique",
  slug: "ma-super-boutique",
  owner: userId,
  subscription: {
    plan: "free", // Commence gratuit
    limits: { maxProducts: 50, maxStorage: 500, maxOrders: 50 },
    isActive: true
  },
  design: {
    selectedTemplate: {
      id: "home-02", // Template gratuit par défaut
      name: "Home Fashion Basic",
      category: "fashion"
    },
    additionalPages: [
      { id: "about-us", name: "À propos", isEnabled: true },
      { id: "contact-1", name: "Contact", isEnabled: true }
    ],
    customizations: {
      colors: { primary: "#007bff", secondary: "#6c757d", accent: "#28a745" },
      fonts: { heading: "Inter", body: "Inter" }
    }
  },
  isActive: true,
  isVerified: false // Nécessite validation admin
}
```

## 🔧 ÉTAPE 2 : ACTIONS ADMIN SUR TEMPLATES ET ABONNEMENTS

### 2.1 L'admin gère les abonnements
```javascript
// Admin accède à /admin/template-management
// Sélectionne le store "Ma Super Boutique"
// Voit: Plan actuel = FREE, Templates disponibles = 2

// Admin upgrade l'abonnement
POST /api/admin/stores/subscription
{
  storeId: "store_123",
  plan: "premium",
  expiresAt: "2025-07-19T00:00:00Z"
}

// Résultat : Store passe à PREMIUM
// Templates disponibles : 2 + 4 + 4 = 10 templates
```

### 2.2 L'admin active/valide la boutique
```javascript
// Admin peut activer/valider la boutique
PUT /api/admin/stores/store_123
{
  isActive: true,
  isVerified: true // Validation admin
}
```

## 🎨 ÉTAPE 3 : VENDEUR UTILISE LES TEMPLATES

### 3.1 Vendeur accède au design
```javascript
// Vendeur va sur /vendor/design
// Voit maintenant 10 templates disponibles (plan premium)

GET /api/templates/accessible?storeId=store_123&type=home
// Retourne tous les templates FREE + BASIC + PREMIUM
```

### 3.2 Vendeur sélectionne un nouveau template
```javascript
// Vendeur choisit "home-cosmetic" (premium)
POST /api/templates/accessible
{
  storeId: "store_123",
  templateId: "home-cosmetic",
  type: "home"
}

// Template mis à jour dans la base
design.selectedTemplate = {
  id: "home-cosmetic",
  name: "Home Cosmétiques",
  category: "beauty"
}
```

### 3.3 Vendeur personnalise le design
```javascript
// Vendeur modifie couleurs et polices
POST /api/vendor/store/design
{
  storeId: "store_123",
  customizations: {
    colors: {
      primary: "#e91e63", // Rose pour cosmétiques
      secondary: "#9c27b0", // Violet
      accent: "#ff5722" // Orange accent
    },
    fonts: {
      heading: "Poppins", // Police élégante
      body: "Open Sans"
    }
  }
}
```

### 3.4 Vendeur active des pages additionnelles
```javascript
// Vendeur active la page FAQ avancée (premium)
POST /api/templates/accessible
{
  storeId: "store_123",
  templateId: "faq-2",
  type: "page"
}

// Page ajoutée à additionalPages
```

## 🌐 ÉTAPE 4 : AFFICHAGE PUBLIC DE LA BOUTIQUE

### 4.1 URL publique de la boutique
```
https://votre-domaine.com/stores/ma-super-boutique
```

### 4.2 API publique pour récupérer la boutique
```javascript
// API publique pour afficher la boutique
GET /api/stores/public/ma-super-boutique

// Vérifications effectuées :
1. Store existe et isActive = true
2. Template sélectionné accessible selon abonnement
3. Pages additionnelles activées
4. Personnalisations appliquées

// Retourne :
{
  store: {
    name: "Ma Super Boutique",
    description: "Boutique de mode tendance",
    design: {
      selectedTemplate: {
        id: "home-cosmetic",
        name: "Home Cosmétiques",
        category: "beauty"
      },
      customizations: {
        colors: { primary: "#e91e63", secondary: "#9c27b0", accent: "#ff5722" },
        fonts: { heading: "Poppins", body: "Open Sans" }
      },
      additionalPages: [
        { id: "about-us", name: "À propos", isEnabled: true },
        { id: "contact-1", name: "Contact", isEnabled: true },
        { id: "faq-2", name: "FAQ Avancée", isEnabled: true }
      ]
    },
    templateData: {
      products: [...], // Données enrichies
      collections: [...],
      banners: [...]
    }
  }
}
```

### 4.3 Rendu de la boutique avec template
```javascript
// Le composant de boutique publique utilise :
const StorePublic = ({ storeData }) => {
  const { selectedTemplate, customizations, additionalPages } = storeData.design;
  
  // Charge le template correspondant
  const TemplateComponent = getTemplateComponent(selectedTemplate.id);
  
  // Applique les personnalisations CSS
  const cssVars = {
    '--primary-color': customizations.colors.primary,
    '--secondary-color': customizations.colors.secondary,
    '--accent-color': customizations.colors.accent,
    '--heading-font': customizations.fonts.heading,
    '--body-font': customizations.fonts.body
  };
  
  return (
    <div style={cssVars}>
      <TemplateComponent 
        storeData={storeData}
        templateData={storeData.templateData}
        pages={additionalPages}
      />
    </div>
  );
};
```

## 📊 ÉTAPE 5 : CYCLE DE VIE COMPLET

### 5.1 Monitoring et gestion continue
```javascript
// Admin surveille via dashboard
GET /api/admin/stores/subscription
// Voit stores expirant, dépassant limites, etc.

// Alertes automatiques
if (store.subscription.expiresAt < Date.now() + 7days) {
  // Email d'alerte envoyé au vendeur
  // Notification dans le dashboard admin
}
```

### 5.2 Évolution de l'abonnement
```javascript
// Vendeur peut upgrader via interface
// Ou admin peut forcer downgrade si non-paiement
// Template automatiquement limité selon nouveau plan
```

## 🔄 FLUX RÉSUMÉ ÉTAPE PAR ÉTAPE

### 📝 **Phase 1 : Inscription & Setup**
1. **User s'inscrit** → Compte créé avec role "user"
2. **User demande upgrade vendeur** → Role change vers "vendor"
3. **Store auto-créé** → Plan FREE, template "home-02" par défaut
4. **Admin valide** → isVerified = true, boutique activée

### 🎨 **Phase 2 : Configuration Template**
5. **Admin upgrade abonnement** → Plan PREMIUM, accès à 10 templates
6. **Vendeur accède design** → Voir templates disponibles selon plan
7. **Vendeur sélectionne template** → "home-cosmetic" choisi
8. **Vendeur personnalise** → Couleurs, polices, pages modifiées

### 🌍 **Phase 3 : Publication & Affichage**
9. **Boutique accessible publiquement** → URL /stores/ma-super-boutique
10. **Template rendu avec personnalisations** → CSS vars appliquées
11. **Données enrichies affichées** → Produits, collections du templateData
12. **Pages additionnelles disponibles** → FAQ, About, Contact actives

### 🔄 **Phase 4 : Maintenance Continue**
13. **Monitoring admin** → Surveillance expirations, limites
14. **Alertes automatiques** → Notifications renouvellement
15. **Évolution abonnement** → Upgrade/downgrade selon besoins

## 🔧 APIs IMPLIQUÉES DANS LE FLUX

### 🏗️ **Setup Initial**
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/user/upgrade-to-vendor` - Upgrade vers vendeur
- `POST /api/admin/stores/validate` - Validation admin

### 🎨 **Gestion Templates**
- `GET /api/templates/accessible` - Templates disponibles
- `POST /api/templates/accessible` - Sélection template
- `POST /api/vendor/store/design` - Personnalisation

### 🌐 **Affichage Public**
- `GET /api/stores/public/[slug]` - Données boutique publique
- `GET /api/stores/public/[slug]/pages/[pageId]` - Pages additionnelles

### 📊 **Administration**
- `POST /api/admin/stores/subscription` - Gestion abonnements
- `GET /api/admin/stores/stats` - Statistiques et monitoring

---

**🎯 Le flux est maintenant entièrement documenté et opérationnel !**

Chaque étape du processus est couverte par des APIs fonctionnelles et des interfaces utilisateur intégrées dans les dashboards.
