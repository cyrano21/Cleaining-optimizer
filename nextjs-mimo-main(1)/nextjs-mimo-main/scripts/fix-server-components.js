const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Exécuter le script fix-paths.js pour créer les pages problématiques manquantes
try {
  console.log('Correction des chemins problématiques...');
  require('./fix-paths');
} catch (error) {
  console.error('Erreur lors de la correction des chemins:', error);
}

// Structure du projet
function determineNextJsStructure() {
  const appDir = path.join(__dirname, '../src/app');
  const pagesDir = path.join(__dirname, '../src/pages');
  const appDirExists = fs.existsSync(appDir);
  const pagesDirExists = fs.existsSync(pagesDir);
  
  console.log(`Structure du projet: ${appDirExists ? 'App Router' : ''} ${pagesDirExists ? 'Pages Router' : ''}`);
  
  return {
    appDir: appDirExists ? appDir : null,
    pagesDir: pagesDirExists ? pagesDir : null,
    isAppRouter: appDirExists,
    isPagesRouter: pagesDirExists
  };
}

// Fonction pour trouver tous les fichiers de composants dans le répertoire
function findComponentFiles(directory, fileList = []) {
  if (!fs.existsSync(directory)) {
    console.log(`Le répertoire ${directory} n'existe pas.`);
    return fileList;
  }
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findComponentFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js')) {
      // Pour l'App Router, on s'intéresse à page.tsx, pour Pages Router, on s'intéresse à tous les fichiers
      const isPageFile = file === 'page.tsx' || file === 'page.jsx' || file === 'page.js';
      const isComponentFile = file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js');
      
      if (isPageFile || isComponentFile) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Fonction pour ajouter "use client" à un fichier s'il ne l'a pas déjà
function addUseClientDirective(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Le fichier ${filePath} n'existe pas.`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient un import React ou d'autres imports typiques de composants
    const isLikelyComponent = 
      content.includes('import React') || 
      content.includes('export default function') ||
      content.includes('export function') ||
      content.includes('export const');
    
    // Si ce n'est pas probablement un composant, on l'ignore
    if (!isLikelyComponent) {
      console.log(`Le fichier ${filePath} ne semble pas être un composant React.`);
      return false;
    }
    
    // Vérifier si "use client" est déjà présent
    if (content.includes('"use client"') || content.includes("'use client'")) {
      console.log(`Le fichier ${filePath} est déjà un composant client.`);
      return false;
    }
    
    // Ajouter "use client" au début du fichier
    content = '"use client"\n\n' + content;
    fs.writeFileSync(filePath, content);
    
    console.log(`"use client" ajouté à ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${filePath}:`, error);
    return false;
  }
}

// Analyser la structure du projet
const structure = determineNextJsStructure();

if (!structure.appDir && !structure.pagesDir) {
  console.log("Aucun répertoire app/ ou pages/ trouvé. La structure du projet est-elle correcte?");
  console.log("Recherche dans le répertoire src/...");
  
  // Chercher dans tout le projet
  const srcDir = path.join(__dirname, '../src');
  if (fs.existsSync(srcDir)) {
    console.log(`Recherche des fichiers dans ${srcDir}...`);
    const allFiles = findComponentFiles(srcDir);
    console.log(`${allFiles.length} fichiers trouvés.`);
    
    // Identifier les fichiers problématiques qui pourraient contenir des exports complexes
    let modifiedCount = 0;
    for (const filePath of allFiles) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifier si le fichier contient des exports complexes
      const hasComplexExports = 
        content.includes('export {') || 
        content.includes('export * from') ||
        (content.includes('export') && content.includes('Module'));
      
      // Si le fichier a des exports complexes, on ajoute "use client"
      if (hasComplexExports) {
        console.log(`Fichier avec exports complexes: ${filePath}`);
        const modified = addUseClientDirective(filePath);
        if (modified) modifiedCount++;
      }
    }
    
    console.log(`\nTraitement terminé. ${modifiedCount} fichiers modifiés.`);
  } else {
    console.log(`Le répertoire ${srcDir} n'existe pas. Structure du projet non reconnue.`);
  }
} else {
  // Traiter l'App Router ou Pages Router selon ce qui est détecté
  let srcDir = structure.appDir || structure.pagesDir;
  console.log(`Recherche des fichiers dans ${srcDir}...`);
  
  const allFiles = findComponentFiles(srcDir);
  console.log(`${allFiles.length} fichiers trouvés.`);
  
  // Identifier et corriger les fichiers problématiques
  let modifiedCount = 0;
  for (const filePath of allFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient des exports complexes
    const hasComplexExports = 
      content.includes('export {') || 
      content.includes('export * from') ||
      (content.includes('export') && content.includes('Module'));
    
    // Si le fichier a des exports complexes ou est une page, on ajoute "use client"
    if (hasComplexExports || filePath.includes('page.')) {
      console.log(`Fichier à traiter: ${filePath}`);
      const modified = addUseClientDirective(filePath);
      if (modified) modifiedCount++;
    }
  }
  
  console.log(`\nTraitement terminé. ${modifiedCount} fichiers modifiés.`);
}

// Installer critters s'il n'est pas déjà installé
try {
  console.log('\nVérification et installation de critters...');
  execSync('npm install critters --save', { stdio: 'inherit' });
  console.log('Critters installé avec succès!');
} catch (error) {
  console.error('Erreur lors de l\'installation de critters:', error);
}
