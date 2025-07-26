# Nettoyage global des data-oid dans tous les fichiers TSX
Write-Host "Début du nettoyage des data-oid..."

# Obtenir tous les fichiers .tsx dans src/
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Where-Object { !$_.PSIsContainer }

Write-Host "Traitement de $($files.Count) fichiers..."

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'data-oid=') {
        Write-Host "Nettoyage de: $($file.Name)"
        $cleanContent = $content -replace ' data-oid="[^"]*"', ''
        Set-Content $file.FullName $cleanContent -NoNewline
    }
}

Write-Host "Nettoyage terminé!"
