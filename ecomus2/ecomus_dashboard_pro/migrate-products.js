require('dotenv').config();
const mongoose = require('mongoose');

// Schéma Product compatible avec les données statiques existantes
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  discountPercentage: { type: Number, default: 0 },
  imgSrc: String,
  imgHoverSrc: String,
  images: [String],
  preOrder: { type: Boolean, default: false },
  soldOut: { type: Boolean, default: false },
  sale: { type: Boolean, default: false },
  category: String,
  brand: String,
  sizes: [String],
  colors: [{
    color: String,
    image: String
  }],
  tags: [String],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  description: String,
  slug: String,
  featured: { type: Boolean, default: false },
  quantity: { type: Number, default: 100 },
  sku: String,
  // Champs spécifiques aux données statiques
  filterColor: [String],
  availability: String,
  fabric: String,
  color: String,
  variants: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  strict: false // Permet des champs additionnels
});

async function migrateStaticProducts() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const Product = mongoose.model('Product', productSchema);

    console.log('🗑️ Suppression des produits existants...');
    await Product.deleteMany({});

    console.log('📦 Import des données statiques...');
    
    // Lire le fichier de données statiques manuellement
    const fs = require('fs');
    const path = require('path');
    
    const productsFilePath = path.join(__dirname, '../ecomusnext-main/data/products.js');
    
    if (!fs.existsSync(productsFilePath)) {
      throw new Error(`Fichier non trouvé: ${productsFilePath}`);
    }
    
    const fileContent = fs.readFileSync(productsFilePath, 'utf8');
    
    // Extraire products1 du contenu du fichier
    const products1Match = fileContent.match(/export const products1 = (\[[\s\S]*?\]);/);
    
    if (!products1Match) {
      throw new Error('Impossible de trouver products1 dans le fichier');
    }
    
    // Évaluer le contenu du tableau (safe car c'est notre propre fichier)
    const products1 = eval(products1Match[1]);
    
    console.log(`📊 ${products1.length} produits trouvés dans les données statiques`);

    // Traiter les produits un par un pour éviter les doublons de slug
    const processedProducts = [];
    const slugsUsed = new Set();

    for (const [index, product] of products1.entries()) {
      let baseSlug = product.slug || `${product.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${index + 1}`;
      let uniqueSlug = baseSlug;
      let counter = 1;
      
      // Vérifier si le slug existe déjà et créer un slug unique
      while (slugsUsed.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      slugsUsed.add(uniqueSlug);
      
      processedProducts.push({
        ...product,
        // S'assurer que les champs essentiels existent
        title: product.title || 'Produit sans nom',
        price: product.price || 0,
        imgSrc: product.imgSrc || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=720&h=1005&auto=format&fit=crop',
        images: product.images || [product.imgSrc, product.imgHoverSrc].filter(Boolean),
        tags: product.tags || [],
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        colors: product.colors || [],
        rating: product.rating || 4 + Math.random() * 1, // Rating aléatoire entre 4 et 5
        reviewsCount: product.reviewsCount || Math.floor(Math.random() * 100) + 10,
        quantity: product.quantity || Math.floor(Math.random() * 50) + 10,
        sku: product.sku || `SKU-${product.id || index + 1}`,
        slug: uniqueSlug,
        featured: product.featured || Math.random() > 0.7, // 30% de chance d'être featured
        sale: product.sale || product.discountPercentage > 0,
        soldOut: product.soldOut || false,
        preOrder: product.preOrder || false
      });
    }

    console.log(`💾 Insertion des ${processedProducts.length} produits dans MongoDB...`);
    const insertedProducts = await Product.insertMany(processedProducts);

    console.log(`✅ ${insertedProducts.length} produits migrés avec succès !`);
    
    // Afficher quelques exemples
    console.log('\n📋 Exemples de produits migrés :');
    insertedProducts.slice(0, 5).forEach(product => {
      console.log(`- ${product.title} (${product.id}) - ${product.price}€`);
    });

    console.log('\n🔢 Statistiques :');
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          featuredProducts: { $sum: { $cond: ['$featured', 1, 0] } },
          averagePrice: { $avg: '$price' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`- Total produits: ${stat.totalProducts}`);
      console.log(`- Produits featured: ${stat.featuredProducts}`);
      console.log(`- Prix moyen: ${stat.averagePrice?.toFixed(2)}€`);
      console.log(`- Catégories: ${stat.categories.filter(Boolean).length}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    console.log('🔌 Déconnexion de MongoDB');
    await mongoose.disconnect();
  }
}

migrateStaticProducts();
