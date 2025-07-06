const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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

async function checkCloudinaryStatus() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // Statistiques générales
    const totalProducts = await Product.countDocuments();
    
    // Produits avec images Cloudinary
    const cloudinaryProducts = await Product.countDocuments({
      'images.0': { $regex: 'cloudinary.com' }
    });
    
    // Produits avec placeholders
    const placeholderProducts = await Product.countDocuments({
      'images.0': { $regex: '^/images/products/' }
    });
    
    // Produits avec variants Cloudinary
    const variantsCloudinaryProducts = await Product.countDocuments({
      'variants.images.0': { $regex: 'cloudinary.com' }
    });
    
    // Échantillon de produits avec Cloudinary
    const sampleCloudinary = await Product.find({
      'images.0': { $regex: 'cloudinary.com' }
    }).limit(3).select('name title images');
    
    // Échantillon de produits avec placeholders
    const samplePlaceholders = await Product.find({
      'images.0': { $regex: '^/images/products/' }
    }).limit(3).select('name title images');
    
    console.log('\n📊 STATISTIQUES CLOUDINARY:');
    console.log(`📦 Total produits: ${totalProducts}`);
    console.log(`☁️ Avec Cloudinary: ${cloudinaryProducts}`);
    console.log(`🎨 Variants avec Cloudinary: ${variantsCloudinaryProducts}`);
    console.log(`🖼️ Avec placeholders: ${placeholderProducts}`);
    console.log(`📈 Taux optimisation: ${((cloudinaryProducts / totalProducts) * 100).toFixed(1)}%`);
    
    console.log('\n🔍 ÉCHANTILLON PRODUITS CLOUDINARY:');
    sampleCloudinary.forEach(product => {
      console.log(`- ${product.name || product.title}: ${product.images[0]}`);
    });
    
    console.log('\n🖼️ ÉCHANTILLON PRODUITS PLACEHOLDER:');
    samplePlaceholders.forEach(product => {
      console.log(`- ${product.name || product.title}: ${product.images[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('💡 Vérifiez que MongoDB est accessible et que MONGODB_URI est correctement configuré');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécution du script
checkCloudinaryStatus();
