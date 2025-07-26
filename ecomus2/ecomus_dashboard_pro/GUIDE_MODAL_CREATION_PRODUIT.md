# Guide d'utilisation du Modal de Création de Produit

## Vue d'ensemble

Le modal de création de produit est maintenant pleinement fonctionnel et connecté à une API réelle. Il permet de créer des produits complets avec tous les types de médias et attributs supportés par la plateforme.

## Fonctionnalités Principales

### ✅ Champs de Base
- **Titre du produit** (requis)
- **Description** (requis)
- **Prix** (requis, > 0)
- **Prix de comparaison** (optionnel)
- **SKU** (requis, unique)
- **Code-barres** (optionnel)
- **Quantité en stock** (requis)
- **Seuil d'alerte stock bas** (défaut: 10)

### ✅ Catégorisation
- **Sélection de boutique** (requis)
- **Catégorie** (requis, chargée dynamiquement)
- **Tags** (optionnel, ajout dynamique)
- **Attributs personnalisés** (chargés selon la catégorie)

### ✅ Médias Avancés
- **Images** (glisser-déposer, multiple)
- **Vidéos** (YouTube, Vimeo, upload direct)
- **Modèles 3D** (GLTF, GLB, OBJ)
- **Vues 360°** (séquences d'images, rotation auto)

### ✅ Détails Produit
- **Variantes** (Couleur, Taille, Matériau)
- **Poids et dimensions**
- **Statut** (Actif, Inactif, Brouillon)
- **Produit en vedette** (oui/non)

### ✅ SEO
- **Titre SEO** (max 60 caractères)
- **Description SEO** (max 160 caractères)
- **Slug automatique** (généré depuis le titre)

## API Endpoints

### Création de Produit
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Nom du produit",
  "description": "Description détaillée",
  "price": 99.99,
  "sku": "PROD-001",
  "category": "categoryId",
  "store": "storeId",
  "images": ["/uploads/image1.jpg"],
  "attributes": {
    "couleur": "Rouge",
    "taille": "L"
  }
}
```

### Réponse Succès (201)
```json
{
  "success": true,
  "message": "Produit créé avec succès",
  "product": {
    "id": "productId",
    "title": "Nom du produit",
    "slug": "nom-du-produit",
    "price": 99.99,
    "sku": "PROD-001",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Gestion des Erreurs

#### Validation (400)
```json
{
  "error": "Erreur de validation",
  "message": "Le titre du produit est requis"
}
```

#### Duplication (409)
```json
{
  "error": "Conflit de données",
  "message": "Ce SKU existe déjà",
  "field": "sku"
}
```

## Structure des Données

### Produit Complet
```typescript
interface ProductData {
  // Informations de base
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockAlert?: number;
  
  // Catégorisation
  category: string;
  tags: string[];
  store: string;
  
  // Médias
  images: string[];
  videos?: Video[];
  media3D?: Media3D[];
  views360?: View360[];
  
  // Détails
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  // Variantes
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  
  // Attributs personnalisés
  attributes?: { [key: string]: any };
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Statut
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
}
```

### Types de Médias

#### Vidéo
```typescript
interface Video {
  url: string;
  type: 'upload' | 'youtube' | 'vimeo';
  thumbnail?: string;
  title?: string;
  description?: string;
}
```

#### Modèle 3D
```typescript
interface Media3D {
  modelUrl: string;
  type: 'gltf' | 'glb' | 'obj';
  textureUrls?: string[];
  previewImage?: string;
}
```

#### Vue 360°
```typescript
interface View360 {
  id: string;
  name: string;
  images: string[]; // Minimum 8 images
  autoRotate: boolean;
  rotationSpeed?: number;
  zoomEnabled?: boolean;
}
```

## Utilisation du Modal

### 1. Ouverture du Modal
```tsx
import ProductCreationModal from '@/components/modals/ProductCreationModal';

<ProductCreationModal
  open={isOpen}
  setOpen={setIsOpen}
  onProductCreated={(product) => {
    console.log('Produit créé:', product);
    // Actualiser la liste des produits
  }}
  storeId={currentStoreId}
  vendorId={currentVendorId}
>
  <Button>Créer un produit</Button>
</ProductCreationModal>
```

### 2. Onglets du Modal

#### Informations de Base
- Titre, description, prix
- SKU, code-barres
- Quantité, stock
- Sélection boutique et catégorie
- Tags

#### Tarification
- Prix principal
- Prix de comparaison
- Calcul automatique de la remise
- Gestion du stock

#### Médias
- Upload d'images (glisser-déposer)
- Ajout de vidéos (URL ou upload)
- Modèles 3D (GLTF, GLB, OBJ)
- Création de vues 360°

#### Détails
- Variantes (couleur, taille, matériau)
- Poids et dimensions
- Statut et mise en vedette

#### SEO
- Titre et description optimisés
- Génération automatique du slug

### 3. Validation

Le modal valide automatiquement :
- ✅ Titre non vide
- ✅ Prix > 0
- ✅ SKU unique
- ✅ Boutique sélectionnée
- ✅ Catégorie sélectionnée
- ✅ Au moins une image

### 4. Sauvegarde

Lors de la sauvegarde :
1. Validation côté client
2. Envoi à l'API `/api/products`
3. Validation côté serveur
4. Sauvegarde en base de données
5. Retour du produit créé
6. Notification de succès
7. Fermeture du modal
8. Réinitialisation du formulaire

## Permissions

### Rôles Autorisés
- **Vendeur** : Peut créer des produits pour ses boutiques
- **Admin** : Peut créer des produits pour toutes les boutiques
- **Super Admin** : Accès complet

### Restrictions
- Les utilisateurs normaux ne peuvent pas créer de produits
- Les vendeurs ne voient que leurs boutiques
- Validation de l'authentification requise

## Tests

Pour tester l'API :
```bash
node test-product-creation-real.js
```

Ce script teste :
- ✅ Création avec données complètes
- ✅ Création avec données minimales
- ✅ Validation des erreurs
- ✅ Détection de duplication SKU
- ✅ Récupération des produits

## Dépannage

### Erreurs Communes

1. **"Non autorisé"** (401)
   - Vérifier l'authentification
   - Renouveler la session

2. **"Permissions insuffisantes"** (403)
   - Vérifier le rôle utilisateur
   - Contacter un administrateur

3. **"Ce SKU existe déjà"** (409)
   - Changer le SKU
   - Vérifier l'unicité

4. **"Erreur de validation"** (400)
   - Vérifier les champs requis
   - Corriger les formats

### Logs de Débogage

Activer les logs dans la console :
```javascript
// Dans ProductCreationModal.tsx
console.log('Données envoyées:', apiData);

// Dans /api/products/route.ts
console.log('Produit reçu:', productData);
```

## Améliorations Futures

- [ ] Upload de fichiers vers un service cloud
- [ ] Prévisualisation des modèles 3D
- [ ] Éditeur de vues 360° intégré
- [ ] Validation avancée des médias
- [ ] Compression automatique des images
- [ ] Support des variantes multiples
- [ ] Import/export en masse
- [ ] Templates de produits

---

**Le modal de création de produit est maintenant prêt pour la production !** 🚀