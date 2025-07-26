#!/bin/bash

echo "🚀 DÉPLOIEMENT VERCEL ROBUSTE"
echo "=============================="

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules package-lock.json yarn.lock .next .vercel

# Installer avec NPM (plus stable pour Vercel)
echo "📦 Installation des dépendances avec NPM..."
npm install --production=false

# Build local pour vérifier
echo "🔨 Build local..."
npm run build

# Déployer
echo "🚀 Déploiement sur Vercel..."
npx vercel --prod

echo "✅ Déploiement terminé !"
