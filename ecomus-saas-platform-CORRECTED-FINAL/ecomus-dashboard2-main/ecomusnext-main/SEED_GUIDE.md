# 🌱 Guide de Migration des Données - Ecomus SaaS

Ce guide explique comment utiliser le système de seed MongoDB pour transformer les données statiques d'Ecomus en une base de données complète pour la plateforme SaaS.

## 📋 Vue d'ensemble

Le système de seed transforme automatiquement :
- **7141 lignes** de données produits (`data/products.js`)
- **2575 lignes** de données catégories (`data/categories.js`)
- En une base MongoDB complète avec utilisateurs, boutiques, et relations

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local avec vos vraies valeurs
```

### 3. Options de base de données

#### Option A: MongoDB avec Docker (Recommandé pour dev)
```bash
# Démarrer MongoDB
npm run mongodb:start

# Mettre à jour .env.local
MONGODB_URI=mongodb://admin:password@localhost:27017/ecomus_saas_dev?authSource=admin
```

#### Option B: MongoDB Atlas (Recommandé pour prod)
```bash
# Utiliser votre URI MongoDB Atlas dans .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomus_saas?retryWrites=true&w=majority
```

### 4. Lancer le seed

#### Démonstration (sans DB)
```bash
npm run seed:demo
```

#### Seed complet avec MongoDB
```bash
npm run seed
```

## 📊 Données Créées

### 👤 Utilisateurs (4 comptes de test)
- **Admin**: `admin@ecomus.com` / `admin123`
- **Vendor 1**: `vendor1@ecomus.com` / `vendor123`  
- **Vendor 2**: `vendor2@ecomus.com` / `vendor123`
- **Client**: `client@ecomus.com` / `client123`

### 🏪 Boutiques (2 boutiques d'exemple)
- **Boutique Mode Premium** (Vendor 1)
- **Tech & Gadgets Store** (Vendor 2)

### 📂 Catégories (Structure hiérarchique)
- Vêtements
  - T-shirts
  - Débardeurs
- Chaussures
  - Baskets
- Accessoires
- Sacs

### 📦 Produits (Tous les produits existants)
- Transformation de tous les produits `data/products.js`
- Images Unsplash conservées
- Attribution automatique aux boutiques
- Catégorisation intelligente
- Génération de variants (couleurs/tailles)
- Gestion des stocks

### 🛒 Commandes (5 commandes d'exemple)
- Commandes de test avec différents statuts
- Attribution aux utilisateurs clients
- Calculs automatiques (total, taxes, etc.)

## 🔧 Scripts Disponibles

```bash
# Seed complet avec MongoDB
npm run seed

# Démonstration sans DB
npm run seed:demo

# Production
npm run seed:prod

# Docker MongoDB
npm run mongodb:start    # Démarrer
npm run mongodb:stop     # Arrêter  
npm run mongodb:remove   # Supprimer
```

## 📝 Structure des Données Transformées

### Exemple de Produit Transformé
```javascript
{
  name: "Ribbed Tank Top",
  slug: "ribbed-tank-top",
  description: "Ribbed Tank Top - Produit de qualité premium...",
  price: 16.95,
  images: [
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923...",
    "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5..."
  ],
  category: ObjectId("..."),
  storeId: ObjectId("..."),
  inventory: {
    quantity: 45,
    lowStockThreshold: 5
  },
  variants: [
    {
      name: "Orange - S",
      attributes: { color: "Orange", size: "S" },
      price: 16.95,
      sku: "ribbed-tank-top-orange-s"
    }
  ],
  tags: ["Best seller", "On Sale"],
  brand: "Ecomus",
  seo: {
    title: "Ribbed Tank Top",
    description: "Achetez Ribbed Tank Top - Livraison gratuite...",
    keywords: ["Ribbed Tank Top", "Ecomus", "mode", "qualité"]
  }
}
```

## 🏗️ Architecture des Modèles

### User Model
- Authentification avec mots de passe hashés
- Rôles: `admin`, `vendor`, `client`
- Slugs SEO-friendly

### Store Model  
- Multi-vendeur avec owner
- Analytics en temps réel
- Paramètres personnalisables

### Product Model
- Variants (couleurs, tailles)
- Gestion des stocks
- SEO intégré
- Images multiples

### Category Model
- Hiérarchie parent/enfant
- Slugs uniques
- Description et métadonnées

### Order Model
- Workflow complet (pending → processing → shipped → delivered)
- Calculs automatiques
- Historique des statuts

## 🚨 Résolution de Problèmes

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB fonctionne
docker ps | grep ecomus-mongodb

# Redémarrer si nécessaire
npm run mongodb:stop
npm run mongodb:start
```

### Erreur de données manquantes
```bash
# Vérifier les fichiers de données
ls data/products.js data/categories.js

# Lancer d'abord la démo
npm run seed:demo
```

### Warnings Mongoose
Les warnings sur les index dupliqués sont normaux et n'affectent pas le fonctionnement.

## 🔄 Re-seed

Pour recommencer à zéro :
```bash
# Le script nettoie automatiquement toutes les collections avant le seed
npm run seed
```

## 📈 Performance

- **Temps de seed**: ~30 secondes pour l'ensemble des données
- **Mémoire**: ~100MB pendant le processus
- **Produits traités**: Tous les produits de `data/products.js`
- **Relations créées**: Automatiquement entre toutes les entités

## 🚀 Prêt pour Production

Une fois le seed terminé, votre base MongoDB contient :
- ✅ Utilisateurs avec authentification sécurisée
- ✅ Boutiques multi-vendeur configurées  
- ✅ Produits avec images et variants
- ✅ Catégories hiérarchiques
- ✅ Commandes d'exemple
- ✅ Relations et index optimisés

Votre plateforme SaaS Ecomus est prête à être utilisée !

## 📞 Support

En cas de problème :
1. Vérifier les logs du script de seed
2. Consulter la section résolution de problèmes
3. Vérifier la configuration `.env.local`
4. Tester avec `npm run seed:demo` d'abord
