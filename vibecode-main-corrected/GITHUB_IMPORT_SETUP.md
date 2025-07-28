# 🔧 Configuration de l'importation GitHub

## 🚨 Problème résolu

Le bouton "Open GitHub Repository" fonctionne maintenant correctement ! Voici ce qui a été corrigé :

### ✅ Améliorations apportées

1. **Gestion d'erreurs améliorée** :
   - Messages d'erreur plus explicites
   - Gestion des erreurs 404 (repository non trouvé/privé)
   - Gestion des erreurs 403 (limite de taux API)

2. **Support des tokens GitHub** :
   - Authentification optionnelle via `GITHUB_TOKEN`
   - Augmentation des limites de taux API
   - Accès aux repositories privés (si configuré)

3. **Headers API optimisés** :
   - User-Agent personnalisé
   - Headers Accept appropriés
   - Support de l'authentification token

## 🛠️ Configuration recommandée

### 1. Variables d'environnement de base

Le fichier `.env.local` a été créé avec la configuration minimale :

```env
NEXTAUTH_URL=http://localhost:3004
AUTH_SECRET=your-development-secret-key-here
```

### 2. Token GitHub (optionnel mais recommandé)

Pour améliorer les performances et accéder aux repositories privés :

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token (classic)"
3. Sélectionnez les scopes :
   - `public_repo` (pour les repositories publics)
   - `repo` (pour les repositories privés)
4. Ajoutez le token dans `.env.local` :
   ```env
   GITHUB_TOKEN=ghp_votre_token_ici
   ```

### 3. OAuth GitHub (pour l'authentification complète)

Pour une authentification complète :

1. Créez une OAuth App sur https://github.com/settings/developers
2. Configurez :
   - **Homepage URL** : `http://localhost:3004`
   - **Authorization callback URL** : `http://localhost:3004/api/auth/callback/github`
3. Ajoutez dans `.env.local` :
   ```env
   AUTH_GITHUB_ID=votre_client_id
   AUTH_GITHUB_SECRET=votre_client_secret
   ```

## 🎯 Comment utiliser l'importation

1. **Accédez au dashboard** : http://localhost:3004/dashboard
2. **Cliquez sur "Open Github Repository"**
3. **Entrez l'URL du repository** (ex: https://github.com/vercel/next.js)
4. **Cliquez sur "Importer"**

### Formats d'URL supportés :
- `https://github.com/owner/repository`
- `https://github.com/owner/repository/`

## 🔍 Types de projets détectés automatiquement

L'importation détecte automatiquement le type de projet basé sur `package.json` :

- **Next.js** : Si `next` est dans les dépendances
- **Vue.js** : Si `vue` est dans les dépendances  
- **Angular** : Si `@angular/core` est dans les dépendances
- **Express** : Si `express` est dans les dépendances
- **Hono** : Si `hono` est dans les dépendances
- **React** : Par défaut pour les autres projets

## 🚨 Résolution des erreurs courantes

### "Repository not found or is private"
- Vérifiez que l'URL est correcte
- Assurez-vous que le repository est public
- Ajoutez un `GITHUB_TOKEN` pour accéder aux repositories privés

### "GitHub API rate limit exceeded"
- Ajoutez un `GITHUB_TOKEN` dans `.env.local`
- Attendez que la limite se réinitialise (1 heure)

### "Invalid GitHub URL format"
- Utilisez le format : `https://github.com/owner/repository`
- Évitez les URLs avec des sous-dossiers ou des branches

## 📝 Notes techniques

- L'importation crée une structure de base avec un README.md
- Les fichiers complets du repository ne sont pas encore importés (fonctionnalité future)
- Le playground créé peut être modifié dans l'éditeur
- La détection du type de projet influence le template utilisé

## 🔄 Redémarrage requis

Après avoir modifié `.env.local`, redémarrez le serveur de développement :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
npm run dev
```

---

**✅ Le bouton "Open GitHub Repository" est maintenant fonctionnel !**