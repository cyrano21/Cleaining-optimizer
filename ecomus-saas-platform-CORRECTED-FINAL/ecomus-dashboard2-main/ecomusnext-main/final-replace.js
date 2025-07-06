const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images de haute qualité pour l'écomusée
const ecomuseumUrls = [
  // Nature et biodiversité
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&q=80',
  
  // Animaux et faune
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&h=600&fit=crop&q=80',
  
  // Plantes et fleurs
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502780402662-acc01917336e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=800&h=600&fit=crop&q=80',
  
  // Paysages naturels
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&q=80',
  
  // Éducation et science
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop&q=80',
  
  // Marques et logos (alternatives naturelles)
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop&q=80'
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

// Fonction pour scanner et remplacer automatiquement
async function scanAndReplace() {
  console.log('🔍 Scan final des placeholders restants...');
  
  // Rechercher tous les fichiers image de moins de 5KB
  const { execSync } = require('child_process');
  const smallFiles = execSync(
    "find public/images -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' | xargs ls -la | awk '$5 < 5000 {print $9}'",
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(f => f);
  
  console.log(`📋 ${smallFiles.length} petits fichiers trouvés`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < smallFiles.length; i++) {
    const filepath = smallFiles[i];
    const filename = path.basename(filepath);
    const imageUrl = ecomuseumUrls[i % ecomuseumUrls.length];
    
    try {
      const stats = fs.statSync(filepath);
      const currentSizeKB = Math.round(stats.size / 1024);
      
      console.log(`\n[${i + 1}/${smallFiles.length}] ${filename} - ${currentSizeKB}KB`);
      
      // Faire une sauvegarde
      const backupPath = filepath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filepath, backupPath);
      }
      
      // Télécharger la nouvelle image
      await downloadImage(imageUrl, filepath);
      
      const newStats = fs.statSync(filepath);
      const newSizeKB = Math.round(newStats.size / 1024);
      
      console.log(`✅ ${filename} - ${currentSizeKB}KB → ${newSizeKB}KB`);
      successCount++;
      
      // Délai pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Erreur ${filename}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Scan final terminé !`);
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
}

// Fonction pour restaurer si besoin
async function restore() {
  console.log('🔄 Restauration des fichiers...');
  const { execSync } = require('child_process');
  
  try {
    const backupFiles = execSync("find public/images -name '*.backup'", { encoding: 'utf-8' })
      .trim().split('\n').filter(f => f);
    
    for (const backupFile of backupFiles) {
      const originalFile = backupFile.replace('.backup', '');
      fs.copyFileSync(backupFile, originalFile);
      console.log(`✅ Restauré: ${path.basename(originalFile)}`);
    }
    
    console.log(`🎉 ${backupFiles.length} fichiers restaurés !`);
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error.message);
  }
}

// Script principal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--restore')) {
    restore();
  } else {
    scanAndReplace()
      .then(() => {
        console.log('\n✅ Script final terminé avec succès !');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
      });
  }
}
