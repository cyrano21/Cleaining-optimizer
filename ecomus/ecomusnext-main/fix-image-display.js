// Script de correction automatique pour résoudre les problèmes d'images
const fs = require('fs');
const path = require('path');

// Fonction pour parcourir tous les fichiers récursivement
function walkSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Le dossier ${dir} n'existe pas`);
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = walkSync(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour corriger les problèmes dans les composants Image
function fixImageIssues(content, filePath) {
  let updatedContent = content;
  const relativePath = filePath.replace(__dirname, '');
  let fixes = [];

  // 1. Corriger: data-src → src pour les composants Image de Next.js
  const dataSrcRegex = /(<Image[^>]*)(data-src=["']([^"']+)["'])([^>]*)(src=["']([^"']+)["'])([^>]*>)/g;
  updatedContent = updatedContent.replace(dataSrcRegex, (match, start, dataSrc, dataSrcValue, middle, src, srcValue, end) => {
    fixes.push(`Remplacé data-src par src pour l'image: ${dataSrcValue}`);
    // Si data-src et src existent tous les deux, on utilise data-src comme nouvelle valeur de src
    return `${start}${middle}src="${dataSrcValue}"${end}`;
  });

  // 2. Ajouter style={{ width: "100%", height: "auto" }} si manquant
  const imageWithoutStyleRegex = /(<Image[^>]*?)(?!style=)((?:(?!style=|>).)*>)/g;
  updatedContent = updatedContent.replace(imageWithoutStyleRegex, (match, start, end) => {
    // Vérifier que l'Image n'a pas déjà un style
    if (!start.includes('style=')) {
      fixes.push(`Ajouté style={{ width: "100%", height: "auto" }} à un composant Image`);
      return `${start} style={{ width: "100%", height: "auto" }} ${end}`;
    }
    return match;
  });

  // 3. Remplacer les mauvais ratios d'aspect (height très grand par rapport à width)
  const badRatioRegex = /(<Image[^>]*)(width=["'](\d+)["'][^>]*height=["'](\d+)["']|height=["'](\d+)["'][^>]*width=["'](\d+)["'])/g;
  updatedContent = updatedContent.replace(badRatioRegex, (match, start, dimensions, width1, height1, height2, width2) => {
    const width = width1 || width2;
    const height = height1 || height2;
    
    if (width && height) {
      // Si le ratio height/width > 2, on ajuste pour un ratio plus normal
      const ratio = height / width;
      if (ratio > 2) {
        const newHeight = Math.round(width * 1.5); // ratio plus raisonnable
        fixes.push(`Corrigé ratio d'aspect extrême: ${width}x${height} → ${width}x${newHeight}`);
        return `${start}${dimensions.replace(height, newHeight)}`;
      }
    }
    return match;
  });

  // 4. Ajouter priority={true} aux images importantes (images dans les hero, banner, etc.)
  const importantImageRegex = /(<Image[^>]*className=["'][^"']*(?:hero|banner|featured|main|slider)[^"']*["'][^>]*)(?!priority=)/g;
  updatedContent = updatedContent.replace(importantImageRegex, (match, start) => {
    if (!match.includes('priority=')) {
      fixes.push(`Ajouté priority={true} à une image importante`);
      return `${start} priority={true} `;
    }
    return match;
  });

  // 5. Corriger priority="true" en priority={true}
  updatedContent = updatedContent.replace(/priority=["']true["']/g, 'priority={true}');
  
  // 6. Résoudre les problèmes possibles avec le lazy loading
  if (updatedContent.includes('lazysizes') || updatedContent.includes('lazyload')) {
    // Si le fichier utilise un script de lazy loading et contient des composants Image de Next.js
    if (updatedContent.includes('<Image') && updatedContent.includes('className="lazyload"')) {
      // Supprimer la classe lazyload des composants Image de Next.js
      updatedContent = updatedContent.replace(/(className=["'][^"']*)lazyload([^"']*["'])/g, '$1$2');
      fixes.push('Supprimé la classe "lazyload" des composants Image pour éviter les conflits avec Next.js');
    }
  }

  return {
    content: updatedContent,
    isModified: content !== updatedContent,
    fixes
  };
}

// Fonction pour créer ou mettre à jour le CSS personnalisé
function updateCustomCSS() {
  const cssPath = path.join(__dirname, 'public', 'css', 'custom-image-fixes.css');
  const cssContent = `/* 
 * custom-image-fixes.css
 * Correctifs pour les problèmes d'affichage des images
 */

/* Assurer que les images s'affichent correctement */
img {
  display: block;
  max-width: 100%;
}

/* Corriger l'aspect ratio des images dans les cartes produits */
.img-product, 
.product-image {
  width: 100% !important;
  height: auto !important;
  object-fit: contain;
}

/* S'assurer que les images de lazy loading s'affichent */
.lazyload,
.lazyloaded {
  opacity: 1 !important;
  display: block !important;
  visibility: visible !important;
}

/* Corriger l'affichage des images dans les sliders */
.swiper-slide img {
  width: 100%;
  height: auto;
  display: block;
}

/* Assurer que les images dans les carousels s'affichent */
.carousel img,
.slider img {
  display: block;
  width: 100%;
  height: auto;
}

/* Styles spécifiques pour les images de produit */
.product-card img,
.product-detail img {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Assurer que les images dans les grilles s'affichent */
.grid-item img,
.grid-product img {
  display: block;
  width: 100%;
  height: auto;
}
`;

  // Créer le dossier css s'il n'existe pas
  const cssDir = path.join(__dirname, 'public', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  // Écrire le fichier CSS
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log(`✅ CSS personnalisé créé/mis à jour: ${cssPath}`);
  
  // Vérifier si le CSS est importé dans le layout.js
  const layoutPath = path.join(__dirname, 'app', 'layout.js');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (!layoutContent.includes('custom-image-fixes.css')) {
      // Trouver l'endroit où importer le CSS
      const importMatch = layoutContent.match(/(import\s+["'].*?["'];(\s*import\s+["'].*?["'];)*)/);
      
      if (importMatch) {
        const imports = importMatch[0];
        layoutContent = layoutContent.replace(imports, `${imports}\nimport "../public/css/custom-image-fixes.css";`);
        fs.writeFileSync(layoutPath, layoutContent, 'utf8');
        console.log(`✅ CSS personnalisé importé dans layout.js`);
      } else {
        console.log(`⚠️ Impossible de trouver l'endroit pour importer le CSS dans layout.js`);
      }
    } else {
      console.log(`✅ Le CSS personnalisé est déjà importé dans layout.js`);
    }
  } else {
    console.log(`⚠️ Fichier layout.js non trouvé`);
  }
}

// Exécuter la correction
console.log("🔧 Correction automatique des problèmes d'images...\n");

// 1. Mettre à jour/créer le CSS personnalisé
updateCustomCSS();

// 2. Parcourir les fichiers de composants et les corriger
const componentFiles = walkSync(path.join(__dirname, 'components'));
let totalFixes = 0;
let modifiedFiles = 0;

componentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const { content: updatedContent, isModified, fixes } = fixImageIssues(content, file);
    
    if (isModified) {
      fs.writeFileSync(file, updatedContent, 'utf8');
      modifiedFiles++;
      totalFixes += fixes.length;
      
      console.log(`\n📄 ${file.replace(__dirname, '')}`);
      console.log(`✅ ${fixes.length} corrections appliquées:`);
      fixes.forEach(fix => console.log(`  - ${fix}`));
    }
  } catch (err) {
    console.error(`⚠️ Erreur lors de la modification de ${file}: ${err.message}`);
  }
});

console.log(`\n🎉 Terminé! ${totalFixes} corrections appliquées dans ${modifiedFiles} fichiers.`);
console.log('\n💡 Prochaines étapes recommandées:');
console.log('1. Redémarrer le serveur Next.js pour appliquer les modifications');
console.log('2. Vérifier visuellement que les images s\'affichent correctement');
console.log('3. Si des problèmes persistent, vérifier les scripts de lazy loading personnalisés');
