const fs = require('fs');
const path = require('path');

// Chemins problématiques spécifiques
const problematicPaths = [
  {
    src: path.join(__dirname, '../src/app/javascript/fundamentals/page.client.js'),
    dest: path.join(__dirname, '../src/app/javascript/fundamentals/page.js')
  },
  {
    src: path.join(__dirname, '../src/app/lessons/module/react-patterns/lesson/compound/page.client.js'),
    dest: path.join(__dirname, '../src/app/lessons/module/react-patterns/lesson/compound/page.js')
  }
];

// Créer le dossier parent si nécessaire
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

// Créer un fichier pour compound pattern page
const compoundPageContent = `"use client"

import React from 'react';

export default function CompoundPatternPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Compound Component Pattern</h1>
      <p className="mb-4">
        This page demonstrates the Compound Component pattern in React.
        A client-side rendered page replaces the problematic server component version.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Key Concepts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Parent and child components that work together</li>
          <li>Shared state through React Context</li>
          <li>Improved component composition</li>
          <li>Flexible and intuitive API</li>
        </ul>
      </div>
    </div>
  );
}`;

// Résoudre les problèmes de chemin
function fixPaths() {
  // Création du répertoire pour la page compound pattern si nécessaire
  const compoundDir = path.join(__dirname, '../src/app/lessons/module/react-patterns/lesson/compound');
  
  if (!fs.existsSync(compoundDir)) {
    console.log(`Création du répertoire: ${compoundDir}`);
    ensureDirectoryExists(compoundDir);
  }
  
  // Création du fichier page.js pour compound pattern
  const compoundPagePath = path.join(compoundDir, 'page.js');
  
  if (!fs.existsSync(compoundPagePath)) {
    console.log(`Création du fichier: ${compoundPagePath}`);
    fs.writeFileSync(compoundPagePath, compoundPageContent);
  }
  
  // Création du répertoire pour la page JavaScript fundamentals si nécessaire
  const jsDir = path.join(__dirname, '../src/app/javascript/fundamentals');
  
  if (!fs.existsSync(jsDir)) {
    console.log(`Création du répertoire: ${jsDir}`);
    ensureDirectoryExists(jsDir);
  }
  
  // Si le fichier page.client.js existe, copier son contenu dans page.js
  const jsClientPath = path.join(__dirname, '../src/app/javascript/fundamentals/page.client.js');
  const jsPagePath = path.join(jsDir, 'page.js');
  
  if (fs.existsSync(jsClientPath)) {
    console.log(`Copie du fichier: ${jsClientPath} vers ${jsPagePath}`);
    fs.copyFileSync(jsClientPath, jsPagePath);
  } else {
    // Sinon créer un nouveau fichier page.js
    const jsPageContent = `"use client"

import React from 'react';

export default function JavascriptFundamentalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">JavaScript Fundamentals</h1>
      <p className="mb-4">
        Welcome to the JavaScript Fundamentals page. This client-side rendered page replaces
        the problematic server component version.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Concepts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Variables and Data Types</li>
            <li>Operators and Expressions</li>
            <li>Control Flow</li>
            <li>Functions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}`;
    
    console.log(`Création du fichier: ${jsPagePath}`);
    fs.writeFileSync(jsPagePath, jsPageContent);
  }
  
  console.log('Chemins corrigés avec succès!');
}

// Exécuter la fonction
fixPaths();
