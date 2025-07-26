// Script TypeScript pour optimiser automatiquement les métadonnées SEO
import { connectDB } from '../lib/mongodb';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';
import Blog from '../models/Blog';

// Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Templates pour les métadonnées
const templates = {
  product: {
    seoTitle: (product: any) => {
      const title = `${product.name}`;
      const category = product.category ? ` - ${product.category}` : '';
      const action = ' - Achat en ligne';
      return (title + category + action).substring(0, 60);
    },
    seoDescription: (product: any) => {
      const desc = `Découvrez ${product.name.toLowerCase()}`;
      const category = product.category ? ` dans la catégorie ${product.category.toLowerCase()}` : '';
      const price = product.price ? ` à partir de ${product.price}€` : '';
      const action = '. Livraison rapide et garantie satisfait ou remboursé.';
      return (desc + category + price + action).substring(0, 160);
    }
  },
  
  vendor: {
    seoTitle: (vendor: any) => {
      const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;
      return `${businessName} - Boutique en ligne officielle`.substring(0, 60);
    },
    seoDescription: (vendor: any) => {
      const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;
      const businessType = vendor.vendor?.businessType || 'e-commerce';
      return `Découvrez la boutique ${businessName}, spécialiste ${businessType}. Produits de qualité, livraison rapide et service client expert.`.substring(0, 160);
    }
  },
  
  category: {
    seoTitle: (category: any) => {
      return `${category.name} - Large sélection en ligne`.substring(0, 60);
    },
    seoDescription: (category: any) => {
      const desc = category.description || `Découvrez notre collection ${category.name.toLowerCase()}`;
      const action = '. Meilleurs prix, livraison gratuite et retours faciles.';
      return (desc + action).substring(0, 160);
    }
  },
  
  blog: {
    seoTitle: (post: any) => {
      return post.title.substring(0, 60);
    },
    seoDescription: (post: any) => {
      return (post.excerpt || post.title).substring(0, 160);
    }
  }
};

// Optimiser les métadonnées des produits
async function optimizeProductsMetadata(): Promise<number> {
  log('cyan', '\n📦 OPTIMISATION MÉTADONNÉES - PRODUITS');
  log('cyan', '=======================================');

  const products = await Product.find({
    $or: [
      { seoTitle: { $exists: false } },
      { seoTitle: null },
      { seoTitle: '' },
      { seoDescription: { $exists: false } },
      { seoDescription: null },
      { seoDescription: '' }
    ]
  });

  let updated = 0;
  
  for (const product of products) {
    const changes: string[] = [];
    let needsUpdate = false;

    // Optimiser le titre SEO
    if (!product.seoTitle) {
      product.seoTitle = templates.product.seoTitle(product);
      changes.push(`Titre SEO: "${product.seoTitle}"`);
      needsUpdate = true;
    }

    // Optimiser la description SEO
    if (!product.seoDescription) {
      product.seoDescription = templates.product.seoDescription(product);
      changes.push(`Description SEO: "${product.seoDescription}"`);
      needsUpdate = true;
    }

    // Générer des mots-clés SEO si manquants
    if (!product.seoKeywords || product.seoKeywords.length === 0) {
      const keywords: string[] = [];
      
      // Ajouter le nom du produit
      keywords.push(product.name.toLowerCase());
      
      // Ajouter la catégorie
      if (product.category) {
        keywords.push(product.category.toLowerCase());
      }
      
      // Ajouter des mots-clés génériques e-commerce
      keywords.push('achat en ligne', 'livraison rapide', 'meilleur prix');
      
      product.seoKeywords = keywords;
      changes.push(`Mots-clés SEO: [${keywords.join(', ')}]`);
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await product.save();
        log('green', `✅ ${product.name}`);
        changes.forEach(change => log('white', `   ${change}`));
        updated++;
      } catch (error: any) {
        log('red', `❌ Erreur pour "${product.name}": ${error.message}`);
      }
    }
  }

  log('blue', `\n📊 ${updated} produits optimisés`);
  return updated;
}

// Optimiser les métadonnées des vendeurs
async function optimizeVendorsMetadata(): Promise<number> {
  log('cyan', '\n🏪 OPTIMISATION MÉTADONNÉES - VENDEURS');
  log('cyan', '=======================================');

  const vendors = await User.find({
    role: 'vendor',
    $or: [
      { 'vendor.seoTitle': { $exists: false } },
      { 'vendor.seoTitle': null },
      { 'vendor.seoTitle': '' },
      { 'vendor.seoDescription': { $exists: false } },
      { 'vendor.seoDescription': null },
      { 'vendor.seoDescription': '' }
    ]
  });

  let updated = 0;
  
  for (const vendor of vendors) {
    const changes: string[] = [];
    let needsUpdate = false;

    // Initialiser vendor si nécessaire
    if (!vendor.vendor) {
      vendor.vendor = {} as any;
    }

    const businessName = vendor.vendor.businessName || `${vendor.firstName} ${vendor.lastName}`;

    // Optimiser le titre SEO
    if (!vendor.vendor.seoTitle) {
      vendor.vendor.seoTitle = templates.vendor.seoTitle(vendor);
      changes.push(`Titre SEO: "${vendor.vendor.seoTitle}"`);
      needsUpdate = true;
    }

    // Optimiser la description SEO
    if (!vendor.vendor.seoDescription) {
      vendor.vendor.seoDescription = templates.vendor.seoDescription(vendor);
      changes.push(`Description SEO: "${vendor.vendor.seoDescription}"`);
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await vendor.save();
        log('green', `✅ ${businessName}`);
        changes.forEach(change => log('white', `   ${change}`));
        updated++;
      } catch (error: any) {
        log('red', `❌ Erreur pour "${businessName}": ${error.message}`);
      }
    }
  }

  log('blue', `\n📊 ${updated} vendeurs optimisés`);
  return updated;
}

// Optimiser les métadonnées des catégories
async function optimizeCategoriesMetadata(): Promise<number> {
  log('cyan', '\n📂 OPTIMISATION MÉTADONNÉES - CATÉGORIES');
  log('cyan', '=========================================');

  const categories = await Category.find({
    $or: [
      { seoTitle: { $exists: false } },
      { seoTitle: null },
      { seoTitle: '' },
      { seoDescription: { $exists: false } },
      { seoDescription: null },
      { seoDescription: '' }
    ]
  });

  let updated = 0;
  
  for (const category of categories) {
    const changes: string[] = [];
    let needsUpdate = false;

    // Optimiser le titre SEO
    if (!category.seoTitle) {
      category.seoTitle = templates.category.seoTitle(category);
      changes.push(`Titre SEO: "${category.seoTitle}"`);
      needsUpdate = true;
    }

    // Optimiser la description SEO
    if (!category.seoDescription) {
      category.seoDescription = templates.category.seoDescription(category);
      changes.push(`Description SEO: "${category.seoDescription}"`);
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await category.save();
        log('green', `✅ ${category.name}`);
        changes.forEach(change => log('white', `   ${change}`));
        updated++;
      } catch (error: any) {
        log('red', `❌ Erreur pour "${category.name}": ${error.message}`);
      }
    }
  }

  log('blue', `\n📊 ${updated} catégories optimisées`);
  return updated;
}

// Fonction principale
async function optimizeAllMetadata(): Promise<void> {
  try {
    log('magenta', '🚀 OPTIMISATION AUTOMATIQUE DES MÉTADONNÉES');
    log('magenta', '============================================');
    
    await connectDB();
    log('green', '✅ Connexion MongoDB établie');

    let totalOptimized = 0;

    // Optimiser tous les types de contenu
    totalOptimized += await optimizeProductsMetadata();
    totalOptimized += await optimizeVendorsMetadata();
    totalOptimized += await optimizeCategoriesMetadata();

    // Résumé final
    log('magenta', '\n🎯 RÉSUMÉ DE L\'OPTIMISATION');
    log('magenta', '============================');
    
    if (totalOptimized === 0) {
      log('green', '🎉 Toutes les métadonnées sont déjà optimisées !');
    } else {
      log('green', `✅ ${totalOptimized} éléments optimisés avec succès !`);
    }

    log('blue', '\n💡 CONSEILS SUPPLÉMENTAIRES:');
    log('white', '   1. Personnalisez les métadonnées générées selon vos besoins');
    log('white', '   2. Testez les titres et descriptions avec Google Rich Results Test');
    log('white', '   3. Surveillez les performances dans Google Search Console');

  } catch (error: any) {
    log('red', `❌ Erreur lors de l'optimisation: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      log('yellow', '💡 Assurez-vous que MongoDB est démarré');
    }
  } finally {
    process.exit(0);
  }
}

// Exporter les fonctions
export {
  optimizeAllMetadata,
  optimizeProductsMetadata,
  optimizeVendorsMetadata,
  optimizeCategoriesMetadata,
  templates
};

// Exécuter si appelé directement
if (require.main === module) {
  optimizeAllMetadata();
}
