# Configuration des URI de redirection autorisés

## Configuration actuelle

L'application utilise NextAuth.js avec les providers suivants :
- **GitHub OAuth**
- **Google OAuth**

## URI de redirection à configurer

### Pour le développement local

#### GitHub OAuth App
Dans les paramètres de votre application GitHub :
- **Authorization callback URL** : `http://localhost:3004/api/auth/callback/github`

#### Google OAuth 2.0
Dans la Google Cloud Console :
- **URI de redirection autorisés** : `http://localhost:3004/api/auth/callback/google`

### Pour la production

#### GitHub OAuth App
- **Authorization callback URL** : `https://votre-domaine.com/api/auth/callback/github`

#### Google OAuth 2.0
- **URI de redirection autorisés** : `https://votre-domaine.com/api/auth/callback/google`

## Variables d'environnement requises

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3004
AUTH_SECRET=your_auth_secret

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_secret
```

## Étapes de configuration

### 1. GitHub OAuth App
1. Allez sur https://github.com/settings/developers
2. Cliquez sur "New OAuth App"
3. Remplissez :
   - **Application name** : Vibecode Playground
   - **Homepage URL** : `http://localhost:3004`
   - **Authorization callback URL** : `http://localhost:3004/api/auth/callback/github`
4. Copiez le Client ID et Client Secret dans votre fichier .env

### 2. Google OAuth 2.0
1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ ou Google Identity
4. Allez dans "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configurez :
   - **Application type** : Web application
   - **Authorized JavaScript origins** : `http://localhost:3004`
   - **Authorized redirect URIs** : `http://localhost:3004/api/auth/callback/google`
6. Copiez le Client ID et Client Secret dans votre fichier .env

## Notes importantes

- Le port 3004 est utilisé car le port 3000 était déjà occupé
- NextAuth.js génère automatiquement les routes d'authentification sous `/api/auth/`
- Les URI de redirection doivent correspondre exactement à ceux configurés dans les providers OAuth
- Pour la production, remplacez `localhost:3004` par votre domaine réel

## Test de la configuration

Pour tester que tout fonctionne :
1. Démarrez le serveur de développement : `npm run dev`
2. Accédez à `http://localhost:3004`
3. Testez la connexion avec GitHub et Google
4. Vérifiez que les redirections fonctionnent correctement