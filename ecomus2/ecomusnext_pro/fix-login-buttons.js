#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour remplacer les liens de login dans un fichier
function updateLoginLinks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer tous les liens #login par /auth/signin
    const oldPattern = `href="#login"
                  data-bs-toggle="modal"`;
    const newPattern = `href="/auth/signin"`;
    
    // Variantes possibles
    const patterns = [
      {
        old: /href="#login"\s*data-bs-toggle="modal"/g,
        new: 'href="/auth/signin"'
      },
      {
        old: /href="#login"\s*\n\s*data-bs-toggle="modal"/g,
        new: 'href="/auth/signin"'
      }
    ];
    
    let modified = false;
    patterns.forEach(pattern => {
      if (pattern.old.test(content)) {
        content = content.replace(pattern.old, pattern.new);
        modified = true;
      }
    });
    
    // Vérifier si Link est importé
    if (modified && !content.includes('import Link from "next/link"')) {
      // Ajouter l'import Link
      content = content.replace(
        /import.*from "next\/link";/,
        'import Link from "next/link";'
      );
      
      // Si pas d'import Link existant, l'ajouter après les autres imports
      if (!content.includes('import Link from "next/link"')) {
        content = content.replace(
          /(import.*from.*;\n)/,
          '$1import Link from "next/link";\n'
        );
      }
    }
    
    // Remplacer les balises <a> par <Link>
    if (modified) {
      content = content.replace(
        /<a\s+href="\/auth\/signin"\s+className="nav-icon-item">/g,
        '<Link href="/auth/signin" className="nav-icon-item">'
      );
      content = content.replace(
        /<\/a>/g,
        (match, offset) => {
          // Vérifier si c'est le bon </a> en regardant le contexte
          const before = content.substring(Math.max(0, offset - 200), offset);
          if (before.includes('href="/auth/signin"')) {
            return '</Link>';
          }
          return match;
        }
      );
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Mis à jour: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Aucun changement: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Obtenir tous les fichiers Header
const headersDir = path.join(__dirname, 'components', 'headers');
const headerFiles = fs.readdirSync(headersDir)
  .filter(file => file.startsWith('Header') && file.endsWith('.jsx'))
  .map(file => path.join(headersDir, file));

console.log(`🔄 Mise à jour des liens de connexion dans ${headerFiles.length} headers...`);

let updatedCount = 0;
headerFiles.forEach(file => {
  if (updateLoginLinks(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Terminé! ${updatedCount} fichiers mis à jour.`);
console.log('🎯 Les boutons de connexion pointent maintenant vers /auth/signin');
