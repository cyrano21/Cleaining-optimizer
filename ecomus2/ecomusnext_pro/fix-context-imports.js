const fs = require('fs');
const path = require('path');

function fixContextImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixContextImports(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // Corriger les imports du Context
      content = content.replace(
        /import\s+{\s*useContextElement\s*}\s+from\s+['"](\.\.\/)+context\/Context['"];?/g,
        'import { useContextElement } from "@/context/Context";'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Corrigé: ${fullPath}`);
      }
    }
  });
}

console.log('🔧 Correction des imports du Context...');
fixContextImports('./components');
console.log('✅ Terminé!');
