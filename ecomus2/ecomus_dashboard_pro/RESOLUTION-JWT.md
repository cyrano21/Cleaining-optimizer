# Résolution du problème JWT "jwt malformed"

## Problème identifié
L'erreur `jwt malformed` indique que le token JWT stocké dans le localStorage du navigateur n'est pas dans un format valide.

## Causes possibles
1. **Token corrompu** : Le token a été altéré ou tronqué dans le localStorage
2. **Token invalide** : Une valeur non-JWT a été stockée à la place du token
3. **Problème de synchronisation** : Le token n'a pas été correctement sauvegardé lors de la connexion

## Solutions appliquées

### 1. Validation côté client
- ✅ Ajout de la validation du format JWT avant envoi des requêtes
- ✅ Nettoyage automatique des tokens corrompus
- ✅ Redirection automatique vers la page de connexion

### 2. Utilitaires créés
- ✅ `src/utils/admin-auth.ts` : Fonctions utilitaires pour la gestion des tokens
- ✅ `debug-jwt.js` : Script de diagnostic pour analyser les tokens

### 3. Améliorations dans user-management
- ✅ Validation des tokens dans toutes les fonctions API
- ✅ Gestion d'erreur améliorée pour les tokens corrompus
- ✅ Messages d'erreur plus explicites

## Étapes de résolution immédiate

### Option 1 : Nettoyage manuel (Recommandé)
1. Ouvrir la console du navigateur (F12)
2. Exécuter : `localStorage.removeItem('adminToken')`
3. Actualiser la page
4. Se reconnecter via `/admin/login`

### Option 2 : Diagnostic approfondi
1. Copier le contenu de `debug-jwt.js`
2. L'exécuter dans la console du navigateur
3. Analyser les résultats pour identifier le problème

### Option 3 : Nettoyage complet
1. Ouvrir les outils de développement (F12)
2. Aller dans l'onglet "Application" ou "Storage"
3. Supprimer tout le localStorage pour le domaine
4. Actualiser et se reconnecter

## Prévention future

Les améliorations apportées au code incluent :

1. **Validation automatique** : Vérification du format JWT avant chaque requête
2. **Nettoyage automatique** : Suppression des tokens corrompus
3. **Gestion d'erreur robuste** : Redirection automatique en cas de problème
4. **Utilitaires réutilisables** : Fonctions communes pour toutes les pages admin

## Vérification

Après application des corrections :
1. Se connecter à `/admin/login`
2. Vérifier que le token est correctement stocké
3. Naviguer vers `/admin/user-management`
4. Confirmer que l'erreur 401 n'apparaît plus

## Fichiers modifiés

- `src/app/admin/user-management/page.tsx` : Validation des tokens
- `src/utils/admin-auth.ts` : Utilitaires d'authentification (nouveau)
- `debug-jwt.js` : Script de diagnostic (nouveau)

## Notes techniques

Un token JWT valide doit :
- Avoir exactement 3 parties séparées par des points (header.payload.signature)
- Être encodé en Base64
- Contenir des données JSON valides dans le header et payload

Le code vérifie maintenant ces critères avant d'envoyer le token au serveur.