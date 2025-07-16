const fs = require('fs');
const path = require('path');

// Fonction pour analyser les fichiers de composants
function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier la présence de "use client" directive
    const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
    
    // Vérifier les exports d'objets complexes ou de modules
    const hasComplexExports = 
      content.includes('export {') || 
      content.includes('export * from') ||
      (content.includes('export') && content.includes('Module'));
    
    // Vérifier la présence de hooks React
    const usesHooks = 
      content.includes('useState') || 
      content.includes('useEffect') || 
      content.includes('useContext') ||
      content.includes('useRef');
    
    // Vérifier s'il s'agit d'un fichier de page
    const isPage = 
      filePath.endsWith('/page.tsx') || 
      filePath.endsWith('/page.jsx') || 
      filePath.endsWith('/page.js') ||
      filePath.includes('/pages/');
    
    return {
      path: filePath,
      isClientComponent,
      hasComplexExports,
      usesHooks,
      isPage,
      needsClientDirective: (hasComplexExports || usesHooks) && !isClientComponent,
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse du fichier ${filePath}:`, error);
    return null;
  }
}

// Fonction récursive pour explorer les répertoires
function scanDirectory(directory, results = []) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Le répertoire ${directory} n'existe pas.`);
      return results;
    }
    
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath, results);
      } else if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
        const result = analyzeComponent(filePath);
        if (result) {
          results.push(result);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Erreur lors de l'analyse du répertoire ${directory}:`, error);
    return results;
  }
}

// Démarrer l'analyse à partir du répertoire src
const srcDir = path.join(__dirname, '../src');
console.log(`Recherche des composants dans ${srcDir}...`);

if (!fs.existsSync(srcDir)) {
  console.log(`Le répertoire ${srcDir} n'existe pas. Vérifiez la structure du projet.`);
  process.exit(1);
}

const results = scanDirectory(srcDir);

// Filtrer les composants potentiellement problématiques
const problematicComponents = results.filter(r => r.needsClientDirective);
const problematicPages = results.filter(r => r.isPage && r.needsClientDirective);

console.log('\nComposants potentiellement problématiques (nécessitent "use client"):');
console.log(problematicComponents.map(c => c.path).join('\n') || 'Aucun trouvé');

console.log('\nPages potentiellement problématiques:');
console.log(problematicPages.map(c => c.path).join('\n') || 'Aucune trouvée');

// Écrire les résultats dans un fichier pour référence
fs.writeFileSync(
  path.join(__dirname, '../component-analysis.json'),
  JSON.stringify({
    allComponents: results,
    problematicComponents,
    problematicPages
  }, null, 2)
);

console.log(`\nAnalyse terminée. ${results.length} composants analysés.`);
console.log(`${problematicComponents.length} composants problématiques, dont ${problematicPages.length} pages.`);
console.log('Voir component-analysis.json pour les détails complets.');

// Application automatique des corrections aux problèmes détectés
console.log('\nApplication des corrections aux problèmes détectés...');

let correctedCount = 0;
for (const component of problematicComponents) {
  try {
    const content = fs.readFileSync(component.path, 'utf8');
    
    // Ajouter "use client" au début du fichier s'il ne l'a pas déjà
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      const newContent = '"use client"\n\n' + content;
      fs.writeFileSync(component.path, newContent);
      correctedCount++;
      console.log(`Correction appliquée à ${component.path}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la correction du fichier ${component.path}:`, error);
  }
}

console.log(`\n${correctedCount} fichiers corrigés.`);
