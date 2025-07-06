const fs = require('fs');
const path = require('path');

// Rechercher tous les fichiers qui contiennent des liens avec product.id
function findUnsafeLinks() {
  const searchDirs = ['components', 'app'];
  const unsafeFiles = [];

  function searchInDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        searchInDir(fullPath);
      } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js') || file.name.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Chercher les patterns dangereux
          const dangerousPatterns = [
            /href=.*product\.id/g,
            /href=.*\$\{product\.id\}/g,
            /href=.*`.*\$\{product\.id\}.*`/g,
            /to=.*product\.id/g,
            /to=.*\$\{product\.id\}/g
          ];
          
          let hasUnsafePattern = false;
          let foundPatterns = [];
          
          for (const pattern of dangerousPatterns) {
            const matches = content.match(pattern);
            if (matches) {
              hasUnsafePattern = true;
              foundPatterns.push(...matches);
            }
          }
          
          // Vérifier si le fichier a la protection
          const hasProtection = content.includes('if (!product || !product.id)') || 
                                content.includes('if (!product?.id)') ||
                                content.includes('product?.id ?');
          
          if (hasUnsafePattern && !hasProtection) {
            unsafeFiles.push({
              file: fullPath,
              patterns: foundPatterns
            });
          }
          
        } catch (error) {
          // Ignorer les erreurs de lecture
        }
      }
    }
  }
  
  for (const dir of searchDirs) {
    searchInDir(dir);
  }
  
  return unsafeFiles;
}

console.log('🔍 Recherche des liens non sécurisés...');
const unsafeFiles = findUnsafeLinks();

console.log(`\n📋 Fichiers avec liens potentiellement non sécurisés: ${unsafeFiles.length}`);

for (const { file, patterns } of unsafeFiles) {
  console.log(`\n❌ ${file}`);
  patterns.forEach(pattern => console.log(`   └─ ${pattern}`));
}

if (unsafeFiles.length === 0) {
  console.log('✅ Aucun lien non sécurisé trouvé!');
} else {
  console.log(`\n⚠️  ${unsafeFiles.length} fichier(s) nécessitent une correction.`);
}
