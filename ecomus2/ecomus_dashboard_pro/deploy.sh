#!/bin/bash

# Script de déploiement Dashboard2 sur Vercel
echo "🚀 Déploiement Dashboard2 sur Vercel..."

cd /workspaces/ecomusnext/dashboard2

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Vérifiez le répertoire."
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Installation des dépendances..."
npm install

# Build local pour vérifier qu'il n'y a pas d'erreurs
echo "🔨 Build local de vérification..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build local. Corrigez les erreurs avant de déployer."
    exit 1
fi

# Déploiement sur Vercel
echo "☁️ Déploiement sur Vercel..."
npx vercel --prod

echo "✅ Déploiement terminé!"
echo ""
echo "📋 Étapes suivantes:"
echo "1. Récupérer l'URL de production Dashboard2 depuis Vercel"
echo "2. Mettre à jour les variables d'environnement dans le projet principal EcomusNext"
echo "3. Tester la communication entre les deux applications"
