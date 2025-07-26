const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const Category = require('./scripts/models/Category.js');

async function listCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const categories = await Category.find({}, 'name slug isActive storeId');
    console.log(`\n📂 Categories trouvées (${categories.length}):`);
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. "${cat.name}" (slug: ${cat.slug}) - Active: ${cat.isActive} - Store: ${cat.storeId}`);
    });

    console.log('\n✅ Liste terminée');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

listCategories();