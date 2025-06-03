# Script PowerShell pour corriger tous les composants ProductCard
Write-Host "🚀 Début de la correction de tous les composants ProductCard..." -ForegroundColor Green

# Obtenir tous les fichiers ProductCard
$productCardFiles = Get-ChildItem -Path "components/shopCards/Product*.jsx"

$fixed = 0
$skipped = 0

foreach ($file in $productCardFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name
    
    try {
        # Lire le contenu du fichier
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Vérifier si le fichier a déjà été modifié
        if ($content -match "// Vérification de sécurité pour éviter les href undefined") {
            Write-Host "✅ Déjà corrigé: $fileName" -ForegroundColor Yellow
            $skipped++
            continue
        }
        
        # Trouver la déclaration de fonction
        $functionMatch = [regex]::Match($content, 'export default function (\w+)\s*\(\s*{\s*product[^}]*}\s*\)')
        if (-not $functionMatch.Success) {
            Write-Host "❌ Impossible de trouver la déclaration de fonction dans: $fileName" -ForegroundColor Red
            continue
        }
        
        $functionName = $functionMatch.Groups[1].Value
        $originalDeclaration = $functionMatch.Groups[0].Value
        
        # Nouvelle déclaration avec vérification de sécurité
        $newDeclaration = @"
export default function $functionName({ product }) {
  // Vérification de sécurité pour éviter les href undefined
  if (!product || !product.id) {
    return null;
  }
"@
        
        # Remplacer la déclaration de fonction
        $content = $content -replace [regex]::Escape($originalDeclaration), $newDeclaration
        
        # Ajouter les imports useState et useEffect si nécessaire
        if ($content -notmatch "import.*useState.*useEffect") {
            if ($content -match "import.*useState") {
                $content = $content -replace "useState", "useState, useEffect"
            } elseif ($content -match "import.*useEffect") {
                $content = $content -replace "useEffect", "useState, useEffect"
            } elseif ($content -match 'from "react"') {
                $content = $content -replace 'from "react"', ', useState, useEffect } from "react"'
                $content = $content -replace 'import React,', 'import React, {'
            } else {
                # Ajouter l'import au début
                $content = "import { useState, useEffect } from 'react';`n" + $content
            }
        }
        
        # Corriger les déclarations useState pour l'image
        if ($content -match "useState\(product\.imgSrc\)" -and $content -notmatch "useState\(product\.imgSrc \|\| '''\)") {
            $content = $content -replace "useState\(product\.imgSrc\)", "useState(product.imgSrc || '')"
        }
        
        # Ajouter useEffect si nécessaire
        if ($content -match "const \[currentImage, setCurrentImage\] = useState" -and $content -notmatch "useEffect\(\(\) => \{") {
            $useStatePattern = "const \[currentImage, setCurrentImage\] = useState\([^)]+\);"
            $replacement = @"
`$&

  useEffect(() => {
    if (product && product.imgSrc) {
      setCurrentImage(product.imgSrc);
    }
  }, [product]);
"@
            $content = $content -replace $useStatePattern, $replacement
        }
        
        # Écrire le fichier modifié
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "✅ Corrigé: $fileName" -ForegroundColor Green
        $fixed++
        
    } catch {
        Write-Host "❌ Erreur lors de la correction de $fileName : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✨ Correction terminée!" -ForegroundColor Green
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "   - Fichiers corrigés: $fixed" -ForegroundColor Green
Write-Host "   - Fichiers ignorés (déjà corrigés): $skipped" -ForegroundColor Yellow
Write-Host "   - Total traité: $($fixed + $skipped)" -ForegroundColor Cyan
