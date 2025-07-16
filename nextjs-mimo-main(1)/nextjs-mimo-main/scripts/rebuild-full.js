/**
 * Script de nettoyage et reconstruction complet pour Next.js
 * Ce script nettoie tous les caches et dossiers de build avant de reconstruire l'application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour exécuter une commande
function runCommand(command) {
  console.log(`\x1b[36m> ${command}\x1b[0m`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\x1b[31mErreur lors de l'exécution de la commande: ${command}\x1b[0m`);
    return false;
  }
}

// Fonction pour supprimer un dossier récursivement
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  console.log(`\x1b[33mSuppression de ${dirPath}...\x1b[0m`);
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`\x1b[32m✓ ${dirPath} supprimé\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31mErreur lors de la suppression de ${dirPath}: ${err.message}\x1b[0m`);
  }
}

// Début du nettoyage
console.log("\x1b[36m=== NETTOYAGE ET RECONSTRUCTION DE L'APPLICATION NEXT.JS ===\x1b[0m");

// 1. Supprimer les dossiers de cache et build
console.log("\x1b[36m\n[1/4] Suppression des dossiers de cache et build...\x1b[0m");
removeDir(path.join(__dirname, '..', '.next'));
removeDir(path.join(__dirname, '..', 'node_modules', '.cache'));

// 2. Nettoyer le cache npm
console.log("\x1b[36m\n[2/4] Nettoyage du cache npm...\x1b[0m");
runCommand('npm cache clean --force');

// 3. Réinstaller les dépendances
console.log("\x1b[36m\n[3/4] Réinstallation des dépendances...\x1b[0m");
runCommand('npm install');

// 4. Reconstruire l'application
console.log("\x1b[36m\n[4/4] Construction de l'application...\x1b[0m");

// Utiliser NEXT_FORCE_DYNAMIC pour s'assurer que les pages d'authentification sont générées correctement
process.env.NEXT_FORCE_DYNAMIC = 'true';
runCommand('npm run build');

console.log("\x1b[32m\n=== TERMINÉ ===\x1b[0m");
console.log("\x1b[32mL'application a été nettoyée et reconstruite avec succès!\x1b[0m");
