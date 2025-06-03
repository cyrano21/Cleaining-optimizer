// Script pour remplacer les chemins d'images locaux par des URLs Unsplash 
const fs = require('fs');
const path = require('path');

// Fonction pour générer une URL Unsplash aléatoire
function getRandomUnsplashUrl(width = 720, height = 1005) {
  // Collection de mots-clés liés à la mode pour des images pertinentes
  const keywords = [
    'fashion', 'clothing', 'apparel', 'style', 'outfit',
    'shirt', 'dress', 'jacket', 'accessories', 'pants',
    'model', 'trendy', 'collection', 'wardrobe', 'minimal'
  ];
  
  // Sélection aléatoire d'un mot-clé
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  // Création d'un ID aléatoire pour diversifier les images
  const randomId = Math.floor(Math.random() * 1000);
  
  return `https://source.unsplash.com/random/${width}x${height}/?${randomKeyword}&sig=${randomId}`;
}

// Fichiers de données à traiter
const dataFiles = [
  path.join(__dirname, 'data', 'products.js'),
  path.join(__dirname, 'data', 'heroslides.js'),
  path.join(__dirname, 'data', 'categories.js'),
  // Ajoutez d'autres fichiers si nécessaire
];

// Parcourir les fichiers de données
dataFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Traitement du fichier: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementCount = 0;
    
    // Remplacer les chemins d'images locaux par des URLs Unsplash
    const newContent = content.replace(/(['"])\/images\/([\w\/-]+\.(jpg|png|jpeg|webp))(['"])/g, (match, quote1, imagePath, ext, quote2) => {
      // Garder une trace de l'expression originale pour le logging
      const original = match;
      
      // Déterminer la taille en fonction du type d'image
      let width = 720;
      let height = 1005;
      
      if (imagePath.includes('slider')) {
        width = 2000;
        height = 1034;
      } else if (imagePath.includes('collection')) {
        width = 800;
        height = 800;
      }
      
      // Générer une URL Unsplash avec les dimensions appropriées
      const unsplashUrl = getRandomUnsplashUrl(width, height);
      
      // Créer la nouvelle chaîne avec l'URL Unsplash
      const replacement = `${quote1}${unsplashUrl}${quote2}`;
      
      replacementCount++;
      
      return replacement;
    });
    
    // Sauvegarder le fichier mis à jour
    if (replacementCount > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${replacementCount} chemins d'images remplacés dans ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️ Aucun chemin d'image à remplacer dans ${path.basename(filePath)}`);
    }
  } else {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
  }
});

console.log('\n✨ Remplacement des images terminé!');
console.log('Redémarrez l\'application pour voir les changements.');
