const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing missing dependencies...');
try {
  // Installation de react-resizable-panels et critters
  execSync('npm install react-resizable-panels critters --save', { stdio: 'inherit' });
  
  // Vérifier si les fichiers page.js existent pour les pages problématiques
  const fundamentalsPagePath = path.join(__dirname, '../src/app/javascript/fundamentals/page.js');
  const compoundPagePath = path.join(__dirname, '../src/app/lessons/module/react-patterns/lesson/compound/page.js');
  
  // Copier page.client.js vers page.js si nécessaire
  if (!fs.existsSync(fundamentalsPagePath)) {
    const clientPagePath = path.join(__dirname, '../src/app/javascript/fundamentals/page.client.js');
    if (fs.existsSync(clientPagePath)) {
      const dir = path.dirname(fundamentalsPagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(clientPagePath, fundamentalsPagePath);
      console.log(`Copied ${clientPagePath} to ${fundamentalsPagePath}`);
    }
  }
  
  // Créer la page compound si nécessaire
  if (!fs.existsSync(compoundPagePath)) {
    const dir = path.dirname(compoundPagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const compoundContent = `"use client"

import React from 'react';

export default function CompoundPatternPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Compound Component Pattern</h1>
      <p className="mb-4">
        This page demonstrates the Compound Component pattern in React.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Key Concepts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Parent and child components that work together</li>
          <li>Shared state through React Context</li>
        </ul>
      </div>
    </div>
  );
}`;
    
    fs.writeFileSync(compoundPagePath, compoundContent);
    console.log(`Created ${compoundPagePath}`);
  }
  
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
}
