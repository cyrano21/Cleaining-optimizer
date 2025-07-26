// Test rapide de la base de données
const mongoose = require('mongoose');
require('dotenv').config();

async function quickTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus');
    console.log('🔗 Connexion MongoDB OK');
    
    // Schémas simples
    const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users' }));
    const Store = mongoose.model('Store', new mongoose.Schema({}, { collection: 'stores' }));
    
    // Compter
    const userCount = await User.countDocuments();
    const storeCount = await Store.countDocuments();
    const storesWithOwner = await Store.countDocuments({ ownerId: { $exists: true } });
    
    console.log(`👥 Utilisateurs: ${userCount}`);
    console.log(`🏪 Boutiques total: ${storeCount}`);
    console.log(`🏪 Boutiques avec propriétaire: ${storesWithOwner}`);
    console.log(`🏪 Boutiques sans propriétaire: ${storeCount - storesWithOwner}`);
    
    // Afficher quelques utilisateurs
    const users = await User.find({}).limit(3);
    console.log('\n👥 Utilisateurs:');
    users.forEach(user => {
      console.log(`   ${user.email || user.name || user._id} (${user.role || 'no role'})`);
    });
    
    // Afficher quelques boutiques
    const stores = await Store.find({}).limit(3);
    console.log('\n🏪 Boutiques:');
    stores.forEach(store => {
      console.log(`   ${store.name} (${store.slug}) - Owner: ${store.ownerId || 'NONE'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

quickTest();
