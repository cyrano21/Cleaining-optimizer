#!/bin/bash

# Script de déploiement alternatif pour contourner les problèmes npm temporaires
echo "🚀 Script de déploiement alternatif - Ecomus Dashboard"

# Nettoyer le cache yarn et npm
echo "🧹 Nettoyage des caches..."
yarn cache clean
npm cache clean --force

# Essayer avec npm au lieu de yarn si yarn échoue
echo "📦 Installation des dépendances..."
if ! yarn install --network-timeout 100000; then
    echo "⚠️  Yarn install failed, trying with npm..."
    rm -rf node_modules yarn.lock
    npm install --timeout=100000 --network-timeout 100000
fi

# Construire le projet
echo "🏗️  Building the project..."
if yarn build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment script completed!"
