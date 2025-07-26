const { MongoClient } = require('mongodb');
const fs = require('fs');

// Log function qui écrit dans un fichier
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('seed-log.txt', logMessage);
  console.log(message);
}

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://louiscyrano:7b0af88dcf06@cluster0.mongodb.net/ecomus?retryWrites=true&w=majority';
const client = new MongoClient(MONGODB_URI);

// Données de seed simplifiées
const seedData = {
  categories: [
    {
      _id: 'cat-1',
      name: 'Vêtements',
      slug: 'vetements',
      description: 'Collection de vêtements écologiques',
      isActive: true
    },
    {
      _id: 'cat-2',
      name: 'Accessoires', 
      slug: 'accessoires',
      description: 'Accessoires de mode durables',
      isActive: true
    }
  ],
  
  sampleProducts: [
    {
      _id: 'prod-1',
      name: 'T-shirt Bio Coton',
      slug: 'tshirt-bio-coton',
      price: 29.99,
      category: 'cat-1',
      inStock: true
    },
    {
      _id: 'prod-2',
      name: 'Sac à Main Recyclé',
      slug: 'sac-main-recycle', 
      price: 79.99,
      category: 'cat-2',
      inStock: true
    }
  ],
  
  navLinks: [
    { _id: 'nav-1', title: 'Accueil', url: '/', order: 1, isActive: true },
    { _id: 'nav-2', title: 'Boutique', url: '/shop', order: 2, isActive: true }
  ],
  
  socialLinks: [
    { _id: 'social-1', platform: 'Facebook', url: 'https://facebook.com/maboutique', isActive: true },
    { _id: 'social-2', platform: 'Instagram', url: 'https://instagram.com/maboutique', isActive: true }
  ]
};

async function seedStoreData() {
  try {
    log('🔗 Connexion à MongoDB...');
    await client.connect();
    log('✅ Connecté à MongoDB');

    const db = client.db();
    const storesCollection = db.collection('stores');

    // Lister toutes les stores
    log('🔍 Recherche des stores...');
    const allStores = await storesCollection.find({}).toArray();
    log(`📊 Nombre de stores trouvées: ${allStores.length}`);
    
    if (allStores.length === 0) {
      log('❌ Aucune store trouvée');
      return;
    }

    // Utiliser la première store
    const store = allStores[0];
    log(`🏪 Utilisation de la store: ${store.name || 'Sans nom'} (${store.slug || 'Sans slug'})`);

    // Préparer les données de mise à jour
    const updateData = {
      categories: seedData.categories,
      sampleProducts: seedData.sampleProducts,
      navLinks: seedData.navLinks,
      socialLinks: seedData.socialLinks,
      
      // Métriques
      'metrics.totalProducts': seedData.sampleProducts.length,
      'metrics.totalOrders': 50,
      'metrics.totalRevenue': 2500.00,
      
      // Analytics
      'analytics.visitorsCount': 1200,
      'analytics.conversionRate': 2.5,
      
      // SEO
      'seo.keywords': ['boutique écologique', 'vêtements bio', 'mode durable'],
      
      updatedAt: new Date()
    };

    log('📝 Mise à jour de la store...');
    const result = await storesCollection.updateOne(
      { _id: store._id },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      log('✅ Store mise à jour avec succès!');
      log(`📊 Données ajoutées: ${seedData.categories.length} catégories, ${seedData.sampleProducts.length} produits`);
    } else {
      log('⚠️ Aucune modification apportée');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`);
    log(`Stack: ${error.stack}`);
  } finally {
    await client.close();
    log('🔌 Connexion fermée');
  }
}

// Initialiser le fichier de log
fs.writeFileSync('seed-log.txt', `=== SEED LOG - ${new Date().toISOString()} ===\n`);

// Exécuter le script
seedStoreData().catch(error => {
  log(`❌ Erreur fatale: ${error.message}`);
});