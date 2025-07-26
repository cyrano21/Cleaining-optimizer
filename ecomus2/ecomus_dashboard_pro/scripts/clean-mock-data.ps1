# Script de nettoyage des données mockées
# Supprime tous les data-oid aléatoires et mots non reconnus

Write-Host "🧹 Nettoyage des données mockées et attributs aléatoires..." -ForegroundColor Green

# Fonction pour nettoyer les data-oid d'un fichier
function Remove-DataOid {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "Nettoyage: $FilePath" -ForegroundColor Yellow
        (Get-Content $FilePath) -replace '\s*data-oid="[^"]*"', '' | Set-Content $FilePath
    }
}

# Fonction pour remplacer les termes en anglais par du français
function Convert-ToFrench {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "Francisation: $FilePath" -ForegroundColor Cyan
        $content = Get-Content $FilePath -Raw
        
        # Remplacements de base EN -> FR
        $replacements = @{
            'Product Detail' = 'Détail produit'
            'Product Details' = 'Détails du produit'
            'Add to Cart' = 'Ajouter au panier'
            'In Stock' = 'En stock'
            'Out of Stock' = 'Rupture de stock'
            'Only \d+ left' = 'Plus que $1 en stock'
            'reviews' = 'avis'
            'Brand:' = 'Marque:'
            'Quantity' = 'Quantité'
            'Color' = 'Couleur'
            'Specifications' = 'Spécifications techniques'
            'View All Products' = 'Voir tous les produits'
            'Enhanced Product View' = 'Vue produit avancée'
            'Front View' = 'Vue de face'
            'Side View' = 'Vue de côté'
            'Top View' = 'Vue du dessus'
            'Click and drag to rotate' = 'Cliquez et faites glisser pour faire tourner'
            'Drag to rotate' = 'Glissez pour faire tourner'
            '360° View' = 'Vue 360°'
            '3D Model' = 'Modèle 3D'
        }
        
        foreach ($key in $replacements.Keys) {
            $content = $content -replace $key, $replacements[$key]
        }
        
        Set-Content $FilePath $content
    }
}

# Nettoyage des fichiers de produits
$productFiles = @(
    "src\app\e-commerce\products\page.tsx",
    "src\app\products\page.tsx",
    "src\components\ui\product-card.tsx"
)

foreach ($file in $productFiles) {
    if (Test-Path $file) {
        Remove-DataOid $file
        Convert-ToFrench $file
    }
}

# Recherche et nettoyage de tous les fichiers TypeScript/TSX
Write-Host "🔍 Recherche de tous les fichiers TSX pour nettoyage..." -ForegroundColor Blue

Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw    if ($content -match 'data-oid="[^"]*"') {
        Write-Host "Nettoyage data-oid: $($_.FullName)" -ForegroundColor Gray
        Remove-DataOid $_.FullName
    }
}

Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "📝 Tous les attributs data-oid aléatoires ont été supprimés" -ForegroundColor Green
Write-Host "🇫🇷 Francisation des termes de base effectuée" -ForegroundColor Green
