const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function activateBySlug() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const slugsToActivate = [
    'cosmetiques-beaute', 
    'electronique-high-tech', 
    'mobilier-decoration', 
    'alimentation-gourmet', 
    'bebe-enfant',
    'accessoires-mode',
    'meubles-salon',
    'baskets-sneakers'
  ];
  
  console.log('🚀 Activation de stores par slug...');
  
  for (const slug of slugsToActivate) {
    const result = await db.collection('stores').updateOne(
      { slug },
      { $set: { isActive: true, activatedAt: new Date(), status: 'active' } }
    );
    console.log(`${result.modifiedCount > 0 ? '✅' : '❌'} ${slug}`);
  }
  
  const activeCount = await db.collection('stores').countDocuments({ isActive: true });
  console.log(`\n📊 Total stores actives: ${activeCount}`);
  
  // Lister les stores actives
  const activeStores = await db.collection('stores').find({ isActive: true }).toArray();
  console.log('\n🛍️ Stores actives:');
  activeStores.forEach(store => {
    console.log(`- ${store.name} (${store.slug})`);
  });
  
  await client.close();
}

activateBySlug().catch(console.error);
