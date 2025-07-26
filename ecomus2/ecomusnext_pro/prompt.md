Tu es un architecte fullstack expert en e-commerce SaaS, Next.js et MongoDB.

Crée un backend complet, évolutif, multi-vendeur, multi-boutique, compatible avec un template statique Next.js (Ecomus) pour une plateforme e-commerce professionnelle.

## Contraintes principales :
- Utilise **Next.js App Router**
- Pas d'Express, tout en API routes natives dans `/app/api/`
- Backend full CRUD MongoDB via **Mongoose**
- Authentification avec **NextAuth.js**
- Upload des images via **Cloudinary**, `secure_url` stocké en DB
- Dashboards différents pour chaque rôle (admin, vendor, client)
- Tout doit être facilement intégrable dans le frontend statique (pages, composants)

## Objectifs :
### 1. Structure
- Génère les dossiers : `app/api/**`, `models/`, `lib/`, `utils/`, `middleware/`, `dashboard/`, `components/`
- Prépare un fichier `.env.example` pour MongoDB, NextAuth, Cloudinary

### 2. Modèles de données MongoDB :
- `User`: email, password, name, role (admin, vendor, client), image
- `Store`: name, slug, owner (vendor), settings
- `Product`: title, description, price, images, stock, category, storeId
- `Category`: name, slug
- `Order`: clientId, products[], total, status, paymentStatus
- `Review`: productId, userId, rating, comment
- `Settings`: clés générales, activation du mode maintenance, etc.

### 3. API REST
Crée toutes les routes `CRUD` sécurisées :
- `/api/products`
- `/api/categories`
- `/api/orders`
- `/api/stores`
- `/api/users`
- `/api/uploads` (Cloudinary)

Inclure middleware `auth` basé sur NextAuth + vérification de rôles par route.

### 4. Dashboards
Crée les pages de dashboard dans `/app/dashboard/**` :
- `admin/`: stats globales, users, commandes, chiffre d'affaires
- `vendor/`: gestion produits, stock, commandes, clients, paramètres boutique
- `client/`: commandes, profil, wishlist

Chacun avec une UI professionnelle prête à connecter au template Ecomus (par classe CSS ou composants).

### 5. Fonctionnalités à prévoir
- Seed automatique depuis fichiers `products.json` et `categories.json`
- Tri, recherche, pagination dans toutes les entités
- Tracking des commandes (étapes livraisons)
- Auth protect routes (middleware, rôle-based)
- Optimisation SEO + bonne séparation frontend/backend

### 6. Backend scalable
Prépare le projet pour une évolution en SaaS : 
- Chaque boutique = une entité distincte
- Prévoir options d’abonnement, limites par vendeur (facultatif)
- Génération de slugs uniques, timestamps, webhooks futurs (facultatif)

Respecte les bonnes pratiques professionnelles de code (async/await, modularité, gestion erreurs, validation avec Zod ou JOI).





Cahier des Charges (technique et fonctionnel)
🧱 Stack technique
Élément	Technologie
Frontend	Next.js (App Router)
Backend	API Routes natives
Base de données	MongoDB (via Mongoose)
Authentification	NextAuth.js + middleware
Upload images	Cloudinary
Styling UI	Tailwind CSS + Ecomus CSS
Hébergement	Vercel / Railway / Render

👤 Utilisateurs
Rôles :
Admin : gestion complète

Vendor : propre boutique (store), produits, commandes

Client : achats, wishlist, commandes

Auth :
Via NextAuth (Email/Password, OAuth possible)

Middleware requireRole() pour sécuriser routes/pages

📦 Produits & Catégories
Produits liés à une boutique

Plusieurs images via Cloudinary

Gestion des stocks, promotions, statut

Catégories imbriquées (parent/enfant)

📊 Dashboard
Admin :
Stats générales (revenus totaux, commandes, produits, utilisateurs)

Tableaux : utilisateurs, produits, commandes

CRUD toutes entités

Vendor :
Stats propres (produits, revenus, commandes)

Pages gestion produit, stock, paramètres boutique

Client :
Historique commandes

Profil utilisateur

Wishlist

🌩️ Cloudinary
Upload d'images côté client avec prévisualisation

Enregistrement du secure_url dans le modèle Mongoose

Support des multiples images par produit

🔄 Fonctionnalités Bonus
Mode maintenance

Slugs SEO friendly

Génération dynamique de pages produit avec getStaticParams() ou getServerSideProps() (si SSR)

Filtres dynamiques (prix, catégorie, stock)

Évolution SaaS possible : multi-stores = micro-sous-domaines (ex: store1.ecomus.com)

