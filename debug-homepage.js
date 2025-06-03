// Script pour analyser en profondeur tous les composants de la page d'accueil
const fs = require('fs');
const path = require('path');

function readFileContent(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.log(`Erreur lecture ${filePath}: ${error.message}`);
  }
  return null;
}

function analyzeComponent(filePath, componentName) {
  const content = readFileContent(filePath);
  if (!content) return null;

  const analysis = {
    name: componentName,
    path: filePath,
    hasLinks: false,
    linkPatterns: [],
    hasProtection: false,
    imports: [],
    isProblematic: false
  };

  // Chercher les imports
  const importMatches = content.match(/import.*from.*/g);
  if (importMatches) {
    analysis.imports = importMatches;
  }

  // Chercher les liens avec des IDs
  const linkPatterns = [
    /href=.*\$\{[^}]*\.id[^}]*\}/g,
    /to=.*\$\{[^}]*\.id[^}]*\}/g,
    /<Link[^>]*href=\{[^}]*undefined[^}]*\}/g
  ];

  for (const pattern of linkPatterns) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      analysis.hasLinks = true;
      analysis.linkPatterns.push(...matches.map(m => m[0]));
    }
  }

  // Vérifier la protection
  const protectionPatterns = [
    /if\s*\(\s*![^)]*\|\|\s*![^)]*\.id\s*\)/,
    /if\s*\(\s*![^)]*\?\.\s*id\s*\)/,
    /\/\/\s*Vérification\s*de\s*sécurité/,
    /product\?\.\s*id\s*\?/
  ];

  for (const pattern of protectionPatterns) {
    if (pattern.test(content)) {
      analysis.hasProtection = true;
      break;
    }
  }

  // Marquer comme problématique si a des liens mais pas de protection
  analysis.isProblematic = analysis.hasLinks && !analysis.hasProtection;

  return analysis;
}

function findComponentFile(componentName) {
  const possiblePaths = [
    `components/homes/home-1/${componentName}.jsx`,
    `components/common/${componentName}.jsx`,
    `components/headers/${componentName}.jsx`,
    `components/footers/${componentName}.jsx`,
    `components/shopCards/${componentName}.jsx`,
    `components/modals/${componentName}.jsx`
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }
  return null;
}

// Analyser tous les composants de la page d'accueil
console.log('🔍 ANALYSE EXHAUSTIVE DE LA PAGE D\'ACCUEIL\n');

// Lire la page d'accueil
const homePage = readFileContent('app/page.jsx');
if (!homePage) {
  console.log('❌ Impossible de lire app/page.jsx');
  process.exit(1);
}

// Extraire tous les composants utilisés
const componentMatches = homePage.match(/<(\w+)[^>]*\/?>/g);
const componentNames = new Set();

if (componentMatches) {
  for (const match of componentMatches) {
    const componentName = match.match(/<(\w+)/)[1];
    if (componentName && componentName[0] === componentName[0].toUpperCase()) {
      componentNames.add(componentName);
    }
  }
}

// Analyser chaque composant
const problematicComponents = [];

for (const componentName of componentNames) {
  const componentPath = findComponentFile(componentName);
  if (componentPath) {
    const analysis = analyzeComponent(componentPath, componentName);
    if (analysis) {
      console.log(`📋 ${componentName}:`);
      console.log(`   Chemin: ${componentPath}`);
      console.log(`   Liens: ${analysis.hasLinks ? '✅' : '❌'}`);
      console.log(`   Protection: ${analysis.hasProtection ? '✅' : '❌'}`);
      console.log(`   Problématique: ${analysis.isProblematic ? '🚨 OUI' : '✅ NON'}`);
      
      if (analysis.linkPatterns.length > 0) {
        console.log(`   Patterns trouvés:`);
        analysis.linkPatterns.forEach(pattern => {
          console.log(`     - ${pattern.substring(0, 100)}...`);
        });
      }
      
      if (analysis.isProblematic) {
        problematicComponents.push(analysis);
      }
      
      console.log('');
    }
  } else {
    console.log(`⚠️  ${componentName}: Fichier non trouvé`);
  }
}

console.log('\n🚨 COMPOSANTS PROBLÉMATIQUES:');
if (problematicComponents.length === 0) {
  console.log('✅ Aucun composant problématique trouvé dans la page d\'accueil!');
} else {
  problematicComponents.forEach(comp => {
    console.log(`❌ ${comp.name} (${comp.path})`);
  });
}

// Analyser également les sous-composants des composants principaux
console.log('\n🔍 ANALYSE DES SOUS-COMPOSANTS...');

for (const componentName of ['Products', 'Categories', 'ShopGram', 'Hero']) {
  const componentPath = findComponentFile(componentName);
  if (componentPath) {
    const content = readFileContent(componentPath);
    if (content) {
      // Chercher les imports de sous-composants
      const subComponentImports = content.match(/import.*from.*shopCards.*/g);
      if (subComponentImports) {
        console.log(`\n📦 ${componentName} utilise:`);
        subComponentImports.forEach(imp => console.log(`   ${imp}`));
      }
    }
  }
}
