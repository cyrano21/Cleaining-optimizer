#!/usr/bin/env node

/**
 * Script de déploiement automatisé des variables d'environnement Vercel
 * Usage: node deploy-vercel-env.js
 */

const fs = require('fs');
const path = require('path');

// Configuration des variables d'environnement pour Vercel
const VERCEL_ENV_VARS = {
  // Base de données
  'MONGODB_URI': 'mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0',
  
  // NextAuth.js
  'NEXTAUTH_URL': 'https://ecomus-dashboard2.vercel.app',
  'NEXTAUTH_SECRET': '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',
  
  // JWT
  'JWT_SECRET': 'ecomus-admin-jwt-secret-super-secure-2025-key',
  
  // URLs Publiques
  'NEXT_PUBLIC_API_BASE_URL': 'https://ecomus-dashboard2.vercel.app',
  'NEXT_PUBLIC_API_URL': 'https://ecomus-dashboard2.vercel.app/api',
  'NEXT_PUBLIC_ECOMMERCE_URL': 'https://ecomusnext-tau.vercel.app',
  'NEXT_PUBLIC_ECOMUS_PRODUCTION_URL': 'https://ecomusnext-tau.vercel.app/api',
  
  // Google OAuth
  'GOOGLE_CLIENT_ID': '167798227599-t5jrag0pqk8joicb955c79615kd703ba.apps.googleusercontent.com',
  'GOOGLE_CLIENT_SECRET': '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',
  
  // Cloudinary
  'CLOUDINARY_CLOUD_NAME': 'dwens2ze5',
  'CLOUDINARY_API_KEY': '895316547868918',
  'CLOUDINARY_API_SECRET': 'fJdiGdhRH1tgemd7mD5cViS2bL0',
  
  // Stripe (à remplacer par les vraies clés)
  'STRIPE_PUBLISHABLE_KEY': 'pk_test_your_stripe_key',
  'STRIPE_SECRET_KEY': 'sk_test_your_stripe_secret',
  'STRIPE_WEBHOOK_SECRET': 'whsec_your_webhook_secret',
  
  // Email
  'EMAIL_FROM': 'noreply@ecomus.com',
  'EMAIL_SERVER_HOST': 'smtp.gmail.com',
  'EMAIL_SERVER_PORT': '587',
  'EMAIL_SERVER_USER': 'your-email@gmail.com',
  'EMAIL_SERVER_PASSWORD': 'your-app-password',
  
  // Analytics
  'ANALYTICS_ID': 'your-analytics-id',
  
  // Admin
  'DEFAULT_ADMIN_EMAIL': 'admin@ecomus.com',
  'DEFAULT_ADMIN_PASSWORD': 'Admin123!',
  
  // Environment
  'NODE_ENV': 'production'
};

// Variables sensibles qui nécessitent une attention particulière
const SENSITIVE_VARS = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'EMAIL_SERVER_PASSWORD'
];

// Variables à mettre à jour avec de vraies valeurs
const PLACEHOLDER_VARS = [
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'ANALYTICS_ID'
];

function generateVercelCommands() {
  console.log('🚀 Commandes Vercel CLI pour configurer les variables d\'environnement\n');
  console.log('📋 Copiez et exécutez ces commandes dans votre terminal :\n');
  
  Object.entries(VERCEL_ENV_VARS).forEach(([key, value]) => {
    const isSensitive = SENSITIVE_VARS.includes(key);
    const isPlaceholder = PLACEHOLDER_VARS.includes(key);
    
    let comment = '';
    if (isSensitive) {
      comment = ' # ⚠️  Variable sensible';
    }
    if (isPlaceholder) {
      comment += ' # 🔄 À remplacer par la vraie valeur';
    }
    
    console.log(`vercel env add ${key} production${comment}`);
    console.log(`# Valeur: ${value}`);
    console.log('');
  });
}

function generateEnvFile() {
  const envContent = Object.entries(VERCEL_ENV_VARS)
    .map(([key, value]) => {
      const isSensitive = SENSITIVE_VARS.includes(key);
      const isPlaceholder = PLACEHOLDER_VARS.includes(key);
      
      let comment = '';
      if (isSensitive) {
        comment = ' # Variable sensible';
      }
      if (isPlaceholder) {
        comment += ' # À remplacer par la vraie valeur';
      }
      
      return `${key}=${value}${comment}`;
    })
    .join('\n');
    
  const fullContent = `# Variables d'environnement Vercel - Production\n# Généré automatiquement\n\n${envContent}`;
  
  fs.writeFileSync('.env.vercel', fullContent);
  console.log('✅ Fichier .env.vercel généré avec succès!');
}

function generateVercelJson() {
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ],
    "env": Object.keys(VERCEL_ENV_VARS).reduce((acc, key) => {
      acc[key] = `@${key.toLowerCase()}`;
      return acc;
    }, {}),
    "functions": {
      "src/app/api/**/*.js": {
        "maxDuration": 30
      }
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Fichier vercel.json mis à jour!');
}

function showInstructions() {
  console.log('\n📖 Instructions de déploiement :\n');
  
  console.log('1. 🔧 Installation Vercel CLI (si pas déjà fait):');
  console.log('   npm i -g vercel\n');
  
  console.log('2. 🔐 Connexion à Vercel:');
  console.log('   vercel login\n');
  
  console.log('3. 🏗️  Lier le projet:');
  console.log('   vercel link\n');
  
  console.log('4. ⚙️  Configurer les variables (utilisez les commandes générées ci-dessus)\n');
  
  console.log('5. 🚀 Déployer:');
  console.log('   vercel --prod\n');
  
  console.log('🔍 Variables à vérifier absolument:');
  PLACEHOLDER_VARS.forEach(varName => {
    console.log(`   - ${varName}: ${VERCEL_ENV_VARS[varName]}`);
  });
  
  console.log('\n⚠️  Sécurité:');
  console.log('   - Ne jamais commiter les vraies clés dans le code');
  console.log('   - Utiliser uniquement Vercel Environment Variables');
  console.log('   - Régénérer les secrets périodiquement\n');
}

function main() {
  console.log('🎯 Configuration Vercel Environment Variables\n');
  console.log('=' .repeat(60));
  
  try {
    generateEnvFile();
    generateVercelJson();
    generateVercelCommands();
    showInstructions();
    
    console.log('✨ Configuration terminée avec succès!');
    console.log('📁 Fichiers générés: .env.vercel, vercel.json');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  VERCEL_ENV_VARS,
  SENSITIVE_VARS,
  PLACEHOLDER_VARS,
  generateVercelCommands,
  generateEnvFile,
  generateVercelJson
};