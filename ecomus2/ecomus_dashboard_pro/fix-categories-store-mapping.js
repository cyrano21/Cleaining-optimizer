const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour corriger le mapping des catégories
const fixCategoriesStoreMapping = async () => {
  try {
    console.log('🔧 Correction du mapping catégories/stores...');
    
    // Récupérer les stores réels
    const stores = await mongoose.connection.db.collection('stores')
      .find({ isActive: true })
      .toArray();
    
    if (stores.length === 0) {
      console.log('❌ Aucun store actif trouvé');
      return;
    }
    
    console.log(`📋 ${stores.length} stores actifs trouvés:`);
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name} (${store._id})`);
    });
    
    // Récupérer les catégories orphelines
    const orphanCategories = await mongoose.connection.db.collection('categories')
      .find({ 
        storeId: { $in: ['store1', 'store2'] } 
      })
      .toArray();
    
    console.log(`\n🔍 ${orphanCategories.length} catégories orphelines trouvées`);
    
    if (orphanCategories.length === 0) {
      console.log('✅ Aucune catégorie orpheline à corriger');
      return;
    }
    
    // Mapping intelligent des catégories
    const categoryMapping = {
      // Catégories électronique -> premier store tech/général
      'store1': stores[0]._id.toString(), // Assigner au premier store
      // Catégories vêtements -> deuxième store ou premier si un seul
      'store2': stores.length > 1 ? stores[1]._id.toString() : stores[0]._id.toString()
    };
    
    console.log('\n🔄 Mapping des catégories:');
    console.log(`   store1 -> ${categoryMapping.store1} (${stores[0].name})`);
    if (stores.length > 1) {
      console.log(`   store2 -> ${categoryMapping.store2} (${stores[1].name})`);
    }
    
    // Appliquer les corrections
    let updatedCount = 0;
    
    for (const [oldStoreId, newStoreId] of Object.entries(categoryMapping)) {
      const result = await mongoose.connection.db.collection('categories')
        .updateMany(
          { storeId: oldStoreId },
          { $set: { storeId: newStoreId } }
        );
      
      console.log(`\n✅ Catégories ${oldStoreId} -> ${newStoreId}: ${result.modifiedCount} mises à jour`);
      updatedCount += result.modifiedCount;
    }
    
    console.log(`\n🎉 Total: ${updatedCount} catégories corrigées`);
    
    // Vérifier le résultat
    console.log('\n📊 Vérification post-correction:');
    
    for (const store of stores) {
      const storeId = store._id.toString();
      const categoriesCount = await mongoose.connection.db.collection('categories')
        .countDocuments({ storeId: storeId });
      
      console.log(`🏪 ${store.name}: ${categoriesCount} catégories`);
      
      if (categoriesCount > 0) {
        const categories = await mongoose.connection.db.collection('categories')
          .find({ storeId: storeId })
          .toArray();
        
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.slug})`);
        });
      }
    }
    
    // Vérifier s'il reste des catégories orphelines
    const remainingOrphans = await mongoose.connection.db.collection('categories')
      .find({ 
        storeId: { $in: ['store1', 'store2'] } 
      })
      .toArray();
    
    if (remainingOrphans.length > 0) {
      console.log(`\n⚠️ ${remainingOrphans.length} catégories orphelines restantes`);
    } else {
      console.log('\n✅ Toutes les catégories orphelines ont été corrigées');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await fixCategoriesStoreMapping();
  
  console.log('\n✅ Correction terminée');
  process.exit(0);
};

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

// Exécution
main();