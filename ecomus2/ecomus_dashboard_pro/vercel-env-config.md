# Configuration Variables d'Environnement Vercel

## Variables à configurer dans Vercel Dashboard

### 🔗 Base de données MongoDB
```
MONGODB_URI=mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0
```

### 🔐 NextAuth.js
```
NEXTAUTH_URL=https://ecomus-dashboard2.vercel.app
NEXTAUTH_SECRET=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
```

### 🔑 JWT Secret
```
JWT_SECRET=ecomus-admin-jwt-secret-super-secure-2025-key
```

### 🌐 URLs Publiques (Variables NEXT_PUBLIC_*)
```
NEXT_PUBLIC_API_BASE_URL=https://ecomus-dashboard2.vercel.app
NEXT_PUBLIC_API_URL=https://ecomus-dashboard2.vercel.app/api
NEXT_PUBLIC_ECOMMERCE_URL=https://ecomusnext-tau.vercel.app
NEXT_PUBLIC_ECOMUS_PRODUCTION_URL=https://ecomusnext-tau.vercel.app/api
```

### 🔐 Google OAuth
```
GOOGLE_CLIENT_ID=167798227599-t5jrag0pqk8joicb955c79615kd703ba.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### ☁️ Cloudinary (Upload d'images)
```
CLOUDINARY_CLOUD_NAME=dwens2ze5
CLOUDINARY_API_KEY=895316547868918
CLOUDINARY_API_SECRET=fJdiGdhRH1tgemd7mD5cViS2bL0
```

### 💳 Stripe (Paiements)
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 📧 Email (Notifications)
```
EMAIL_FROM=noreply@ecomus.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

### 📊 Analytics & Monitoring
```
ANALYTICS_ID=your-analytics-id
```

### 👤 Admin par défaut
```
DEFAULT_ADMIN_EMAIL=admin@ecomus.com
DEFAULT_ADMIN_PASSWORD=Admin123!
```

### 🚀 Mode Production
```
NODE_ENV=production
```

## 📋 Instructions pour Vercel

### 1. Accéder aux Variables d'Environnement
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet `ecomus-dashboard2`
3. Aller dans **Settings** > **Environment Variables**

### 2. Ajouter les Variables
Pour chaque variable ci-dessus :
1. Cliquer sur **Add New**
2. **Name** : Nom de la variable (ex: `MONGODB_URI`)
3. **Value** : Valeur correspondante
4. **Environment** : Sélectionner `Production`, `Preview`, et `Development`
5. Cliquer **Save**

### 3. Variables Critiques à Vérifier

#### ✅ URLs Corrigées
- ❌ Ancien : `NEXTAUTH_URL=http://localhost:3000`
- ✅ Nouveau : `NEXTAUTH_URL=https://ecomus-dashboard2.vercel.app`

#### ✅ Variables NEXT_PUBLIC_* (sans backticks)
- ❌ Ancien : `NEXT_PUBLIC_API_BASE_URL=\`https://ecomus-dashboard2.vercel.app\``
- ✅ Nouveau : `NEXT_PUBLIC_API_BASE_URL=https://ecomus-dashboard2.vercel.app`

#### ✅ NODE_ENV
- ❌ Ancien : `NODE_ENV=development`
- ✅ Nouveau : `NODE_ENV=production`

### 4. Variables à Mettre à Jour

#### 🔄 Stripe (À remplacer par vos vraies clés)
```
STRIPE_PUBLISHABLE_KEY=pk_live_your_real_stripe_key
STRIPE_SECRET_KEY=sk_live_your_real_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_real_webhook_secret
```

#### 🔄 Email (À configurer avec vos vraies données)
```
EMAIL_SERVER_USER=your-real-email@gmail.com
EMAIL_SERVER_PASSWORD=your-real-app-password
```

#### 🔄 Analytics (À remplacer par votre ID)
```
ANALYTICS_ID=your-real-analytics-id
```

### 5. Redéploiement
Après avoir ajouté toutes les variables :
1. Aller dans **Deployments**
2. Cliquer sur **Redeploy** sur le dernier déploiement
3. Ou faire un nouveau commit pour déclencher un redéploiement automatique

### 6. Vérification
Après redéploiement, vérifier :
- ✅ Connexion à la base de données MongoDB
- ✅ Authentification Google OAuth
- ✅ Upload d'images Cloudinary
- ✅ URLs publiques accessibles

## 🚨 Sécurité

### Variables Sensibles
Ces variables contiennent des informations sensibles :
- `MONGODB_URI` (contient mot de passe DB)
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_SERVER_PASSWORD`

### Recommandations
1. **Ne jamais** commiter ces variables dans le code
2. **Utiliser** uniquement Vercel Environment Variables
3. **Régénérer** les secrets périodiquement
4. **Limiter** l'accès aux variables sensibles

## 📝 Notes

- Les variables `NEXT_PUBLIC_*` sont exposées côté client
- Les autres variables sont uniquement accessibles côté serveur
- Vercel injecte automatiquement ces variables dans l'environnement de build et runtime
- Un redéploiement est nécessaire après modification des variables