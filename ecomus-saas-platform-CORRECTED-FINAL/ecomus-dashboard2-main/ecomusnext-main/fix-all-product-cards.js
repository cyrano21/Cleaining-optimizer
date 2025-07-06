const fs = require('fs');
const path = require('path');

// Scan tous les fichiers ProductCard dans le dossier shopCards
function findAllProductCardFiles() {
  const shopCardsDir = path.join(__dirname, 'components', 'shopCards');
  const files = fs.readdirSync(shopCardsDir);
  
  return files
    .filter(file => file.includes('ProductCard') || file.includes('Productcart'))
    .map(file => path.join(shopCardsDir, file));
}

function fixProductCardFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern pour détecter les fonctions de composant
    const patterns = [
      /export default function (\w+)\(\{ product \}\) \{[\s\S]*?const \[currentImage, setCurrentImage\] = useState\(product\.imgSrc\);/,
      /export default function (\w+)\(\{ product \}\) \{[\s\S]*?const \[currentImage, setCurrentImage\] = useState\(product\.imgSrc\);/,
      /export function (\w+)\(\{ product \}\) \{[\s\S]*?const \[currentImage, setCurrentImage\] = useState\(product\.imgSrc\);/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const functionName = match[1];
        const exportType = content.includes('export default') ? 'export default function' : 'export function';
        
        // Nouveau début de fonction avec validation
        const newFunctionStart = `${exportType} ${functionName}({ product }) {
  // Vérification de sécurité pour éviter les href undefined
  if (!product || !product.id) {
    return null;
  }

  const [currentImage, setCurrentImage] = useState(product.imgSrc || '');`;
        
        // Remplacer le début de la fonction
        content = content.replace(pattern, newFunctionStart);
        modified = true;
        break;
      }
    }
    
    // Chercher et corriger les patterns sans useState d'abord
    const simplePatterns = [
      /export default function (\w+)\(\{ product \}\) \{/,
      /export function (\w+)\(\{ product \}\) \{/
    ];
    
    for (const pattern of simplePatterns) {
      const match = content.match(pattern);
      if (match && !content.includes('if (!product || !product.id)')) {
        const functionName = match[1];
        const exportType = content.includes('export default') ? 'export default function' : 'export function';
        
        const newFunctionStart = `${exportType} ${functionName}({ product }) {
  // Vérification de sécurité pour éviter les href undefined
  if (!product || !product.id) {
    return null;
  }
`;
        
        content = content.replace(pattern, newFunctionStart);
        modified = true;
        break;
      }
    }
    
    // Corriger le useEffect s'il existe
    const useEffectPattern = /useEffect\(\(\) => \{\s*setCurrentImage\(product\.imgSrc\);\s*\}, \[product\]\);/;
    if (content.match(useEffectPattern)) {
      const newUseEffect = `useEffect(() => {
    if (product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);`;
      
      content = content.replace(useEffectPattern, newUseEffect);
      modified = true;
    }
    
    // Corriger le useState s'il existe mais n'a pas été corrigé
    const useStatePattern = /const \[currentImage, setCurrentImage\] = useState\(product\.imgSrc\);/;
    if (content.match(useStatePattern)) {
      content = content.replace(useStatePattern, 
        `const [currentImage, setCurrentImage] = useState(product.imgSrc || '');`);
      modified = true;
    }
    
    if (modified) {
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️  Pas de changement nécessaire: ${path.basename(filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur avec ${path.basename(filePath)}:`, error.message);
  }
}

console.log('🔧 Recherche et correction de TOUS les composants ProductCard...');

const allProductCardFiles = findAllProductCardFiles();
console.log(`Trouvé ${allProductCardFiles.length} fichiers ProductCard à vérifier:`);
allProductCardFiles.forEach(file => console.log(`  - ${path.basename(file)}`));

allProductCardFiles.forEach(fixProductCardFile);

console.log('✨ Correction terminée!');
