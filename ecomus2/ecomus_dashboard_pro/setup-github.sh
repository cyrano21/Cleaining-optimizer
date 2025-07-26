#!/bin/bash

# Script pour configurer et pousser Dashboard2 vers GitHub
echo "🐙 Configuration Git et GitHub pour Dashboard2..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire dashboard2"
    exit 1
fi

# Vérifier la configuration Git
echo "🔧 Vérification de la configuration Git..."
git config user.name "Cyrano"
git config user.email "cyranobg@gmail.com"

# Ajouter tous les fichiers
echo "📝 Ajout des fichiers..."
git add .

# Créer le commit
echo "💾 Commit des changements..."
git commit -m "feat: Dashboard2 setup with NextAuth integration

- ✅ Next.js 14 setup with TypeScript
- ✅ NextAuth configuration for authentication
- ✅ EcomusNext API integration
- ✅ Test sync page for API communication
- ✅ Modern UI with Tailwind CSS
- ✅ Ready for Vercel deployment"

# Instructions pour GitHub
echo ""
echo "🚀 Prêt pour GitHub! Suivez ces étapes:"
echo ""
echo "1. Créez un nouveau repository sur GitHub:"
echo "   👉 https://github.com/new"
echo "   📋 Nom suggéré: ecomus-dashboard2"
echo "   📋 Description: Dashboard administratif pour EcomusNext"
echo ""
echo "2. Une fois créé, exécutez ces commandes:"
echo "   git remote add origin https://github.com/VOTRE_USERNAME/ecomus-dashboard2.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Puis déployez sur Vercel:"
echo "   👉 https://vercel.com/import"
echo ""

# Vérifier l'état Git
echo "📊 État actuel du repository:"
git status --short
echo ""
echo "📈 Nombre de fichiers prêts: $(git diff --cached --name-only | wc -l)"
