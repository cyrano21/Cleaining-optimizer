// Script pour télécharger des images de produits depuis Unsplash
const https = require('https');
const fs = require('fs');
const path = require('path');

// Créer le dossier de destination s'il n'existe pas
const productsDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
  console.log(`✅ Dossier créé: ${productsDir}`);
}

// Liste des termes de recherche pour les produits
const productTerms = [
  'fashion', 'outfit', 'clothing', 'apparel', 'style',
  'minimal', 'trendy', 'collection', 'wardrobe',
  'jacket', 'shirt', 'pants', 'dress', 'accessories', 'model'
];

// Liste d'URLs d'images fiables d'Unsplash (pas l'API random)
const reliableImageUrls = [
  'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=720&h=1005&fit=crop&q=80', // Mode féminine
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=720&h=1005&fit=crop&q=80', // Mode féminine
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=720&h=1005&fit=crop&q=80', // Mode féminine
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=720&h=1005&fit=crop&q=80', // Mode féminine
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=720&h=1005&fit=crop&q=80', // Mode masculine
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=720&h=1005&fit=crop&q=80', // Mode masculine
  'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=720&h=1005&fit=crop&q=80', // Vêtements
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=720&h=1005&fit=crop&q=80', // Mode féminine
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=720&h=1005&fit=crop&q=80', // Accessoires
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=720&h=1005&fit=crop&q=80' // Homme mode
];

/**
 * Télécharge une image depuis une URL
 * @param {string} url - URL de l'image à télécharger
 * @param {string} filepath - Chemin de destination pour l'image
 * @returns {Promise} - Promesse résolue une fois l'image téléchargée
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Échec du téléchargement: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Image téléchargée: ${filepath}`);
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Supprime le fichier partiellement téléchargé
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Télécharge plusieurs images de produits
 */
async function downloadProductImages() {
  console.log('📥 Téléchargement des images de produits...');

  let successCount = 0;
  let errorCount = 0;
  
  // Télécharge des images de placeholder numérotées de 1 à 10
  for (let i = 1; i <= 10; i++) {
    const filename = `placeholder-${i}.jpg`;
    const filepath = path.join(productsDir, filename);
    
    // Utilise une URL fiable de la liste
    const imageUrl = reliableImageUrls[i % reliableImageUrls.length];
    
    try {
      await downloadImage(imageUrl, filepath);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur de téléchargement pour ${filename}:`, error.message);
      errorCount++;
    }
    
    // Petite pause entre les téléchargements
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Télécharge une image pour chaque terme de recherche
  for (const term of productTerms) {
    const filename = `${term.toLowerCase()}.jpg`;
    const filepath = path.join(productsDir, filename);
    
    // Utilise une URL fiable de la liste
    const imageUrl = reliableImageUrls[productTerms.indexOf(term) % reliableImageUrls.length];
    
    try {
      await downloadImage(imageUrl, filepath);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur de téléchargement pour ${filename}:`, error.message);
      errorCount++;
    }
    
    // Petite pause entre les téléchargements
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📊 Résumé du téléchargement:`);
  console.log(`✅ Images téléchargées avec succès: ${successCount}`);
  console.log(`❌ Échecs de téléchargement: ${errorCount}`);
  console.log(`\n💡 Ces images sont maintenant disponibles localement dans /public/images/products/`);
  console.log(`💡 Utilisez-les dans vos composants au lieu des URLs source.unsplash.com/random problématiques`);
  console.log(`💡 Exécutez maintenant 'node fix-unsplash-urls.js' pour remplacer automatiquement toutes les URLs problématiques dans votre code`);
}

// Exécute la fonction principale
console.log('🚀 Démarrage du téléchargement d\'images...');
downloadProductImages().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});