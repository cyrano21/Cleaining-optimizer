#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des APIs consolidées...\n');

// Fonction pour vérifier les imports dans un fichier
function checkApiFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Vérifier les imports relatifs problématiques
  if (content.includes('../../')) {
    const matches = content.match(/from\s+['"][^'"]*\.\.\//g);
    if (matches) {
      issues.push(`Imports relatifs trouvés: ${matches.join(', ')}`);
    }
  }

  // Vérifier l'utilisation de dbConnect
  if (content.includes('dbConnect') && !content.includes('await dbConnect()')) {
    issues.push('dbConnect utilisé sans await');
  }

  // Vérifier les imports d'alias @
  if (content.includes('from "@/') && !content.includes('import')) {
    issues.push('Import avec alias @ mal formé');
  }

  return issues;
}

// Parcourir tous les fichiers API
function scanApiDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFiles = 0;
  let issuesFound = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = scanApiDirectory(fullPath);
      totalFiles += subResults.totalFiles;
      issuesFound += subResults.issuesFound;
    } else if (entry.name.endsWith('.js')) {
      totalFiles++;
      const issues = checkApiFile(fullPath);
      
      if (issues.length > 0) {
        console.log(`⚠️  ${fullPath.replace('/workspaces/ecomusnext/', '')}:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        issuesFound++;
      }
    }
  }

  return { totalFiles, issuesFound };
}

// Démarrer la vérification
const apiDir = '/workspaces/ecomusnext/app/api';
const results = scanApiDirectory(apiDir);

console.log('\n📊 Résultats de la consolidation des APIs:');
console.log(`✅ ${results.totalFiles} fichiers API analysés`);
console.log(`${results.issuesFound > 0 ? '⚠️' : '✅'} ${results.issuesFound} fichiers avec des problèmes`);

// Lister les APIs principales
console.log('\n📋 APIs principales consolidées:');
const mainApis = [
  'products/index.js',
  'orders/index.js', 
  'users/index.js',
  'categories/index.js',
  'auth/[...nextauth]/route.js',
  'dashboard/stats/route.js',
  'dashboard/products/route.js',
  'dashboard/orders/route.js'
];

mainApis.forEach(api => {
  const apiPath = path.join(apiDir, api);
  const exists = fs.existsSync(apiPath);
  console.log(`${exists ? '✅' : '❌'} /api/${api}`);
});

console.log('\n🎉 Consolidation des APIs terminée !');
