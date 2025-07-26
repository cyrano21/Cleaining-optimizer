const mongoose = require('mongoose');
const slugify = require('slugify');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

const slugifyOptions = {
  replacement: '-',
  lower: true,
  strict: true,
  locale: 'en',
  trim: true
};

// Connexion MongoDB
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
}

// Schémas simplifiés
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
}, { timestamps: true, collection: 'products' });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  role: String,
  vendor: {
    businessName: String,
    slug: String,
  }
}, { timestamps: true, collection: 'users' });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
}, { timestamps: true, collection: 'categories' });

// Modèles
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Fonction pour créer un slug unique
async function createUniqueSlug(text, Model, field = 'slug') {
  let baseSlug = slugify(text, slugifyOptions);
  let slug = baseSlug;
  let counter = 1;

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
  return updated;
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
  return updated;
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
  return updated;
}

// Fonction principale
async function generateAllSlugs() {
  try {
    console.log('🚀 Démarrage de la génération des slugs SEO...');
    
    await connectToDatabase();

    let totalUpdated = 0;
    totalUpdated += await updateProductSlugs();
    totalUpdated += await updateVendorSlugs();
    totalUpdated += await updateCategorySlugs();

    console.log(`🎉 Génération terminée ! ${totalUpdated} slugs créés/mis à jour.`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération des slugs:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter
if (require.main === module) {
  generateAllSlugs();
}

module.exports = {
  generateAllSlugs,
  updateProductSlugs,
  updateVendorSlugs,
  updateCategorySlugs
};
