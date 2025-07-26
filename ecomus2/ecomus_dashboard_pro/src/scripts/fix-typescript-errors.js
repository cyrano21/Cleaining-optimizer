#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger et leurs corrections
const corrections = [
  // Corriger les références à 'real' par 'realProducts' ou 'realFilterOptions'
  {
    pattern: /const \[products, setProducts\] = useState<Product\[\]>\(real\);/g,
    replacement: 'const [products, setProducts] = useState<Product[]>(realProducts);'
  },
  {
    pattern: /const \[filteredProducts, setFilteredProducts\] = useState<Product\[\]>\(real\);/g,
    replacement: 'const [filteredProducts, setFilteredProducts] = useState<Product[]>(realProducts);'
  },
  {
    pattern: /options={transformFilterOptions\(real\)}/g,
    replacement: 'options={transformFilterOptions(realFilterOptions)}'
  },
  {
    pattern: /real\.filter\(/g,
    replacement: 'realProducts.filter('
  },
  {
    pattern: /real\.map\(/g,
    replacement: 'realProducts.map('
  },
  {
    pattern: /real\.length/g,
    replacement: 'realProducts.length'
  },
  {
    pattern: /real\.reduce\(/g,
    replacement: 'realProducts.reduce('
  },
  {
    pattern: /real\.find\(/g,
    replacement: 'realProducts.find('
  },
  {
    pattern: /real\.categories/g,
    replacement: 'realFilterOptions.categories'
  },
  {
    pattern: /real\.brands/g,
    replacement: 'realFilterOptions.brands'
  },
  {
    pattern: /setFilteredProducts\(real\)/g,
    replacement: 'setFilteredProducts(realProducts)'
  }
];

// Liste des fichiers à traiter
const filesToProcess = [
  'src/app/e-commerce/shop/categories-list/page.tsx',
  'src/app/e-commerce/shop/product-list-view/page.tsx',
  'src/app/e-commerce/shop/left-filter/page.tsx',
  'src/app/e-commerce/shop/right-filter/page.tsx'
];

function applyCorrections() {
  filesToProcess.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    corrections.forEach(correction => {
      if (correction.pattern.test(content)) {
        content = content.replace(correction.pattern, correction.replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Corrigé: ${filePath}`);
    } else {
      console.log(`ℹ️  Aucune correction nécessaire: ${filePath}`);
    }
  });
}

console.log('🔧 Correction automatique des erreurs TypeScript...\n');
applyCorrections();
console.log('\n✨ Correction terminée!');
