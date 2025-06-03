const fs = require('fs');
const path = require('path');

// Tous les fichiers ProductCard à corriger
const productCardFiles = [
  'components/shopCards/Productcart4.jsx',
  'components/shopCards/Productcart3.jsx',
  'components/shopCards/Productcart2.jsx',
  'components/shopCards/ProductCardWishlist.jsx',
  'components/shopCards/ProductCard9.jsx',
  'components/shopCards/ProductCard8.jsx',
  'components/shopCards/ProductCard7.jsx',
  'components/shopCards/ProductCard6.jsx'
];

// Pattern pour trouver la fonction export default
const exportPattern = /export default function (\w+)\(\{ product \}\) \{/;

// Pattern pour le useState actuel
const useStatePattern = /const \[currentImage, setCurrentImage\] = useState\(product\.imgSrc\);/;

// Pattern pour le useEffect actuel
const useEffectPattern = /useEffect\(\(\) => \{\s*setCurrentImage\(product\.imgSrc\);\s*\}, \[product\]\);/;

function fixProductCard(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Chercher le nom de la fonction
    const exportMatch = content.match(exportPattern);
    if (!exportMatch) {
      console.log(`Pattern d'export non trouvé dans: ${filePath}`);
      return;
    }
    
    const functionName = exportMatch[1];
    
    // Remplacer le début de la fonction avec la validation
    const newFunctionStart = `export default function ${functionName}({ product }) {
  // Vérification de sécurité pour éviter les href undefined
  if (!product || !product.id) {
    return null;
  }

  const [currentImage, setCurrentImage] = useState(product.imgSrc || '');`;
    
    let newContent = content.replace(exportPattern, newFunctionStart);
    
    // Supprimer l'ancien useState s'il existe
    newContent = newContent.replace(useStatePattern, '');
    
    // Corriger le useEffect
    const newUseEffect = `useEffect(() => {
    if (product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);`;
    
    newContent = newContent.replace(useEffectPattern, newUseEffect);
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Exécuter la correction pour tous les fichiers
console.log('🔧 Correction des composants ProductCard...');

productCardFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixProductCard(fullPath);
  } else {
    console.log(`⚠️  Fichier non trouvé: ${fullPath}`);
  }
});

console.log('✨ Correction terminée!');
