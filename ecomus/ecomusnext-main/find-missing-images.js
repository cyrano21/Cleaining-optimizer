// find-missing-images.js
// Ce script recherche les références aux images manquantes ou problématiques

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Fonction pour parcourir récursivement tous les fichiers dans un répertoire
function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = walkSync(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.js') || 
       file.endsWith('.jsx') || 
       file.endsWith('.ts') || 
       file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour extraire les chemins d'images locaux
function extractLocalImagePaths(content) {
  // Recherche des chemins d'images dans les imports statiques
  const staticImportRegex = /['"]\/images\/([^'"]+)['"/]/g;
  let match;
  const paths = new Set();
  
  while ((match = staticImportRegex.exec(content)) !== null) {
    paths.add(`/images/${match[1]}`);
  }
  
  return [...paths];
}

// Fonction pour vérifier si le fichier existe dans le dossier public
function checkImageExists(imagePath) {
  const fullPath = path.join(__dirname, 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Parcourir tous les fichiers JS/JSX/TS/TSX
console.log('🔍 Recherche des chemins d\'images locaux manquants...');

const allFiles = walkSync(__dirname);
const imagePaths = new Map();
const missingImages = [];

// Pour chaque fichier, extraire les chemins d'images
allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const localPaths = extractLocalImagePaths(content);
    
    if (localPaths.length > 0) {
      // Stocker les chemins trouvés avec leur fichier source
      localPaths.forEach(imagePath => {
        if (!imagePaths.has(imagePath)) {
          imagePaths.set(imagePath, []);
        }
        imagePaths.get(imagePath).push(file);
        
        // Vérifier si l'image existe
        if (!checkImageExists(imagePath)) {
          missingImages.push({ path: imagePath, sourceFile: file });
        }
      });
    }
  } catch (err) {
    console.error(`Erreur lors de la lecture du fichier ${file}:`, err.message);
  }
});

// Afficher les résultats
console.log(`\n✅ ${imagePaths.size} chemins d'images locaux trouvés dans les fichiers`);
console.log(`❌ ${missingImages.length} images manquantes identifiées\n`);

// Afficher les chemins d'images manquants
if (missingImages.length > 0) {
  console.log('Images manquantes (les 20 premières):');
  missingImages.slice(0, 20).forEach((item, index) => {
    console.log(`${index + 1}. ${item.path}`);
    console.log(`   Source: ${path.relative(__dirname, item.sourceFile)}`);
  });
  
  if (missingImages.length > 20) {
    console.log(`...et ${missingImages.length - 20} autres.`);
  }
  
  // Créer un fichier de sortie avec toutes les images manquantes
  const output = missingImages.map(item => {
    return `${item.path}\n   Source: ${path.relative(__dirname, item.sourceFile)}`;
  }).join('\n\n');
  
  fs.writeFileSync(path.join(__dirname, 'missing-images.txt'), output, 'utf8');
  console.log('\nListe complète enregistrée dans missing-images.txt');
}

// Fonction pour remplacer les chemins d'images manquants par des URLs Unsplash
function getRandomUnsplashUrl(width = 800, height = 600) {
  const keywords = ['nature', 'hiking', 'camping', 'outdoor', 'adventure', 'mountains', 'forest', 'landscape'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  const randomId = Math.floor(Math.random() * 1000);
  return `https://source.unsplash.com/random/${width}x${height}/?${randomKeyword}&sig=${randomId}`;
}

// Demander à l'utilisateur s'il souhaite remplacer les images manquantes
console.log('\n🔄 Voulez-vous remplacer les chemins des images manquantes par des URLs Unsplash?');
console.log('Cette action modifiera directement les fichiers source répertoriés ci-dessus.');
console.log('Pour exécuter le remplacement, utilisez: node find-missing-images.js --replace\n');
