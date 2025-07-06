#!/bin/bash

echo "🔧 Correction globale des imports du dashboard..."

# Compter les fichiers avant correction
BEFORE=$(grep -r "from \"../.*components/" app/dashboard/src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | wc -l)
echo "📊 Imports relatifs trouvés: $BEFORE"

# Corrections des imports components
find app/dashboard/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    # Remplacer tous les niveaux de remontée pour components
    sed -i 's|from "\.\./\.\./\.\./\.\./\.\./components/|from "@/components/|g' "$file"
    sed -i 's|from "\.\./\.\./\.\./\.\./components/|from "@/components/|g' "$file"
    sed -i 's|from "\.\./\.\./\.\./components/|from "@/components/|g' "$file"
    sed -i 's|from "\.\./\.\./components/|from "@/components/|g' "$file"
    sed -i 's|from "\.\./components/|from "@/components/|g' "$file"
    
    # Remplacer les imports lib
    sed -i 's|from "\.\./\.\./\.\./\.\./\.\./lib/|from "@/lib/|g' "$file"
    sed -i 's|from "\.\./\.\./\.\./\.\./lib/|from "@/lib/|g' "$file"
    sed -i 's|from "\.\./\.\./\.\./lib/|from "@/lib/|g' "$file"
    sed -i 's|from "\.\./\.\./lib/|from "@/lib/|g' "$file"
    sed -i 's|from "\.\./lib/|from "@/lib/|g' "$file"
    
    # Corriger les imports avec guillemets simples aussi
    sed -i "s|from '\.\./\.\./\.\./\.\./\.\./components/|from '@/components/|g" "$file"
    sed -i "s|from '\.\./\.\./\.\./\.\./components/|from '@/components/|g" "$file"
    sed -i "s|from '\.\./\.\./\.\./components/|from '@/components/|g" "$file"
    sed -i "s|from '\.\./\.\./components/|from '@/components/|g" "$file"
    sed -i "s|from '\.\./components/|from '@/components/|g" "$file"
done

# Vérifier le résultat
AFTER=$(grep -r "from \"../.*components/" app/dashboard/src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | wc -l 2>/dev/null || echo "0")
echo "✅ Imports relatifs restants: $AFTER"
echo "🎉 Correction terminée!"
