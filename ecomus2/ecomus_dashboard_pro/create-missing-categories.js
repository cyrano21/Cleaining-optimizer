// Script Node.js pour créer automatiquement les catégories manquantes référencées dans les stores
// Utilise process.env.MONGODB_URI (charger .env)

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI manquant dans .env');
  process.exit(1);
}

// Modèle Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Modèle Store (simplifié)
const storeSchema = new mongoose.Schema({
  categories: [{ type: mongoose.Schema.Types.Mixed }],
});
const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);

function slugify(str) {
  return str
    .toString()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  // 1. Récupérer tous les noms de catégories référencés dans les stores (qui ne sont pas des ObjectId)
  const stores = await Store.find({ categories: { $exists: true, $not: { $size: 0 } } });
  const allCategoryNames = new Set();
  for (const store of stores) {
    for (const cat of store.categories) {
      if (typeof cat === 'string') {
        allCategoryNames.add(cat.trim());
      }
    }
  }

  // 2. Vérifier celles qui n'existent pas dans la collection Category
  const missing = [];
  for (const name of allCategoryNames) {
    const exists = await Category.findOne({ name });
    if (!exists) missing.push(name);
  }

  if (missing.length === 0) {
    console.log('🎉 Aucune catégorie manquante à créer.');
    process.exit(0);
  }

  // 3. Créer les catégories manquantes
  let created = 0;
  for (const name of missing) {
    try {
      const slug = slugify(name);
      await Category.create({ name, slug });
      console.log(`✅ Catégorie créée: "${name}" (slug: ${slug})`);
      created++;
    } catch (e) {
      console.error(`❌ Erreur création catégorie "${name}":`, e.message);
    }
  }
  console.log(`🎯 ${created} catégorie(s) créée(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur script:', err);
  process.exit(1);
});
