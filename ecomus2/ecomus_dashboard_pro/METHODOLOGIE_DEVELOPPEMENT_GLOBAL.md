# 📋 GUIDE SPÉCIFIQUE - ECOMUS DASHBOARD

> **Note** : Ce guide documente la structure ACTUELLE de cette application spécifique.

## 🏗️ STRUCTURE RÉELLE DE L'APPLICATION ECOMUS

### Architecture Actuelle (état des lieux)
```
RACINE/
├── /components/ui/          # Composants UI ShadCN uniquement
├── /lib/                    # Config auth principale (auth-config.ts)
├── /models/                 # TOUS les schémas MongoDB (JS)
├── /scripts/                # Scripts utilitaires
└── /src/
    ├── /app/                # Pages Next.js 13 App Router
    ├── /components/         # TOUS les composants React de l'app
    ├── /lib/                # Utilitaires spécifiques (role-utils.ts, etc.)
    ├── /models/             # Types TypeScript (peu utilisé)
    └── /middleware.ts       # Protection routes
```

## 🔍 ANALYSE AVANT MODIFICATION

### 2. 🏗️ ARCHITECTURE DU PROJET ECOMUS

#### Structure des Répertoires
```
RACINE/
├── /components/ui/          # Composants UI basiques (ShadCN)
├── /lib/                    # Config auth + utils racine
├── /models/                 # Schémas MongoDB (JavaScript)
└── /src/
    ├── /components/         # Composants React organisés
    ├── /lib/                # Utilitaires Next.js (TypeScript)
    ├── /models/             # Types TypeScript
    └── /app/                # Pages Next.js 13+ App Router
```

#### Règles d'Organisation
1. **Modèles MongoDB** : `/models/*.js` (Mongoose schemas)
2. **Types TypeScript** : `/src/models/*.ts` (interfaces)
3. **Composants UI** : `/components/ui/` (ShadCN base)
4. **Composants App** : `/src/components/` (logique métier)
5. **Config Auth** : `/lib/auth-config.ts` (NextAuth)
6. **Utilitaires App** : `/src/lib/` (helpers, API, etc.)

### 3. 🔐 SYSTÈME D'AUTHENTIFICATION ET RÔLES

#### Rôles Supportés (Compatibilité)
```javascript
// Ancien système (rétrocompatibilité)
'admin', 'vendor', 'customer', 'user'

// Nouveau système (hiérarchique)
'SUPER_ADMIN', 'ADMIN', 'MODERATOR'
```

#### Mapping des Rôles
```javascript
const ROLE_MAPPING = {
  'admin': 'SUPER_ADMIN',
  'vendor': 'MODERATOR',
  'customer': 'customer',
  'user': 'customer'
};
```

#### Fichiers Critiques d'Auth
- `/lib/auth-config.ts` - Configuration NextAuth
- `/src/lib/role-utils.ts` - Utilitaires de rôles
- `/src/middleware.ts` - Protection des routes
- `/models/User.js` - Schéma utilisateur MongoDB

### 4. 🛡️ VÉRIFICATIONS OBLIGATOIRES

#### Avant Modification d'un Fichier
1. **Lister tous les fichiers qui l'importent**
2. **Vérifier les types/interfaces utilisés**
3. **Identifier les APIs qui l'utilisent**
4. **Vérifier les composants qui en dépendent**

#### Avant Création d'un Nouveau Fichier
1. **Vérifier qu'il n'existe pas déjà**
2. **Respecter la structure existante**
3. **Suivre les conventions de nommage**
4. **Mettre à jour les index si nécessaire**

### 5. 🔧 PROCÉDURE DE MODIFICATION

#### Étape 1 : Audit Global
```bash
# Rechercher tous les usages d'un élément
grep -r "nom_element" src/
grep -r "nom_element" components/
grep -r "nom_element" lib/
grep -r "nom_element" models/
```

#### Étape 2 : Analyse d'Impact
- [ ] Lister tous les fichiers impactés
- [ ] Identifier les breaking changes potentiels
- [ ] Vérifier les imports/exports
- [ ] Analyser les dépendances circulaires

#### Étape 3 : Planification
- [ ] Ordre de modification des fichiers
- [ ] Points de test intermédiaires
- [ ] Plan de rollback si nécessaire

#### Étape 4 : Exécution Contrôlée
- [ ] Une modification à la fois
- [ ] Test après chaque changement
- [ ] Vérification des erreurs TypeScript
- [ ] Validation fonctionnelle

### 6. 🚨 RÈGLES STRICTES

#### ❌ INTERDICTIONS ABSOLUES
1. **NE JAMAIS** créer de doublons de répertoires
2. **NE JAMAIS** modifier sans analyser l'impact global
3. **NE JAMAIS** ignorer les erreurs TypeScript
4. **NE JAMAIS** casser la rétrocompatibilité
5. **NE JAMAIS** modifier plusieurs fichiers en parallèle

#### ✅ OBLIGATIONS
1. **TOUJOURS** vérifier la structure existante
2. **TOUJOURS** respecter les conventions
3. **TOUJOURS** tester après modification
4. **TOUJOURS** documenter les changements
5. **TOUJOURS** maintenir la cohérence

### 7. 🔍 OUTILS DE VÉRIFICATION

#### Commandes de Diagnostic
```bash
# Structure du projet
find . -type d -name "components" -o -name "lib" -o -name "models"

# Recherche de doublons
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "export.*Component"

# Vérification des imports
grep -r "import.*from.*\.\." src/

# Analyse des rôles
grep -r "role.*admin\|SUPER_ADMIN\|MODERATOR" src/
```

#### Points de Contrôle
1. **Build TypeScript** : `yarn build`
2. **Linting** : `yarn lint`
3. **Tests** : `yarn test`
4. **Authentification** : Test de connexion admin

### 8. 📊 MONITORING CONTINU

#### Métriques à Surveiller
- [ ] Nombre de fichiers dupliqués
- [ ] Erreurs TypeScript
- [ ] Warnings de build
- [ ] Temps de compilation
- [ ] Cohérence des imports

### 9. 🔄 PROCESSUS DE VALIDATION

#### Avant Commit
1. **Audit complet** de la structure
2. **Test de toutes les fonctionnalités critiques**
3. **Vérification des imports/exports**
4. **Validation des types TypeScript**
5. **Test d'authentification**

#### Checklist Finale
- [ ] Aucun fichier dupliqué créé
- [ ] Structure respectée
- [ ] Imports cohérents
- [ ] Tests passent
- [ ] Authentification fonctionne
- [ ] Pas d'erreurs de build

## 🚨 VIOLATION DE CETTE MÉTHODOLOGIE

Toute modification qui ne suit pas cette méthodologie doit être immédiatement annulée et reprise depuis le début.

---

**Date de création** : 12 juin 2025
**Version** : 1.0
**Statut** : OBLIGATOIRE - NON NÉGOCIABLE
