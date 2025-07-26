console.log('🔍 Démarrage du script de vérification des stores...');

const mongoose = require('mongoose');

async function checkStores() {
  try {
    console.log('🔌 Tentative de connexion à MongoDB...');
    await mongoose.connect('mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connexion MongoDB réussie');
    
    const Store = mongoose.model('Store', new mongoose.Schema({}, { strict: false }));
    
    const count = await Store.countDocuments({});
    console.log(`📊 Nombre total de stores: ${count}`);
    
    if (count > 0) {
      const stores = await Store.find({}).limit(5).lean();
      console.log('📋 Premières stores:');
      stores.forEach((store, i) => {
        console.log(`  ${i+1}. ${JSON.stringify(store, null, 2).substring(0, 200)}...`);
      });
    }
    
    mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkStores();
