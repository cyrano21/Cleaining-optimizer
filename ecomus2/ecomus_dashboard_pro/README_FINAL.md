# 🎉 ECOMUS DASHBOARD2 MULTI-STORE - GUIDE COMPLET

> **Application e-commerce multi-boutiques avec gestion des rôles et dashboards dynamiques**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-green)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Ready-green)](https://www.mongodb.com/)

---

## 🚀 DÉMARRAGE RAPIDE

### Option 1: Script automatique (Recommandé)
```powershell
# PowerShell (Windows)
.\start-ecomus.ps1

# Ou Command Prompt
start-ecomus.bat
```

### Option 2: Démarrage manuel
```powershell
# 1. Démarrer MongoDB
mongod

# 2. Initialiser les rôles
yarn run init:roles

# 3. Démarrer l'application
yarn dev
```

### 🌐 Accès à l'application
- **URL :** http://localhost:3001
- **Admin par défaut :**
  - Email : `admin@ecomus.com`
  - Mot de passe : `admin123`

---

## 📋 PRÉREQUIS

### Logiciels requis
- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Yarn** package manager ([Installer](https://yarnpkg.com/))
- **MongoDB** 6+ ([Installer](https://www.mongodb.com/try/download/community))

### Variables d'environnement
Créez un fichier `.env.local` à la racine :
```env
MONGODB_URI=mongodb://localhost:27017/ecomus
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001
```

---

## 🏗️ ARCHITECTURE SYSTÈME

### Rôles utilisateurs
```
ADMIN (Super Admin)
├── 🌍 Vue globale toutes boutiques
├── 👥 Gestion utilisateurs/rôles  
├── 📊 Analytics consolidées
└── ⚙️ Paramètres système

VENDOR (Propriétaire boutique)
├── 🏪 Gestion de SA boutique
├── 📦 Ses produits uniquement
├── 📋 Ses commandes uniquement
└── 📈 Analytics boutique

CUSTOMER (Client)
├── 👤 Profil personnel
├── 📜 Historique commandes
├── ❤️ Wishlist/Favoris
└── 🏪 Boutiques suivies
```

### APIs disponibles
```
/api/roles          - Gestion des rôles
/api/users          - Gestion des utilisateurs
/api/stores         - Gestion des boutiques
/api/products       - Gestion des produits
/api/orders         - Gestion des commandes
/api/test-ecomus    - Tests et diagnostics
```

---

## 🛠️ COMMANDES DISPONIBLES

### Développement
```powershell
yarn dev              # Démarrer en mode développement
yarn build            # Construire pour la production
yarn start            # Démarrer en mode production
yarn lint             # Vérifier le code
```

### Base de données
```powershell
yarn run init:roles   # Initialiser les rôles système
yarn run setup:db     # Configuration complète de la DB
```

### Tests et diagnostics
```powershell
yarn run test:complete       # Tests complets
node scripts/final-check.js  # Vérification système
```

---

## 🔧 FONCTIONNALITÉS PRINCIPALES

### ✅ Système Multi-Store
- **Boutiques multiples** avec isolation des données
- **Propriétaires indépendants** (vendors)
- **Gestion centralisée** par les administrateurs

### ✅ Gestion des Rôles
- **Permissions granulaires** par rôle
- **Hiérarchie de rôles** (Admin > Vendor > Customer)
- **Interface de gestion** complète

### ✅ Dashboards Adaptatifs
- **Contenu dynamique** selon le rôle connecté
- **Métriques contextuelles** par boutique/global
- **Navigation intelligente** adaptée aux permissions

### ✅ Sécurité Avancée
- **Authentification JWT** avec NextAuth
- **Contrôle d'accès** par rôle et permission
- **Protection des APIs** sensibles

### ✅ Interface Moderne
- **Design responsive** adaptatif
- **Thème sombre/clair** configurable
- **Composants réutilisables** avec TypeScript

---

## 📁 STRUCTURE DU PROJET

```
ecomus-dashboard2-main/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── api/               # APIs REST
│   │   ├── dashboard/         # Dashboards par rôle
│   │   └── e-commerce/        # Pages e-commerce
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants UI de base
│   │   └── layout/           # Composants de mise en page
│   ├── models/               # Modèles TypeScript
│   └── lib/                  # Utilitaires et configuration
├── models/                   # Modèles Mongoose (JS)
├── scripts/                  # Scripts d'installation/test
└── public/                   # Assets statiques
```

---

## 🧪 TESTS ET VALIDATION

### Tests automatisés
```powershell
# Test complet du système
yarn run test:complete

# Vérification de l'environnement
node scripts/final-check.js

# Test des APIs
curl http://localhost:3001/api/test-ecomus
```

### Tests manuels recommandés
1. **Connexion multi-rôles**
   - Tester chaque type de compte
   - Vérifier les redirections
   - Contrôler les permissions

2. **Gestion des boutiques**
   - Créer une nouvelle boutique
   - Assigner un vendor
   - Tester l'isolation des données

3. **Dashboards dynamiques**
   - Vérifier le contenu adapté
   - Tester les métriques
   - Contrôler la navigation

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### MongoDB ne démarre pas
```powershell
# Vérifier que MongoDB est installé
mongod --version

# Créer le répertoire de données
mkdir data

# Démarrer avec un chemin spécifique
mongod --dbpath=./data
```

### Port 3001 déjà utilisé
```powershell
# Changer le port dans package.json
"dev": "next dev -p 3002"

# Ou tuer le processus existant
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erreurs de dépendances
```powershell
# Nettoyer et réinstaller
rm -rf node_modules yarn.lock
yarn install

# Ou forcer la résolution
yarn install --force
```

### Problèmes d'authentification
1. Vérifier les variables d'environnement
2. Redémarrer l'application
3. Vider le cache du navigateur
4. Vérifier la connexion MongoDB

---

## 🔄 MISE À JOUR ET MAINTENANCE

### Sauvegardes recommandées
```powershell
# Exporter la base de données
mongodump --db ecomus --out backup/

# Sauvegarder la configuration
cp .env.local .env.backup
```

### Mises à jour des dépendances
```powershell
# Vérifier les mises à jour
yarn outdated

# Mettre à jour (attention aux breaking changes)
yarn upgrade-interactive
```

---

## 📞 SUPPORT ET CONTACT

### Documentation
- **API Reference :** `/api/test-ecomus` pour les endpoints
- **Composants UI :** Dossier `src/components/ui/`
- **Modèles de données :** Dossier `src/models/`

### Fichiers de logs
- **Application :** Console du navigateur
- **MongoDB :** `mongodb.log`
- **Next.js :** Terminal de développement

---

## 🎯 PROCHAINES ÉTAPES

### Fonctionnalités suggérées
- [ ] **Système de notifications** en temps réel
- [ ] **Analytics avancées** avec graphiques
- [ ] **Système de paiement** intégré (Stripe/PayPal)
- [ ] **Gestion d'inventaire** avancée
- [ ] **Chat client-vendor** en direct
- [ ] **Système d'avis et notes** détaillé

### Optimisations techniques
- [ ] **Tests unitaires** complets
- [ ] **CI/CD Pipeline** pour le déploiement
- [ ] **Monitoring** et logging avancé
- [ ] **Cache Redis** pour les performances
- [ ] **CDN** pour les images et assets

---

## 📄 LICENCE

Ce projet est un dashboard e-commerce multi-store basé sur Next.js et TypeScript.

---

## 🎉 FÉLICITATIONS !

Votre système Ecomus Multi-Store est maintenant **opérationnel** !

### Points forts de votre installation :
- ✅ **Architecture scalable** et moderne
- ✅ **Code TypeScript** entièrement typé
- ✅ **Sécurité renforcée** avec contrôle d'accès
- ✅ **Interface adaptative** par rôle
- ✅ **APIs RESTful** complètes et documentées

**Votre application est prête pour la production !** 🚀

---

*Documentation mise à jour le 12 juin 2025*
*Version Ecomus Dashboard2 Multi-Store 2.0*
