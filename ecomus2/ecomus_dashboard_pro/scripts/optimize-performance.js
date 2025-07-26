const fs = require('fs');
const path = require('path');

/**
 * Script d'optimisation des performances frontend
 * Analyse et optimise les composants React pour de meilleures performances
 */

const srcDir = path.join(__dirname, '..', 'src');

// Patterns à optimiser
const optimizationPatterns = {
  // Composants qui devraient être mémorisés
  memoizable: [
    /const\s+(\w+)\s*=\s*\(\{[^}]*\}\)\s*=>\s*\{/g,
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g
  ],
  
  // Imports qui peuvent être optimisés
  heavyImports: [
    /import\s+.*\s+from\s+['"]lodash['"]/g,
    /import\s+.*\s+from\s+['"]moment['"]/g,
    /import\s+.*\s+from\s+['"]@mui\/material['"]/g
  ],
  
  // Fonctions qui devraient utiliser useCallback
  callbackable: [
    /const\s+(handle\w+|on\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/g
  ]
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Vérifier les composants non mémorisés
  optimizationPatterns.memoizable.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (!content.includes('React.memo') && !content.includes('memo(')) {
        issues.push({
          type: 'memo',
          component: match[1],
          line: content.substring(0, match.index).split('\n').length,
          suggestion: `Considérer React.memo pour ${match[1]}`
        });
      }
    }
  });
  
  // Vérifier les imports lourds
  optimizationPatterns.heavyImports.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      issues.push({
        type: 'import',
        line: content.substring(0, match.index).split('\n').length,
        suggestion: 'Utiliser des imports spécifiques au lieu d\'imports complets'
      });
    }
  });
  
  // Vérifier les fonctions qui devraient utiliser useCallback
  optimizationPatterns.callbackable.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (!content.includes('useCallback')) {
        issues.push({
          type: 'callback',
          function: match[1],
          line: content.substring(0, match.index).split('\n').length,
          suggestion: `Utiliser useCallback pour ${match[1]}`
        });
      }
    }
  });
  
  return issues;
}

function scanDirectory(dir) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.jsx'))) {
        const issues = analyzeFile(fullPath);
        if (issues.length > 0) {
          results.push({
            file: path.relative(srcDir, fullPath),
            issues
          });
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

function generateOptimizationReport() {
  console.log('🔄 Analyse des performances frontend...');
  
  const results = scanDirectory(srcDir);
  
  console.log('\n📊 Rapport d\'optimisation des performances\n');
  console.log('=' .repeat(50));
  
  if (results.length === 0) {
    console.log('✅ Aucun problème de performance détecté!');
    return;
  }
  
  let totalIssues = 0;
  
  results.forEach(result => {
    console.log(`\n📁 ${result.file}`);
    console.log('-'.repeat(30));
    
    result.issues.forEach(issue => {
      totalIssues++;
      const icon = {
        memo: '🧠',
        import: '📦',
        callback: '🔄'
      }[issue.type] || '⚠️';
      
      console.log(`${icon} Ligne ${issue.line}: ${issue.suggestion}`);
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 Total: ${totalIssues} optimisations possibles dans ${results.length} fichier(s)`);
  
  // Générer des recommandations spécifiques
  console.log('\n💡 Recommandations prioritaires:');
  console.log('1. Mémoriser les composants avec React.memo');
  console.log('2. Utiliser useCallback pour les fonctions de gestion d\'événements');
  console.log('3. Optimiser les imports de bibliothèques tierces');
  console.log('4. Implémenter le lazy loading pour les composants lourds');
}

function createOptimizedComponent(componentPath) {
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Ajouter React.memo si nécessaire
  let optimizedContent = content;
  
  if (!content.includes('React.memo') && !content.includes('memo(')) {
    // Détecter l'export par défaut
    const exportMatch = content.match(/export default (\w+);?/);
    if (exportMatch) {
      const componentName = exportMatch[1];
      optimizedContent = optimizedContent.replace(
        exportMatch[0],
        `export default React.memo(${componentName});`
      );
      
      // Ajouter l'import React si nécessaire
      if (!content.includes('import React')) {
        optimizedContent = `import React from 'react';\n${optimizedContent}`;
      }
    }
  }
  
  return optimizedContent;
}

// Exécuter l'analyse
if (require.main === module) {
  generateOptimizationReport();
}

module.exports = {
  analyzeFile,
  scanDirectory,
  generateOptimizationReport,
  createOptimizedComponent
};