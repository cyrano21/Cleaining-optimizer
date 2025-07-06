// Script pour vérifier les composants Image et identifier des problèmes potentiels
const fs = require('fs');
const path = require('path');

// Fonction pour parcourir tous les fichiers récursivement
function walkSync(dir, fileList = []) {
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

// Fonction pour analyser les composants Image de Next.js
function analyzeImageComponents(content, filePath) {
  const issues = [];
  
  // Chercher les composants Image qui n'ont pas style={{ width: "100%", height: "auto" }}
  const imageRegex = /<Image\s+([^>]*)>/g;
  const styleRegex = /style\s*=\s*{{\s*width\s*:\s*["']100%["']\s*,\s*height\s*:\s*["']auto["']\s*}}/;
  const priorityRegex = /priority\s*=\s*{(true|false)}/;
  
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imageProps = match[1];
    const relativePath = filePath.replace(__dirname, '');
    
    if (!styleRegex.test(imageProps)) {
      issues.push({
        type: 'style',
        file: relativePath,
        snippet: match[0].substring(0, 200) + '...',
        message: 'Image sans style="width:100%, height:auto" pour maintenir le ratio d\'aspect'
      });
    }
    
    // Vérifier si c'est une image importante sans priority
    if (imageProps.includes('className="hero-image"') || 
        imageProps.includes('className="banner-image"') || 
        imageProps.includes('className="featured"')) {
      if (!priorityRegex.test(imageProps) || !imageProps.includes('priority={true}')) {
        issues.push({
          type: 'priority',
          file: relativePath,
          snippet: match[0].substring(0, 200) + '...',
          message: 'Image importante sans attribut priority'
        });
      }
    }
  }
  
  return issues;
}

// Analyser tous les fichiers
console.log('🔍 Analyse des composants Image de Next.js...\n');

const componentFiles = walkSync(path.join(__dirname, 'components'));
const appFiles = walkSync(path.join(__dirname, 'app'));
const allFiles = [...componentFiles, ...appFiles];

let allIssues = [];

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const issues = analyzeImageComponents(content, file);
    allIssues = [...allIssues, ...issues];
  } catch (err) {
    console.error(`⚠️ Erreur lors de l'analyse de ${file}: ${err.message}`);
  }
});

// Grouper par type
const styleIssues = allIssues.filter(issue => issue.type === 'style');
const priorityIssues = allIssues.filter(issue => issue.type === 'priority');

console.log(`⚠️ Problèmes de style détectés: ${styleIssues.length}`);
styleIssues.slice(0, 10).forEach(issue => {
  console.log(`\n📄 ${issue.file}`);
  console.log(`${issue.message}`);
});

if (styleIssues.length > 10) {
  console.log(`...et ${styleIssues.length - 10} autres problèmes de style`);
}

console.log(`\n⚠️ Images importantes sans priorité: ${priorityIssues.length}`);
priorityIssues.slice(0, 10).forEach(issue => {
  console.log(`\n📄 ${issue.file}`);
  console.log(`${issue.message}`);
});

if (priorityIssues.length > 10) {
  console.log(`...et ${priorityIssues.length - 10} autres problèmes de priorité`);
}

console.log('\n💡 Suggestions pour résoudre les problèmes:');
console.log('1. Ajouter style={{ width: "100%", height: "auto" }} à tous les composants Image');
console.log('2. Définir des dimensions width/height proportionnelles à l\'image originale');
console.log('3. Ajouter priority={true} aux images importantes visibles au premier chargement');
console.log('4. Vérifier que sizes="" est défini pour les images responsives');
console.log('5. Utiliser placeholder="blur" avec blurDataURL pour améliorer l\'expérience utilisateur');
