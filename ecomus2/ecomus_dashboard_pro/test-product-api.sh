#!/bin/bash

echo "🚀 Test de création de produit via API..."

# Préparer les données JSON du produit
PRODUCT_DATA='{
  "title": "Produit Test Modal '$(date +%s)'",
  "description": "Ce produit a été créé via le modal de création pour tester tous les attributs disponibles.",
  "price": 99.99,
  "comparePrice": 129.99,
  "sku": "TEST-SKU-'$(date +%s)'",
  "barcode": "1234567890123",
  "category": "electronics",
  "tags": ["test", "modal", "ecommerce"],
  "weight": 0.5,
  "dimensions": {
    "length": 10.5,
    "width": 8.2,
    "height": 3.1
  },
  "quantity": 25,
  "lowStockAlert": 5,
  "images": [
    "https://via.placeholder.com/300x300/FF5733/FFFFFF?text=Test+Product+1",
    "https://via.placeholder.com/300x300/33FF57/FFFFFF?text=Test+Product+2"
  ],
  "videos": [{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "type": "youtube",
    "title": "Vidéo de démonstration"
  }],
  "seoTitle": "Produit Test SEO - Meilleur choix 2025",
  "seoDescription": "Description SEO optimisée pour ce produit de test avec mots-clés stratégiques",
  "variant": {
    "color": "Rouge",
    "size": "Medium",
    "material": "Coton Bio"
  },
  "status": "active",
  "featured": true,
  "slug": "produit-test-modal-'$(date +%s)'"
}'

echo "📦 Données du produit préparées"

# Tester la création via curl
echo "🔄 Envoi de la requête POST à l'API..."

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PRODUCT_DATA" \
  -w "HTTPSTATUS:%{http_code}" \
  http://localhost:3001/api/products/)

# Extraire le status HTTP
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo ""
echo "🎯 RÉSULTAT DU TEST :"
echo "📊 Status HTTP: $HTTP_STATUS"
echo "📝 Response Body:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo ""
    echo "✅ SUCCESS ! Produit créé avec succès !"
else
    echo ""
    echo "❌ ERREUR lors de la création (Status: $HTTP_STATUS)"
fi