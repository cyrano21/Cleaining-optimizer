// Ce script nécessite que les modèles TypeScript soient compilés
// Pour l'instant, nous utilisons ts-node pour l'exécuter

import mongoose from 'mongoose';
import slugify from 'slugify';

// Configuration de slugify
const slugifyOptions = {
  replacement: '-',
  lower: true,
  strict: true,
  locale: 'en',
  trim: true
};

// Configuration de la connexion MongoDB

// Configuration de la connexion MongoDB
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
}

// Schémas Mongoose simplifiés pour ce script
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  category: String,
  price: Number,
  images: [String],
  status: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  vendor: {
    businessName: String,
    slug: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    businessType: String,
    category: String,
    description: String,
    logo: String,
    bannerImage: String
  }
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  description: String,
  image: String,
  featured: Boolean
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  content: String,
  excerpt: String,
  status: String,
  categories: [String],
  tags: [String]
}, { timestamps: true });

// Modèles
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

// Fonction pour créer un slug unique
async function createUniqueSlug(text, Model, field = 'slug') {
  const baseSlug = slugify(text, slugifyOptions);
  let slug = baseSlug;
  let counter = 1;

  // Vérifier si le slug existe déjà
  while (await Model.findOne({ [field]: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Mise à jour des slugs pour les produits
async function updateProductSlugs() {
  console.log('🔄 Mise à jour des slugs pour les produits...');
  
  const products = await Product.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  });

  let updated = 0;
  for (const product of products) {
    try {
      const slug = await createUniqueSlug(product.name, Product);
      await Product.findByIdAndUpdate(product._id, { slug });
      console.log(`✅ Produit "${product.name}" -> slug: "${slug}"`);
      updated++;
    } catch (error) {
      console.error(`❌ Erreur pour le produit "${product.name}":`, error.message);
    }
  }

  console.log(`✅ ${updated} slugs de produits mis à jour`);
}

// Mise à jour des slugs pour les vendeurs
async function updateVendorSlugs() {
  console.log('🔄 Mise à jour des slugs pour les vendeurs...');
  
  const vendors = await User.find({ 
    role: 'vendor',
    $or: [
      { 'vendor.slug': { $exists: false } },
      { 'vendor.slug': null },
      { 'vendor.slug': '' }
    ]
  });

  let updated = 0;
  for (const vendor of vendors) {
    try {
      const businessName = vendor.vendor?.businessName || `${vendor.firstName} ${vendor.lastName}`;
      const slug = await createUniqueSlug(businessName, User, 'vendor.slug');
      
      // Initialiser vendor si nécessaire
      if (!vendor.vendor) {
        vendor.vendor = {};
      }
      
      vendor.vendor.slug = slug;
      await vendor.save();
      
      console.log(`✅ Vendeur "${businessName}" -> slug: "${slug}"`);
      updated++;
    } catch (error) {
      console.error(`❌ Erreur pour le vendeur "${vendor.firstName} ${vendor.lastName}":`, error.message);
    }
  }

  console.log(`✅ ${updated} slugs de vendeurs mis à jour`);
}

// Mise à jour des slugs pour les catégories
async function updateCategorySlugs() {
  console.log('🔄 Mise à jour des slugs pour les catégories...');
  
  const categories = await Category.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  });

  let updated = 0;
  for (const category of categories) {
    try {
      const slug = await createUniqueSlug(category.name, Category);
      await Category.findByIdAndUpdate(category._id, { slug });
      console.log(`✅ Catégorie "${category.name}" -> slug: "${slug}"`);
      updated++;
    } catch (error) {
      console.error(`❌ Erreur pour la catégorie "${category.name}":`, error.message);
    }
  }

  console.log(`✅ ${updated} slugs de catégories mis à jour`);
}

// Mise à jour des slugs pour les articles de blog
async function updateBlogSlugs() {
  console.log('🔄 Mise à jour des slugs pour les articles de blog...');
  
  const blogPosts = await Blog.find({ 
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  });

  let updated = 0;
  for (const post of blogPosts) {
    try {
      const slug = await createUniqueSlug(post.title, Blog);
      await Blog.findByIdAndUpdate(post._id, { slug });
      console.log(`✅ Article "${post.title}" -> slug: "${slug}"`);
      updated++;
    } catch (error) {
      console.error(`❌ Erreur pour l'article "${post.title}":`, error.message);
    }
  }

  console.log(`✅ ${updated} slugs d'articles mis à jour`);
}

// Fonction principale
async function generateAllSlugs() {
  try {
    console.log('🚀 Démarrage de la génération des slugs SEO...');
    
    await connectToDatabase();
    console.log('✅ Connexion à MongoDB établie');

    // Mettre à jour tous les slugs
    await updateProductSlugs();
    await updateVendorSlugs();
    await updateCategorySlugs();
    await updateBlogSlugs();

    console.log('🎉 Génération des slugs terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des slugs:', error);
  } finally {
    process.exit(0);
  }
}

// Fonction pour générer un slug à partir d'un texte (utilitaire)
function generateSlug(text) {
  return slugify(text, slugifyOptions);
}

// Exporter les fonctions
export {
  generateAllSlugs,
  generateSlug,
  createUniqueSlug,
  updateProductSlugs,
  updateVendorSlugs,
  updateCategorySlugs,
  updateBlogSlugs
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSlugs();
}
