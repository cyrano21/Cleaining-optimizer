@echo off
echo.
echo 🚀 DÉMARRAGE AUTOMATIQUE ECOMUS MULTI-STORE
echo ============================================
echo.

echo 📋 Vérification des prérequis...
where mongod >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB non trouvé dans le PATH
    echo 💡 Installez MongoDB ou ajoutez-le au PATH
    echo 📖 Guide: https://docs.mongodb.com/manual/installation/
    pause
    exit /b 1
)

echo ✅ MongoDB trouvé

echo.
echo 🗄️  Démarrage de MongoDB...
start "MongoDB Server" cmd /c "mongod --dbpath=data --logpath=mongodb.log"
timeout /t 3 >nul

echo ✅ MongoDB démarré

echo.
echo 👥 Initialisation des rôles système...
call yarn run init:roles
if errorlevel 1 (
    echo ⚠️  Erreur lors de l'initialisation des rôles
    echo 💡 Les rôles existent peut-être déjà
)

echo.
echo 🌐 Démarrage de l'application...
echo 📍 L'application sera accessible sur: http://localhost:3001
echo 🔐 Connexion admin: admin@ecomus.com / admin123
echo.
echo ⏳ Démarrage en cours...

call yarn dev

echo.
echo 🛑 Application fermée
pause
