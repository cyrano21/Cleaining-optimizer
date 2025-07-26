# Correction de la Gestion des Tokens JWT Expirés

## Problème Identifié

L'erreur suivante était rencontrée lors de l'utilisation de l'API admin :

```
Erreur vérification permissions: Error [TokenExpiredError]: jwt expired
GET /api/admin/users 401 in 5233ms
```

## Cause du Problème

Les fichiers API ne géraient pas spécifiquement les différents types d'erreurs JWT :
- `TokenExpiredError` - Quand le token a expiré
- `JsonWebTokenError` - Quand le format du token est invalide
- `NotBeforeError` - Quand le token n'est pas encore valide

## Corrections Apportées

### 1. Fichiers Corrigés

- ✅ `src/app/api/admin/users/route.ts`
- ✅ `src/app/api/admin/logs/route.ts`
- ✅ `src/app/api/admin/auth/route.ts`

### 2. Amélioration de la Gestion d'Erreurs

Avant :
```typescript
} catch (error) {
  console.error('Erreur vérification permissions:', error);
  return { error: 'Token invalide', status: 401 };
}
```

Après :
```typescript
} catch (error: any) {
  console.error('Erreur vérification permissions:', error);
  
  // Gestion spécifique des différents types d'erreurs JWT
  if (error.name === 'TokenExpiredError') {
    return { error: 'Token expiré - Veuillez vous reconnecter', status: 401 };
  } else if (error.name === 'JsonWebTokenError') {
    return { error: 'Token invalide - Format incorrect', status: 401 };
  } else if (error.name === 'NotBeforeError') {
    return { error: 'Token pas encore valide', status: 401 };
  }
  
  return { error: 'Erreur d\'authentification', status: 401 };
}
```

### 3. Utilitaires JWT Créés

Un nouveau fichier `src/utils/jwt.ts` a été créé avec des fonctions utilitaires :

- `verifyJWTToken()` - Vérifie un token JWT
- `handleJWTError()` - Gère les erreurs JWT de manière centralisée
- `extractBearerToken()` - Extrait le token de l'en-tête Authorization

## Avantages de cette Correction

1. **Messages d'erreur explicites** : L'utilisateur sait exactement pourquoi son token a été rejeté
2. **Meilleure expérience utilisateur** : Des messages clairs pour savoir quand se reconnecter
3. **Code plus maintenable** : Gestion centralisée des erreurs JWT
4. **Debugging facilité** : Les logs sont plus informatifs

## Test de la Correction

Pour tester la correction :

1. Connectez-vous à l'interface admin
2. Attendez que le token expire (ou modifiez manuellement le token)
3. Essayez d'accéder à `/admin/user-management`
4. Vous devriez maintenant voir un message d'erreur explicite

## Recommandations

1. **Implémentation de refresh tokens** : Pour une meilleure UX, considérez l'ajout de refresh tokens
2. **Gestion automatique du renouvellement** : Implémentez une logique côté client pour renouveler automatiquement les tokens
3. **Configuration de durée de vie** : Ajustez la durée de vie des tokens selon vos besoins de sécurité

## Configuration Recommandée

Dans votre `.env` :
```
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=24h
```

Cette correction améliore significativement la robustesse de votre système d'authentification en fournissant des messages d'erreur clairs et une gestion appropriée des tokens expirés.
