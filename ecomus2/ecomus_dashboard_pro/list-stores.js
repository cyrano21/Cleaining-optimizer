const { MongoClient } = require('mongodb');

async function listStores() {
  // Utilise l'URL MongoDB par défaut locale
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
  
  console.log('🔌 Connexion à MongoDB:', uri);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const stores = await db.collection('stores').find({}).toArray();
    
    console.log(`🏪 Nombre de stores trouvées: ${stores.length}`);
    
    if (stores.length > 0) {
      console.log('\n📋 Liste des stores:');
      stores.forEach((store, index) => {
        console.log(`\n${index + 1}. Store: ${store.name}`);
        console.log(`   - Slug: ${store.slug}`);
        console.log(`   - Active: ${store.isActive ? '✅' : '❌'}`);
        console.log(`   - Status: ${store.status || 'N/A'}`);
        console.log(`   - Thème: ${store.homeTheme || 'N/A'}`);
        console.log(`   - Created: ${store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log(`   - URL: http://localhost:3000/preview/store/${store.slug}`);
      });
      
      console.log('\n🔗 URLs de test:');
      stores.slice(0, 3).forEach((store) => {
        console.log(`   • http://localhost:3000/preview/store/${store.slug}`);
      });
    } else {
      console.log('❌ Aucune store trouvée dans la base de données');
      console.log('💡 Suggestion: Créez des stores via le dashboard admin ou importez des données de test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Connexion fermée');
  }
}

listStores().catch(console.error);
