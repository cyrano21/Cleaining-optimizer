#!/bin/bash
# Script pour démarrer MongoDB avec Docker pour le développement

echo "🚀 Démarrage de MongoDB avec Docker..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker pour continuer."
    exit 1
fi

# Démarrer MongoDB container
docker run -d \
  --name ecomus-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=ecomus_saas_dev \
  -v ecomus_mongodb_data:/data/db \
  mongo:7

# Attendre que MongoDB soit prêt
echo "⏳ Attente du démarrage de MongoDB..."
sleep 10

# Vérifier si le container fonctionne
if docker ps | grep -q ecomus-mongodb; then
    echo "✅ MongoDB est maintenant disponible sur mongodb://localhost:27017"
    echo "📝 Utilisateur: admin"
    echo "🔑 Mot de passe: password"
    echo ""
    echo "🔗 URI de connexion pour l'application:"
    echo "mongodb://admin:password@localhost:27017/ecomus_saas_dev?authSource=admin"
    echo ""
    echo "🛑 Pour arrêter MongoDB:"
    echo "docker stop ecomus-mongodb"
    echo ""
    echo "🗑️ Pour supprimer le container:"
    echo "docker rm ecomus-mongodb"
else
    echo "❌ Erreur lors du démarrage de MongoDB"
    exit 1
fi
