# Script de nettoyage de l'ancien dashboard utilisateur
# Supprime l'ancien dossier (dashboard) et finalise la migration

Write-Host "🔧 Nettoyage de l'ancien dashboard utilisateur..." -ForegroundColor Cyan

# Naviguer vers le dossier ecomusnext
Set-Location "g:\ecomus\ecomusnext-main"

# Vérifier si l'ancien dossier existe
$oldDashboardPath = "app\(dashboard)"
if (Test-Path $oldDashboardPath) {
    Write-Host "📁 Suppression du dossier $oldDashboardPath..." -ForegroundColor Yellow
    
    # Supprimer le dossier et tout son contenu
    Remove-Item -Path $oldDashboardPath -Recurse -Force
    
    if (Test-Path $oldDashboardPath) {
        Write-Host "❌ Erreur: Le dossier n'a pas pu être supprimé" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Ancien dossier dashboard supprimé avec succès" -ForegroundColor Green
    }
} else {
    Write-Host "✅ L'ancien dossier dashboard n'existe plus" -ForegroundColor Green
}

# Nettoyer le cache Next.js
Write-Host "🗑️ Nettoyage du cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ Cache Next.js nettoyé" -ForegroundColor Green
}

# Nettoyer node_modules si demandé
$cleanModules = Read-Host "Voulez-vous nettoyer node_modules aussi ? (y/n)"
if ($cleanModules -eq "y" -or $cleanModules -eq "Y") {
    Write-Host "🗑️ Nettoyage des node_modules..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force
        Write-Host "✅ node_modules nettoyé - N'oubliez pas de faire 'npm install'" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Migration du dashboard utilisateur terminée !" -ForegroundColor Green
Write-Host "📋 Résumé de la migration:" -ForegroundColor Cyan
Write-Host "   ✅ Nouveau dashboard unifié dans /dashboard" -ForegroundColor White
Write-Host "   ✅ Pages créées: orders, wishlist, addresses, settings" -ForegroundColor White
Write-Host "   ✅ Redirections configurées dans next.config.mjs" -ForegroundColor White
Write-Host "   ✅ Types TypeScript ajoutés" -ForegroundColor White
Write-Host "   ✅ Ancien dossier (dashboard) supprimé" -ForegroundColor White

Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Démarrer les serveurs avec start-migrated.sh" -ForegroundColor White
Write-Host "   2. Tester les nouvelles pages dashboard" -ForegroundColor White
Write-Host "   3. Vérifier les redirections depuis les anciennes URLs" -ForegroundColor White
Write-Host "   4. Créer les APIs backend nécessaires" -ForegroundColor White

Write-Host "`n📝 URLs du nouveau dashboard:" -ForegroundColor Cyan
Write-Host "   - http://localhost:3000/dashboard (Accueil)" -ForegroundColor White
Write-Host "   - http://localhost:3000/dashboard/orders (Commandes)" -ForegroundColor White
Write-Host "   - http://localhost:3000/dashboard/wishlist (Favoris)" -ForegroundColor White
Write-Host "   - http://localhost:3000/dashboard/addresses (Adresses)" -ForegroundColor White
Write-Host "   - http://localhost:3000/dashboard/settings (Paramètres)" -ForegroundColor White
