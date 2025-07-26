# Correction JWT_SECRET - Configuration d'Environnement

## Problème Identifié

L'erreur `jwt expired` était accompagnée d'un problème plus grave : l'utilisation de valeurs par défaut dangereuses pour `JWT_SECRET`.

```typescript
// ❌ DANGEREUX - Valeur par défaut non sécurisée
jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

// ❌ DANGEREUX - Fallback non sécurisé  
jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret")
```

## Cause du Problème

1. **Variable manquante** : `JWT_SECRET` n'était pas défini dans le fichier `.env`
2. **Fallbacks dangereux** : Utilisation de valeurs par défaut non sécurisées
3. **Pas de validation** : Aucune vérification de la présence de la variable

## Corrections Apportées

### 1. Ajout de JWT_SECRET dans .env

**Fichier** : `.env`
```bash
# JWT Secret pour l'authentification admin
JWT_SECRET=ecomus-admin-jwt-secret-super-secure-2025-key
```

### 2. Suppression des Fallbacks Dangereux

**Avant** :
```typescript
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
```

**Après** :
```typescript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('ERREUR CRITIQUE: JWT_SECRET non configuré dans .env');
  return { error: 'Configuration serveur manquante', status: 500 };
}

const decoded = jwt.verify(token, jwtSecret) as any;
```

### 3. Validation Stricte pour la Signature

**Avant** :
```typescript
jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", options)
```

**Après** :
```typescript
jwt.sign(
  payload,
  (() => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET non configuré dans .env');
    }
    return jwtSecret;
  })(),
  options
)
```

## Fichiers Corrigés

- ✅ `.env` - Ajout de JWT_SECRET
- ✅ `src/app/api/admin/users/route.ts`
- ✅ `src/app/api/admin/logs/route.ts` 
- ✅ `src/app/api/admin/auth/route.ts`
- ✅ `src/app/api/auth/signin/route.ts`

## Sécurité Améliorée

### Avant (DANGEREUX)
- Fallback vers `'your-secret-key'` ou `"fallback-secret"`
- Aucune validation de configuration
- Tokens potentiellement compromis

### Après (SÉCURISÉ)
- JWT_SECRET obligatoire et validé
- Erreur explicite si mal configuré
- Pas de fallback dangereux
- Logs d'erreur pour debugging

## Test de la Correction

1. **Redémarrer le serveur** pour charger la nouvelle variable
```bash
npm run dev
```

2. **Vérifier l'authentification admin**
   - Se connecter à `/admin/auth`
   - Accéder à `/admin/user-management`
   - Vérifier que le token ne génère plus d'erreur

3. **Tester l'absence de JWT_SECRET** (optionnel)
   - Commenter `JWT_SECRET` dans `.env`
   - Redémarrer → doit afficher "Configuration serveur manquante"

## Bonnes Pratiques Respectées

1. **Fail-fast** : Échec immédiat si mal configuré
2. **Logs explicites** : Messages d'erreur clairs pour debugging
3. **Pas de fallback** : Aucune valeur par défaut dangereuse
4. **Configuration centralisée** : Toutes les variables dans `.env`

## Variables d'Environnement Complètes

Le fichier `.env` contient maintenant :
- ✅ `JWT_SECRET` - Pour l'authentification admin
- ✅ `NEXTAUTH_SECRET` - Pour NextAuth.js
- ✅ `MONGODB_URI` - Base de données
- ✅ `NEXT_PUBLIC_API_URL` - URLs de l'API
- ✅ Configuration Cloudinary, Stripe, etc.

Cette correction élimine complètement les risques de sécurité liés aux secrets JWT non configurés ou fallback dangereux.
