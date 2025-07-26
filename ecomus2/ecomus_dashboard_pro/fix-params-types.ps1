# Script pour corriger les types de params dans les API Next.js

$apiFiles = Get-ChildItem -Path "src/app/api" -Recurse -Filter "*.ts" | Where-Object { (Get-Content $_.FullName -Raw) -match "params: Promise<" }

foreach ($file in $apiFiles) {
    Write-Host "Correction de $($file.Name)..."
    
    $content = Get-Content $file.FullName -Raw
    
    # Remplacer params: Promise<{ id: string }> par params: { id: string }
    $content = $content -replace 'params: Promise<\{ id: string \}>', 'params: { id: string }'
    
    # Remplacer params: Promise<{ slug: string }> par params: { slug: string }
    $content = $content -replace 'params: Promise<\{ slug: string \}>', 'params: { slug: string }'
    
    # Remplacer await params par params
    $content = $content -replace 'const \{ (id|slug) \} = await params;', 'const { $1 } = params;'
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    
    Write-Host "✅ Corrigé: $($file.Name)"
}

Write-Host "🎉 Correction terminée pour $($apiFiles.Count) fichiers"
