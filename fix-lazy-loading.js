// Script pour identifier et corriger les problèmes de lazy loading des images
const fs = require('fs');
const path = require('path');

// Fonction pour parcourir tous les fichiers récursivement
function walkSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Le dossier ${dir} n'existe pas`);
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = walkSync(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour analyser le lazy loading
function analyzeLazyLoading(content, filePath) {
  const issues = [];
  const relativePath = filePath.replace(__dirname, '');
  
  // Identifier les composants Image qui utilisent data-src au lieu de src
  const lazyloadRegex = /<Image[^>]*className="[^"]*lazyload[^"]*"[^>]*data-src=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = lazyloadRegex.exec(content)) !== null) {
    issues.push({
      type: 'lazyload-next',
      file: relativePath,
      snippet: match[0],
      message: 'Image utilise data-src au lieu de src avec Next.js Image - peut causer des problèmes de chargement',
      imagePath: match[1]
    });
  }
  
  // Vérifier si des scripts de lazy loading externes sont utilisés
  if (content.includes('lazysizes') || content.includes('lazyload')) {
    if (content.includes('<Image') && (content.includes('className="lazyload"') || content.includes('data-src='))) {
      issues.push({
        type: 'external-lazy',
        file: relativePath,
        message: 'Le composant utilise un script de lazy loading externe avec Next.js Image (conflit potentiel)',
      });
    }
  }
  
  return issues;
}

// Analyse des fichiers
console.log('🔍 Analyse des problèmes de lazy loading...\n');

const componentFiles = walkSync(path.join(__dirname, 'components'));
const jsFiles = walkSync(path.join(__dirname, 'utlis'));  // Le dossier s'appelle "utlis" et non "utils"

let allIssues = [];

[...componentFiles, ...jsFiles].forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const issues = analyzeLazyLoading(content, file);
    allIssues = [...allIssues, ...issues];
  } catch (err) {
    console.error(`⚠️ Erreur lors de l'analyse de ${file}: ${err.message}`);
  }
});

// Afficher les résultats
console.log(`⚠️ Problèmes de lazy loading détectés: ${allIssues.length}`);
const lazyloadNextIssues = allIssues.filter(issue => issue.type === 'lazyload-next');
const externalLazyIssues = allIssues.filter(issue => issue.type === 'external-lazy');

console.log(`\n📋 Images avec data-src au lieu de src: ${lazyloadNextIssues.length}`);
lazyloadNextIssues.slice(0, 10).forEach(issue => {
  console.log(`\n📄 ${issue.file}`);
  console.log(`⚠️ ${issue.message}`);
  console.log(`🖼️ Image: ${issue.imagePath}`);
});

if (lazyloadNextIssues.length > 10) {
  console.log(`...et ${lazyloadNextIssues.length - 10} autres problèmes similaires`);
}

console.log(`\n📋 Conflits potentiels avec des scripts de lazy loading externes: ${externalLazyIssues.length}`);
externalLazyIssues.forEach(issue => {
  console.log(`\n📄 ${issue.file}`);
  console.log(`⚠️ ${issue.message}`);
});

// Vérifier si des scripts de lazy loading externes sont utilisés
const hasExternalLazyLoadScript = fs.existsSync(path.join(__dirname, 'public', 'js', 'lazysizes.min.js')) ||
  fs.readdirSync(path.join(__dirname, 'public', 'js')).some(file => file.includes('lazy'));

console.log('\n📋 Scripts de lazy loading:');
if (hasExternalLazyLoadScript) {
  console.log('⚠️ Scripts externes de lazy loading détectés. Cela peut entrer en conflit avec Next.js Image.');
} else {
  console.log('✅ Aucun script externe de lazy loading détecté.');
}

// Vérifier l'utilisation de la bibliothèque lazysizes dans package.json
try {
  const packageJson = require(path.join(__dirname, 'package.json'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (dependencies.lazysizes) {
    console.log(`⚠️ lazysizes version ${dependencies.lazysizes} est installé. Cela peut entrer en conflit avec Next.js Image.`);
  }
} catch (err) {
  console.error(`⚠️ Erreur lors de la lecture de package.json: ${err.message}`);
}

console.log('\n💡 Recommandations pour corriger les problèmes de lazy loading:');
console.log('1. Remplacer l\'attribut data-src par src dans les composants Next.js Image');
console.log('2. Éviter d\'utiliser les bibliothèques externes de lazy loading avec Next.js Image');
console.log('3. Si vous avez besoin d\'un lazy loading personnalisé, utiliser loading="lazy" natif');
console.log('4. Pour les images critiques (LCP), utiliser l\'attribut priority={true}');
