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

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Chercher toutes les utilisations de Link avec href
    const linkMatches = [...content.matchAll(/<Link[^>]*href=\{[^}]*\}[^>]*>/g)];
    
    if (linkMatches.length === 0) {
      return null;
    }

    const results = [];
    
    for (const match of linkMatches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const linkCode = match[0];
      
      // Extraire la valeur href
      const hrefMatch = linkCode.match(/href=\{([^}]+)\}/);
      const hrefValue = hrefMatch ? hrefMatch[1] : 'unknown';
      
      // Vérifier s'il y a une protection
      const hasProtection = content.includes('if (!product || !product.id)') || 
                            content.includes('if (!product?.id)') ||
                            content.includes('product?.id ?') ||
                            content.includes('// Vérification de sécurité pour éviter les href undefined') ||
                            content.includes('if (!item || !item.id)') ||
                            content.includes('if (!item?.id)');
      
      results.push({
        line: lineNumber,
        hrefValue,
        linkCode,
        hasProtection
      });
    }
    
    return { file: relativePath, links: results };
  } catch (error) {
    return null;
  }
}

console.log('🔍 RECHERCHE DE TOUS LES COMPOSANTS LINK...\n');

const allFiles = getAllJSXFiles('.');
const componentsWithLinks = [];

for (const file of allFiles) {
  const analysis = analyzeFile(file);
  if (analysis && analysis.links.length > 0) {
    componentsWithLinks.push(analysis);
  }
}

console.log(`📋 Fichiers avec des composants Link: ${componentsWithLinks.length}\n`);

// Grouper par protection
const protectedFiles = [];
const unprotectedFiles = [];

for (const fileAnalysis of componentsWithLinks) {
  let hasUnprotectedLinks = false;
  
  for (const link of fileAnalysis.links) {
    if (!link.hasProtection && (link.hrefValue.includes('.id') || link.hrefValue.includes('id}'))) {
      hasUnprotectedLinks = true;
      break;
    }
  }
  
  if (hasUnprotectedLinks) {
    unprotectedFiles.push(fileAnalysis);
  } else {
    protectedFiles.push(fileAnalysis);
  }
}

console.log(`🚨 FICHIERS AVEC LIENS NON PROTÉGÉS: ${unprotectedFiles.length}`);
for (const file of unprotectedFiles) {
  console.log(`\n❌ ${file.file}`);
  for (const link of file.links) {
    if (!link.hasProtection && (link.hrefValue.includes('.id') || link.hrefValue.includes('id}'))) {
      console.log(`   │ Ligne ${link.line}: href={${link.hrefValue}}`);
      console.log(`   │ Code: ${link.linkCode.substring(0, 80)}...`);
    }
  }
}

console.log(`\n✅ FICHIERS AVEC LIENS PROTÉGÉS: ${protectedFiles.length}`);
for (const file of protectedFiles) {
  console.log(`   - ${file.file}`);
}

if (unprotectedFiles.length === 0) {
  console.log('\n🎉 Tous les fichiers avec des liens sont protégés!');
  console.log('Le problème pourrait venir d\'ailleurs...');
} else {
  console.log('\n⚠️  Ces fichiers nécessitent une correction immédiate!');
}
