// Script pour vérifier le chargement des images depuis les URLs externes
const https = require('https');
const fs = require('fs');

function fetchHead(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Liste des URLs d'images à vérifier
const imagesToCheck = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&h=1034&auto=format&fit=crop',
  'https://img.icons8.com/fluency/48/quote-left.png',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop'
];

console.log('🔍 Vérification du chargement des images depuis les URLs externes...\n');

async function checkImageUrls() {
  for (const url of imagesToCheck) {
    try {
      console.log(`📥 Tentative d'accès à: ${url}`);
      
      const response = await fetchHead(url);
      
      if (response.ok) {
        console.log(`✅ L'image est accessible (${response.status} ${response.statusText})`);
        console.log(`📋 Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-length']) {
          console.log(`📦 Taille: ${(response.headers['content-length'] / 1024).toFixed(2)} KB\n`);
        } else {
          console.log(`📦 Taille: Non spécifiée\n`);
        }
      } else {
        console.log(`❌ L'image n'est pas accessible (${response.status} ${response.statusText})\n`);
      }
    } catch (error) {
      console.log(`❌ Erreur lors de l'accès à l'URL: ${error.message}\n`);
    }
  }
}

// Fonction pour vérifier les paramètres des composants Image
console.log('\n🔍 Conseil pour les composants Image de Next.js:\n');
console.log('1. Assurez-vous que les domaines des images externes sont autorisés dans next.config.mjs');
console.log('2. Vérifiez que les attributs width et height sont proportionnels à l\'image originale');
console.log('3. Utilisez style={{ width: "100%", height: "auto" }} pour maintenir le ratio d\'aspect');
console.log('4. Ajoutez priority={true} pour les images importantes au-dessus de la ligne de flottaison\n');

checkImageUrls();
