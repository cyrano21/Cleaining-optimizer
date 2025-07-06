# E-comusnext Dashboard Integration

Ce projet connecte une application dashboard à la plateforme e-commerce E-comusnext en utilisant MongoDB pour la synchronisation des données.

## Fonctionnalités

- Routes API du dashboard pour accéder et modifier les données e-commerce
- Gestion des produits en temps réel
- Suivi et gestion des commandes
- Gestion des catégories
- Gestion des utilisateurs et authentification
- Gestion des articles de blog et commentaires
- Gestion du panier d'achat
- Traitement des paiements
- Intégration Cloudinary pour le téléchargement d'images
- Statistiques de ventes et analyses

## Instructions d'installation

### Prérequis

- Node.js (v14 ou ultérieur)
- MongoDB en local ou un compte MongoDB Atlas
- Compte Cloudinary pour le stockage d'images

### Configuration de la boutique E-comusnext

1. Extraire le fichier E-comusnext.zip
2. Naviguer vers le répertoire extrait
   ```
   cd E-comusnext
   ```
3. Installer les dépendances
   ```
   npm install
   ```
4. Créer un fichier `.env` avec les variables suivantes (ou utiliser celui existant) :
   ```
   MONGODB_URI=votre_chaine_de_connexion_mongodb
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```
5. Démarrer le serveur de développement
   ```
   npm run dev
   ```
   La boutique sera disponible à l'adresse http://localhost:3000

### Configuration du Dashboard

1. Extraire le fichier dashboard.zip
2. Naviguer vers le répertoire extrait
   ```
   cd dashboard
   ```
3. Installer les dépendances
   ```
   npm install bcryptjs cloudinary jsonwebtoken mongoose slugify
   ```
4. Ajouter les fichiers API de cette intégration :
   - Créer `lib/dbConnect.js` (utilitaire de connexion MongoDB)
   - Créer les modèles dans `models/` : Product, Category, Order, User, Post, Comment, Cart, Payment
   - Créer les routes API dans `pages/api/` pour tous les modèles
   - Créer `pages/api/upload.js` pour l'intégration Cloudinary
   - Créer `pages/api/stats.js` pour les statistiques du dashboard

5. Créer un fichier `.env.local` avec les variables suivantes :
   ```
   MONGODB_URI=votre_chaine_de_connexion_mongodb
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   JWT_SECRET=votre_secret_jwt
   ```
   Note: Utilisez la même chaîne de connexion MongoDB que la boutique E-comusnext pour accéder à la même base de données.

6. Démarrer le serveur de développement
   ```
   npm run dev
   ```
   Le dashboard sera disponible à l'adresse http://localhost:3000 (ou un port différent si spécifié)

## Points de terminaison API

### Produits
- `GET /api/products` - Obtenir tous les produits
- `POST /api/products` - Créer un nouveau produit
- `GET /api/products/:id` - Obtenir un produit par ID
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Catégories
- `GET /api/categories` - Obtenir toutes les catégories
- `POST /api/categories` - Créer une nouvelle catégorie
- `GET /api/categories/:id` - Obtenir une catégorie par ID
- `PUT /api/categories/:id` - Mettre à jour une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### Commandes
- `GET /api/orders` - Obtenir toutes les commandes
- `POST /api/orders` - Créer une nouvelle commande
- `GET /api/orders/:id` - Obtenir une commande par ID
- `PUT /api/orders/:id` - Mettre à jour le statut d'une commande

### Utilisateurs
- `GET /api/users` - Obtenir tous les utilisateurs
- `POST /api/users` - Créer un nouvel utilisateur
- `GET /api/users/:id` - Obtenir un utilisateur par ID
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Authentification
- `POST /api/auth/login` - Authentifier un utilisateur

### Articles (Blog)
- `GET /api/posts` - Obtenir tous les articles
- `POST /api/posts` - Créer un nouvel article
- `GET /api/posts/:id` - Obtenir un article par ID
- `PUT /api/posts/:id` - Mettre à jour un article
- `DELETE /api/posts/:id` - Supprimer un article

### Commentaires
- `GET /api/comments` - Obtenir tous les commentaires
- `POST /api/comments` - Créer un nouveau commentaire
- `GET /api/comments/:id` - Obtenir un commentaire par ID
- `PUT /api/comments/:id` - Mettre à jour un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire

### Paniers
- `GET /api/carts` - Obtenir le panier d'un utilisateur
- `POST /api/carts` - Créer ou mettre à jour un panier

### Paiements
- `GET /api/payments` - Obtenir tous les paiements
- `POST /api/payments` - Créer un nouveau paiement
- `GET /api/payments/:id` - Obtenir un paiement par ID
- `PUT /api/payments/:id` - Mettre à jour un paiement

### Téléchargement d'images
- `POST /api/upload` - Télécharger une image sur Cloudinary

### Statistiques
- `GET /api/stats` - Obtenir les statistiques du dashboard

## Détails d'implémentation

- Les deux applications partagent la même base de données MongoDB
- Le dashboard effectue des modifications directement sur la base de données qui se reflètent dans la boutique
- Toutes les images de produits sont stockées dans Cloudinary avec des URL sécurisées enregistrées dans MongoDB
- Le dashboard fournit des statistiques en temps réel sur les ventes, l'inventaire et d'autres métriques clés

## Remarques importantes

- Assurez-vous que les deux applications utilisent la même chaîne de connexion MongoDB
- Configurez CORS si les applications s'exécutent sur des domaines différents
- Assurez-vous que les identifiants Cloudinary sont les mêmes pour les deux applications
