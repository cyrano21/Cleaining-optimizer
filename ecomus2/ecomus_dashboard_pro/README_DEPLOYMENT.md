# Dashboard2 - Interface d'Administration EcomusNext

Dashboard2 est une interface d'administration séparée pour le projet EcomusNext, déployée indépendamment et communiquant via API.

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte Vercel configuré
- CLI Vercel installé (`npm i -g vercel`)
- Variables d'environnement configurées

### Étapes de déploiement

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Build local de vérification**
   ```bash
   npm run build
   ```

3. **Déploiement automatique**
   ```bash
   ./deploy.sh
   ```

   Ou manuellement :
   ```bash
   npx vercel --prod
   ```

### Gestion des branches multiples

Si vous rencontrez des problèmes de déploiement liés à des branches multiples dans Vercel:

1. **Vérifiez la branche de production dans Vercel**
   - Accédez au dashboard Vercel > Projet ecomus-dashboard2 > Settings > Git
   - Sous "Production Branch", vérifiez quelle branche est utilisée pour les déploiements

2. **Déploiement forcé**
   Si les modifications GitHub n'apparaissent pas dans Vercel:
   ```bash
   ./force-deploy.bat
   ```
   
3. **Configuration des branches**
   Le fichier `vercel.json` à la racine configure les branches de déploiement:
   ```json
   {
     "git": {
       "deploymentEnabled": {
         "main": true,
         "master": false
       }
     }
   }
   ```
   Modifiez-le selon votre structure de branches.
   ```

### Variables d'environnement Vercel

Configurer les variables suivantes dans Vercel Dashboard :

```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-dashboard2-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-ecomus-domain.vercel.app/api
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔗 Communication avec EcomusNext

Dashboard2 communique avec l'application principale EcomusNext via :

- **API REST** : Récupération des données (produits, commandes, utilisateurs)
- **NextAuth partagé** : Authentification unifiée
- **MongoDB partagé** : Base de données commune

### Endpoints principaux
- `/api/dashboard/test-cors` - Test de connectivité
- `/api/products` - Gestion des produits
- `/api/orders` - Gestion des commandes
- `/api/users` - Gestion des utilisateurs

## 🧪 Tests de Communication

Accéder à `/test-sync` pour :
- Tester la connectivité API
- Vérifier l'authentification
- Valider la synchronisation des données

## 📁 Structure du Projet

```
dashboard2/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/  # Configuration NextAuth
│   │   ├── auth/                    # Pages d'authentification
│   │   ├── dashboard/               # Interface principale
│   │   └── test-sync/               # Page de tests
│   ├── components/                  # Composants UI
│   ├── lib/                        # Utilitaires et API clients
│   └── types/                       # Types TypeScript
├── vercel.json                      # Configuration Vercel
├── deploy.sh                        # Script de déploiement
└── package.json
```

## 🔧 Configuration Post-Déploiement

Après le déploiement de Dashboard2 :

1. **Récupérer l'URL de production** depuis Vercel
2. **Mettre à jour EcomusNext** avec la nouvelle URL Dashboard2
3. **Configurer les CORS** pour autoriser les requêtes cross-origin
4. **Tester la communication** via `/test-sync`

## 🚨 Résolution des Problèmes

### Erreurs d'authentification
- Vérifier `NEXTAUTH_URL` et `NEXTAUTH_SECRET`
- Contrôler la configuration des credentials

### Erreurs CORS
- Vérifier la configuration CORS dans EcomusNext
- S'assurer que l'URL Dashboard2 est autorisée

### Erreurs de build
- Contrôler les types TypeScript
- Vérifier les imports et dependencies

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs Vercel
2. Tester avec `/test-sync`
3. Vérifier la configuration des variables d'environnement
