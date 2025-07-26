# Script PowerShell pour démarrer Ecomus Multi-Store
Write-Host ""
Write-Host "🚀 DÉMARRAGE AUTOMATIQUE ECOMUS MULTI-STORE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier MongoDB
$mongoPath = Get-Command mongod -ErrorAction SilentlyContinue
if (-not $mongoPath) {
    Write-Host "❌ MongoDB non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez MongoDB ou ajoutez-le au PATH" -ForegroundColor Yellow
    Write-Host "📖 Guide: https://docs.mongodb.com/manual/installation/" -ForegroundColor Cyan
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "✅ MongoDB trouvé" -ForegroundColor Green

# Vérifier Node.js et Yarn
$nodeVersion = node --version 2>$null
$yarnVersion = yarn --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
    exit 1
}

if (-not $yarnVersion) {
    Write-Host "❌ Yarn non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
Write-Host "✅ Yarn $yarnVersion" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️  Démarrage de MongoDB..." -ForegroundColor Yellow

# Créer le répertoire data s'il n'existe pas
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}

# Démarrer MongoDB en arrière-plan
$mongoProcess = Start-Process -FilePath "mongod" -ArgumentList "--dbpath=data", "--logpath=mongodb.log" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 3
Write-Host "✅ MongoDB démarré (PID: $($mongoProcess.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "👥 Initialisation des rôles système..." -ForegroundColor Yellow

try {
    & yarn run init:roles
    Write-Host "✅ Rôles initialisés" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'initialisation des rôles" -ForegroundColor Yellow
    Write-Host "💡 Les rôles existent peut-être déjà" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🌐 Démarrage de l'application..." -ForegroundColor Yellow
Write-Host "📍 L'application sera accessible sur: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔐 Connexion admin: admin@ecomus.com / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Démarrage en cours..." -ForegroundColor Yellow

# Fonction de nettoyage
function Cleanup {
    Write-Host ""
    Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
    
    if ($mongoProcess -and -not $mongoProcess.HasExited) {
        Write-Host "🛑 Arrêt de MongoDB..." -ForegroundColor Yellow
        Stop-Process -Id $mongoProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "✅ MongoDB arrêté" -ForegroundColor Green
    }
    
    Write-Host "👋 Application fermée" -ForegroundColor Green
}

# Gérer l'arrêt propre
Register-EngineEvent PowerShell.Exiting -Action {
    Cleanup
}

try {
    # Démarrer l'application Next.js
    & yarn dev
} catch {
    Write-Host "❌ Erreur lors du démarrage de l'application" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    Cleanup
    Read-Host "Appuyez sur Entrée pour fermer"
}
