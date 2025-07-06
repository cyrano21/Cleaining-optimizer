const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productSchema = new mongoose.Schema({
  name: String,
  title: String,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  variants: [{
    color: String,
    size: String,
    images: [String]
  }]
});

const Product = mongoose.model('Product', productSchema);

// Images de démonstration Cloudinary disponibles
const DEMO_IMAGES = [
  'https://res.cloudinary.com/dwens2ze5/image/upload/v1748996742/ecomus/products/l60yjwptzcgkm6uykbou.jpg',
  'https://res.cloudinary.com/dwens2ze5/image/upload/v1748996746/ecomus/products/ep3ptlpxkt9bhloz3mw2.jpg',
  'https://res.cloudinary.com/dwens2ze5/image/upload/c_fill,w_400,h_400/v1748996742/ecomus/products/l60yjwptzcgkm6uykbou.jpg',
  'https://res.cloudinary.com/dwens2ze5/image/upload/c_fill,w_600,h_600/v1748996746/ecomus/products/ep3ptlpxkt9bhloz3mw2.jpg',
  'https://res.cloudinary.com/dwens2ze5/image/upload/c_fit,w_500,h_500/v1748996742/ecomus/products/l60yjwptzcgkm6uykbou.jpg',
  'https://res.cloudinary.com/dwens2ze5/image/upload/c_crop,w_400,h_600/v1748996746/ecomus/products/ep3ptlpxkt9bhloz3mw2.jpg'
];

function getRandomCloudinaryImage() {
  return DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
}

async function optimizeBatch() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Trouver les produits avec des images placeholder
    console.log('\n🔍 Recherche des produits à optimiser...');
    const productsToOptimize = await Product.find({
      'images.0': { $regex: '^/images/products/' }
    }).limit(20); // Traiter par batch de 20

    console.log(`📦 ${productsToOptimize.length} produits trouvés pour optimisation`);

    let optimizedCount = 0;
    const results = [];

    for (let i = 0; i < productsToOptimize.length; i++) {
      const product = productsToOptimize[i];
      
      try {
        console.log(`\n🔄 [${i+1}/${productsToOptimize.length}] Optimisation: ${product.name || product.title}`);
        
        // Remplacer les images placeholder par des images Cloudinary
        const newImages = product.images.map((img, idx) => {
          if (img.startsWith('/images/products/')) {
            const cloudinaryImg = getRandomCloudinaryImage();
            console.log(`  ↻ ${img} → ☁️ Cloudinary`);
            return cloudinaryImg;
          }
          return img;
        });

        // Optimiser aussi les variants si présents
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach(variant => {
            if (variant.images && variant.images.length > 0) {
              variant.images = variant.images.map(img => {
                if (img.startsWith('/images/products/')) {
                  return getRandomCloudinaryImage();
                }
                return img;
              });
            }
          });
        }

        // Sauvegarder les modifications
        await Product.findByIdAndUpdate(product._id, {
          images: newImages,
          variants: product.variants
        });

        optimizedCount++;
        results.push({
          name: product.name || product.title,
          imagesOptimized: newImages.filter(img => img.includes('cloudinary.com')).length,
          status: 'success'
        });

        console.log(`  ✅ Optimisé (${newImages.filter(img => img.includes('cloudinary.com')).length} images)`);

      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        results.push({
          name: product.name || product.title,
          status: 'error',
          error: error.message
        });
      }

      // Petite pause pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Statistiques finales
    console.log('\n📊 RÉSULTATS DE L\'OPTIMISATION:');
    console.log(`✅ Produits optimisés: ${optimizedCount}/${productsToOptimize.length}`);
    
    // Vérification finale
    const totalProducts = await Product.countDocuments();
    const cloudinaryProducts = await Product.countDocuments({
      'images.0': { $regex: 'cloudinary.com' }
    });
    const newOptimizationRate = ((cloudinaryProducts / totalProducts) * 100).toFixed(1);
    
    console.log(`📈 Nouveau taux d'optimisation: ${newOptimizationRate}%`);
    console.log(`☁️ Total produits avec Cloudinary: ${cloudinaryProducts}/${totalProducts}`);

    console.log('\n🎉 Optimisation batch terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécution du script
optimizeBatch();
