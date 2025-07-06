const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images finales de qualité pour écomusée
const finalImageUrls = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1502780402662-acc01917336e?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop&q=85',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop&q=85'
];

// Fonction pour télécharger une image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Fonction pour obtenir la taille d'un fichier en KB
function getFileSizeKB(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    return 0;
  }
}

// Fonction pour trouver et remplacer les derniers placeholders
async function finalCleanup() {
  console.log('🧹 Nettoyage final des images restantes...\n');
  
  const imageDirs = [
    'public/images/collections',
    'public/images/products',
    'public/images/slider',
    'public/images/blog',
    'public/images/shop'
  ];
  
  const smallImages = [];
  
  // Trouver toutes les images de moins de 15KB
  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(file => 
      file.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    
    for (const file of files) {
      const filepath = path.join(dir, file);
      const sizeKB = getFileSizeKB(filepath);
      
      if (sizeKB < 15 && sizeKB > 0) {
        smallImages.push({
          filepath,
          filename: file,
          sizeKB
        });
      }
    }
  }
  
  console.log(`📋 ${smallImages.length} petites images trouvées (< 15KB)\n`);
  
  if (smallImages.length === 0) {
    console.log('🎉 Aucune image à corriger ! Toutes les images sont de bonne taille.');
    return;
  }
  
  let replacedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < smallImages.length; i++) {
    const img = smallImages[i];
    
    console.log(`[${i + 1}/${smallImages.length}] ${img.filename} - Taille: ${img.sizeKB}KB`);
    
    try {
      // Faire une sauvegarde
      const backupPath = img.filepath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(img.filepath, backupPath);
      }
      
      // Choisir une URL d'image
      const imageUrl = finalImageUrls[i % finalImageUrls.length];
      
      console.log(`   📥 Téléchargement: ${img.filename}`);
      await downloadImage(imageUrl, img.filepath);
      
      const newSizeKB = getFileSizeKB(img.filepath);
      console.log(`   ✅ ${img.filename} - Terminé`);
      console.log(`   📏 ${img.sizeKB}KB → ${newSizeKB}KB\n`);
      
      replacedCount++;
      
      // Délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Erreur ${img.filename}: ${error.message}\n`);
      errorCount++;
    }
  }
  
  console.log('🎉 Nettoyage final terminé !');
  console.log(`   ✅ Remplacées: ${replacedCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
}

// Exécution du script
if (require.main === module) {
  finalCleanup()
    .then(() => {
      console.log('\n✅ Nettoyage final terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { finalCleanup };
