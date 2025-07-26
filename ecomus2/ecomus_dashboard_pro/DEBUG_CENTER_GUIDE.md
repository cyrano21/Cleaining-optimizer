# 🔧 Centre de Debug - Guide Complet

## 📋 Vue d'ensemble

Le **Centre de Debug** (`/debug-center`) est une interface centralisée qui remplace toutes les anciennes pages de debug dispersées. Il offre une vue complète sur l'état du système, les APIs, les rôles et les utilisateurs.

## 🎯 Fonctionnalités Principales

### 📊 Vue d'ensemble
- **Statut de session** : Authentification, rôle actuel, détails utilisateur
- **Statistiques des tests** : Nombre d'APIs testées, taux de réussite
- **Actions rapides** : Tests groupés, attribution de rôles, navigation

### 👤 Utilisateur
- **Session NextAuth** : Données complètes de la session
- **Détails Base de Données** : Informations utilisateur depuis MongoDB
- **Debug Session** : Informations techniques avancées

### 🔒 Rôles
- **Résumé des rôles** : Statistiques globales
- **Liste détaillée** : Permissions, utilisateurs assignés
- **Gestion visuelle** : Interface claire pour chaque rôle

### 🧪 Tests API
- **Tests globaux** : Toutes les APIs en une fois
- **Résultats détaillés** : Statut, données, erreurs
- **Historique** : Horodatage et suivi des tests

### 📈 Dashboard APIs
- **Tests spécialisés** : APIs du dashboard uniquement
- **Tests individuels** : Statistiques, revenus, ventes
- **Résultats filtrés** : Affichage par catégorie

### 🏪 Vendor APIs
- **APIs vendeur** : Commandes, produits, analytics
- **Tests spécialisés** : Focus sur les fonctionnalités vendeur
- **Catégories** : Gestion des catégories produits

### ⚙️ Système
- **Diagnostics** : État général du système
- **Tests système** : Authentification, debug, rôles
- **Informations techniques** : Store ID, configuration

### ⚡ Actions
- **Attribution de rôles** : Super Admin, Vendeur
- **Navigation rapide** : Liens vers les dashboards
- **Tests manuels** : Exécution de tests spécifiques
- **Actualisation** : Refresh des données

## 🔗 Navigation par URL

Le centre de debug supporte la navigation par paramètres URL :

```
/debug-center?tab=overview    # Vue d'ensemble
/debug-center?tab=user        # Utilisateur
/debug-center?tab=roles       # Rôles
/debug-center?tab=apis        # Tests API
/debug-center?tab=dashboard   # Dashboard APIs
/debug-center?tab=vendor      # Vendor APIs
/debug-center?tab=system      # Système
/debug-center?tab=actions     # Actions
```

## 📄 Anciennes Pages (Redirigées)

Les anciennes pages de debug redirigent automatiquement vers le centre :

- `/debug-api` → `/debug-center?tab=dashboard`
- `/debug-orders` → `/debug-center?tab=vendor`
- `/debug-session` → `/debug-center?tab=system`
- `/debug-user` → `/debug-center?tab=user`
- `/debug-roles` → `/debug-center?tab=roles`

## 🚀 Utilisation

### Tests d'APIs
1. **Tests globaux** : Cliquez sur "🧪 Tous APIs" pour tester toutes les APIs
2. **Tests spécialisés** : Utilisez les onglets spécifiques (Dashboard, Vendor, Système)
3. **Tests individuels** : Cliquez sur les boutons de test spécifiques

### Attribution de Rôles
1. Allez dans l'onglet **Actions**
2. Cliquez sur "👑 Attribuer Super Admin" ou "🏪 Attribuer Vendeur"
3. Confirmez l'attribution dans la popup

### Debug Utilisateur
1. Onglet **Utilisateur** : Voir les détails de session
2. Onglet **Système** : Diagnostics techniques
3. Actualisation automatique des données

### Gestion des Rôles
1. Onglet **Rôles** : Vue complète des rôles
2. Permissions détaillées par rôle
3. Utilisateurs assignés à chaque rôle

## 🔧 Maintenance

### Actualisation des Données
- **Auto** : Actualisation automatique à l'ouverture
- **Manuel** : Boutons de refresh dans l'onglet Actions
- **Temps réel** : Mise à jour après chaque action

### Logs et Debugging
- **Console** : Logs détaillés dans la console navigateur
- **Résultats** : Affichage complet des réponses API
- **Erreurs** : Messages d'erreur clairs et détaillés

## 🎨 Interface

### Design
- **Responsive** : Adaptation mobile et desktop
- **Moderne** : Interface claire avec Tailwind CSS
- **Intuitive** : Navigation par onglets
- **Accessible** : Contrastes et tailles appropriés

### Couleurs
- **Bleu** : Actions principales
- **Vert** : Succès et vendeur
- **Rouge** : Erreurs et suppressions
- **Violet** : Administration et système
- **Gris** : Éléments secondaires

## 📊 Métriques

Le centre de debug affiche :
- **Taux de réussite** des APIs
- **Nombre d'APIs testées**
- **Statut de session**
- **Nombre de rôles actifs**
- **Utilisateurs par rôle**

## 🔐 Sécurité

- **Authentification requise** : Connexion obligatoire
- **Contrôle d'accès** : Basé sur les rôles utilisateur
- **Logs sécurisés** : Pas d'exposition de données sensibles
- **HTTPS** : Communications chiffrées

## 📈 Performance

- **Chargement optimisé** : Lazy loading des données
- **Cache intelligent** : Réutilisation des résultats
- **Requests groupées** : Tests parallèles
- **Interface fluide** : Pas de blocage UI

---

## 🚨 Règles ANTI_STUPIDITE_UNIVERSELLE

✅ **Respecté** :
- Centralisation (pas de dispersion)
- Fusion (pas de doublons)
- Amélioration (pas de suppression bête)
- Structure Next.js (tout dans `src/`)
- Rétrocompatibilité (redirections)

❌ **Évité** :
- Suppression sans fusion
- Création de doublons
- Dispersion des fonctionnalités
- Rupture de compatibilité

---

*Centre de Debug - Version 1.0 - Juin 2025*
