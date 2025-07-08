const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images réelles pour remplacer les placeholders
const replacementImageUrls = {
  // Images de nature et écomusée
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502780402662-acc01917336e?w=800&h=600&fit=crop'
  ],
  // Collections et bannières
  collections: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=1200&h=800&fit=crop'
  ],
  // Produits éco-responsables
  products: [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=600&fit=crop'
  ]
};

// Fonction pour détecter si une image est un placeholder gris
async function isGrayPlaceholder(imagePath) {
  try {
    const stats = fs.statSync(imagePath);
    
    // Si le fichier est très petit (moins de 1KB), c'est probablement un placeholder
    if (stats.size < 1024) {
      return true;
    }
    
    // Si le fichier fait exactement certaines tailles communes de placeholders
    const commonPlaceholderSizes = [1024, 2048, 3072, 4096, 5120, 6144];
    if (commonPlaceholderSizes.includes(stats.size)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la vérification de ${imagePath}:`, error.message);
    return false;
  }
}

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

// Fonction pour remplacer les images placeholder
async function replacePlaceholderImages() {
  console.log('🔍 Recherche des images placeholder grises...');
  
  const imageDirs = [
    'public/images/collections',
    'public/images/products',
    'public/images/slider',
    'public/images/blog',
    'public/images/shop',
    'public/images/demo'
  ];
  
  let replacedCount = 0;
  let allUrls = [...replacementImageUrls.nature, ...replacementImageUrls.collections, ...replacementImageUrls.products];
  let urlIndex = 0;
  
  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`📁 Dossier inexistant: ${dir}`);
      continue;
    }
    
    console.log(`\n📂 Vérification du dossier: ${dir}`);
    
    const files = fs.readdirSync(dir, { recursive: true });
    
    for (const file of files) {
      if (!file.toString().match(/\.(jpg|jpeg|png|webp)$/i)) {
        continue;
      }
      
      const filepath = path.join(dir, file.toString());
      
      if (await isGrayPlaceholder(filepath)) {
        console.log(`🔄 Remplacement de l'image placeholder: ${filepath}`);
        
        try {
          // Faire une sauvegarde de l'original
          const backupPath = filepath + '.backup';
          if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filepath, backupPath);
          }
          
          // Télécharger une nouvelle image
          const newImageUrl = allUrls[urlIndex % allUrls.length];
          await downloadImage(newImageUrl, filepath);
          
          console.log(`✅ Image remplacée: ${file}`);
          replacedCount++;
          urlIndex++;
          
          // Délai pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Erreur lors du remplacement de ${file}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\n🎉 Remplacement terminé ! ${replacedCount} images placeholder remplacées.`);
}

// Fonction pour lister les fichiers suspects
async function listSuspiciousFiles() {
  console.log('🔍 Analyse des fichiers suspects...');
  
  const imageDirs = [
    'public/images/collections',
    'public/images/products', 
    'public/images/slider',
    'public/images/blog',
    'public/images/shop'
  ];
  
  const suspiciousFiles = [];
  
  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir, { recursive: true });
    
    for (const file of files) {
      if (!file.toString().match(/\.(jpg|jpeg|png|webp)$/i)) continue;
      
      const filepath = path.join(dir, file.toString());
      const stats = fs.statSync(filepath);
      
      // Fichiers très petits ou de tailles suspectes
      if (stats.size < 5000 || [1024, 2048, 3072, 4096, 5120, 6144].includes(stats.size)) {
        suspiciousFiles.push({
          path: filepath,
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024)
        });
      }
    }
  }
  
  console.log(`\n📊 ${suspiciousFiles.length} fichiers suspects trouvés:`);
  suspiciousFiles.forEach(file => {
    console.log(`   ${file.path} (${file.sizeKB} KB)`);
  });
  
  return suspiciousFiles;
}

// Script principal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    listSuspiciousFiles();
  } else if (args.includes('--replace')) {
    replacePlaceholderImages()
      .then(() => {
        console.log('\n✅ Script terminé avec succès !');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node replace-placeholder-images.js --list    # Lister les fichiers suspects');
    console.log('  node replace-placeholder-images.js --replace # Remplacer les placeholders');
  }
}

module.exports = { replacePlaceholderImages, listSuspiciousFiles };
