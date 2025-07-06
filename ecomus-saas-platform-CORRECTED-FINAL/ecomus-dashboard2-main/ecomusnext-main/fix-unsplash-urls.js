// Script pour remplacer les URLs source.unsplash.com/random problématiques
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Extensions de fichiers à traiter
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Regex pour trouver les URLs source.unsplash.com/random problématiques
const SOURCE_UNSPLASH_REGEX = /https:\/\/source\.unsplash\.com\/random\/([0-9]+)x([0-9]+)\/\?([^&"']+)(?:&sig=([0-9]+))?/g;

// Remplace les URLs problématiques par des images locales
function replaceSrcWithLocalImage(match, width, height, query, signature = '0') {
  const signatureNum = parseInt(signature, 10) || 0;
  const placeholderIndex = (signatureNum % 10) + 1;
  
  // Utilise un numéro de 1 à 10 basé sur la signature pour les placeholders
  return `/images/products/placeholder-${placeholderIndex}.jpg`;
}

/**
 * Traite un fichier unique et remplace les URLs problématiques
 * @param {string} filePath - Chemin du fichier à traiter
 * @returns {Promise<boolean>} - true si des modifications ont été apportées
 */
async function processFile(filePath) {
  // Lire le contenu du fichier
  let content;
  try {
    content = await readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Impossible de lire le fichier ${filePath}:`, error.message);
    return false;
  }

  // Vérifier si le fichier contient des URLs problématiques
  if (!SOURCE_UNSPLASH_REGEX.test(content)) {
    return false;
  }
  
  // Réinitialiser le regex (car .test() avance l'index)
  SOURCE_UNSPLASH_REGEX.lastIndex = 0;
  
  // Remplacer toutes les URLs problématiques
  const newContent = content.replace(SOURCE_UNSPLASH_REGEX, replaceSrcWithLocalImage);
  
  // Compter combien de remplacements ont été effectués
  const matches = content.match(SOURCE_UNSPLASH_REGEX) || [];
  const replaceCount = matches.length;

  // Sauvegarder le fichier si des modifications ont été apportées
  if (newContent !== content) {
    try {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✅ ${filePath}: ${replaceCount} URLs remplacées`);
      return true;
    } catch (error) {
      console.error(`❌ Impossible d'écrire dans le fichier ${filePath}:`, error.message);
      return false;
    }
  }
  
  return false;
}

/**
 * Parcourt récursivement un répertoire et traite tous les fichiers
 * @param {string} dir - Répertoire à parcourir
 * @returns {Promise<number>} - Nombre total de fichiers modifiés
 */
async function processDirectory(dir) {
  let modifiedCount = 0;
  
  // Lister tous les fichiers et dossiers
  const items = await readdir(dir);
  
  // Traiter chaque élément
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    // Ignorer les dossiers node_modules et .next
    if (item === 'node_modules' || item === '.next') {
      continue;
    }
    
    // Vérifier si c'est un dossier
    const stats = await stat(itemPath);
    
    if (stats.isDirectory()) {
      // Traiter récursivement le sous-dossier
      modifiedCount += await processDirectory(itemPath);
    } else if (stats.isFile() && EXTENSIONS.includes(path.extname(itemPath))) {
      // Traiter le fichier s'il a une extension supportée
      const modified = await processFile(itemPath);
      if (modified) {
        modifiedCount++;
      }
    }
  }
  
  return modifiedCount;
}

/**
 * Vérifie si le dossier d'images existe
 * @returns {boolean} - true si le dossier existe
 */
async function checkImagesFolder() {
  const productsDir = path.join(__dirname, 'public', 'images', 'products');
  try {
    await fs.promises.access(productsDir);
    // Vérifie s'il y a au moins quelques images de placeholder
    const files = await fs.promises.readdir(productsDir);
    const placeholderFiles = files.filter(file => file.startsWith('placeholder-'));
    
    if (placeholderFiles.length >= 5) {
      console.log('✅ Dossier d\'images détecté avec des placeholders');
      return true;
    } else {
      console.log('⚠️ Le dossier d\'images existe mais ne contient pas assez de placeholders');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Le dossier d\'images n\'existe pas ou n\'est pas accessible');
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔍 Recherche et remplacement des URLs source.unsplash.com/random problématiques...');
  
  // Vérifie si le dossier d'images existe
  const imagesExist = await checkImagesFolder();
  if (!imagesExist) {
    console.log('\n⚠️ Les images de placeholder n\'ont pas été trouvées.');
    console.log('🔄 Veuillez d\'abord exécuter le script "download-product-images.js" pour télécharger les images nécessaires.');
    console.log('   Commande: node download-product-images.js');
    process.exit(1);
  }
  
  // Chemin racine du projet
  const rootDir = path.resolve(__dirname);
  
  try {
    // Traiter tous les fichiers du projet
    console.log('🔎 Analyse des fichiers du projet...');
    const modifiedCount = await processDirectory(rootDir);
    
    console.log('\n📊 Résumé des modifications:');
    console.log(`✅ ${modifiedCount} fichiers modifiés`);
    
    if (modifiedCount > 0) {
      console.log('\n🎉 Toutes les URLs problématiques ont été remplacées avec succès!');
      console.log('💡 Redémarrez votre serveur Next.js pour voir les changements avec la commande:');
      console.log('   npm run dev');
    } else {
      console.log('\n💡 Aucun fichier n\'a été modifié. Soit toutes les URLs ont déjà été corrigées, soit aucune URL problématique n\'a été trouvée.');
    }
  } catch (error) {
    console.error('❌ Une erreur est survenue lors du traitement des fichiers:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main().catch(console.error);
