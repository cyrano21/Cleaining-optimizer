const { connectToDatabase } = require('../lib/mongodb');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// Fonction pour générer automatiquement les métadonnées SEO manquantes
async function generateMissingMetadata() {
  console.log('🚀 Génération automatique des métadonnées SEO...\n');
  
  try {
    await connectToDatabase();
    let updated = 0;

    // === OPTIMISATION DES PRODUITS ===
    console.log('📦 Optimisation des produits...');
    const products = await Product.find({
      $or: [
        { seoTitle: { $exists: false } },
        { seoTitle: '' },
        { seoDescription: { $exists: false } },
        { seoDescription: '' }
      ]
    });

    for (const product of products) {
      const updates = {};

      // Générer le titre SEO si manquant
      if (!product.seoTitle) {
        updates.seoTitle = generateProductSEOTitle(product);
      }

      // Générer la description SEO si manquante
      if (!product.seoDescription) {
        updates.seoDescription = generateProductSEODescription(product);
      }

      // Générer les mots-clés si manquants
      if (!product.seoKeywords || product.seoKeywords.length === 0) {
        updates.seoKeywords = generateProductKeywords(product);
      }

      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, updates);
        console.log(`   ✅ ${product.name}`);
        updated++;
      }
    }

    // === OPTIMISATION DES VENDEURS ===
    console.log('\n🏪 Optimisation des vendeurs...');
    const vendors = await User.find({
      role: 'vendor',
      $or: [
        { 'vendor.seoTitle': { $exists: false } },
        { 'vendor.seoTitle': '' },
        { 'vendor.seoDescription': { $exists: false } },
        { 'vendor.seoDescription': '' }
      ]
    });

    for (const vendor of vendors) {
      const updates = {};
      const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;

      // Générer le titre SEO si manquant
      if (!vendor.vendor?.seoTitle) {
        updates['vendor.seoTitle'] = generateVendorSEOTitle(businessName, vendor.vendor?.businessType);
      }

      // Générer la description SEO si manquante
      if (!vendor.vendor?.seoDescription) {
        updates['vendor.seoDescription'] = generateVendorSEODescription(businessName, vendor.vendor?.description);
      }

      // Générer les mots-clés si manquants
      if (!vendor.vendor?.seoKeywords || vendor.vendor?.seoKeywords.length === 0) {
        updates['vendor.seoKeywords'] = generateVendorKeywords(vendor.vendor);
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(vendor._id, updates);
        console.log(`   ✅ ${businessName}`);
        updated++;
      }
    }

    // === OPTIMISATION DES CATÉGORIES ===
    console.log('\n📂 Optimisation des catégories...');
    const categories = await Category.find({
      $or: [
        { seoTitle: { $exists: false } },
        { seoTitle: '' },
        { seoDescription: { $exists: false } },
        { seoDescription: '' }
      ]
    });

    for (const category of categories) {
      const updates = {};

      // Générer le titre SEO si manquant
      if (!category.seoTitle) {
        updates.seoTitle = generateCategorySEOTitle(category.name);
      }

      // Générer la description SEO si manquante
      if (!category.seoDescription) {
        updates.seoDescription = generateCategorySEODescription(category.name, category.description);
      }

      // Générer les mots-clés si manquants
      if (!category.seoKeywords || category.seoKeywords.length === 0) {
        updates.seoKeywords = generateCategoryKeywords(category.name);
      }

      if (Object.keys(updates).length > 0) {
        await Category.findByIdAndUpdate(category._id, updates);
        console.log(`   ✅ ${category.name}`);
        updated++;
      }
    }

    console.log(`\n🎉 ${updated} éléments optimisés avec succès !`);

  } catch (error) {
    console.error('❌ Erreur lors de la génération des métadonnées:', error);
  } finally {
    process.exit(0);
  }
}

// === FONCTIONS DE GÉNÉRATION ===

function generateProductSEOTitle(product) {
  const brand = product.brand || 'Premium';
  const category = product.category || 'Produit';
  const name = product.name;
  
  // Modèles de titres SEO pour produits
  const templates = [
    `${name} - ${brand} - Achat en ligne`,
    `${name} ${brand} - Livraison gratuite`,
    `${name} - ${category} ${brand} - Meilleur prix`,
    `Acheter ${name} ${brand} - Garantie 2 ans`
  ];

  const title = templates[Math.floor(Math.random() * templates.length)];
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

function generateProductSEODescription(product) {
  const name = product.name;
  const price = product.price;
  const category = product.category || 'produit';
  const description = product.description || '';
  
  const shortDesc = description.substring(0, 80);
  
  const templates = [
    `Découvrez ${name} à partir de ${price}€. ${shortDesc} Livraison rapide et service client expert.`,
    `${name} au meilleur prix : ${price}€. Profitez de notre sélection ${category} avec garantie satisfaction.`,
    `Achetez ${name} en ligne - ${price}€. ${shortDesc} Paiement sécurisé et livraison gratuite.`
  ];

  const description_seo = templates[Math.floor(Math.random() * templates.length)];
  return description_seo.length > 160 ? description_seo.substring(0, 157) + '...' : description_seo;
}

function generateProductKeywords(product) {
  const keywords = [];
  
  // Ajouter le nom du produit
  if (product.name) {
    keywords.push(product.name.toLowerCase());
  }
  
  // Ajouter la catégorie
  if (product.category) {
    keywords.push(product.category.toLowerCase());
  }
  
  // Ajouter la marque
  if (product.brand) {
    keywords.push(product.brand.toLowerCase());
  }
  
  // Ajouter des mots-clés e-commerce génériques
  const genericKeywords = ['achat en ligne', 'livraison gratuite', 'meilleur prix', 'garantie'];
  keywords.push(...genericKeywords.slice(0, 2));
  
  return keywords.slice(0, 6); // Limiter à 6 mots-clés
}

function generateVendorSEOTitle(businessName, businessType) {
  const type = businessType || 'Boutique';
  
  const templates = [
    `${businessName} - ${type} en ligne officielle`,
    `${businessName} - Achat direct chez le fabricant`,
    `Boutique ${businessName} - Vente en ligne exclusive`,
    `${businessName} - ${type} certifiée et vérifiée`
  ];

  const title = templates[Math.floor(Math.random() * templates.length)];
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

function generateVendorSEODescription(businessName, description) {
  const shortDesc = description ? description.substring(0, 80) : `Découvrez les produits de qualité de ${businessName}`;
  
  const templates = [
    `${shortDesc} Boutique officielle avec garantie authentique et service client premium.`,
    `Achetez directement chez ${businessName}. ${shortDesc} Livraison rapide et paiement sécurisé.`,
    `${businessName} : ${shortDesc} Profitez de prix exclusifs et d'un service personnalisé.`
  ];

  const desc = templates[Math.floor(Math.random() * templates.length)];
  return desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
}

function generateVendorKeywords(vendor) {
  const keywords = [];
  
  if (vendor?.businessName) {
    keywords.push(vendor.businessName.toLowerCase());
  }
  
  if (vendor?.businessType) {
    keywords.push(vendor.businessType.toLowerCase());
  }
  
  if (vendor?.category) {
    keywords.push(vendor.category.toLowerCase());
  }
  
  // Mots-clés génériques vendeur
  const genericKeywords = ['boutique en ligne', 'vendeur vérifié', 'achat direct', 'service client'];
  keywords.push(...genericKeywords.slice(0, 3));
  
  return keywords.slice(0, 6);
}

function generateCategorySEOTitle(categoryName) {
  const templates = [
    `${categoryName} - Achat en ligne au meilleur prix`,
    `Collection ${categoryName} - Livraison gratuite`,
    `${categoryName} - Large sélection et prix imbattables`,
    `Acheter ${categoryName} - Qualité garantie`
  ];

  const title = templates[Math.floor(Math.random() * templates.length)];
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

function generateCategorySEODescription(categoryName, description) {
  const baseDesc = description || `Découvrez notre sélection ${categoryName.toLowerCase()}`;
  
  const templates = [
    `${baseDesc}. Large choix de produits ${categoryName.toLowerCase()} avec livraison rapide et garantie satisfaction.`,
    `Achetez ${categoryName.toLowerCase()} en ligne. ${baseDesc} Prix compétitifs et service client expert.`,
    `${baseDesc}. Profitez de notre expertise ${categoryName.toLowerCase()} avec paiement sécurisé et retour gratuit.`
  ];

  const desc = templates[Math.floor(Math.random() * templates.length)];
  return desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
}

function generateCategoryKeywords(categoryName) {
  const keywords = [categoryName.toLowerCase()];
  
  // Mots-clés génériques catégorie
  const genericKeywords = [
    'achat en ligne',
    'livraison gratuite',
    'meilleur prix',
    'large sélection',
    'qualité premium',
    'garantie satisfaction'
  ];
  
  keywords.push(...genericKeywords.slice(0, 5));
  return keywords.slice(0, 6);
}

// Exécuter si appelé directement
if (require.main === module) {
  generateMissingMetadata();
}

module.exports = {
  generateMissingMetadata,
  generateProductSEOTitle,
  generateProductSEODescription,
  generateVendorSEOTitle,
  generateVendorSEODescription,
  generateCategorySEOTitle,
  generateCategorySEODescription
};
