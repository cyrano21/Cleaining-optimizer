// Script simple pour générer les slugs SEO
import { MongoClient } from 'mongodb';
const slugify = require('slugify');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

interface BaseModel {
  _id: string;
  title?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  slug?: string;
  role?: string;
}

// Fonction pour générer des slugs uniques
function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// Fonction pour vérifier l'unicité du slug
async function ensureUniqueSlug(collection: any, slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const query: any = { slug: uniqueSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await collection.findOne(query);
    if (!existing) {
      return uniqueSlug;
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}

// Fonction principale
async function generateSlugs() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connexion à la base de données...');
    await client.connect();
    const db = client.db();
    
    console.log('📦 Génération des slugs pour les produits...');
    await generateProductSlugs(db);
    
    console.log('👥 Génération des slugs pour les vendeurs...');
    await generateVendorSlugs(db);
    
    console.log('📂 Génération des slugs pour les catégories...');
    await generateCategorySlugs(db);
    
    console.log('📝 Génération des slugs pour les articles de blog...');
    await generateBlogSlugs(db);
    
    console.log('✅ Génération des slugs terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des slugs:', error);
  } finally {
    await client.close();
  }
}

// Génération des slugs pour les produits
async function generateProductSlugs(db: any) {
  const collection = db.collection('products');
  const products = await collection.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).toArray();
  
  console.log(`📦 ${products.length} produits à traiter`);
  
  let processed = 0;
  for (const product of products) {
    try {
      const baseSlug = generateSlug(product.title || product.name || `product-${product._id}`);
      const uniqueSlug = await ensureUniqueSlug(collection, baseSlug, product._id);
      
      await collection.updateOne(
        { _id: product._id },
        { $set: { slug: uniqueSlug } }
      );
      
      processed++;
      if (processed % 10 === 0) {
        console.log(`   ✅ ${processed}/${products.length} produits traités`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour le produit ${product._id}:`, error);
    }
  }
  
  console.log(`✅ ${processed} slugs de produits générés`);
}

// Génération des slugs pour les vendeurs
async function generateVendorSlugs(db: any) {
  const collection = db.collection('users');
  const vendors = await collection.find({
    role: 'vendor',
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).toArray();
  
  console.log(`👥 ${vendors.length} vendeurs à traiter`);
  
  let processed = 0;
  for (const vendor of vendors) {
    try {
      const displayName = vendor.name || 
                         (vendor.firstName && vendor.lastName ? `${vendor.firstName} ${vendor.lastName}` : '') ||
                         vendor.email?.split('@')[0] ||
                         `vendor-${vendor._id}`;
      
      const baseSlug = generateSlug(displayName);
      const uniqueSlug = await ensureUniqueSlug(collection, baseSlug, vendor._id);
      
      await collection.updateOne(
        { _id: vendor._id },
        { $set: { slug: uniqueSlug } }
      );
      
      processed++;
    } catch (error) {
      console.error(`❌ Erreur pour le vendeur ${vendor._id}:`, error);
    }
  }
  
  console.log(`✅ ${processed} slugs de vendeurs générés`);
}

// Génération des slugs pour les catégories
async function generateCategorySlugs(db: any) {
  const collection = db.collection('categories');
  const categories = await collection.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).toArray();
  
  console.log(`📂 ${categories.length} catégories à traiter`);
  
  let processed = 0;
  for (const category of categories) {
    try {
      const baseSlug = generateSlug(category.name || category.title || `category-${category._id}`);
      const uniqueSlug = await ensureUniqueSlug(collection, baseSlug, category._id);
      
      await collection.updateOne(
        { _id: category._id },
        { $set: { slug: uniqueSlug } }
      );
      
      processed++;
    } catch (error) {
      console.error(`❌ Erreur pour la catégorie ${category._id}:`, error);
    }
  }
  
  console.log(`✅ ${processed} slugs de catégories générés`);
}

// Génération des slugs pour les articles de blog
async function generateBlogSlugs(db: any) {
  const collection = db.collection('blogs');
  const posts = await collection.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).toArray();
  
  console.log(`📝 ${posts.length} articles de blog à traiter`);
  
  let processed = 0;
  for (const post of posts) {
    try {
      const baseSlug = generateSlug(post.title || `blog-post-${post._id}`);
      const uniqueSlug = await ensureUniqueSlug(collection, baseSlug, post._id);
      
      await collection.updateOne(
        { _id: post._id },
        { $set: { slug: uniqueSlug } }
      );
      
      processed++;
    } catch (error) {
      console.error(`❌ Erreur pour l'article ${post._id}:`, error);
    }
  }
  
  console.log(`✅ ${processed} slugs d'articles générés`);
}

// Exécution du script
if (require.main === module) {
  generateSlugs();
}
