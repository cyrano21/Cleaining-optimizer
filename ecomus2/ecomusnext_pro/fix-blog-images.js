const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images de blog thématiques pour écomusée
const blogImageUrls = [
  // Nature et environnement
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&q=80',
  
  // Faune et animaux
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&h=600&fit=crop&q=80',
  
  // Plantes et botanique
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502780402662-acc01917336e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=800&h=600&fit=crop&q=80',
  
  // Paysages et écosystèmes
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&q=80',
  
  // Sciences et éducation
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop&q=80',
  
  // Biodiversité
  'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609906736967-5f4b5b0b1e3e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493925410384-84b9d2cd0d03?w=800&h=600&fit=crop&q=80'
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

// Fonction principale pour fixer les images de blog
async function fixBlogImages() {
  console.log('🖼️  Correction des images de blog...\n');
  
  const blogDir = 'public/images/blog';
  
  if (!fs.existsSync(blogDir)) {
    console.log('❌ Dossier blog inexistant');
    return;
  }
  
  const files = fs.readdirSync(blogDir).filter(file => 
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  
  console.log(`📋 ${files.length} fichiers d'images trouvés dans le blog\n`);
  
  let replacedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = path.join(blogDir, filename);
    const currentSizeKB = getFileSizeKB(filepath);
    
    console.log(`[${i + 1}/${files.length}] ${filename} - Taille actuelle: ${currentSizeKB}KB`);
    
    // Si l'image fait moins de 15KB, c'est probablement un placeholder
    if (currentSizeKB < 15) {
      try {
        // Faire une sauvegarde
        const backupPath = filepath + '.backup';
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(filepath, backupPath);
        }
        
        // Choisir une URL d'image aléatoire
        const imageUrl = blogImageUrls[i % blogImageUrls.length];
        
        console.log(`   📥 Téléchargement: ${filename}`);
        await downloadImage(imageUrl, filepath);
        
        const newSizeKB = getFileSizeKB(filepath);
        console.log(`   ✅ ${filename} - Terminé`);
        console.log(`   📏 Nouvelle taille: ${newSizeKB}KB\n`);
        
        replacedCount++;
        
        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.log(`   ❌ Erreur ${filename}: ${error.message}\n`);
        errorCount++;
      }
    } else {
      console.log(`   ⏭️  Ignoré (taille acceptable)\n`);
      skippedCount++;
    }
  }
  
  console.log('🎉 Correction des images de blog terminée !');
  console.log(`   ✅ Remplacées: ${replacedCount}`);
  console.log(`   ⏭️  Ignorées: ${skippedCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
}

// Exécution du script
if (require.main === module) {
  fixBlogImages()
    .then(() => {
      console.log('\n✅ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fixBlogImages };
