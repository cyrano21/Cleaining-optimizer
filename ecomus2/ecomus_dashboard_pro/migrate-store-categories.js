// migrate-store-categories.js
// Script de migration pour corriger les champs "categories" des documents Store
// Remplace les noms de catégories (string) par leurs ObjectId corrects
// Usage : node migrate-store-categories.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Schéma minimal pour la migration
const CategorySchema = new mongoose.Schema({
  name: String,
}, { collection: 'categories' });
const StoreSchema = new mongoose.Schema({
  categories: [mongoose.Schema.Types.Mixed],
}, { collection: 'stores' });

const Category = mongoose.model('Category', CategorySchema);
const Store = mongoose.model('Store', StoreSchema);

async function migrateCategories() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connecté à MongoDB');

  const stores = await Store.find({});
  let updatedCount = 0;
  for (const store of stores) {
    if (!Array.isArray(store.categories) || store.categories.length === 0) continue;
    let changed = false;
    const newCategories = [];
    for (const cat of store.categories) {
      if (typeof cat === 'string' && cat.length > 0 && !cat.match(/^[0-9a-fA-F]{24}$/)) {
        // Si c'est un nom de catégorie, on cherche l'ObjectId
        const categoryDoc = await Category.findOne({ name: cat });
        if (categoryDoc) {
          newCategories.push(categoryDoc._id);
          changed = true;
        } else {
          console.warn(`⚠️ Catégorie non trouvée pour le nom: "${cat}" dans Store ${store._id}`);
        }
      } else {
        // Déjà un ObjectId ou une valeur correcte
        newCategories.push(cat);
      }
    }
    if (changed) {
      store.categories = newCategories;
      await store.save();
      updatedCount++;
      console.log(`✅ Store ${store._id} mis à jour.`);
    }
  }
  console.log(`🎉 Migration terminée. ${updatedCount} store(s) mis à jour.`);
  await mongoose.disconnect();
}

migrateCategories().catch(err => {
  console.error('💥 Erreur lors de la migration :', err);
  process.exit(1);
});
