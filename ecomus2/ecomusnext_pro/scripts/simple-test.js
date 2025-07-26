const fs = require('fs');

console.log('Script démarré');
fs.writeFileSync('test-output.txt', 'Script exécuté avec succès à ' + new Date().toISOString());
console.log('Fichier créé');