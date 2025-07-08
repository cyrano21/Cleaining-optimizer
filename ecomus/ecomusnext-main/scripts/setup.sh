#!/bin/bash

# Script d'automatisation complète du seed MongoDB pour Ecomus SaaS
# Ce script guide l'utilisateur à travers tout le processus

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation et Seed automatique - Ecomus SaaS"
echo "================================================="
echo ""

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour attendre une confirmation
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
}

# Vérifier Node.js
if ! command_exists node; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Vérifier npm
if ! command_exists npm; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Vérifier .env.local
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  Fichier .env.local non trouvé"
    if confirm "Créer un fichier .env.local avec des valeurs par défaut?"; then
        cp .env.example .env.local
        echo "✅ .env.local créé"
        echo "⚠️  Pensez à configurer vos vraies valeurs MongoDB et Cloudinary"
    else
        echo "❌ .env.local requis pour continuer"
        exit 1
    fi
fi

# Choix de la base de données
echo ""
echo "🗄️  Configuration de la base de données:"
echo "1. MongoDB avec Docker (recommandé pour développement)"
echo "2. MongoDB Atlas (recommandé pour production)"
echo "3. MongoDB local existant"
echo "4. Démonstration sans base de données"

read -p "Votre choix (1-4): " -n 1 -r choice
echo ""

case $choice in
    1)
        echo "🐳 Configuration MongoDB avec Docker..."
        
        # Vérifier Docker
        if ! command_exists docker; then
            echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
            exit 1
        fi
        
        # Arrêter le container existant s'il existe
        if docker ps -a | grep -q ecomus-mongodb; then
            echo "🛑 Arrêt du container MongoDB existant..."
            docker stop ecomus-mongodb 2>/dev/null || true
            docker rm ecomus-mongodb 2>/dev/null || true
        fi
        
        # Démarrer MongoDB
        echo "🚀 Démarrage de MongoDB..."
        npm run mongodb:start
        
        # Attendre que MongoDB soit prêt
        echo "⏳ Attente du démarrage de MongoDB..."
        sleep 15
        
        # Mettre à jour .env.local
        if grep -q "MONGODB_URI=mongodb://localhost:27017" .env.local; then
            sed -i 's|MONGODB_URI=mongodb://localhost:27017.*|MONGODB_URI=mongodb://admin:password@localhost:27017/ecomus_saas_dev?authSource=admin|' .env.local
        else
            echo "MONGODB_URI=mongodb://admin:password@localhost:27017/ecomus_saas_dev?authSource=admin" >> .env.local
        fi
        
        echo "✅ MongoDB configuré avec Docker"
        RUN_SEED=true
        ;;
        
    2)
        echo "☁️  Configuration MongoDB Atlas..."
        echo "Veuillez configurer manuellement MONGODB_URI dans .env.local"
        echo "Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
        
        if confirm "Avez-vous configuré MONGODB_URI dans .env.local?"; then
            RUN_SEED=true
        else
            echo "⚠️  Configurez MONGODB_URI puis relancez le script"
            exit 0
        fi
        ;;
        
    3)
        echo "🏠 Utilisation de MongoDB local..."
        echo "⚠️  Assurez-vous que MongoDB fonctionne sur localhost:27017"
        
        if confirm "MongoDB local est-il démarré?"; then
            RUN_SEED=true
        else
            echo "⚠️  Démarrez MongoDB puis relancez le script"
            exit 0
        fi
        ;;
        
    4)
        echo "🎭 Mode démonstration..."
        echo ""
        npm run seed:demo
        echo ""
        echo "🎉 Démonstration terminée!"
        echo "Pour un seed réel, relancez avec l'option 1, 2 ou 3"
        exit 0
        ;;
        
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

# Lancer le seed si configuré
if [ "$RUN_SEED" = true ]; then
    echo ""
    echo "🌱 Lancement du seed MongoDB..."
    echo "⚠️  Cela va supprimer toutes les données existantes!"
    
    if confirm "Continuer avec le seed?"; then
        npm run seed
        
        echo ""
        echo "🔍 Vérification de l'intégrité des données..."
        npm run seed:verify
        
        echo ""
        echo "🎉 Installation et seed terminés avec succès!"
        echo ""
        echo "🔑 Comptes de test créés:"
        echo "   Admin: admin@ecomus.com / admin123"
        echo "   Vendor: vendor1@ecomus.com / vendor123"
        echo "   Client: client@ecomus.com / client123"
        echo ""
        echo "🚀 Votre plateforme Ecomus SaaS est prête!"
        echo ""
        echo "📋 Prochaines étapes:"
        echo "   1. Démarrer le serveur: npm run dev"
        echo "   2. Ouvrir http://localhost:3000"
        echo "   3. Se connecter avec un compte de test"
        echo "   4. Accéder au dashboard: http://localhost:3000/dashboard"
    else
        echo "❌ Seed annulé"
        exit 0
    fi
fi

echo ""
echo "🎯 Installation terminée!"
