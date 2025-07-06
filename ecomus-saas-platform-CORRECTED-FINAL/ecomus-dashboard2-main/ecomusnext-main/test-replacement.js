#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 Test de remplacement d\'images...');
console.log('Directory:', process.cwd());

// Test d'une seule image
const testFile = 'public/images/collections/best-deals.png';
const testUrl = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80';

console.log('Fichier de test:', testFile);
console.log('Existe:', fs.existsSync(testFile));

if (fs.existsSync(testFile)) {
  const stats = fs.statSync(testFile);
  console.log('Taille actuelle:', Math.round(stats.size / 1024), 'KB');
}

// Fonction simple de téléchargement
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log('Téléchargement depuis:', url);
    console.log('Vers:', filepath);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Téléchargement terminé');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

// Test de téléchargement
async function testDownload() {
  try {
    // Sauvegarde
    if (fs.existsSync(testFile)) {
      fs.copyFileSync(testFile, testFile + '.test-backup');
      console.log('💾 Sauvegarde créée');
    }
    
    await downloadImage(testUrl, testFile);
    
    // Vérifier le résultat
    const newStats = fs.statSync(testFile);
    console.log('Nouvelle taille:', Math.round(newStats.size / 1024), 'KB');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testDownload();
