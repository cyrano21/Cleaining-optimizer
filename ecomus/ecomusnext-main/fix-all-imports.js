#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Script de correction automatique des imports...\n');

// Fonction pour trouver tous les fichiers .js, .jsx, .ts, .tsx
function findAllFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'documentation', 'ecomusnext2'].includes(file)) {
        results = results.concat(findAllFiles(filePath, extensions));
      }
    } else if (extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Fonction pour calculer le chemin relatif correct
function getCorrectPath(fromFile, toPath) {
  const projectRoot = '/workspaces/ecomusnext';
  const fromDir = path.dirname(fromFile);
  
  // Si c'est déjà un alias @, le garder
  if (toPath.startsWith('@/')) {
    return toPath;
  }
  
  // Si c'est un chemin de module npm, le garder
  if (!toPath.startsWith('.') && !toPath.startsWith('/')) {
    // Vérifier s'il s'agit d'un chemin vers des fichiers locaux
    const possiblePaths = [
      path.join(projectRoot, 'components', toPath),
      path.join(projectRoot, 'context', toPath),
      path.join(projectRoot, 'data', toPath),
      path.join(projectRoot, 'utils', toPath),
      path.join(projectRoot, 'utlis', toPath),
      path.join(projectRoot, toPath)
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath + '.js') || 
          fs.existsSync(possiblePath + '.jsx') || 
          fs.existsSync(possiblePath + '.ts') || 
          fs.existsSync(possiblePath + '.tsx') ||
          fs.existsSync(possiblePath + '/index.js') ||
          fs.existsSync(possiblePath + '/index.jsx')) {
        return '@/' + path.relative(projectRoot, possiblePath).replace(/\\/g, '/');
      }
    }
    
    // Si pas trouvé, retourner tel quel (probablement un module npm)
    return toPath;
  }
  
  // Si c'est un chemin relatif incorrect, essayer de le corriger
  if (toPath.startsWith('../') || toPath.startsWith('./')) {
    const resolvedPath = path.resolve(fromDir, toPath);
    
    // Vérifier si le fichier existe
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    let existingFile = null;
    
    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext)) {
        existingFile = resolvedPath + ext;
        break;
      }
    }
    
    // Si le fichier n'existe pas, chercher dans le projet
    if (!existingFile) {
      const fileName = path.basename(toPath);
      const possibleLocations = [
        path.join(projectRoot, 'components'),
        path.join(projectRoot, 'context'),
        path.join(projectRoot, 'data'),
        path.join(projectRoot, 'utils'),
        path.join(projectRoot, 'utlis')
      ];
      
      for (const location of possibleLocations) {
        const searchResults = findFileRecursive(location, fileName);
        if (searchResults.length > 0) {
          return '@/' + path.relative(projectRoot, searchResults[0]).replace(/\\/g, '/').replace(/\.(js|jsx|ts|tsx)$/, '');
        }
      }
    }
  }
  
  return toPath;
}

// Fonction pour chercher un fichier récursivement
function findFileRecursive(dir, fileName) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFileRecursive(filePath, fileName));
    } else {
      const nameWithoutExt = path.basename(file, path.extname(file));
      const searchNameWithoutExt = path.basename(fileName, path.extname(fileName));
      
      if (nameWithoutExt === searchNameWithoutExt) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Fonction pour corriger les imports dans un fichier
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  const importRegex = /^import\s+.*from\s+['"](.*)['"]/;
  const requireRegex = /require\s*\(\s*['"](.*)['"]\s*\)/g;
  
  const newLines = lines.map(line => {
    // Corriger les imports
    const importMatch = line.match(importRegex);
    if (importMatch) {
      const originalPath = importMatch[1];
      const correctedPath = getCorrectPath(filePath, originalPath);
      
      if (correctedPath !== originalPath) {
        modified = true;
        const newLine = line.replace(originalPath, correctedPath);
        console.log(`  📝 ${path.relative('/workspaces/ecomusnext', filePath)}: ${originalPath} → ${correctedPath}`);
        return newLine;
      }
    }
    
    // Corriger les require
    return line.replace(requireRegex, (match, requiredPath) => {
      const correctedPath = getCorrectPath(filePath, requiredPath);
      if (correctedPath !== requiredPath) {
        modified = true;
        console.log(`  📝 ${path.relative('/workspaces/ecomusnext', filePath)}: ${requiredPath} → ${correctedPath}`);
        return match.replace(requiredPath, correctedPath);
      }
      return match;
    });
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'));
    return true;
  }
  
  return false;
}

// Fonction principale
function main() {
  const projectRoot = '/workspaces/ecomusnext';
  
  console.log('📁 Recherche de tous les fichiers...');
  const allFiles = findAllFiles(projectRoot);
  console.log(`✅ ${allFiles.length} fichiers trouvés\n`);
  
  console.log('🔍 Correction des imports...');
  let totalFixed = 0;
  
  for (const filePath of allFiles) {
    try {
      if (fixImportsInFile(filePath)) {
        totalFixed++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n✅ Correction terminée! ${totalFixed} fichiers modifiés.`);
  
  // Nettoyer le cache Next.js
  console.log('\n🧹 Nettoyage du cache...');
  try {
    execSync('rm -rf .next', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Cache nettoyé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage du cache:', error.message);
  }
  
  console.log('\n🚀 Vous pouvez maintenant redémarrer le serveur avec: npm run dev');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, getCorrectPath };
