# 🏪 Système de Gestion des Templates par Abonnement

## 📋 Vue d'ensemble

Ce système permet de gérer l'accès aux templates et pages selon l'abonnement des vendeurs. Il inclut une interface admin pour gérer les abonnements et une interface vendeur pour choisir et personnaliser les templates.

## 🎯 Fonctionnalités

### 🔑 Niveaux d'abonnement
- **FREE**: Templates de base (2 templates homepage, 2 pages)
- **BASIC**: Secteurs spécialisés (accessoires, chaussures, bijoux, etc.)
- **PREMIUM**: Templates haut de gamme (cosmétiques, électronique, mobilier)
- **ENTERPRISE**: Accès complet + templates exclusifs (marketplace, POD)

### 🎨 Templates Homepage
#### FREE (2 templates)
- `home-02`: Home Fashion Basic
- `home-03`: Home General

#### BASIC (+ 4 templates sectoriels)
- `home-accessories`: Accessoires de mode
- `home-footwear`: Chaussures spécialisé
- `home-handbag`: Maroquinerie premium
- `home-jewerly`: Bijouterie élégante

#### PREMIUM (+ 4 templates premium)
- `home-cosmetic`: Cosmétiques avec testeur virtuel
- `home-skincare`: Soins avec diagnostic peau
- `home-electronic`: High-tech avec AR preview
- `home-furniture`: Mobilier avec configurateur 3D

#### ENTERPRISE (+ 3 templates exclusifs)
- `home-multi-brand`: Marketplace multi-vendeurs
- `home-baby`: Puériculture premium
- `home-personalized-pod`: Print-on-demand

### 📄 Pages additionnelles
Système similaire pour les pages comme À propos, Contact, FAQ, etc.

## 🏗️ Architecture

### 📁 Fichiers créés
```
src/
├── config/
│   └── template-subscriptions.js      # Configuration des templates par niveau
├── app/
│   ├── api/
│   │   ├── templates/accessible/      # API templates accessibles
│   │   ├── admin/stores/              # API admin gestion stores
│   │   └── vendor/store/              # API vendeur store
│   ├── admin/
│   │   └── template-management/       # Interface admin templates
│   └── vendor/
│       └── design/                    # Interface vendeur design
└── models/
    └── Store.js                       # Modèle mis à jour

ecomusnext-main/
└── models/
    └── Store.js                       # Modèle principal mis à jour
```

### 🔧 Modèle Store mis à jour
```javascript
{
  // ... champs existants
  subscription: {
    plan: 'free|basic|premium|enterprise',
    limits: { maxProducts, maxStorage, maxOrders },
    expiresAt: Date,
    startedAt: Date,
    isActive: Boolean
  },
  design: {
    selectedTemplate: { id, name, category },
    additionalPages: [{ id, name, isEnabled }],
    customizations: {
      colors: { primary, secondary, accent },
      fonts: { heading, body },
      layout: { headerStyle, footerStyle }
    }
  },
  templateData: {  // Existant - données enrichies
    products: [...],
    collections: [...],
    banners: [...]
  }
}
```

## 🚀 APIs créées

### 🔒 Admin APIs
#### `GET /api/admin/stores`
- Liste tous les stores avec pagination
- Filtres: recherche, plan d'abonnement
- Permissions: admin, super_admin

#### `POST /api/admin/stores/subscription`
- Met à jour l'abonnement d'un store
- Permissions: admin, super_admin

#### `GET /api/admin/stores/subscription`
- Statistiques des abonnements
- Stores expirant bientôt
- Stores dépassant les limites

### 🛍️ Vendor APIs
#### `GET /api/vendor/store/current`
- Récupère le store du vendeur connecté

#### `POST /api/vendor/store/design`
- Sauvegarde les personnalisations de design

### 🎨 Templates APIs
#### `GET /api/templates/accessible`
- Récupère les templates accessibles selon l'abonnement
- Paramètres: `storeId`, `type` (home/page)

#### `POST /api/templates/accessible`
- Sélectionne un template pour un store
- Vérifie l'accès selon l'abonnement

## 🖥️ Interfaces

### 👨‍💼 Interface Admin (`/admin/template-management`)
- **Liste des stores** avec niveau d'abonnement
- **Templates disponibles** par store sélectionné
- **Mise à jour abonnements** en temps réel
- **Aperçu templates** avec fonctionnalités
- **Gestion des accès** selon les plans

### 🛒 Interface Vendeur (`/vendor/design`)
- **Templates Homepage** accessibles selon abonnement
- **Pages additionnelles** à activer/désactiver
- **Personnalisation** couleurs et typographie
- **Prévisualisation** en temps réel
- **Upgrade prompts** pour débloquer plus de templates

## 🧪 Tests

### Script de test complet
```bash
node test-subscription-system.js
```

Tests inclus:
- ✅ Templates accessibles par niveau
- ✅ Vérification d'accès spécifiques
- ✅ Analyse des stores existants
- ✅ Simulation de mise à jour d'abonnement
- ✅ Statistiques des abonnements

## 🔧 Configuration

### Fonctions utilitaires (`template-subscriptions.js`)
```javascript
// Vérifier l'accès à un template
isTemplateAccessible(templateId, subscriptionTier, type)

// Récupérer tous les templates accessibles
getAccessibleTemplates(subscriptionTier, type)

// Informations d'un template
getTemplateInfo(templateId, type)
```

### Constantes
```javascript
SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
}
```

## 📊 Limites par abonnement

| Plan | Produits | Stockage | Templates | Pages | Support | Analytics |
|------|----------|----------|-----------|-------|---------|-----------|
| **FREE** | 50 | 500MB | 2 | 2 | Community | Non |
| **BASIC** | 500 | 2GB | Sectoriels | 6 | Email | Basic |
| **PREMIUM** | 2000 | 10GB | Premium | 12 | Priority | Advanced |
| **ENTERPRISE** | ∞ | 50GB | Tous + Exclusifs | ∞ | Dedicated | Enterprise |

## 🚦 États et permissions

### Statuts d'abonnement
- ✅ **Actif**: Accès normal aux templates
- ⚠️ **Expirant**: Notification 7 jours avant
- ❌ **Expiré**: Retour au plan FREE automatique
- 🔒 **Suspendu**: Aucun accès (admin only)

### Contrôles de sécurité
- Vérification propriétaire pour APIs vendeur
- Permissions admin strict pour gestion abonnements
- Validation des formats de personnalisation
- Logs des actions admin

## 📈 Métriques de suivi

### KPIs disponibles
- Répartition des abonnements par plan
- Taux de conversion FREE → BASIC
- Templates les plus populaires par niveau
- Stores dépassant les limites
- Revenus par plan d'abonnement

### Tableaux de bord
- **Admin**: Vue globale des abonnements et métriques
- **Vendeur**: Utilisation des limites et suggestions d'upgrade

## 🔄 Migration et déploiement

### Étapes de déploiement
1. ✅ Modèle Store mis à jour avec champs subscription/design
2. ✅ Configuration templates créée
3. ✅ APIs développées et testées
4. ✅ Interfaces admin et vendeur fonctionnelles
5. 🔄 Tests d'intégration en cours

### Scripts de migration
- `enrich-stores-with-templates.js`: Enrichissement données existantes
- `test-subscription-system.js`: Validation système complet

## 🎯 Prochaines étapes

### Phase 1 - Finalisation (en cours)
- [ ] Tests complets sur données de production
- [ ] Optimisation des performances (pagination, cache)
- [ ] Documentation utilisateur
- [ ] Formation équipe support

### Phase 2 - Améliorations
- [ ] Import/export de personnalisations
- [ ] Templates custom (enterprise)
- [ ] A/B testing des templates
- [ ] Analytics avancées par template

### Phase 3 - Évolutions avancées
- [ ] Market place de templates tiers
- [ ] Designer de templates intégré
- [ ] Templates saisonniers automatiques
- [ ] Intelligence artificielle pour recommandations

## 📞 Support et maintenance

### Logs et debugging
- Logs d'accès aux templates par store
- Métriques de performance des APIs
- Alertes sur limites dépassées
- Monitoring des erreurs de personnalisation

### Procédures de support
1. **Upgrade manuel**: Via interface admin
2. **Reset template**: Retour au template par défaut
3. **Migration de données**: Scripts de sauvegarde/restauration
4. **Résolution conflits**: Outils de diagnostic intégrés

---

**📅 Dernière mise à jour**: 19 juin 2025  
**👨‍💻 Développé par**: Assistant IA  
**📝 Status**: ✅ Fonctionnel - 🔄 Tests en cours
