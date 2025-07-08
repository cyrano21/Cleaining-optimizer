#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fonction pour rechercher et remplacer dans un fichier
function replaceInFile(filePath, searchValue, replaceValue) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Corrigé: ${filePath}`);
    return true;
  }
  return false;
}

// Fonction pour parcourir récursivement les dossiers
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    
    if (stats.isDirectory()) {
      walkDir(filepath, callback);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js'))) {
      callback(filepath);
    }
  });
}

console.log('🔧 Correction des imports du dashboard...');

// Corriger tous les imports relatifs vers des aliases @
const dashboardSrcDir = './app/dashboard/src';

if (fs.existsSync(dashboardSrcDir)) {
  let totalFixed = 0;
  
  walkDir(dashboardSrcDir, (filePath) => {
    let fixed = false;
    
    // Remplacer les imports relatifs par des aliases @
    const patterns = [
      '../../../../components/',
      '../../../components/',
      '../../components/',
      '../components/',
      '../../../../lib/',
      '../../../lib/',
      '../../lib/',
      '../lib/'
    ];
    
    patterns.forEach(pattern => {
      const searchRegex = new RegExp(`from ['"]${pattern.replace(/\//g, '\\/')}`, 'g');
      const replacement = pattern.includes('components/') ? 'from "@/components/' : 'from "@/lib/';
      
      if (replaceInFile(filePath, searchRegex.source, replacement)) {
        fixed = true;
      }
    });
    
    if (fixed) {
      totalFixed++;
    }
  });
  
  console.log(`✅ Correction terminée! ${totalFixed} fichiers corrigés.`);
} else {
  console.log('❌ Dossier dashboard/src non trouvé');
}
