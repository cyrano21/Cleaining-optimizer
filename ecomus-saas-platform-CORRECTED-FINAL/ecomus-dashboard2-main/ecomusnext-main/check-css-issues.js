// Script pour analyser le CSS et détecter les règles qui pourraient masquer les images
const fs = require('fs');
const path = require('path');
const https = require('https');

// Fonction pour parcourir tous les fichiers CSS récursivement
function walkSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Le dossier ${dir} n'existe pas`);
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = walkSync(filePath, fileList);
    } else if (file.endsWith('.css') || file.endsWith('.scss')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour analyser les règles CSS qui pourraient affecter les images
function analyzeCSSRules(content, filePath) {
  const issues = [];
  const relativePath = filePath.replace(__dirname, '');
  
  // Règles qui pourraient masquer des images
  const problematicRules = [
    { regex: /img\s*{\s*display\s*:\s*none/i, message: "Les images sont masquées avec display: none" },
    { regex: /img\s*{\s*visibility\s*:\s*hidden/i, message: "Les images sont masquées avec visibility: hidden" },
    { regex: /img\s*{\s*opacity\s*:\s*0/i, message: "Les images sont transparentes avec opacity: 0" },
    { regex: /\.lazyload\s*{\s*opacity\s*:\s*0/i, message: "Les images avec classe .lazyload sont transparentes" },
    { regex: /img\s*{\s*height\s*:\s*0/i, message: "Les images ont une hauteur de 0" },
    { regex: /img\s*{\s*width\s*:\s*0/i, message: "Les images ont une largeur de 0" },
    { regex: /img\s*{\s*max-height\s*:\s*0/i, message: "Les images ont une max-height de 0" },
    { regex: /img\s*{\s*max-width\s*:\s*0/i, message: "Les images ont une max-width de 0" },
  ];
  
  problematicRules.forEach(rule => {
    if (rule.regex.test(content)) {
      issues.push({
        file: relativePath,
        message: rule.message,
        snippet: content.match(rule.regex)[0]
      });
    }
  });
  
  // Rechercher les sélecteurs spécifiques pour les images de cartes produits
  const productCardRules = [
    /\.img-product/i,
    /\.product-card\s+img/i,
    /\.product-image/i
  ];
  
  productCardRules.forEach(regex => {
    const match = content.match(new RegExp(`(${regex.source}[^{]*{[^}]*})`, 'i'));
    if (match) {
      const rule = match[1];
      if (rule.includes('display: none') || rule.includes('visibility: hidden') || rule.includes('opacity: 0') ||
          rule.includes('height: 0') || rule.includes('width: 0')) {
        issues.push({
          file: relativePath,
          message: "Règle CSS potentiellement problématique pour les images de produits",
          snippet: rule
        });
      }
    }
  });
  
  return issues;
}

// Vérifier si une URL d'image est accessible et récupérer ses dimensions
function checkImageSize(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        // L'image existe et est accessible
        let data = [];
        
        res.on('data', chunk => {
          data.push(chunk);
          
          // Pour éviter de télécharger toute l'image, on arrête après avoir reçu suffisamment de données
          // pour déterminer les dimensions (pour les formats courants)
          if (data.length > 10) {
            res.destroy();
            resolve({ 
              status: 200, 
              message: 'Image accessible' 
            });
          }
        });
        
        res.on('end', () => {
          resolve({ 
            status: 200, 
            message: 'Image accessible' 
          });
        });
      } else {
        resolve({ 
          status: res.statusCode, 
          message: `Erreur HTTP: ${res.statusCode}` 
        });
      }
    }).on('error', (err) => {
      resolve({ 
        status: 0, 
        message: `Erreur de connexion: ${err.message}` 
      });
    });
  });
}

// Analyser tous les fichiers CSS
console.log('🔍 Analyse des styles CSS qui pourraient masquer les images...\n');

const cssFiles = [
  ...walkSync(path.join(__dirname, 'public', 'css')),
  ...walkSync(path.join(__dirname, 'public', 'scss')),
  ...walkSync(path.join(__dirname, 'styles'))
];

let allIssues = [];

cssFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const issues = analyzeCSSRules(content, file);
    allIssues = [...allIssues, ...issues];
  } catch (err) {
    console.error(`⚠️ Erreur lors de l'analyse de ${file}: ${err.message}`);
  }
});

// Vérifier quelques URLs d'images pour s'assurer qu'elles sont accessibles
const imagesToCheck = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&h=1034&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'
];

console.log('📋 Problèmes CSS détectés:');
if (allIssues.length === 0) {
  console.log('✅ Aucun problème CSS qui pourrait masquer les images n\'a été détecté');
} else {
  allIssues.forEach(issue => {
    console.log(`\n📄 ${issue.file}`);
    console.log(`⚠️ ${issue.message}`);
    console.log(`📝 ${issue.snippet}`);
  });
}

console.log('\n📋 Test des URLs d\'images:');
Promise.all(imagesToCheck.map(url => {
  console.log(`🔍 Test de l'URL: ${url}`);
  return checkImageSize(url).then(result => {
    console.log(`${result.status === 200 ? '✅' : '❌'} ${result.message}`);
    return result;
  });
})).then(() => {
  console.log('\n💡 Recommandations:');
  console.log('1. Vérifier les éventuelles règles CSS qui masquent les images');
  console.log('2. S\'assurer que les dimensions des images sont correctes dans les composants Image');
  console.log('3. Vérifier les scripts de lazy loading qui pourraient empêcher l\'affichage des images');
  console.log('4. Vérifier que les URLs des images sont correctes et accessibles');
});
