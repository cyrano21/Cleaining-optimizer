const fs = require('fs');
const path = require('path');

// Fonction pour obtenir la taille d'un fichier en KB
function getFileSizeKB(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    return 0;
  }
}

// Fonction de vérification complète des images
function verifyAllImages() {
  console.log('📊 Rapport final des images du site écomusée\n');
  
  const imageDirs = [
    'public/images/posts',
    'public/images/sponsors', 
    'public/images/ads',
    'public/images/events',
    'public/images/gallery',
    'public/images/banners',
    'public/images/animals',
    'public/images/collections',
    'public/images/products',
    'public/images/blog'
  ];
  
  let totalImages = 0;
  let totalSize = 0;
  const sizeRanges = {
    'très petites (< 10KB)': 0,
    'petites (10-30KB)': 0,
    'moyennes (30-100KB)': 0,
    'grandes (100-200KB)': 0,
    'très grandes (> 200KB)': 0
  };
  
  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Dossier non trouvé: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir).filter(file => 
      file.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    
    if (files.length === 0) {
      console.log(`📁 ${dir}: Aucune image`);
      continue;
    }
    
    let dirSize = 0;
    let minSize = Infinity;
    let maxSize = 0;
    
    for (const file of files) {
      const filepath = path.join(dir, file);
      const sizeKB = getFileSizeKB(filepath);
      
      totalImages++;
      totalSize += sizeKB;
      dirSize += sizeKB;
      
      minSize = Math.min(minSize, sizeKB);
      maxSize = Math.max(maxSize, sizeKB);
      
      // Classer par taille
      if (sizeKB < 10) sizeRanges['très petites (< 10KB)']++;
      else if (sizeKB < 30) sizeRanges['petites (10-30KB)']++;
      else if (sizeKB < 100) sizeRanges['moyennes (30-100KB)']++;
      else if (sizeKB < 200) sizeRanges['grandes (100-200KB)']++;
      else sizeRanges['très grandes (> 200KB)']++;
    }
    
    const avgSize = Math.round(dirSize / files.length);
    console.log(`📁 ${dir.replace('public/images/', '')}: ${files.length} images`);
    console.log(`   📏 Taille: ${minSize}KB - ${maxSize}KB (moy: ${avgSize}KB)`);
    console.log(`   💾 Total: ${dirSize}KB\n`);
  }
  
  console.log('📈 STATISTIQUES GLOBALES:');
  console.log(`   🖼️  Total d'images: ${totalImages}`);
  console.log(`   💾 Taille totale: ${Math.round(totalSize / 1024)}MB`);
  console.log(`   📏 Taille moyenne: ${Math.round(totalSize / totalImages)}KB\n`);
  
  console.log('📊 RÉPARTITION PAR TAILLE:');
  for (const [range, count] of Object.entries(sizeRanges)) {
    const percentage = Math.round((count / totalImages) * 100);
    console.log(`   ${range}: ${count} images (${percentage}%)`);
  }
  
  // Vérifier s'il reste des placeholders potentiels
  const suspiciousCount = sizeRanges['très petites (< 10KB)'];
  if (suspiciousCount > 0) {
    console.log(`\n⚠️  ATTENTION: ${suspiciousCount} images très petites détectées`);
    console.log('   Ces images pourraient être des placeholders non remplacés.');
  } else {
    console.log('\n✅ EXCELLENT! Aucune image suspecte détectée.');
    console.log('   Toutes les images semblent avoir été correctement remplacées.');
  }
}

// Exécution du script
if (require.main === module) {
  verifyAllImages();
}

module.exports = { verifyAllImages };
