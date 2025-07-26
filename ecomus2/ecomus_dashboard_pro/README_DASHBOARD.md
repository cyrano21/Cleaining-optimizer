# Dashboard Ecomus - Application Autonome

## Vue d'ensemble

Ce dashboard est une application Next.js autonome qui se connecte à l'API de la boutique Ecomus principale. Il peut être déployé séparément et réutilisé pour différentes boutiques e-commerce.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │────▶│   API Ecomus    │
│   (Port 3001)   │     │   (Port 3000)   │
│                 │     │                 │
│ - Interface     │     │ - Base de données│
│ - Gestion       │     │ - Authentification│
│ - Analytics     │     │ - Business Logic │
└─────────────────┘     └─────────────────┘
```

## Installation et Configuration

### 1. Installation des dépendances

```bash
cd app/dashboard2
npm install
```

### 2. Configuration de l'environnement

Copiez `.env.local` et ajustez les variables :

```env
# Port du dashboard
PORT=3001

# URL de l'API principale
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ECOMMERCE_URL=http://localhost:3000

# Authentification
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dashboard-secret-key-2024

# Base de données (partagée avec l'API principale)
MONGODB_URI=mongodb://localhost:27017/ecomus
```

### 3. Démarrage

```bash
# Démarrer l'API principale (port 3000)
cd /workspaces/ecomusnext
npm run dev

# Démarrer le dashboard (port 3001)
cd app/dashboard2
npm run dev
```

Le dashboard sera accessible sur http://localhost:3001

## Fonctionnalités

### 🏪 Gestion Multi-Boutiques
- Interface configurable pour différentes boutiques
- Connexion API flexible
- Déploiement indépendant

### 📊 Analytics et Reporting
- Dashboard temps réel
- Graphiques de ventes
- Statistiques détaillées
- Rapports exportables

### 🛍️ Gestion E-commerce
- Gestion des produits
- Suivi des commandes
- Gestion des clients
- Gestion des catégories

### 👥 Administration
- Gestion des utilisateurs
- Rôles et permissions
- Paramètres système

## Configuration pour une Nouvelle Boutique

### 1. Cloner le dashboard
```bash
git clone [repository-url] nouvelle-boutique-dashboard
cd nouvelle-boutique-dashboard/app/dashboard2
```

### 2. Configurer l'API
Modifiez `.env.local` :
```env
NEXT_PUBLIC_API_URL=https://api.nouvelle-boutique.com/api
NEXT_PUBLIC_ECOMMERCE_URL=https://nouvelle-boutique.com
```

### 3. Personnalisation
- Logos et branding dans `/public`
- Couleurs et thème dans `/src/styles`
- Configuration dans `/src/config`

## Déploiement

### Vercel (Recommandé)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Variables d'environnement de production
```env
PORT=3001
NEXT_PUBLIC_API_URL=https://api.votre-boutique.com/api
NEXT_PUBLIC_ECOMMERCE_URL=https://votre-boutique.com
NEXTAUTH_URL=https://dashboard.votre-boutique.com
NEXTAUTH_SECRET=production-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/boutique
```

## Sécurité

- Authentification JWT
- Validation des entrées
- Protection CORS
- Variables d'environnement sécurisées
- Audit logs

## API Endpoints Utilisées

```
GET  /api/dashboard/stats          - Statistiques générales
GET  /api/products                 - Liste des produits
POST /api/products                 - Créer un produit
GET  /api/orders                   - Liste des commandes
GET  /api/users                    - Liste des utilisateurs
GET  /api/dashboard/sales          - Données de ventes
```

## Support et Maintenance

- Documentation API : `/docs`
- Logs : `/logs`
- Monitoring : `/health`
- Backup : Base de données MongoDB

## Avantages de cette Architecture

✅ **Modularité** - Chaque service peut évoluer indépendamment
✅ **Réutilisabilité** - Un dashboard pour plusieurs boutiques
✅ **Scalabilité** - Déploiement distribué possible
✅ **Maintenabilité** - Code organisé et séparé
✅ **Sécurité** - Isolation des services
