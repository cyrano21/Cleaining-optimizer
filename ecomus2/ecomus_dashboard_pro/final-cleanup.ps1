# Nettoyage final et complet de tous les data-oid
Write-Host "🧹 Début du nettoyage final des data-oid..."

# Fonction pour nettoyer un fichier
function Clean-File {
    param($filePath)
    
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'data-oid=') {
        Write-Host "  Nettoyage: $($filePath | Split-Path -Leaf)"
        $cleanContent = $content -replace '\s*data-oid="[^"]*"', ''
        Set-Content $filePath $cleanContent -NoNewline
        return $true
    }
    return $false
}

# Obtenir tous les fichiers TSX et JSX
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.jsx" | Where-Object { !$_.PSIsContainer }

$cleanedCount = 0
foreach ($file in $files) {
    if (Clean-File $file.FullName) {
        $cleanedCount++
    }
}

Write-Host "✅ Nettoyage terminé! $cleanedCount fichiers nettoyés sur $($files.Count) fichiers traités."

# Vérification finale
$remainingFiles = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'data-oid=') {
        $remainingFiles += $file.Name
    }
}

if ($remainingFiles.Count -eq 0) {
    Write-Host "🎉 SUCCÈS: Aucun data-oid restant!"
} else {
    Write-Host "⚠️  Il reste des data-oid dans $($remainingFiles.Count) fichiers:"
    $remainingFiles | ForEach-Object { Write-Host "  - $_" }
}
