const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images d'exemple (Unsplash pour des images libres)
const imageUrls = {
  posts: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop'
  ],
  sponsors: [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop'
  ],
  ads: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop'
  ],
  events: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop'
  ],
  gallery: [
    'https://images.unsplash.com/photo-1502780402662-acc01917336e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
  ],
  banners: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'
  ],
  animals: [
    'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&h=600&fit=crop'
  ]
};

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
        console.log(`✅ Image téléchargée: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {}); // Supprimer le fichier en cas d'erreur
      reject(err);
    });
  });
}

async function createDirectories() {
  const dirs = [
    'public/images/posts',
    'public/images/sponsors',
    'public/images/ads',
    'public/images/events',
    'public/images/gallery',
    'public/images/banners',
    'public/images/animals',
    'public/images/ecomuseum'
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Dossier créé: ${dir}`);
    }
  }
}

async function downloadCategoryImages(category, urls, prefix) {
  console.log(`\n🔄 Téléchargement des images ${category}...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = `${prefix}-${i + 1}.jpg`;
    const filepath = path.join(`public/images/${category}`, filename);
    
    try {
      // Vérifier si l'image existe déjà
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  Image existe déjà: ${filename}`);
        continue;
      }
      
      await downloadImage(url, filepath);
      // Délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Erreur téléchargement ${filename}:`, error.message);
    }
  }
}

async function downloadAllImages() {
  console.log('🚀 Début du téléchargement des images pour l\'écomusée...');
  
  try {
    await createDirectories();

    // Télécharger toutes les catégories d'images
    await downloadCategoryImages('posts', imageUrls.posts, 'post');
    await downloadCategoryImages('sponsors', imageUrls.sponsors, 'sponsor');
    await downloadCategoryImages('ads', imageUrls.ads, 'ad');
    await downloadCategoryImages('events', imageUrls.events, 'event');
    await downloadCategoryImages('gallery', imageUrls.gallery, 'gallery');
    await downloadCategoryImages('banners', imageUrls.banners, 'banner');
    await downloadCategoryImages('animals', imageUrls.animals, 'animal');

    console.log('\n✅ Téléchargement terminé avec succès !');
    console.log('📊 Résumé:');
    
    // Afficher le résumé
    const categories = Object.keys(imageUrls);
    for (const category of categories) {
      const dir = `public/images/${category}`;
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
        console.log(`   ${category}: ${files.length} images`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour vérifier les images téléchargées
function checkDownloadedImages() {
  console.log('\n🔍 Vérification des images téléchargées...');
  
  const categories = Object.keys(imageUrls);
  let totalImages = 0;
  
  for (const category of categories) {
    const dir = `public/images/${category}`;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
      console.log(`📁 ${category}: ${files.length} images`);
      totalImages += files.length;
      
      // Afficher la taille des fichiers
      files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   - ${file}: ${sizeKB} KB`);
      });
    } else {
      console.log(`❌ Dossier manquant: ${dir}`);
    }
  }
  
  console.log(`\n📊 Total: ${totalImages} images téléchargées`);
}

// Exécuter le script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    checkDownloadedImages();
  } else {
    downloadAllImages()
      .then(() => {
        console.log('\n🎉 Script terminé avec succès !');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
      });
  }
}

module.exports = { downloadAllImages, checkDownloadedImages };