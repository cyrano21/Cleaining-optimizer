// Script pour tester les URLs Unsplash et vérifier leur accessibilité
const https = require('https');
const fs = require('fs');
const path = require('path');

// Fonction pour parcourir tous les fichiers JavaScript récursivement
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
      (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour extraire les URLs Unsplash
function extractUnsplashURLs(content) {
  const unsplashRegex = /(https:\/\/(?:plus\.)?unsplash\.com\/[^"'\s]+)/g;
  let match;
  const urls = new Set();
  
  while ((match = unsplashRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  return [...urls];
}

// Fonction pour vérifier si une URL est accessible
function checkURL(url) {
  return new Promise((resolve, reject) => {
    // Vérifier si l'URL est valide
    if (!url.startsWith('https://')) {
      return resolve({
        url,
        status: 'invalid',
        message: 'URL invalide',
      });
    }
    
    https.get(url, (res) => {
      const { statusCode } = res;
      
      // Nous avons juste besoin de vérifier le code de statut
      res.resume(); // Consommer la réponse pour libérer la mémoire
      
      if (statusCode === 200) {
        resolve({
          url,
          status: 'ok',
          message: 'L\'URL est accessible',
          statusCode
        });
      } else {
        resolve({
          url,
          status: 'error',
          message: `L'URL a retourné le code ${statusCode}`,
          statusCode
        });
      }
    }).on('error', (err) => {
      resolve({
        url,
        status: 'error',
        message: `Erreur de connexion: ${err.message}`,
        error: err
      });
    });
  });
}

// Fonction pour trouver et tester toutes les URLs Unsplash
async function testAllUnsplashURLs() {
  console.log('🔍 Recherche des URLs Unsplash dans les fichiers JavaScript...');
  
  const dataFiles = walkSync(path.join(__dirname, 'data'));
  const componentFiles = walkSync(path.join(__dirname, 'components'));
  const allFiles = [...dataFiles, ...componentFiles];
  
  let allUrls = new Set();
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const urls = extractUnsplashURLs(content);
      urls.forEach(url => allUrls.add(url));
    } catch (err) {
      console.error(`⚠️ Erreur lors de la lecture de ${file}: ${err.message}`);
    }
  });
  
  console.log(`\n✅ ${allUrls.size} URLs Unsplash trouvées`);
  
  // Limiter à 10 URLs pour éviter trop de requêtes simultanées
  const urlsToCheck = [...allUrls].slice(0, 10);
  
  console.log('\n🔄 Vérification de l\'accessibilité des URLs Unsplash...');
  
  const results = await Promise.all(urlsToCheck.map(url => checkURL(url)));
  
  // Compter les résultats
  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error').length;
  const invalid = results.filter(r => r.status === 'invalid').length;
  
  console.log(`\n📊 Résultats: ${ok} OK, ${errors} erreurs, ${invalid} invalides`);
  
  // Afficher les détails
  console.log('\n📋 Détails:');
  
  results.forEach(result => {
    const icon = result.status === 'ok' ? '✅' : '❌';
    console.log(`${icon} ${result.url}`);
    console.log(`   ${result.message}`);
    
    // Si c'est une erreur, proposer une URL alternative
    if (result.status === 'error') {
      // Construire une URL alternative en modifiant les paramètres
      const baseUrl = result.url.split('?')[0];
      const alternativeUrl = `${baseUrl}?q=80&w=600&auto=format&fit=crop`;
      console.log(`   💡 Essayez cette URL alternative: ${alternativeUrl}`);
    }
  });
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  console.log('1. Assurez-vous que toutes les URLs Unsplash sont valides et accessibles');
  console.log('2. Utilisez des paramètres optimisés: ?q=80&w=600&auto=format&fit=crop');
  console.log('3. Vérifiez que les domaines sont correctement configurés dans next.config.mjs');
  console.log('4. Si une URL ne fonctionne pas, essayez une image alternative d\'Unsplash');
}

// Exécuter le script
testAllUnsplashURLs();
