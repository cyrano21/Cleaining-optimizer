const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Schema simplifié pour les tests
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

async function testApis() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // Test 1: Statistiques générales
    console.log('\n📊 TEST 1: STATISTIQUES GÉNÉRALES');
    const totalProducts = await Product.countDocuments();
    console.log(`📦 Total produits: ${totalProducts}`);
    
    // Test 2: Produits avec Cloudinary
    console.log('\n☁️ TEST 2: PRODUITS CLOUDINARY');
    const cloudinaryProducts = await Product.countDocuments({
      'images.0': { $regex: 'cloudinary.com' }
    });
    console.log(`☁️ Avec Cloudinary: ${cloudinaryProducts}`);
    
    // Test 3: Produits avec placeholders
    console.log('\n🖼️ TEST 3: PRODUITS PLACEHOLDER');
    const placeholderProducts = await Product.countDocuments({
      'images.0': { $regex: '^/images/products/' }
    });
    console.log(`🖼️ Avec placeholders: ${placeholderProducts}`);
    
    // Test 4: Échantillon de produits
    console.log('\n🔍 TEST 4: ÉCHANTILLON PRODUITS');
    const sampleProducts = await Product.find({})
      .limit(5)
      .select('name title images');
      
    sampleProducts.forEach(product => {
      const hasCloudinary = product.images[0]?.includes('cloudinary.com');
      console.log(`- ${product.name || product.title}: ${hasCloudinary ? '☁️' : '🖼️'} ${product.images[0]}`);
    });
    
    // Test 5: Calcul du taux d'optimisation
    console.log('\n📊 TEST 5: TAUX D\'OPTIMISATION');
    const optimizationRate = totalProducts > 0 ? ((cloudinaryProducts / totalProducts) * 100).toFixed(1) : 0;
    console.log(`📈 Taux optimisation: ${optimizationRate}%`);
    
    // Test 6: Données pour l'API
    console.log('\n🔌 TEST 6: FORMAT DONNÉES API');
    const apiResponse = {
      totalProducts,
      cloudinaryImages: cloudinaryProducts,
      placeholderImages: placeholderProducts,
      optimizationRate: parseFloat(optimizationRate),
      productsWithCloudinary: cloudinaryProducts,
      lastUpdated: new Date().toISOString()
    };
    console.log('📋 Réponse API:', JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('💡 Vérifiez que MongoDB est accessible');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécution des tests
testApis();
