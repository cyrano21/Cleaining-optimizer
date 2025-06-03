const fs = require('fs');
const path = require('path');

// Rechercher récursivement tous les fichiers jsx/js
function getAllJSXFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      getAllJSXFiles(fullPath, files);
    } else if (item.name.endsWith('.jsx') || item.name.endsWith('.js') || item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Analyser un fichier pour trouver des liens potentiellement dangereux
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Patterns dangereux
    const patterns = [
      { name: 'href with product.id', regex: /href=.*\$\{[^}]*\.id\}/g },
      { name: 'href with .id', regex: /href=.*\$\{[^}]*\.id[^}]*\}/g },
      { name: 'Link href undefined', regex: /<Link[^>]*href=\{[^}]*undefined[^}]*\}/g },
      { name: 'href with variable.id', regex: /href=.*\$\{(\w+)\.id\}/g }
    ];
    
    const issues = [];
    
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern.regex)];
      if (matches.length > 0) {
        for (const match of matches) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          issues.push({
            pattern: pattern.name,
            line: lineNumber,
            code: match[0],
            hasProtection: content.includes('if (!product || !product.id)') || 
                          content.includes('if (!product?.id)') ||
                          content.includes('product?.id ?') ||
                          content.includes('// Vérification de sécurité pour éviter les href undefined')
          });
        }
      }
    }
    
    return { file: relativePath, issues };
  } catch (error) {
    return { file: path.relative(process.cwd(), filePath), issues: [], error: error.message };
  }
}

console.log('🔍 Analyse complète de tous les fichiers JSX/JS...\n');

const allFiles = getAllJSXFiles('.');
const problematicFiles = [];

for (const file of allFiles) {
  const analysis = analyzeFile(file);
  if (analysis.issues.length > 0) {
    problematicFiles.push(analysis);
  }
}

console.log(`📋 Fichiers analysés: ${allFiles.length}`);
console.log(`⚠️  Fichiers avec des problèmes potentiels: ${problematicFiles.length}\n`);

for (const fileAnalysis of problematicFiles) {
  console.log(`\n❌ ${fileAnalysis.file}`);
  
  for (const issue of fileAnalysis.issues) {
    const protectionStatus = issue.hasProtection ? '✅ PROTÉGÉ' : '🚨 NON PROTÉGÉ';
    console.log(`   │ Ligne ${issue.line}: ${issue.pattern} - ${protectionStatus}`);
    console.log(`   │ Code: ${issue.code.substring(0, 80)}...`);
  }
}

// Compter les fichiers non protégés
const unprotectedFiles = problematicFiles.filter(f => 
  f.issues.some(issue => !issue.hasProtection)
);

console.log(`\n🚨 FICHIERS CRITIQUES (non protégés): ${unprotectedFiles.length}`);
for (const file of unprotectedFiles) {
  console.log(`   - ${file.file}`);
}

if (unprotectedFiles.length === 0) {
  console.log('\n✅ Tous les fichiers avec des liens sont protégés!');
} else {
  console.log('\n⚠️  Attention: Il reste des fichiers non protégés qui causent l\'erreur.');
}
