const fs = require('fs');
const path = require('path');

console.log('🔍 RECHERCHE URGENTE DES HREF UNDEFINED');
console.log('========================================\n');

// Patterns dangereux spécifiques
const dangerousPatterns = [
  // href directement avec variable non protégée
  /<Link[^>]*href=\{[^}]*\.id[^}]*\}/g,
  // href avec template literal non protégé
  /<Link[^>]*href=\{`[^`]*\$\{[^}]*\.id[^}]*\}[^`]*`\}/g,
  // href avec objets potentiellement undefined
  /<Link[^>]*href=\{[^}]*product[^}]*\}/g,
  // href avec elm (comme dans cartProducts.map)
  /<Link[^>]*href=\{[^}]*elm[^}]*\}/g,
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Vérifier si le fichier contient des imports Link
    if (!content.includes('from "next/link"') && !content.includes("from 'next/link'")) {
      return issues;
    }
    
    dangerousPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          
          // Vérifier si il y a une protection dans les lignes précédentes
          const lines = content.split('\n');
          const startCheck = Math.max(0, lineNumber - 10);
          const checkRange = lines.slice(startCheck, lineNumber).join('\n');
          
          const hasProtection = 
            checkRange.includes('if (!') ||
            checkRange.includes('if (') ||
            checkRange.includes('return null') ||
            checkRange.includes('return <div') ||
            checkRange.includes('|| ');
            
          if (!hasProtection) {
            issues.push({
              type: `Pattern dangereux ${index + 1}`,
              match: match,
              line: lineNumber,
              severity: 'CRITIQUE'
            });
          }
        });
      }
    });
    
    return issues;
  } catch (error) {
    return [{ type: 'Erreur de lecture', error: error.message }];
  }
}

function scanDirectory(dir, results = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      scanDirectory(fullPath, results);
    } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Scanner tous les fichiers
const allFiles = scanDirectory('.');
let criticalFiles = [];

console.log('📁 Fichiers scannés:', allFiles.length);
console.log('');

allFiles.forEach(filePath => {
  const issues = scanFile(filePath);
  
  if (issues.length > 0) {
    const criticalIssues = issues.filter(i => i.severity === 'CRITIQUE');
    if (criticalIssues.length > 0) {
      criticalFiles.push(filePath);
      console.log(`🚨 CRITIQUE: ${path.relative('.', filePath)}`);
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.type} - Ligne ${issue.line}`);
        console.log(`      Code: ${issue.match.substring(0, 80)}...`);
      });
      console.log('');
    }
  }
});

console.log('\n🎯 RÉSUMÉ CRITIQUE');
console.log('==================');
console.log(`Fichiers critiques trouvés: ${criticalFiles.length}`);

if (criticalFiles.length > 0) {
  console.log('\n📋 FICHIERS À CORRIGER EN URGENCE:');
  criticalFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${path.relative('.', file)}`);
  });
  
  console.log('\n🛠️ ACTIONS RECOMMANDÉES:');
  console.log('1. Corriger les fichiers listés ci-dessus');
  console.log('2. Ajouter des vérifications: if (!item || !item.id) return null;');
  console.log('3. Redémarrer le serveur de développement');
} else {
  console.log('✅ Aucun fichier critique trouvé');
}

console.log('\n✨ Analyse terminée!');
