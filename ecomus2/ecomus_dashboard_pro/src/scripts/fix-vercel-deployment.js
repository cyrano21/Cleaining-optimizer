#!/usr/bin/env node

/**
 * 🚀 RÉSOLUTION DES PROBLÈMES DE DÉPLOIEMENT VERCEL
 * Ce script applique plusieurs solutions pour résoudre les erreurs de déploiement
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 RÉSOLUTION DES PROBLÈMES DE DÉPLOIEMENT VERCEL');
console.log('=' .repeat(60));

// 1. Vérifier et créer .npmrc pour utiliser un miroir fiable
const npmrcContent = `
registry=https://registry.npmjs.org/
# Augmenter les timeouts
timeout=60000
fetch-timeout=60000
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
fetch-retry-factor=2
fetch-retries=5
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());
console.log('✅ Fichier .npmrc créé avec configuration robuste');

// 2. Mettre à jour .yarnrc.yml avec configuration plus robuste
const yarnrcContent = `
nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-1.22.22.cjs
networkTimeout: 300000
httpTimeout: 60000
networkConcurrency: 8
`;

fs.writeFileSync('.yarnrc.yml', yarnrcContent.trim());
console.log('✅ Fichier .yarnrc.yml mis à jour');

// 3. Créer un script de build alternatif sans problematic packages
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Sauvegarder les dépendances actuelles
const originalDeps = { ...packageJson.dependencies };

// Ajouter alternatives pour les packages problématiques
if (packageJson.dependencies['@floating-ui/react-dom']) {
    packageJson.dependencies['@floating-ui/react-dom'] = '^2.0.0';
}

// Ajouter scripts de build alternatifs
packageJson.scripts = {
    ...packageJson.scripts,
    'build:safe': 'npm ci --production=false && npm run build',
    'build:yarn': 'yarn install --frozen-lockfile && yarn build',
    'build:npm': 'npm ci && npm run build',
    'vercel-build': 'npm ci --production=false --ignore-scripts && npm run build',
    'postinstall': 'echo "Installation terminée"'
};

// Ajouter engines pour forcer Node.js version
packageJson.engines = {
    node: '>=18.0.0',
    npm: '>=8.0.0'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json mis à jour avec scripts alternatifs');

// 4. Créer vercel.json optimisé
const vercelConfig = {
    "version": 2,
    "builds": [
        {
            "src": "package.json",
            "use": "@vercel/node",
            "config": {
                "maxLambdaSize": "50mb"
            }
        }
    ],
    "buildCommand": "npm ci --production=false && npm run build",
    "installCommand": "npm ci --production=false",
    "framework": "nextjs",
    "functions": {
        "src/app/api/**/*.js": {
            "runtime": "nodejs18.x"
        }
    },
    "env": {
        "NODE_VERSION": "18"
    },
    "regions": ["fra1"]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json optimisé créé');

// 5. Créer script de déploiement robuste
const deployScript = `#!/bin/bash

echo "🚀 DÉPLOIEMENT VERCEL ROBUSTE"
echo "=============================="

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules package-lock.json yarn.lock .next .vercel

# Installer avec NPM (plus stable pour Vercel)
echo "📦 Installation des dépendances avec NPM..."
npm install --production=false

# Build local pour vérifier
echo "🔨 Build local..."
npm run build

# Déployer
echo "🚀 Déploiement sur Vercel..."
npx vercel --prod

echo "✅ Déploiement terminé !"
`;

fs.writeFileSync('deploy-robust.sh', deployScript);
fs.chmodSync('deploy-robust.sh', '755');
console.log('✅ Script de déploiement robuste créé');

// 6. Créer un backup de package-lock si nécessaire
if (fs.existsSync('package-lock.json')) {
    fs.copyFileSync('package-lock.json', 'package-lock.json.backup');
    console.log('✅ Backup de package-lock.json créé');
}

console.log('\n🎯 SOLUTIONS APPLIQUÉES:');
console.log('1. ✅ Configuration .npmrc robuste');
console.log('2. ✅ Configuration .yarnrc.yml optimisée');
console.log('3. ✅ Scripts de build alternatifs');
console.log('4. ✅ Configuration Vercel optimisée');
console.log('5. ✅ Script de déploiement robuste');

console.log('\n🚀 PROCHAINES ÉTAPES:');
console.log('1. Exécuter: npm install');
console.log('2. Tester: npm run build');
console.log('3. Déployer: ./deploy-robust.sh');
console.log('4. Ou utiliser: npx vercel --prod');

console.log('\n💡 ALTERNATIVES EN CAS D\'ÉCHEC:');
console.log('- Utiliser npm au lieu de yarn');
console.log('- Déployer depuis un environnement différent');
console.log('- Utiliser GitHub Actions pour le déploiement');
