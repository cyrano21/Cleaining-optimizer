# Script PowerShell pour nettoyer et reconstruire l'application

Write-Host "🧹 Nettoyage du cache et préparation du build..." -ForegroundColor Cyan

# Supprimer le cache et le dossier .next
if (Test-Path ".next") {
    Write-Host "Suppression du dossier .next..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

if (Test-Path "node_modules/.cache") {
    Write-Host "Suppression du cache Node.js..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules/.cache"
}

# Lancer un nouveau build
Write-Host "🔨 Démarrage du build..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Échec du build. Vérifiez les erreurs ci-dessus." -ForegroundColor Red
}
