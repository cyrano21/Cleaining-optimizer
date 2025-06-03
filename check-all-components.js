const fs = require('fs');
const path = require('path');

// Vérifier tous les composants ProductCard pour s'assurer qu'ils ont la protection
function checkAllProductCards() {
  const productCardPattern = /Product.*\.jsx$/;
  const shopCardsDir = path.join(__dirname, 'components', 'shopCards');
  
  if (!fs.existsSync(shopCardsDir)) {
    console.log('❌ Répertoire shopCards non trouvé');
    return;
  }
  
  const files = fs.readdirSync(shopCardsDir);
  const productCardFiles = files.filter(file => productCardPattern.test(file));
  
  console.log(`🔍 Vérification de ${productCardFiles.length} composants ProductCard...\n`);
  
  let protectedCount = 0;
  let unprotectedCount = 0;
  let errorCount = 0;
  
  for (const fileName of productCardFiles) {
    const filePath = path.join(shopCardsDir, fileName);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasProtection = content.includes('// Vérification de sécurité pour éviter les href undefined') ||
                           content.includes('if (!product || !product.id)') ||
                           content.includes('if (!product?.id)');
      
      const hasUnsafeHref = content.includes('href={`/product-detail/${product.id}`}') ||
                           content.includes('href={`/product-giftcard/${product.id}`}');
      
      if (hasProtection) {
        console.log(`✅ ${fileName} - Protégé`);
        protectedCount++;
      } else if (hasUnsafeHref) {
        console.log(`❌ ${fileName} - NON PROTÉGÉ avec liens dangereux`);
        unprotectedCount++;
      } else {
        console.log(`⚠️  ${fileName} - Pas de liens détectés`);
      }
      
    } catch (error) {
      console.log(`💥 ${fileName} - Erreur de lecture: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Protégés: ${protectedCount}`);
  console.log(`   ❌ Non protégés: ${unprotectedCount}`);
  console.log(`   ⚠️  Erreurs: ${errorCount}`);
  console.log(`   📁 Total: ${productCardFiles.length}`);
  
  return { protectedCount, unprotectedCount, errorCount };
}

// Rechercher d'autres composants susceptibles d'utiliser product.id
function findOtherProblematicComponents() {
  console.log('\n🔍 Recherche d\'autres composants problématiques...\n');
  
  const searchDirs = ['components/homes', 'components/common', 'components/shop'];
  
  for (const dir of searchDirs) {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) {
      searchInDirectory(fullDir, dir);
    }
  }
}

function searchInDirectory(dir, relativePath) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativeFilePath = path.join(relativePath, file.name);
    
    if (file.isDirectory()) {
      searchInDirectory(fullPath, relativeFilePath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        const hasUnsafeHref = /href=.*\$\{.*\.id\}/.test(content) && 
                             !content.includes('if (!product || !product.id)') &&
                             !content.includes('if (!product?.id)');
        
        if (hasUnsafeHref) {
          const matches = content.match(/href=.*\$\{.*\.id\}/g);
          console.log(`❌ ${relativeFilePath}`);
          if (matches) {
            matches.forEach(match => console.log(`   └─ ${match}`));
          }
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }
}

console.log('🚀 Vérification complète des composants...\n');

checkAllProductCards();
findOtherProblematicComponents();

console.log('\n✨ Vérification terminée!');
