#!/usr/bin/env pwsh

# Script PowerShell pour corriger tous les imports connectToDatabase vers connectDB

Write-Host "🔧 Correction des imports connectToDatabase vers connectDB..." -ForegroundColor Green

# Fichiers à corriger
$files = @(
    "src\app\vendor\[slug]\page.tsx",
    "src\app\category\[slug]\page.tsx", 
    "src\app\blog\page.tsx",
    "src\app\blog\[slug]\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Correction de $file" -ForegroundColor Yellow
        
        # Lire le contenu
        $content = Get-Content $file -Raw
        
        # Remplacer les imports
        $content = $content -replace "import \{ connectToDatabase \} from '@/lib/mongodb';", "import { connectDB } from '@/lib/mongodb';"
        
        # Remplacer les appels de fonction
        $content = $content -replace "await connectToDatabase\(\);", "await connectDB();"
        
        # Sauvegarder
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✅ $file corrigé" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 Tous les imports ont été corrigés!" -ForegroundColor Green
