const fs = require('fs');
const path = require('path');

// Fichiers avec exportation nommée qui ont échoué
const namedExportFiles = [
  'components/shopCards/ProductCard24.jsx',
  'components/shopCards/ProductCard25.jsx',
  'components/shopCards/ProductCard26.jsx',
  'components/shopCards/ProductCard29.jsx',
  'components/shopCards/ProductCard31.jsx',
  'components/shopCards/ProductCard33.jsx',
  'components/shopCards/ProductCard5.jsx'
];

function fixNamedExportProductCard(filePath) {
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
    
    // Pattern pour export const ComponentName = ({ product }) => {
    let functionPattern = /export const (\w+) = \(\{\s*product[^}]*\}\)\s*=>\s*\{/;
    let match = content.match(functionPattern);
    
    if (!match) {
      console.log(`❌ Pattern d'exportation nommée non trouvé dans: ${path.basename(filePath)}`);
      return;
    }

    const componentName = match[1];
    const originalDeclaration = match[0];
    
    // Nouveau début de fonction avec validation
    const newFunctionStart = `export const ${componentName} = ({ product }) => {
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
    
    // Ajouter useEffect si currentImage existe mais pas de useEffect
    if (content.includes('setCurrentImage') && !content.includes('useEffect(')) {
      const statePattern = /(const \[currentImage, setCurrentImage\] = useState\([^)]+\);)/;
      if (statePattern.test(content)) {
        content = content.replace(statePattern, `$1
  
  useEffect(() => {
    if (product && product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);`);
        
        // S'assurer que useEffect est importé
        if (!content.includes('useEffect')) {
          content = content.replace(
            /import \{ ([^}]+) \} from "react";/,
            'import { $1, useEffect } from "react";'
          );
        }
      }
    }
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé (export nommée): ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${path.basename(filePath)}:`, error.message);
  }
}

console.log('🔧 Correction des composants ProductCard avec exportation nommée...');

namedExportFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  fixNamedExportProductCard(fullPath);
});

console.log('✨ Correction des exportations nommées terminée!');
