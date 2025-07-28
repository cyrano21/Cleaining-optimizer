# 🔐 Guide d'accès aux dépôts privés GitHub

## 🚀 Nouvelles fonctionnalités

L'application supporte maintenant **deux méthodes** pour accéder aux dépôts privés GitHub :

### 1. 🔄 Accès automatique (Recommandé)

**Comment ça marche :**
- Connectez-vous avec votre compte GitHub lors de l'authentification
- L'application récupère automatiquement votre token d'accès GitHub
- Accès direct à tous vos dépôts privés sans configuration supplémentaire

**Avantages :**
- ✅ Configuration automatique
- ✅ Pas de token à gérer manuellement
- ✅ Limites d'API plus élevées
- ✅ Accès sécurisé via OAuth

### 2. ⚙️ Configuration manuelle

**Comment ça marche :**
- Allez dans **Paramètres > API Configuration**
- Ajoutez manuellement votre token GitHub
- Configurez les scopes requis : `public_repo` et `repo`

**Quand l'utiliser :**
- Si vous préférez ne pas vous connecter avec GitHub
- Pour utiliser un token avec des permissions spécifiques
- Pour des environnements de développement séparés

## 🛠️ Configuration OAuth GitHub

### Scopes automatiquement demandés :
- `read:user` - Informations de base du profil
- `user:email` - Adresse email
- `public_repo` - Accès aux dépôts publics
- `repo` - Accès aux dépôts privés

### Variables d'environnement requises :
```env
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_secret
```

## 🔍 Messages d'erreur améliorés

### Dépôt privé sans token :
```
Le dépôt 'owner/repo' est introuvable ou privé. 🔐 Solutions :

1. **Connexion automatique** : Connectez-vous avec votre compte GitHub pour un accès direct à vos dépôts privés
2. **Configuration manuelle** : Ajoutez votre token GitHub dans Paramètres > API Configuration
```

### Limite d'API atteinte :
```
Limite de l'API GitHub atteinte. 🚀 Solutions :

1. **Connexion GitHub** : Connectez-vous avec GitHub pour des limites plus élevées
2. **Token manuel** : Configurez votre token dans Paramètres > API Configuration
```

## 🎯 Interface utilisateur

### Modal d'importation GitHub :
- Message informatif sur les options d'accès aux dépôts privés
- Distinction claire entre accès automatique et manuel
- Instructions visuelles avec icônes

### Page des paramètres :
- Bannière verte expliquant l'accès automatique
- Champ de token marqué comme "Optionnel"
- Instructions détaillées pour la configuration manuelle

## 🔄 Workflow utilisateur

### Pour un nouvel utilisateur :
1. **Se connecter avec GitHub** (recommandé)
2. Aller sur le dashboard
3. Cliquer sur "Open GitHub Repository"
4. Entrer l'URL du dépôt privé
5. ✅ Accès automatique !

### Pour un utilisateur existant :
1. **Option A** : Se reconnecter avec GitHub pour l'accès automatique
2. **Option B** : Configurer manuellement le token dans les paramètres

## 🛡️ Sécurité

- Les tokens sont stockés de manière sécurisée dans la base de données
- Masquage automatique des tokens dans l'interface
- Validation du format des tokens GitHub
- Scopes minimaux requis pour la fonctionnalité

## 🚨 Résolution des problèmes

### "Repository not found or is private"
1. Vérifiez que vous êtes connecté avec GitHub OU
2. Configurez votre token dans les paramètres
3. Assurez-vous que le dépôt existe et que vous avez les permissions

### "GitHub API rate limit exceeded"
1. Connectez-vous avec GitHub pour des limites plus élevées
2. Ou configurez un token personnel
3. Attendez la réinitialisation des limites (1 heure)

---

**✨ Résultat :** Accès fluide et sécurisé aux dépôts privés GitHub avec une expérience utilisateur optimisée !