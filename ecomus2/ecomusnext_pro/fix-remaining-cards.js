const fs = require('fs');
const path = require('path');

// Liste de tous les fichiers ProductCard
const productCardFiles = [
  'components/shopCards/ProductCard.jsx',
  'components/shopCards/ProductCard10.jsx',
  'components/shopCards/ProductCard11.jsx',
  'components/shopCards/ProductCard12.jsx',
  'components/shopCards/ProductCard13.jsx',
  'components/shopCards/ProductCard14.jsx',
  'components/shopCards/ProductCard15.jsx',
  'components/shopCards/ProductCard16.jsx',
  'components/shopCards/ProductCard17.jsx',
  'components/shopCards/ProductCard18.jsx',
  'components/shopCards/ProductCard19.jsx',
  'components/shopCards/ProductCard20.jsx',
  'components/shopCards/ProductCard21.jsx',
  'components/shopCards/ProductCard22.jsx',
  'components/shopCards/Productcard23.jsx',
  'components/shopCards/ProductCard24.jsx',
  'components/shopCards/ProductCard25.jsx',
  'components/shopCards/ProductCard26.jsx',
  'components/shopCards/ProductCard27.jsx',
  'components/shopCards/ProductCard28.jsx',
  'components/shopCards/ProductCard29.jsx',
  'components/shopCards/ProductCard30.jsx',
  'components/shopCards/ProductCard31.jsx',
  'components/shopCards/ProductCard32.jsx',
  'components/shopCards/ProductCard33.jsx',
  'components/shopCards/ProductCard5.jsx',
  'components/shopCards/ProductCard6.jsx',
  'components/shopCards/ProductCard7.jsx',
  'components/shopCards/ProductCard8.jsx',
  'components/shopCards/ProductCard9.jsx',
  'components/shopCards/ProductCardWishlist.jsx',
  'components/shopCards/Productcart2.jsx',
  'components/shopCards/Productcart3.jsx',
  'components/shopCards/Productcart4.jsx',
  'components/shopCards/ProductsCard21.jsx'
];

function fixProductCardFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà corrigé
    if (content.includes('// Vérification de sécurité pour éviter les href undefined')) {
      console.log(`✅ Déjà corrigé: ${path.basename(filePath)}`);
      return;
    }
    
    // Pattern pour détecter le début d'une fonction de composant avec différentes variations
    let functionPattern = /export default function (\w+)\(\{\s*product[^}]*\}\)\s*\{/;
    let match = content.match(functionPattern);
    
    if (!match) {
      // Essayer un autre pattern
      functionPattern = /export default function (\w+)\(\s*\{\s*product[^}]*\}\s*\)\s*\{/;
      match = content.match(functionPattern);
    }
    
    if (!match) {
      console.log(`❌ Pattern de fonction non trouvé dans: ${path.basename(filePath)}`);
      return;
    }

    const functionName = match[1];
    const originalDeclaration = match[0];
    
    // Nouveau début de fonction avec validation
    const newFunctionStart = `export default function ${functionName}({ product }) {
  // Vérification de sécurité pour éviter les href undefined
  if (!product || !product.id) {
    return null;
  }`;
    
    // Remplacer le début de la fonction
    content = content.replace(originalDeclaration, newFunctionStart);
    
    // Corriger useState pour currentImage
    content = content.replace(
      /useState\(product\.imgSrc\)/g, 
      'useState(product.imgSrc || \'\')'
    );
    
    // Corriger le useEffect si présent
    const useEffectPattern = /useEffect\(\(\) => \{\s*setCurrentImage\(product\.imgSrc\);\s*\}, \[product\]\);/;
    if (useEffectPattern.test(content)) {
      const newUseEffect = `useEffect(() => {
    if (product && product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);`;
      content = content.replace(useEffectPattern, newUseEffect);
    }
    
    // Ajouter useEffect si currentImage existe mais pas de useEffect
    if (content.includes('setCurrentImage') && !content.includes('useEffect')) {
      const statePattern = /(const \[currentImage, setCurrentImage\] = useState\([^)]+\);)/;
      if (statePattern.test(content)) {
        content = content.replace(statePattern, `$1
  
  useEffect(() => {
    if (product && product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);`);
      }
    }
    
    // S'assurer que useState et useEffect sont importés
    if (!content.includes('useState') || !content.includes('useEffect')) {
      if (content.includes('from "react"')) {
        content = content.replace(
          /import React[^;]*from "react";/, 
          'import React, { useState, useEffect } from "react";'
        );
      } else {
        content = 'import { useState, useEffect } from "react";\n' + content;
      }
    }
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${path.basename(filePath)}:`, error.message);
  }
}

console.log('🔧 Correction des composants ProductCard restants...');

productCardFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  fixProductCardFile(fullPath);
});

console.log('✨ Correction terminée!');
