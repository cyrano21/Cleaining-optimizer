// Script TypeScript pour vérifier la qualité SEO en utilisant les vrais modèles
import { connectDB } from '../lib/mongodb';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';
import Store from '../models/Store';

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

// Interface pour les statistiques
interface SEOStats {
  total: number;
  withSlug: number;
  withSEOTitle: number;
  withSEODescription: number;
  withImages?: number;
  withLogo?: number;
  withDescription?: number;
  titleTooLong?: number;
  descriptionTooLong?: number;
  titleTooShort?: number;
  descriptionTooShort?: number;
}

// Vérifier la qualité SEO des produits
async function checkProductsSEO(): Promise<number> {
  log('cyan', '\n🔍 VÉRIFICATION SEO - PRODUITS');
  log('cyan', '=====================================');

  const products = await Product.find().select('name slug seoTitle seoDescription images');
  
  let issues = 0;
  const stats: SEOStats = {
    total: products.length,
    withSlug: 0,
    withSEOTitle: 0,
    withSEODescription: 0,
    withImages: 0,
    titleTooLong: 0,
    descriptionTooLong: 0,
    titleTooShort: 0,
    descriptionTooShort: 0
  };

  for (const product of products) {
    const productIssues: string[] = [];

    // Vérification du slug
    if (product.slug) {
      stats.withSlug++;
    } else {
      productIssues.push('❌ Slug manquant');
      issues++;
    }

    // Vérification du titre SEO
    if (product.seoTitle) {
      stats.withSEOTitle++;
      if (product.seoTitle.length > 60) {
        stats.titleTooLong!++;
        productIssues.push(`⚠️  Titre SEO trop long (${product.seoTitle.length} chars)`);
      } else if (product.seoTitle.length < 30) {
        stats.titleTooShort!++;
        productIssues.push(`⚠️  Titre SEO trop court (${product.seoTitle.length} chars)`);
      }
    } else {
      productIssues.push('❌ Titre SEO manquant');
      issues++;
    }

    // Vérification de la description SEO
    if (product.seoDescription) {
      stats.withSEODescription++;
      if (product.seoDescription.length > 160) {
        stats.descriptionTooLong!++;
        productIssues.push(`⚠️  Description SEO trop longue (${product.seoDescription.length} chars)`);
      } else if (product.seoDescription.length < 120) {
        stats.descriptionTooShort!++;
        productIssues.push(`⚠️  Description SEO trop courte (${product.seoDescription.length} chars)`);
      }
    } else {
      productIssues.push('❌ Description SEO manquante');
      issues++;
    }

    // Vérification des images
    if (product.images && product.images.length > 0) {
      stats.withImages!++;
    } else {
      productIssues.push('❌ Images manquantes');
      issues++;
    }

    // Afficher les problèmes pour ce produit
    if (productIssues.length > 0) {
      log('red', `\n📦 ${product.name}`);
      productIssues.forEach(issue => log('yellow', `   ${issue}`));
    }
  }

  // Afficher les statistiques
  log('blue', '\n📊 STATISTIQUES PRODUITS:');
  log('white', `   Total: ${stats.total}`);
  log('green', `   ✅ Avec slug: ${stats.withSlug} (${Math.round(stats.withSlug/stats.total*100)}%)`);
  log('green', `   ✅ Avec titre SEO: ${stats.withSEOTitle} (${Math.round(stats.withSEOTitle/stats.total*100)}%)`);
  log('green', `   ✅ Avec description SEO: ${stats.withSEODescription} (${Math.round(stats.withSEODescription/stats.total*100)}%)`);
  log('green', `   ✅ Avec images: ${stats.withImages!} (${Math.round(stats.withImages!/stats.total*100)}%)`);
  
  if (stats.titleTooLong! > 0) log('yellow', `   ⚠️  Titres trop longs: ${stats.titleTooLong}`);
  if (stats.titleTooShort! > 0) log('yellow', `   ⚠️  Titres trop courts: ${stats.titleTooShort}`);
  if (stats.descriptionTooLong! > 0) log('yellow', `   ⚠️  Descriptions trop longues: ${stats.descriptionTooLong}`);
  if (stats.descriptionTooShort! > 0) log('yellow', `   ⚠️  Descriptions trop courtes: ${stats.descriptionTooShort}`);

  return issues;
}

// Vérifier la qualité SEO des vendeurs
async function checkVendorsSEO(): Promise<number> {
  log('cyan', '\n🏪 VÉRIFICATION SEO - VENDEURS');
  log('cyan', '=====================================');

  const vendors = await User.find({ role: 'vendor' }).select('firstName lastName vendor');
  
  let issues = 0;
  const stats: SEOStats = {
    total: vendors.length,
    withSlug: 0,
    withSEOTitle: 0,
    withSEODescription: 0,
    withLogo: 0,
    withDescription: 0
  };

  for (const vendor of vendors) {
    const vendorIssues: string[] = [];
    const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;

    // Vérification du slug
    if (vendor.vendor?.slug) {
      stats.withSlug++;
    } else {
      vendorIssues.push('❌ Slug manquant');
      issues++;
    }

    // Vérification du titre SEO
    if (vendor.vendor?.seoTitle) {
      stats.withSEOTitle++;
    } else {
      vendorIssues.push('❌ Titre SEO manquant');
      issues++;
    }

    // Vérification de la description SEO
    if (vendor.vendor?.seoDescription) {
      stats.withSEODescription++;
    } else {
      vendorIssues.push('❌ Description SEO manquante');
      issues++;
    }

    // Vérification du logo
    if (vendor.vendor?.logo) {
      stats.withLogo!++;
    } else {
      vendorIssues.push('❌ Logo manquant');
      issues++;
    }

    // Vérification de la description
    if (vendor.vendor?.description) {
      stats.withDescription!++;
    } else {
      vendorIssues.push('❌ Description manquante');
      issues++;
    }

    // Afficher les problèmes pour ce vendeur
    if (vendorIssues.length > 0) {
      log('red', `\n🏪 ${businessName}`);
      vendorIssues.forEach(issue => log('yellow', `   ${issue}`));
    }
  }

  // Afficher les statistiques
  log('blue', '\n📊 STATISTIQUES VENDEURS:');
  log('white', `   Total: ${stats.total}`);
  log('green', `   ✅ Avec slug: ${stats.withSlug} (${Math.round(stats.withSlug/stats.total*100)}%)`);
  log('green', `   ✅ Avec titre SEO: ${stats.withSEOTitle} (${Math.round(stats.withSEOTitle/stats.total*100)}%)`);
  log('green', `   ✅ Avec description SEO: ${stats.withSEODescription} (${Math.round(stats.withSEODescription/stats.total*100)}%)`);
  log('green', `   ✅ Avec logo: ${stats.withLogo!} (${Math.round(stats.withLogo!/stats.total*100)}%)`);
  log('green', `   ✅ Avec description: ${stats.withDescription!} (${Math.round(stats.withDescription!/stats.total*100)}%)`);

  return issues;
}

// Vérifier la qualité SEO des catégories
async function checkCategoriesSEO(): Promise<number> {
  log('cyan', '\n📂 VÉRIFICATION SEO - CATÉGORIES');
  log('cyan', '=====================================');

  const categories = await Category.find().select('name slug seoTitle seoDescription image');
  
  let issues = 0;
  const stats: SEOStats = {
    total: categories.length,
    withSlug: 0,
    withSEOTitle: 0,
    withSEODescription: 0,
    withImages: 0
  };

  for (const category of categories) {
    const categoryIssues: string[] = [];

    // Vérification du slug
    if (category.slug) {
      stats.withSlug++;
    } else {
      categoryIssues.push('❌ Slug manquant');
      issues++;
    }

    // Vérification du titre SEO
    if (category.seoTitle) {
      stats.withSEOTitle++;
    } else {
      categoryIssues.push('❌ Titre SEO manquant');
      issues++;
    }

    // Vérification de la description SEO
    if (category.seoDescription) {
      stats.withSEODescription++;
    } else {
      categoryIssues.push('❌ Description SEO manquante');
      issues++;
    }

    // Vérification de l'image
    if (category.image) {
      stats.withImages!++;
    } else {
      categoryIssues.push('❌ Image manquante');
    }

    // Afficher les problèmes pour cette catégorie
    if (categoryIssues.length > 0) {
      log('red', `\n📂 ${category.name}`);
      categoryIssues.forEach(issue => log('yellow', `   ${issue}`));
    }
  }

  // Afficher les statistiques
  log('blue', '\n📊 STATISTIQUES CATÉGORIES:');
  log('white', `   Total: ${stats.total}`);
  log('green', `   ✅ Avec slug: ${stats.withSlug} (${Math.round(stats.withSlug/stats.total*100)}%)`);
  log('green', `   ✅ Avec titre SEO: ${stats.withSEOTitle} (${Math.round(stats.withSEOTitle/stats.total*100)}%)`);
  log('green', `   ✅ Avec description SEO: ${stats.withSEODescription} (${Math.round(stats.withSEODescription/stats.total*100)}%)`);
  log('green', `   ✅ Avec image: ${stats.withImages!} (${Math.round(stats.withImages!/stats.total*100)}%)`);

  return issues;
}

// Vérifier les URLs et la structure du site
async function checkSiteStructure(): Promise<number> {
  log('cyan', '\n🌐 VÉRIFICATION STRUCTURE DU SITE');
  log('cyan', '=====================================');

  const issues: string[] = [];

  // Vérifier les variables d'environnement
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    issues.push('❌ NEXT_PUBLIC_BASE_URL non définie');
  } else {
    log('green', `✅ Base URL: ${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    issues.push('❌ CLOUDINARY_CLOUD_NAME non définie');
  } else {
    log('green', `✅ Cloudinary configuré: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  }

  // Recommandations SEO
  log('blue', '\n💡 RECOMMANDATIONS:');
  log('white', '   1. Configurez Google Search Console');
  log('white', '   2. Ajoutez Google Analytics 4');
  log('white', '   3. Vérifiez les Core Web Vitals avec Lighthouse');
  log('white', '   4. Créez un compte Google My Business pour chaque vendeur');
  log('white', '   5. Implémentez un système de reviews produits');

  if (issues.length > 0) {
    log('red', '\n❌ PROBLÈMES DE CONFIGURATION:');
    issues.forEach(issue => log('yellow', `   ${issue}`));
  }

  return issues.length;
}

// Fonction principale
async function checkSEOQuality(): Promise<void> {
  try {
    log('magenta', '🚀 AUDIT SEO COMPLET - DÉBUT');
    log('magenta', '==============================');
    
    await connectDB();
    log('green', '✅ Connexion à MongoDB établie');

    let totalIssues = 0;

    // Vérifier chaque composant
    totalIssues += await checkProductsSEO();
    totalIssues += await checkVendorsSEO();
    totalIssues += await checkCategoriesSEO();
    totalIssues += await checkSiteStructure();

    // Résumé final
    log('magenta', '\n🎯 RÉSUMÉ DE L\'AUDIT SEO');
    log('magenta', '========================');
    
    if (totalIssues === 0) {
      log('green', '🎉 Félicitations ! Votre site est parfaitement optimisé pour le SEO !');
    } else if (totalIssues < 10) {
      log('yellow', `⚠️  ${totalIssues} problèmes mineurs détectés. Optimisation recommandée.`);
    } else {
      log('red', `❌ ${totalIssues} problèmes détectés. Optimisation urgente nécessaire !`);
    }

    log('blue', '\n📋 PROCHAINES ÉTAPES:');
    log('white', '   1. Exécutez: yarn seo:generate-slugs');
    log('white', '   2. Exécutez: yarn seo:auto-metadata');
    log('white', '   3. Testez les pages avec Lighthouse');
    log('white', '   4. Soumettez le sitemap à Google Search Console');

  } catch (error: any) {
    log('red', `❌ Erreur lors de l'audit SEO: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      log('yellow', '💡 Assurez-vous que MongoDB est démarré');
    }
  } finally {
    process.exit(0);
  }
}

// Exporter les fonctions
export {
  checkSEOQuality,
  checkProductsSEO,
  checkVendorsSEO,
  checkCategoriesSEO,
  checkSiteStructure
};

// Exécuter si appelé directement
if (require.main === module) {
  checkSEOQuality();
}
