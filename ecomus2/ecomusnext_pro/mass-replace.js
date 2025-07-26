const fs = require('fs');
const https = require('https');
const path = require('path');

// Liste des fichiers placeholder restants (après le premier remplacement)
const placeholderFiles = [
  // Collections
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
  'public/images/collections/electronic-10.png',
  'public/images/collections/electronic-11.png',
  'public/images/collections/electronic-12.png',
  'public/images/collections/electronic-13.png',
  'public/images/collections/electronic-14.png',
  'public/images/collections/electronic-15.png',
  'public/images/collections/electronic-4.png',
  'public/images/collections/electronic-8.png',
  'public/images/collections/kitchen-wear-4.png',
  'public/images/collections/package-foods.png',
  
  // Products
  'public/images/products/headphone-11.png',
  'public/images/products/headphone-12.png',
  'public/images/products/headphone-13.png',
  'public/images/products/headphone-14.png',
  'public/images/products/headphone-15.png',
  'public/images/products/headphone-2.png',
  'public/images/products/headphone-3.png',
  'public/images/products/headphone-4.png',
  'public/images/products/headphone-5.png',
  'public/images/products/headphone-6.png',
  'public/images/products/headphone-7.png',
  'public/images/products/headphone-8.png',
  'public/images/products/headphone-9.png',
  
  // Sliders
  'public/images/slider/collection-1.jpg',
  'public/images/slider/collection-2.jpg',
  'public/images/slider/collection-3.jpg',
  'public/images/slider/collection-4.jpg',
  'public/images/slider/collection-5.jpg',
  'public/images/slider/collection-6.jpg',
  'public/images/slider/collection-7.jpg',
  'public/images/slider/collection-8.jpg',
  'public/images/slider/collection-9.jpg',
  
  // Blog
  'public/images/blog/blog-0.jpg',
  'public/images/blog/blog-1.jpg',
  'public/images/blog/blog-2.jpg',
  'public/images/blog/blog-3.jpg',
  'public/images/blog/blog-4.jpg',
  'public/images/blog/blog-5.jpg',
  'public/images/blog/blog-6.jpg',
  'public/images/blog/blog-7.jpg',
  'public/images/blog/blog-8.jpg',
  'public/images/blog/blog-9.jpg',
  
  // Shop
  'public/images/shop/shop-1.jpg',
  'public/images/shop/shop-2.jpg',
  'public/images/shop/shop-3.jpg',
  'public/images/shop/shop-4.jpg',
  'public/images/shop/shop-5.jpg',
  'public/images/shop/shop-6.jpg',
  'public/images/shop/shop-7.jpg',
  'public/images/shop/shop-8.jpg',
  'public/images/shop/shop-9.jpg',
  'public/images/shop/shop-10.jpg'
];

// URLs d'images variées pour l'écomusée
const imageUrls = [
  // Nature et paysages
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
  
  // Paysages et environnement
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&q=80',
  
  // Produits naturels et éducation
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
  
  // Images supplémentaires pour la variété
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551712026-24bb95f4e8a1?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563979689-0c3db98da6dc?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555400113-e8eb1fa6b94d?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550754930-1b2e2d7a78f3?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573424725727-c5c8b74b6659?w=800&h=600&fit=crop&q=80'
];

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

async function replaceImages() {
  console.log('🚀 Remplacement massif des images placeholder...');
  console.log(`📋 ${placeholderFiles.length} fichiers à traiter\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < placeholderFiles.length; i++) {
    const filePath = placeholderFiles[i];
    const fileName = path.basename(filePath);
    const imageUrl = imageUrls[i % imageUrls.length];
    
    console.log(`[${i + 1}/${placeholderFiles.length}] ${fileName} - Taille actuelle: ${getFileSize(filePath)}KB`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}\n`);
      continue;
    }
    
    try {
      // Sauvegarder l'original s'il n'existe pas déjà
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      
      console.log(`📥 Téléchargement: ${fileName}`);
      await downloadImage(imageUrl, filePath);
      
      const newSize = getFileSize(filePath);
      console.log(`✅ ${fileName} - Terminé`);
      console.log(`📏 Nouvelle taille: ${newSize}KB\n`);
      
      successCount++;
      
      // Délai pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Erreur ${fileName}: ${error.message}\n`);
      errorCount++;
    }
  }
  
  console.log('🎉 Terminé !');
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
}

replaceImages().catch(console.error);
