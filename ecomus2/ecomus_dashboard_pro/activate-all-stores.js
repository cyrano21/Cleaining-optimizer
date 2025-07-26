const { MongoClient } = require('mongodb');

async function activateAllStores() {
  const client = new MongoClient('mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('🔗 Connexion MongoDB établie');
    
    const db = client.db('ecomusnext');
    const stores = db.collection('stores');
    
    // Activer toutes les stores qui ont un homeTheme
    const result = await stores.updateMany(
      { homeTheme: { $exists: true, $ne: null } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ ${result.modifiedCount} stores activées`);
    
    // Vérifier le résultat
    const activeCount = await stores.countDocuments({ isActive: true });
    console.log(`📊 Total des stores actives: ${activeCount}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

activateAllStores();
