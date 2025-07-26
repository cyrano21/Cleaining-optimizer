#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images réelles de haute qualité pour l'écomusée
const realImageUrls = [
  // Images de nature et biodiversité
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
  
  // Paysages
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&q=80',
  
  // Produits éco-responsables et naturels
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=600&fit=crop&q=80',
  
  // Sciences et éducation
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop&q=80'
];

// Liste des fichiers suspects identifiés
const suspiciousFiles = [
  'public/images/collections/best-deals.png',
  'public/images/collections/beverage.png',
  'public/images/collections/collection-59.jpg',
  'public/images/collections/collection-60.jpg',
  'public/images/collections/collection-61.jpg',
  'public/images/collections/collection-62.jpg',
  'public/images/collections/collection-64.jpg',
  'public/images/collections/collection-circle-14.png',
  'public/images/collections/collection-circle-15.png',
  'public/images/collections/collection-circle-16.png',
  'public/images/collections/collection-circle-17.png',
  'public/images/collections/collection-circle-18.png',
  'public/images/collections/collection-circle-19.png',
  'public/images/collections/collection-circle-20.png',
  'public/images/collections/collection-circle-21.png',
  'public/images/collections/collection-circle-22.png',
  'public/images/collections/collection-circle-23.png',
  'public/images/collections/collection-circle-24.png',
  'public/images/collections/collection-circle-25.png',
  'public/images/collections/collection-circle-26.png',
  'public/images/collections/collection-circle-27.png',
  'public/images/collections/collection-circle-28.png',
  'public/images/collections/collection-circle-29.png',
  'public/images/collections/collection-circle-30.png',
  'public/images/collections/collection-circle-5.jpg',
  'public/images/collections/dairy.png',
  'public/images/collections/electronic-10.png',
  'public/images/collections/electronic-11.png',
  'public/images/collections/electronic-12.png',
  'public/images/collections/electronic-13.png',
  'public/images/collections/electronic-14.png',
  'public/images/collections/electronic-15.png',
  'public/images/collections/electronic-4.png',
  'public/images/collections/electronic-8.png',
  'public/images/collections/fruit.png',
  'public/images/collections/kitchen-wear-4.png',
  'public/images/collections/meat.png',
  'public/images/collections/new-releases.png',
  'public/images/collections/package-foods.png',
  'public/images/collections/vegetable.png',
  'public/images/products/cosmetic15.jpg',
  'public/images/products/headphone-1.png',
  'public/images/products/headphone-10.png',
  'public/images/products/headphone-11.png',
  'public/images/products/headphone-12.png',
  'public/images/products/headphone-13.png',
  'public/images/products/headphone-14.png',
  'public/images/products/headphone-15.png',
  'public/images/products/headphone-16.png',
  'public/images/products/headphone-17.png',
  'public/images/products/headphone-18.png',
  'public/images/products/headphone-19.png',
  'public/images/products/headphone-2.png',
  'public/images/products/headphone-3.png',
  'public/images/products/headphone-4.png',
  'public/images/products/headphone-5.png',
  'public/images/products/headphone-6.png',
  'public/images/products/headphone-7.png',
  'public/images/products/headphone-8.png',
  'public/images/products/headphone-9.png',
  'public/images/products/img-feature-1.png',
  'public/images/products/pod-store-17.png',
  'public/images/products/setup-gear-13.png',
  'public/images/products/sneaker-1.png',
  'public/images/products/sneaker-10.png',
  'public/images/products/sneaker-3.png',
  'public/images/products/sneaker-4.png',
  'public/images/products/sneaker-5.png',
  'public/images/products/sneaker-6.png',
  'public/images/products/sneaker-9.png',
  'public/images/slider/accessories-tes1.png',
  'public/images/slider/accessories-tes2.png',
  'public/images/slider/book-store-2.png',
  'public/images/blog/blog-personalized-pod-1.png',
  'public/images/blog/blog-personalized-pod-2.png',
  'public/images/blog/blog-personalized-pod-3.png',
  'public/images/blog/food-blog1.png',
  'public/images/blog/food-blog2.png',
  'public/images/blog/food-blog3.png',
  'public/images/shop/cate/cate4.png',
  'public/images/shop/file/Open-Ear.png',
  'public/images/shop/file/page-title-blog.png',
  'public/images/shop/products/gift-card-1.png',
  'public/images/shop/products/img-p2.png',
  'public/images/shop/products/img-p3.png',
  'public/images/shop/products/img-p4.png',
  'public/images/shop/products/img-p5.png',
  'public/images/shop/products/lb-shoes.png',
  'public/images/shop/store/ourstore4.png'
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

// Fonction principale pour remplacer toutes les images placeholder
async function replaceAllPlaceholders() {
  console.log(`🚀 Début du remplacement de ${suspiciousFiles.length} images placeholder...`);
  console.log(`📋 URLs disponibles: ${realImageUrls.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < suspiciousFiles.length; i++) {
    const filepath = suspiciousFiles[i];
    const imageUrl = realImageUrls[i % realImageUrls.length];
    
    console.log(`\n📸 [${i + 1}/${suspiciousFiles.length}] Remplacement de: ${path.basename(filepath)}`);
    
    try {
      // Faire une sauvegarde si elle n'existe pas déjà
      const backupPath = filepath + '.backup';
      if (fs.existsSync(filepath) && !fs.existsSync(backupPath)) {
        fs.copyFileSync(filepath, backupPath);
        console.log(`   💾 Sauvegarde créée`);
      }
      
      // Télécharger la nouvelle image
      await downloadImage(imageUrl, filepath);
      console.log(`   ✅ Image remplacée avec succès`);
      successCount++;
      
      // Délai pour éviter de surcharger l'API Unsplash
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Remplacement terminé !`);
  console.log(`   ✅ Succès: ${successCount} images`);
  console.log(`   ❌ Erreurs: ${errorCount} images`);
  
  if (successCount > 0) {
    console.log(`\n📋 Vérification de quelques images remplacées:`);
    // Vérifier la taille de quelques fichiers remplacés
    for (let i = 0; i < Math.min(5, successCount); i++) {
      const filepath = suspiciousFiles[i];
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   📏 ${path.basename(filepath)}: ${sizeKB} KB`);
      }
    }
  }
}

// Fonction pour restaurer les sauvegardes
async function restoreBackups() {
  console.log('🔄 Restauration des sauvegardes...');
  
  let restoredCount = 0;
  
  for (const filepath of suspiciousFiles) {
    const backupPath = filepath + '.backup';
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, filepath);
        console.log(`✅ Restauré: ${path.basename(filepath)}`);
        restoredCount++;
      } catch (error) {
        console.error(`❌ Erreur restauration ${path.basename(filepath)}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n🎉 ${restoredCount} fichiers restaurés !`);
}

// Script principal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--restore')) {
    restoreBackups();
  } else {
    replaceAllPlaceholders()
      .then(() => {
        console.log('\n✅ Script terminé avec succès !');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
      });
  }
}

module.exports = { replaceAllPlaceholders, restoreBackups };
