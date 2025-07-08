#!/bin/bash

echo "🚀 Démarrage de l'écosystème Ecomus migré"
echo "=============================================="

# Vérifier que les dossiers existent
if [ ! -d "ecommerce-dashboard-core" ]; then
  echo "❌ Dossier ecommerce-dashboard-core non trouvé"
  exit 1
fi

if [ ! -d "ecomusnext-main" ]; then
  echo "❌ Dossier ecomusnext-main non trouvé"
  exit 1
fi

# Dashboard2 (API Backend)
echo "📊 Démarrage du Dashboard API..."
(
  cd ecommerce-dashboard-core
  echo "   📍 URL: http://localhost:3001"
  echo "   📊 Dashboard API démarré"
  npm run dev 2>&1 | sed 's/^/   [DASHBOARD] /'
) &
DASHBOARD_PID=$!

# Attendre un peu que le dashboard démarre
sleep 3

# EcomusNext (Frontend Vitrine) 
echo "🛒 Démarrage du Frontend..."
(
  cd ecomusnext-main
  echo "   📍 URL: http://localhost:3000"
  echo "   🛍️ Frontend vitrine démarré"
  npm run dev 2>&1 | sed 's/^/   [FRONTEND] /'
) &
FRONTEND_PID=$!

echo ""
echo "✅ Les deux serveurs démarrent..."
echo "🔗 Dashboard: http://localhost:3001"
echo "🛍️ Frontend: http://localhost:3000"
echo ""
echo "📋 Architecture après migration:"
echo "   ecomusnext ────API────► dashboard2 ────► MongoDB"
echo "   (frontend)              (backend)        (database)"
echo ""
echo "🛑 CTRL+C pour arrêter tous les serveurs"

# Fonction pour nettoyer en cas d'arrêt
cleanup() {
  echo ""
  echo "🛑 Arrêt des serveurs..."
  kill $DASHBOARD_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}

# Capturer CTRL+C
trap cleanup SIGINT

# Attendre que les processus se terminent
wait
