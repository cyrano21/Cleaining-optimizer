# Centre de Debug Centralisé 🔧

## 📋 Vue d'ensemble

Toutes les fonctionnalités de debug ont été centralisées dans une seule page : **`/debug-center`**

Cette page remplace et améliore les anciennes pages de debug :
- `/debug-api` → Redirection vers `/debug-center?tab=dashboard`
- `/debug-orders` → Redirection vers `/debug-center?tab=vendor` 
- `/debug-session` → Redirection vers `/debug-center?tab=system`
- `/debug-user` → Redirection vers `/debug-center?tab=user`
- `/debug-roles` → Redirection vers `/debug-center?tab=roles`

## 🎯 Fonctionnalités

### 📊 Vue d'ensemble
- Status de session en temps réel
- Statistiques sur les rôles
- Tests d'APIs rapides
- Actions d'administration

### 👤 Utilisateur
- Détails de session NextAuth
- Informations utilisateur depuis la base de données
- Debug session complet

### 🔒 Rôles
- Liste complète des rôles disponibles
- Permissions par rôle
- Utilisateurs par rôle
- Statistics des rôles

### 🧪 Tests API - Général
- Test de toutes les APIs principales
- Résultats détaillés avec status et données
- Historique des tests

### 📈 Dashboard APIs
- Tests spécifiques aux APIs du dashboard
- Stats, revenus, catégories, météo
- Tests individuels et en batch

### 🏪 Vendor APIs
- Tests des APIs vendeur
- Commandes, produits, analytics
- Catégories et gestion vendeur

### ⚙️ Système
- Tests des APIs système
- Diagnostics de session
- Vérifications des droits d'accès
- Tests d'authentification

### ⚡ Actions
- Attribution automatique de rôles
- Navigation rapide vers les dashboards
- Actions de maintenance système
- Refresh et actualisation

## 🚀 Navigation

### Accès direct par onglet :
- `/debug-center` - Vue d'ensemble
- `/debug-center?tab=user` - Debug utilisateur
- `/debug-center?tab=roles` - Gestion des rôles
- `/debug-center?tab=apis` - Tests API généraux
- `/debug-center?tab=dashboard` - Tests Dashboard
- `/debug-center?tab=vendor` - Tests Vendeur
- `/debug-center?tab=system` - Tests Système
- `/debug-center?tab=actions` - Actions rapides

## 🔄 Migration

Les anciennes pages de debug redirigent automatiquement vers les bons onglets du centre de debug. Toutes les fonctionnalités ont été préservées et améliorées.

## ✨ Améliorations

1. **Interface unifiée** : Plus besoin de naviguer entre plusieurs pages
2. **Tests avancés** : Tests par catégorie avec résultats détaillés
3. **Actions rapides** : Attribution de rôles, navigation, refresh
4. **Diagnostics complets** : Vue d'ensemble de l'état du système
5. **Responsive** : Interface adaptée à tous les écrans
6. **Temps réel** : Actualisation automatique des données
7. **Historique** : Conservation des résultats de tests
8. **Filtrage** : Résultats organisés par catégorie

## 🎨 Interface

- **Navigation par onglets** : Organisation claire des fonctionnalités
- **Indicateurs visuels** : Status colorés pour les résultats
- **Actions contextuelles** : Boutons d'action selon l'onglet
- **Données JSON** : Affichage formaté des réponses API
- **Loading states** : Indicateurs de chargement pour tous les tests

## 🛠️ Administration

Le centre de debug permet :
- Attribution de rôles (Super Admin, Vendeur)
- Tests d'accès aux APIs par rôle
- Vérification des permissions
- Diagnostic de session
- Navigation rapide vers les dashboards
- Maintenance du système
