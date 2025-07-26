// Script pour tester la disponibilité des stores
// Usage: npx tsx test-stores-availability.ts

import connectDB from './src/lib/mongodb';
import Store from './src/models/Store';

async function testStoresAvailability() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectDB();
    console.log('✅ Connecté à MongoDB');

    // Compter le total de stores
    const totalCount = await Store.countDocuments();
    console.log(`📊 Total stores: ${totalCount}`);

    // Compter les stores actives
    const activeCount = await Store.countDocuments({ isActive: true });
    console.log(`✅ Stores actives: ${activeCount}`);

    // Compter les stores inactives
    const inactiveCount = await Store.countDocuments({ isActive: false });
    console.log(`❌ Stores inactives: ${inactiveCount}`);

    // Lister quelques stores pour les tests
    const stores = await Store.find({}).limit(5).select('name slug isActive status homeTheme createdAt');
    
    if (stores.length > 0) {
      console.log('\n🏪 Exemples de stores:');
      stores.forEach((store, index) => {
        console.log(`\n${index + 1}. ${store.name}`);
        console.log(`   Slug: ${store.slug}`);
        console.log(`   Active: ${store.isActive ? '✅' : '❌'}`);
        console.log(`   Status: ${store.status || 'N/A'}`);
        console.log(`   Thème: ${store.homeTheme || 'N/A'}`);
        console.log(`   URL Admin: http://localhost:3001/preview/store/${store.slug}`);
      });

      console.log('\n🧪 URLs de test pour admin:');
      stores.slice(0, 3).forEach((store) => {
        console.log(`   • http://localhost:3001/preview/store/${store.slug}`);
      });
    } else {
      console.log('\n❌ Aucune store trouvée');
      console.log('💡 Créez des stores via: http://localhost:3001/admin/stores-management');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

testStoresAvailability();
