// fix-product-image-ratio.js
// Ce script ajoute le style pour corriger l'aspect ratio des images dans les cartes de produit

const fs = require('fs');
const path = require('path');

// Liste des fichiers de composants de cartes de produit
const productCardFiles = [
  'Productcart2.jsx',
  'Productcart3.jsx',
  'Productcart4.jsx',
  'ProductCard.jsx',
  'ProductCard5.jsx',
  'ProductCard6.jsx',
  'ProductCard7.jsx',
  'ProductCard8.jsx',
  'ProductCard9.jsx',
  'ProductCard10.jsx',
  'ProductCard11.jsx',
  'ProductCard12.jsx',
  'ProductCard13.jsx',
  'ProductCard14.jsx',
  'ProductCard15.jsx',
  'ProductCard16.jsx',
  'ProductCard17.jsx',
  'ProductCard18.jsx',
  'ProductCard19.jsx',
  'ProductCard20.jsx',
  'ProductCard21.jsx',
  'ProductCard22.jsx',
  'ProductCard23.jsx',
  'ProductCard24.jsx',
  'ProductCard25.jsx',
  'ProductCard26.jsx',
  'ProductCard27.jsx',
  'ProductCard28.jsx',
  'ProductCard29.jsx',
  'ProductCard30.jsx',
  'ProductCard31.jsx',
  'ProductCard32.jsx',
  'ProductCard33.jsx',
  'ProductCardWishlist.jsx'
];

// Chemin du dossier des composants de cartes de produit
const componentDir = path.join(__dirname, 'components', 'shopCards');

// Compteurs pour le suivi
let filesProcessed = 0;
let filesModified = 0;
let errors = 0;

console.log('🔧 Correction de l\'aspect ratio des images dans les cartes de produit...\n');

// Pour chaque fichier de carte de produit
productCardFiles.forEach(filename => {
  const filePath = path.join(componentDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouvé: ${filename}`);
    errors++;
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    filesProcessed++;
    
    // Chercher les balises Image qui n'ont pas encore de style
    const hasModified = content.includes('style={{ width: "100%", height: "auto" }}');
    
    if (!hasModified) {
      // Remplacer les balises Image pour ajouter le style
      const newContent = content.replace(
        /<Image\s+([^>]*?)width=["'](\d+)["']\s+height=["'](\d+)["']([^>]*?)>/g,
        '<Image $1width="$2" height="$3"$4 style={{ width: "100%", height: "auto" }}>'
      );
      
      // Sauvegarder le fichier modifié
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        filesModified++;
        console.log(`✅ ${filename} - Aspect ratio corrigé`);
      } else {
        console.log(`ℹ️ ${filename} - Aucune modification nécessaire`);
      }
    } else {
      console.log(`ℹ️ ${filename} - Déjà corrigé`);
    }
  } catch (err) {
    console.error(`❌ Erreur lors de la modification de ${filename}:`, err.message);
    errors++;
  }
});

console.log(`\n📊 Résumé:`);
console.log(`   - ${filesProcessed} fichiers analysés`);
console.log(`   - ${filesModified} fichiers modifiés`);
console.log(`   - ${errors} erreurs rencontrées`);

console.log('\n✨ Opération terminée!');
