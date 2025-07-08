// Script pour créer la catégorie Electronics et corriger les produits
const mongoose = require('./ecomusnext-main/node_modules/mongoose');

// Configuration MongoDB - utiliser la même base que l'API (MongoDB Atlas)
const MONGODB_URI = 'mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0';

// Schéma Category (simplifié)
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Schéma Product (avec référence à Category)
const productSchema = new mongoose.Schema({
  title: String,
  slug: String,
  imgSrc: String,
  imgHoverSrc: String,
  price: Number,
  oldPrice: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Produits électroniques avec les vraies images
const electronicsProducts = [
  {
    title: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
    slug: "ultraglass-2-screen-protector-iphone-15-pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-1.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-2.jpg",
    price: 39.99,
    description: "Protection d'écran de haute qualité pour iPhone 15 Pro"
  },
  {
    title: "Smart Light Switch with Thread",
    slug: "smart-light-switch-thread",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-3.jpg", 
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-4.jpg",
    price: 49.99,
    description: "Interrupteur intelligent avec support Thread"
  },
  {
    title: "SoundForm Rise",
    slug: "soundform-rise",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-5.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-6.jpg",
    price: 79.99,
    oldPrice: 100.00,
    description: "Casque audio haute qualité SoundForm Rise"
  },
  {
    title: "Wireless On-Ear Headphones for Kids",
    slug: "wireless-headphones-kids",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-7.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-8.jpg",
    price: 24.99,
    oldPrice: 34.99,
    description: "Casque sans fil spécialement conçu pour les enfants"
  },
  {
    title: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
    slug: "3-in-1-wireless-charger-magsafe-15w",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-9.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-10.jpg",
    price: 127.49,
    oldPrice: 149.99,
    description: "Chargeur sans fil 3-en-1 avec MagSafe officiel 15W"
  },
  {
    title: "3-in-1 Wireless Charger for Apple Devices",
    slug: "3-in-1-wireless-charger-apple",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-11.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-12.jpg",
    price: 119.99,
    description: "Chargeur sans fil 3-en-1 pour appareils Apple"
  },
  {
    title: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-13.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-14.jpg",
    price: 199.99,
    description: "Écouteurs sans fil professionnels haute qualité"
  },
  {
    title: "Smart Watch Series 8",
    slug: "smart-watch-series-8",
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-15.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/headphone-16.jpg",
    price: 399.99,
    description: "Montre connectée de dernière génération"
  }
];

async function createElectronicsCategoryAndProducts() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Utiliser des schémas flexibles pour éviter les contraintes
    const flexibleCategorySchema = new mongoose.Schema({}, { strict: false });
    const flexibleProductSchema = new mongoose.Schema({}, { strict: false });
    
    const Category = mongoose.models.Category || mongoose.model('Category', flexibleCategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', flexibleProductSchema);

    console.log('📁 Création/récupération de la catégorie Electronics...');
    let electronicsCategory = await Category.findOne({ slug: 'electronics' });
    
    if (!electronicsCategory) {
      electronicsCategory = await Category.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Produits électroniques et accessoires high-tech',
        isActive: true,
        createdAt: new Date()
      });
      console.log('✅ Catégorie Electronics créée:', electronicsCategory._id);
    } else {
      console.log('✅ Catégorie Electronics existante:', electronicsCategory._id);
    }

    console.log('🗑️ Suppression des anciens produits électroniques...');
    await Product.deleteMany({ category: electronicsCategory._id });

    console.log('📦 Insertion des nouveaux produits électroniques...');
    
    // Insérer les produits un par un pour éviter les conflits d'index
    const insertedProducts = [];
    for (const productData of electronicsProducts) {
      try {
        const product = await Product.create({
          title: productData.title,
          slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          description: `${productData.title} - Produit électronique de haute qualité`,
          price: productData.price,
          oldPrice: productData.oldPrice,
          imgSrc: productData.imgSrc,
          imgHoverSrc: productData.imgHoverSrc,
          images: [productData.imgSrc, productData.imgHoverSrc].filter(Boolean),
          category: electronicsCategory._id,
          isActive: true,
          createdAt: new Date()
        });
        insertedProducts.push(product);
        console.log(`✅ Produit créé: ${product.title}`);
      } catch (error) {
        console.error(`❌ Erreur création produit ${productData.title}:`, error.message);
      }
    }

    console.log(`✅ ${insertedProducts.length} produits électroniques insérés avec succès !`);
    
    console.log('\n📋 Catégorie créée :');
    console.log(`- ${electronicsCategory.name} (${electronicsCategory._id})`);
    
    console.log('\n📋 Exemples de produits insérés :');
    insertedProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.price}€`);
      console.log(`   Image: ${product.imgSrc}`);
      console.log(`   Category ID: ${product.category}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    console.log('🔒 Connexion fermée');
    await mongoose.connection.close();
  }
}

// Exécuter le script
createElectronicsCategoryAndProducts();
