const fs = require('fs');
const path = require('path');

// Script pour corriger toutes les occurrences de onCheckedChange vers onChange
function fixCheckboxProps(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixCheckboxProps(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Pattern 1: onCheckedChange={setFunction}
      if (content.includes('onCheckedChange={set')) {
        content = content.replace(
          /onCheckedChange=\{(set\w+)\}/g,
          'onChange={(e) => $1(e.target.checked)}'
        );
        modified = true;
      }
      
      // Pattern 2: onCheckedChange={(checked) => setFunction(checked)}
      if (content.includes('onCheckedChange={(checked)')) {
        content = content.replace(
          /onCheckedChange=\{\(checked\)\s*=>\s*(\w+)\(checked.*?\)\}/g,
          'onChange={(e) => $1(e.target.checked)}'
        );
        modified = true;
      }
      
      // Pattern 3: onCheckedChange={(checked) => setFunction(checked as boolean)}
      if (content.includes('onCheckedChange={(checked)') && content.includes('as boolean')) {
        content = content.replace(
          /onCheckedChange=\{\(checked\)\s*=>\s*(\w+)\(checked\s+as\s+boolean\)\}/g,
          'onChange={(e) => $1(e.target.checked)}'
        );
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${filePath}`);
      }
    }
  });
}

console.log('🔧 Fixing checkbox props in Dashboard2...');
fixCheckboxProps('./src');
console.log('✅ All checkbox props fixed!');
