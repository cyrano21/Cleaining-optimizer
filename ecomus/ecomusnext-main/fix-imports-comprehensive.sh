#!/bin/bash

# Script pour remplacer tous les imports @/ par des chemins relatifs
echo "🔧 Correction de tous les imports avec alias @ vers des chemins relatifs..."

# Fonction pour calculer le chemin relatif depuis un répertoire vers un autre
get_relative_path() {
    local from_dir="$1"
    local to_path="$2"
    
    # Compter le nombre de niveaux de profondeur depuis la racine
    local depth=$(echo "$from_dir" | tr '/' '\n' | wc -l)
    
    # Construire le préfixe "../" selon la profondeur
    local prefix=""
    for ((i=1; i<depth; i++)); do
        prefix="../$prefix"
    done
    
    echo "$prefix$to_path"
}

# Trouver tous les fichiers JS/JSX/TS/TSX qui contiennent @/
find /workspaces/ecomusnext -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read file; do
    # Ignorer les fichiers dans node_modules, .next, etc.
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]] || [[ "$file" == *"phoenix"* ]]; then
        continue
    fi
    
    # Vérifier si le fichier contient @/
    if grep -q "@/" "$file"; then
        echo "📁 Traitement de: $file"
        
        # Calculer le répertoire du fichier relatif à la racine du projet
        file_dir=$(dirname "$file" | sed 's|/workspaces/ecomusnext/||')
        
        # Remplacer les différents types d'imports
        sed -i 's|@/components/|'$(get_relative_path "$file_dir" "components/")'|g' "$file"
        sed -i 's|@/context/|'$(get_relative_path "$file_dir" "context/")'|g' "$file"
        sed -i 's|@/data/|'$(get_relative_path "$file_dir" "data/")'|g' "$file"
        sed -i 's|@/utlis/|'$(get_relative_path "$file_dir" "utlis/")'|g' "$file"
        sed -i 's|@/utils/|'$(get_relative_path "$file_dir" "utils/")'|g' "$file"
        sed -i 's|@/lib/|'$(get_relative_path "$file_dir" "lib/")'|g' "$file"
        sed -i 's|@/styles/|'$(get_relative_path "$file_dir" "styles/")'|g' "$file"
        sed -i 's|@/public/|'$(get_relative_path "$file_dir" "public/")'|g' "$file"
        
        echo "✅ Modifié: $file"
    fi
done

echo "🎉 Correction terminée !"
