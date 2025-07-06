const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Contenu minimal d'un JPEG valide (header + EOI)
const minimalJpeg = Buffer.from([
  0xFF, 0xD8, // SOI
  0xFF, 0xD9  // EOI
]);

for (let i = 1; i <= 10; i++) {
  const file = path.join(targetDir, `placeholder-${i}.jpg`);
  fs.writeFileSync(file, minimalJpeg);
  console.log('Créé :', file);
}
