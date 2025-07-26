const fs = require('fs');
const path = require('path');

// Configuration des remplacements
const REPLACEMENTS = {
  // Images de profil
  'photo-1633332755192-727a05c4013d': '/images/placeholder.svg',
  'photo-1472099645785-5658abf4ff4e': '/images/placeholder.svg',
  'photo-1494790108755-2616b612b786': '/images/placeholder.svg',
  'photo-1507003211169-0a1dd7228f2d': '/images/placeholder.svg',
  'photo-1580489944761-15a19d654956': '/images/placeholder.svg',
  'photo-1438761681033-6461ffad8d80': '/images/placeholder.svg',
  
  // Images de produits
  'photo-1505740420928-5e560c06d30e': '/images/placeholder.svg',
  'photo-1523275335684-37898b6baf30': '/images/placeholder.svg',
  'photo-1542291026-7eec264c27ff': '/images/placeholder.svg',
  'photo-1495474472287-4d71bcdd2085': '/images/placeholder.svg',
  'photo-1527864550417-7fd91fc51a46': '/images/placeholder.svg',
  'photo-1511707171634-5f897ff02aa9': '/images/placeholder.svg',
  'photo-1521572163474-6864f9cf17ab': '/images/placeholder.svg',
  'photo-1553062407-98eeb64c6a62': '/images/placeholder.svg',
  'photo-1496181133206-80ce9b88a853': '/images/placeholder.svg',
  'photo-1572635196237-14b3f281503f': '/images/placeholder.svg',
  'photo-1551028719-00167b16eac5': '/images/placeholder.svg',
  'photo-1544244015-0df4b3ffc6b0': '/images/placeholder.svg',
  'photo-1541643600914-78b084683601': '/images/placeholder.svg',
  'photo-1608043152269-423dbba4e7e1': '/images/placeholder.svg',
};

function replaceUnsplashImages(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer les URLs Unsplash par des placeholders
    const unsplashRegex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"']*/g;
    
    content = content.replace(unsplashRegex, (match, imageId) => {
      const replacement = REPLACEMENTS[`photo-${imageId}`] || '/images/placeholder.svg';
      console.log(`Replacing ${match} with ${replacement}`);
      modified = true;
      return replacement;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalModified = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorer node_modules et .next
      if (!['node_modules', '.next', '.git'].includes(entry.name)) {
        totalModified += processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Traiter les fichiers TypeScript, JavaScript et TSX
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        if (replaceUnsplashImages(fullPath)) {
          totalModified++;
        }
      }
    }
  }
  
  return totalModified;
}

// Exécuter le script
console.log('🔄 Starting Unsplash image replacement...');
const srcPath = path.join(__dirname, '..', 'src');
const modifiedFiles = processDirectory(srcPath);
console.log(`\n✨ Replacement complete! Modified ${modifiedFiles} files.`);

// Également traiter les fichiers à la racine
const rootFiles = ['next.config.js'];
for (const file of rootFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    replaceUnsplashImages(filePath);
  }
}