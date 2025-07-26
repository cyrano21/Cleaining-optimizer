// Script TypeScript pour générer les slugs SEO en utilisant les vrais modèles
import { connectDB } from '../src/lib/mongodb';
const slugify = require('slugify');

// Import dynamique des modèles pour éviter les conflits TypeScript
async function getModels() {
  const Product = (await import('../src/models/Product')).default;
  const User = (await import('../src/models/User')).default;
  const Category = (await import('../src/models/Category')).default;
  const Blog = (await import('../src/models/Blog')).default;
  
  return { Product, User, Category, Blog };
}

// Configuration de slugify
const slugifyOptions = {
  replacement: '-',
  lower: true,
  strict: true,
  locale: 'en',
  trim: true
};

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

// Fonction pour créer un slug unique
async function createUniqueSlug(text: string, Model: any, field: string = 'slug'): Promise<string> {
  let baseSlug = slugify(text, slugifyOptions);
  let slug = baseSlug;
  let counter = 1;

  // Gérer les champs imbriqués comme vendor.slug
  const query = field.includes('.') 
    ? { [field]: slug }
    : { [field]: slug };

  while (await Model.findOne(query)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Mise à jour des slugs pour les produits
async function updateProductSlugs(): Promise<number> {
  log('cyan', '\n📦 MISE À JOUR SLUGS - PRODUITS');
  log('cyan', '==============================');
  
  const { Product } = await getModels();
  const products = await Product.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).select('name slug');

  let updated = 0;
  for (const product of products) {
    try {
      const slug = await createUniqueSlug(product.name, Product);
      await Product.findByIdAndUpdate(product._id, { slug });
      log('green', `✅ "${product.name}" -> ${slug}`);
      updated++;
    } catch (error: any) {
      log('red', `❌ Erreur pour "${product.name}": ${error.message}`);
    }
  }

  log('blue', `\n📊 ${updated} produits mis à jour`);
  return updated;
}

// Mise à jour des slugs pour les vendeurs
async function updateVendorSlugs(): Promise<number> {
  log('cyan', '\n🏪 MISE À JOUR SLUGS - VENDEURS');
  log('cyan', '==============================');
  
  const { User } = await getModels();
  const vendors = await User.find({ 
    role: 'vendor',
    $or: [
      { 'vendor.slug': { $exists: false } },
      { 'vendor.slug': null },
      { 'vendor.slug': '' }
    ]
  }).select('firstName lastName vendor');

  let updated = 0;
  for (const vendor of vendors) {
    try {
      const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;
      const slug = await createUniqueSlug(businessName, User, 'vendor.slug');
      
      // Initialiser vendor si nécessaire
      if (!vendor.vendor) {
        vendor.vendor = {} as any;
      }
      
      vendor.vendor.slug = slug;
      await vendor.save();
      
      log('green', `✅ "${businessName}" -> ${slug}`);
      updated++;
    } catch (error: any) {
      log('red', `❌ Erreur pour "${vendor.firstName} ${vendor.lastName}": ${error.message}`);
    }
  }

  log('blue', `\n📊 ${updated} vendeurs mis à jour`);
  return updated;
}

// Mise à jour des slugs pour les catégories
async function updateCategorySlugs(): Promise<number> {
  log('cyan', '\n📂 MISE À JOUR SLUGS - CATÉGORIES');
  log('cyan', '=================================');
  
  const { Category } = await getModels();
  const categories = await Category.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).select('name slug');

  let updated = 0;
  for (const category of categories) {
    try {
      const slug = await createUniqueSlug(category.name, Category);
      await Category.findByIdAndUpdate(category._id, { slug });
      log('green', `✅ "${category.name}" -> ${slug}`);
      updated++;
    } catch (error: any) {
      log('red', `❌ Erreur pour "${category.name}": ${error.message}`);
    }
  }

  log('blue', `\n📊 ${updated} catégories mises à jour`);
  return updated;
}

// Mise à jour des slugs pour les articles de blog
async function updateBlogSlugs(): Promise<number> {
  log('cyan', '\n📝 MISE À JOUR SLUGS - BLOG');
  log('cyan', '===========================');
  
  const { Blog } = await getModels();
  const posts = await Blog.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).select('title slug');

  let updated = 0;
  for (const post of posts) {
    try {
      const slug = await createUniqueSlug(post.title, Blog);
      await Blog.findByIdAndUpdate(post._id, { slug });
      log('green', `✅ "${post.title}" -> ${slug}`);
      updated++;
    } catch (error: any) {
      log('red', `❌ Erreur pour "${post.title}": ${error.message}`);
    }
  }

  log('blue', `\n📊 ${updated} articles mis à jour`);
  return updated;
}

// Fonction principale
async function generateAllSlugs(): Promise<void> {
  try {
    log('magenta', '🚀 GÉNÉRATION SLUGS SEO - DÉMARRAGE');
    log('magenta', '====================================');
    
    await connectDB();
    log('green', '✅ Connexion MongoDB établie');

    let totalUpdated = 0;

    // Mettre à jour tous les slugs
    totalUpdated += await updateProductSlugs();
    totalUpdated += await updateVendorSlugs();
    totalUpdated += await updateCategorySlugs();
    totalUpdated += await updateBlogSlugs();

    // Résumé final
    log('magenta', '\n🎯 RÉSUMÉ FINAL');
    log('magenta', '===============');
    
    if (totalUpdated === 0) {
      log('green', '🎉 Tous les slugs sont déjà à jour !');
    } else {
      log('green', `✅ ${totalUpdated} slugs générés/mis à jour avec succès !`);
    }

    log('blue', '\n💡 PROCHAINES ÉTAPES:');
    log('white', '   1. Exécutez: yarn seo:auto-metadata');
    log('white', '   2. Vérifiez: yarn seo:check');
    log('white', '   3. Testez les pages avec Lighthouse');

  } catch (error: any) {
    log('red', `❌ Erreur lors de la génération des slugs: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      log('yellow', '💡 Assurez-vous que MongoDB est démarré');
    }
  } finally {
    process.exit(0);
  }
}

// Fonction utilitaire pour générer un slug simple
export function generateSlug(text: string): string {
  return slugify(text, slugifyOptions);
}

// Exporter les fonctions
export {
  generateAllSlugs,
  createUniqueSlug,
  updateProductSlugs,
  updateVendorSlugs,
  updateCategorySlugs,
  updateBlogSlugs
};

// Exécuter si appelé directement
if (require.main === module) {
  generateAllSlugs();
}
