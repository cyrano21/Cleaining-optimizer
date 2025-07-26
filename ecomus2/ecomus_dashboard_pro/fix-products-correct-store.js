const mongoose = require('mongoose');
require('dotenv').config();

async function fixProductsCorrectStore() {
  try {
    console.log('🔧 Correction de l\'association des produits au bon store...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Modèles flexibles
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Store = mongoose.models.Store || mongoose.model('Store', new mongoose.Schema({}, { strict: false }));
    
    // Trouver le store avec le slug 'boutique-685ba4ab66267b0af88dcf06'
    const targetStore = await Store.findOne({ slug: 'boutique-685ba4ab66267b0af88dcf06' });
    
    if (!targetStore) {
      console.log('❌ Store avec slug boutique-685ba4ab66267b0af88dcf06 non trouvé');
      return;
    }
    
    console.log(`🎯 Store trouvé: ${targetStore.name} (ID: ${targetStore._id})`);
    
    // Compter les produits actuels
    const currentStoreId = '683f9286c77cce00d2b5d370';
    const productsToUpdate = await Product.countDocuments({ storeId: currentStoreId });
    console.log(`📊 Produits à réassocier: ${productsToUpdate}`);
    
    // Mettre à jour tous les produits pour les associer au bon store
    const result = await Product.updateMany(
      { storeId: currentStoreId },
      { $set: { storeId: targetStore._id.toString() } }
    );
    
    console.log(`✅ ${result.modifiedCount} produits réassociés au store ${targetStore.name}`);
    
    // Vérification
    const verifyCount = await Product.countDocuments({ storeId: targetStore._id.toString() });
    console.log(`🔍 Vérification: ${verifyCount} produits maintenant associés au store ${targetStore._id}`);
    
    // Afficher quelques exemples
    console.log('\n📋 Exemples de produits mis à jour:');
    const sampleProducts = await Product.find({ storeId: targetStore._id.toString() }).limit(3).lean();
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - storeId: ${product.storeId}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixProductsCorrectStore();