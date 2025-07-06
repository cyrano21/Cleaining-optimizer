#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs d'images pour écomusée
const imageUrls = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&q=80'
];

// Quelques fichiers de test - les plus critiques
const testFiles = [
  'public/images/collections/best-deals.png',
  'public/images/collections/beverage.png',
  'public/images/collections/dairy.png',
  'public/images/collections/fruit.png',
  'public/images/collections/meat.png',
  'public/images/collections/vegetable.png',
  'public/images/collections/new-releases.png',
  'public/images/products/cosmetic15.jpg',
  'public/images/products/headphone-1.png',
  'public/images/products/headphone-10.png'
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Téléchargement: ${path.basename(filepath)}`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${path.basename(filepath)} - Terminé`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function replaceImages() {
  console.log('🚀 Remplacement des images placeholder principales...');
  console.log(`📋 ${testFiles.length} fichiers à traiter`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    const url = imageUrls[i % imageUrls.length];
    
    try {
      // Vérifier l'existence et la taille
      if (fs.existsSync(file)) {
        const oldSize = fs.statSync(file).size;
        console.log(`\n[${i+1}/${testFiles.length}] ${path.basename(file)} - Taille actuelle: ${Math.round(oldSize/1024)}KB`);
        
        // Sauvegarde
        if (!fs.existsSync(file + '.backup')) {
          fs.copyFileSync(file, file + '.backup');
        }
        
        // Télécharger
        await downloadImage(url, file);
        
        // Vérifier le résultat
        const newSize = fs.statSync(file).size;
        console.log(`📏 Nouvelle taille: ${Math.round(newSize/1024)}KB`);
        
        success++;
      } else {
        console.log(`⚠️  Fichier non trouvé: ${file}`);
      }
      
      // Délai pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erreur ${path.basename(file)}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n🎉 Terminé !`);
  console.log(`✅ Succès: ${success}`);
  console.log(`❌ Erreurs: ${errors}`);
}

replaceImages().catch(console.error);
