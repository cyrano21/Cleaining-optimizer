#!/bin/bash

# Script pour remplacer tous les imports @/ par des chemins relatifs appropriés

echo "Correction des imports @/context/Context dans les fichiers..."

# Pour les fichiers dans components/common/
find /workspaces/ecomusnext/components/common/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/context/Context|../../context/Context|g'

# Pour les fichiers dans components/modals/
find /workspaces/ecomusnext/components/modals/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/context/Context|../../context/Context|g'

# Pour les fichiers dans components/shopDetails/
find /workspaces/ecomusnext/components/shopDetails/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/context/Context|../../context/Context|g'

# Pour les fichiers dans components/shop/
find /workspaces/ecomusnext/components/shop/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/context/Context|../../context/Context|g'

# Pour les fichiers dans components/shopCards/
find /workspaces/ecomusnext/components/shopCards/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/context/Context|../../context/Context|g'

# Pour les autres imports @/ communs
find /workspaces/ecomusnext/components/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/data/|../../data/|g'
find /workspaces/ecomusnext/components/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/utlis/|../../utlis/|g'
find /workspaces/ecomusnext/components/ -name "*.jsx" -o -name "*.js" | xargs sed -i 's|@/utils/|../../utils/|g'

echo "Correction terminée!"
