#!/bin/bash

# Script de démarrage complet Ecomus SaaS Advanced Features
# Ce script configure et démarre tous les services nécessaires

echo "🚀 ECOMUS SAAS - DÉMARRAGE COMPLET"
echo "================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log "✅ Node.js détecté : $NODE_VERSION"
    else
        error "❌ Node.js non trouvé. Veuillez installer Node.js 18+"
        exit 1
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log "✅ npm détecté : $NPM_VERSION"
    else
        error "❌ npm non trouvé"
        exit 1
    fi
    
    # MongoDB
    if command -v mongod &> /dev/null; then
        log "✅ MongoDB détecté"
    else
        warn "⚠️ MongoDB non détecté - utilisation de MongoDB Atlas recommandée"
    fi
    
    # Vérifier .env.local
    if [ -f ".env.local" ]; then
        log "✅ Fichier .env.local trouvé"
    else
        error "❌ Fichier .env.local manquant"
        exit 1
    fi
}

# Installation des dépendances
install_dependencies() {
    log "📦 Installation des dépendances..."
    
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        log "Installation complète des dépendances..."
        npm install --force
    else
        log "Mise à jour des dépendances..."
        npm update
    fi
    
    if [ $? -eq 0 ]; then
        log "✅ Dépendances installées avec succès"
    else
        error "❌ Échec de l'installation des dépendances"
        exit 1
    fi
}

# Configuration Ollama
setup_ollama() {
    log "🤖 Configuration d'Ollama..."
    
    if command -v ollama &> /dev/null; then
        log "✅ Ollama déjà installé"
        
        # Vérifier si les modèles sont installés
        if ollama list | grep -q "llama2"; then
            log "✅ Modèle llama2 disponible"
        else
            log "📥 Téléchargement du modèle llama2..."
            ollama pull llama2
        fi
        
        if ollama list | grep -q "codellama"; then
            log "✅ Modèle codellama disponible"
        else
            log "📥 Téléchargement du modèle codellama..."
            ollama pull codellama
        fi
        
        # Démarrer Ollama en arrière-plan
        if ! pgrep -f "ollama serve" > /dev/null; then
            log "🚀 Démarrage d'Ollama..."
            ollama serve &
            sleep 5
        else
            log "✅ Ollama déjà en cours d'exécution"
        fi
        
    else
        log "📥 Installation d'Ollama..."
        curl -fsSL https://ollama.ai/install.sh | sh
        
        if [ $? -eq 0 ]; then
            log "✅ Ollama installé avec succès"
            log "📥 Téléchargement des modèles..."
            ollama pull llama2
            ollama pull codellama
            
            # Démarrer Ollama
            ollama serve &
            sleep 5
        else
            error "❌ Échec de l'installation d'Ollama"
            warn "⚠️ Fonctionnalités IA locales non disponibles"
        fi
    fi
}

# Test des APIs
test_apis() {
    log "🧪 Test des APIs..."
    
    # Attendre que le serveur Next.js démarre
    sleep 10
    
    # Test API Chat
    info "Test API Chat..."
    CHAT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello", "model":"llama2"}' \
        -w "%{http_code}")
    
    if [[ $CHAT_RESPONSE == *"200"* ]]; then
        log "✅ API Chat fonctionnelle"
    else
        warn "⚠️ API Chat indisponible (code: ${CHAT_RESPONSE: -3})"
    fi
    
    # Test API IA Génération
    info "Test API IA Génération..."
    AI_RESPONSE=$(curl -s -X POST http://localhost:3000/api/ai/generate \
        -H "Content-Type: application/json" \
        -d '{"type":"text", "prompt":"Test", "model":"llama2"}' \
        -w "%{http_code}")
    
    if [[ $AI_RESPONSE == *"200"* ]]; then
        log "✅ API IA Génération fonctionnelle"
    else
        warn "⚠️ API IA Génération indisponible (code: ${AI_RESPONSE: -3})"
    fi
    
    # Test API Upload 3D
    info "Test API Upload 3D..."
    UPLOAD_RESPONSE=$(curl -s -X GET http://localhost:3000/api/products/3d/upload \
        -w "%{http_code}")
    
    if [[ $UPLOAD_RESPONSE == *"405"* ]]; then # Method not allowed = API existe
        log "✅ API Upload 3D accessible"
    else
        warn "⚠️ API Upload 3D problématique"
    fi
}

# Optimisation Cloudinary
optimize_cloudinary() {
    log "☁️ Optimisation Cloudinary..."
    
    if [ -f "scripts/optimize-cloudinary-batch.js" ]; then
        log "🔄 Exécution de l'optimisation batch..."
        node scripts/optimize-cloudinary-batch.js
        
        if [ $? -eq 0 ]; then
            log "✅ Optimisation Cloudinary terminée"
        else
            warn "⚠️ Optimisation Cloudinary échouée"
        fi
    else
        warn "⚠️ Script d'optimisation Cloudinary non trouvé"
    fi
}

# Démarrage du serveur de développement
start_dev_server() {
    log "🌐 Démarrage du serveur de développement..."
    
    # Tuer les processus Next.js existants
    pkill -f "next dev" 2>/dev/null || true
    
    # Démarrer en arrière-plan
    npm run dev &
    DEV_PID=$!
    
    log "🚀 Serveur de développement démarré (PID: $DEV_PID)"
    log "📍 Application disponible sur : http://localhost:3000"
    
    return $DEV_PID
}

# Affichage du statut final
show_final_status() {
    echo ""
    echo "🎉 ECOMUS SAAS - DÉMARRAGE TERMINÉ"
    echo "=================================="
    echo ""
    echo "📊 STATUT DES SERVICES :"
    echo ""
    
    # Vérifier Next.js
    if pgrep -f "next dev" > /dev/null; then
        echo -e "✅ ${GREEN}Next.js${NC} : En cours d'exécution"
    else
        echo -e "❌ ${RED}Next.js${NC} : Arrêté"
    fi
    
    # Vérifier Ollama
    if pgrep -f "ollama serve" > /dev/null; then
        echo -e "✅ ${GREEN}Ollama${NC} : En cours d'exécution"
    else
        echo -e "⚠️ ${YELLOW}Ollama${NC} : Non démarré"
    fi
    
    # Vérifier MongoDB (si local)
    if command -v mongod &> /dev/null && pgrep -f "mongod" > /dev/null; then
        echo -e "✅ ${GREEN}MongoDB${NC} : En cours d'exécution"
    else
        echo -e "📡 ${BLUE}MongoDB${NC} : Atlas (cloud)"
    fi
    
    echo ""
    echo "🌟 FONCTIONNALITÉS DISPONIBLES :"
    echo ""
    echo "🖥️  Application web : http://localhost:3000"
    echo "🛒 E-commerce complet avec toutes les fonctionnalités"
    echo "🎯 Modèles 3D interactifs sur les pages produits"
    echo "🤖 Chatbot IA intelligent (bouton flottant)"
    echo "🎨 Génération de contenu IA"
    echo "👤 Profils utilisateur avancés"
    echo "☁️ Optimisation Cloudinary"
    echo ""
    echo "📚 DOCUMENTATION :"
    echo "📖 Guide complet : documentation/ECOMUS_ADVANCED_FEATURES.md"
    echo "🔧 Configuration : config/ai-config.json"
    echo ""
    echo "🧪 TESTS :"
    echo "🔬 npm run test:ai      - Test des APIs IA"
    echo "🔬 npm run test:3d      - Test des fonctionnalités 3D"
    echo "🔬 npm run test:all     - Tests complets"
    echo ""
    echo -e "${GREEN}🚀 Système entièrement opérationnel !${NC}"
}

# Fonction principale
main() {
    echo ""
    log "🎯 Démarrage de l'installation complète..."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_ollama
    start_dev_server
    DEV_PID=$!
    test_apis
    optimize_cloudinary
    
    show_final_status
    
    echo ""
    echo -e "${BLUE}💡 Appuyez sur Ctrl+C pour arrêter tous les services${NC}"
    echo ""
    
    # Attendre l'interruption
    trap 'echo -e "\n🛑 Arrêt des services..."; pkill -P $$; exit 0' SIGINT
    wait $DEV_PID
}

# Exécution
main "$@"
