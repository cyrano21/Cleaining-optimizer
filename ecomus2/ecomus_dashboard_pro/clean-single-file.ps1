# Script pour nettoyer un fichier spécifique des data-oid
$filePath = "src\app\products\[id]\page.tsx"

Write-Host "Nettoyage du fichier: $filePath"

# Lire le contenu du fichier
$content = Get-Content $filePath -Raw

# Supprimer tous les data-oid
$cleanContent = $content -replace ' data-oid="[^"]*"', ''

# Sauvegarder le fichier nettoyé
Set-Content $filePath $cleanContent -NoNewline

Write-Host "Nettoyage terminé!"
