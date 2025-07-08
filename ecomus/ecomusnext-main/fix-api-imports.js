#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour corriger les imports dans un fichier
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corriger les imports nommés vers des imports par défaut
    const replacements = [
      { from: /import { Product } from (.+)/g, to: 'import Product from $1' },
      { from: /import { Order } from (.+)/g, to: 'import Order from $1' },
      { from: /import { User } from (.+)/g, to: 'import User from $1' },
      { from: /import { Store } from (.+)/g, to: 'import Store from $1' },
      { from: /import { Category } from (.+)/g, to: 'import Category from $1' }
    ];

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Fonction pour parcourir récursivement les fichiers
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

// Corriger tous les fichiers API
const apiDir = path.join(__dirname, 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('🔧 Fixing API imports...');
  walkDir(apiDir, fixImports);
  console.log('✅ API imports fixed!');
} else {
  console.log('❌ API directory not found');
}
