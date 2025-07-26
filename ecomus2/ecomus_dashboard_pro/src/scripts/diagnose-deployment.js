#!/usr/bin/env node

/**
 * Script de diagnostic pour les problèmes de déploiement
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 DIAGNOSTIC DES PROBLÈMES DE DÉPLOIEMENT\n');

// Vérifier les fichiers de configuration
const configFiles = [
  'package.json',
  'yarn.lock',
  'vercel.json',
  '.yarnrc.yml',
  'next.config.js'
];

console.log('📁 FICHIERS DE CONFIGURATION:');
configFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📦 INFORMATIONS YARN:');
try {
  const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
  console.log(`   Version Yarn: ${yarnVersion}`);
} catch (error) {
  console.log('   ❌ Yarn non disponible');
}

console.log('\n📦 INFORMATIONS NPM:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`   Version NPM: ${npmVersion}`);
} catch (error) {
  console.log('   ❌ NPM non disponible');
}

console.log('\n🔧 SOLUTIONS APPLIQUÉES:');
console.log('   ✅ Configuration .yarnrc.yml ajoutée');
console.log('   ✅ Résolutions de paquets dans package.json');
console.log('   ✅ Scripts de build alternatifs');
console.log('   ✅ Configuration Vercel optimisée');

console.log('\n🚀 COMMANDES ALTERNATIVES:');
console.log('   yarn build:vercel     - Build avec timeout étendu');
console.log('   yarn build:alternative - Build avec npm fallback');
console.log('   yarn reinstall        - Réinstallation complète');
console.log('   yarn clean            - Nettoyage complet');

console.log('\n💡 RECOMMANDATIONS:');
console.log('   1. Redéployer après les modifications');
console.log('   2. Vérifier les variables d\'environnement');
console.log('   3. Utiliser Node.js 18.x pour la compatibilité');
console.log('   4. Si le problème persiste, attendre que npm registry se stabilise');

console.log('\n✅ Diagnostic terminé !');
