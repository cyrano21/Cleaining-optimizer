@echo off
echo 🚀 Force le déploiement du projet sur Vercel...

:: Vérifier si Vercel CLI est installé
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI n'est pas installé. Installation en cours...
    npm install -g vercel
)

:: Forcer le déploiement en production
echo ☁️ Déploiement forcé sur Vercel...
vercel --prod -f

echo ✅ Commande de déploiement envoyée! Vérifiez le statut dans le dashboard Vercel.
