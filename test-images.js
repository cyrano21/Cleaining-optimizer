// Script pour tester l'existence des images
const fs = require('fs');
const path = require('path');

const imagesToCheck = [
  '/images/slider/fashion-slideshow-04.jpg',
  '/images/slider/fashion-slideshow-05.jpg', 
  '/images/slider/fashion-slideshow-06.jpg',  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop',
  '/images/collections/collection-1.jpg'
];

console.log('🔍 Vérification de l\'existence des images...\n');

imagesToCheck.forEach(imagePath => {
  const fullPath = path.join(__dirname, 'public', imagePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  
  console.log(`${status} ${imagePath}`);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`   Taille: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`   Fichier introuvable à: ${fullPath}`);
  }
  console.log('');
});

// Vérifier les dossiers d'images
const imageDirs = ['slider', 'shop/products', 'collections', 'item'];

console.log('\n📁 Contenu des dossiers d\'images:\n');

imageDirs.forEach(dir => {
  const dirPath = path.join(__dirname, 'public', 'images', dir);
  
  if (fs.existsSync(dirPath)) {
    console.log(`📂 /images/${dir}:`);
    try {
      const files = fs.readdirSync(dirPath);
      files.slice(0, 5).forEach(file => {
        console.log(`   - ${file}`);
      });
      if (files.length > 5) {
        console.log(`   ... et ${files.length - 5} autres fichiers`);
      }
    } catch (error) {
      console.log(`   Erreur de lecture: ${error.message}`);
    }
  } else {
    console.log(`❌ Dossier introuvable: /images/${dir}`);
  }
  console.log('');
});
