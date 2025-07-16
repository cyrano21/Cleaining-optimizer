// @ts-check
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script pour nettoyer le cache de Next.js et résoudre les problèmes de build
 */

// Chemins à supprimer
const pathsToDelete = [
  '.next',
  'node_modules/.cache'
];

console.log('🧹 Nettoyage du cache Next.js...');

// Supprimer les dossiers
pathsToDelete.forEach(p => {
  const fullPath = path.join(process.cwd(), p);
  if (fs.existsSync(fullPath)) {
    console.log(`Suppression de ${p}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    console.log(`Le chemin ${p} n'existe pas, ignoré.`);
  }
});

console.log('✅ Nettoyage terminé');

// Réinstaller les dépendances (pour reconstruire le cache)
console.log('📦 Réinstallation des dépendances...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances réinstallées');
} catch (error) {
  console.error('❌ Erreur lors de la réinstallation des dépendances:', error);
  process.exit(1);
}

console.log('🚀 Prêt pour la génération du build. Exécutez "npm run build" pour créer un nouveau build.');
