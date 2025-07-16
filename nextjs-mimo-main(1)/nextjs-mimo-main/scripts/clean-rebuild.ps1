# Chemin du script: G:\nextjs-mimo-clean\scripts\clean-rebuild.ps1

Write-Host "🧹 Nettoyage du cache Next.js et des fichiers de build..." -ForegroundColor Cyan

# Supprimer les dossiers de cache et build
if (Test-Path ".next") { 
    Remove-Item -Recurse -Force ".next" 
    Write-Host "✓ Dossier .next supprimé" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") { 
    Remove-Item -Recurse -Force "node_modules/.cache" 
    Write-Host "✓ Cache de node_modules supprimé" -ForegroundColor Green
}

# Supprimer les fichiers lock si nécessaire (décommenter si besoin)
# if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" }
# if (Test-Path "yarn.lock") { Remove-Item "yarn.lock" }

Write-Host "📦 Réinstallation des dépendances..." -ForegroundColor Cyan
npm install

Write-Host "🔨 Construction de l'application..." -ForegroundColor Cyan
# Ajout du drapeau force-dynamic pour s'assurer que toutes les pages sont traitées correctement
$env:NEXT_FORCE_DYNAMIC = "true" 
npm run build

Write-Host "✅ Nettoyage et reconstruction terminés !" -ForegroundColor Green
