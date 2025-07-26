const mongoose = require('mongoose');
require('dotenv').config();

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check stores
    const stores = await mongoose.connection.db.collection('stores').find({ isActive: true }).toArray();
    console.log(`Active stores: ${stores.length}`);
    
    // Check categories
    const categories = await mongoose.connection.db.collection('categories').find({ status: 'active' }).toArray();
    console.log(`Active categories: ${categories.length}`);
    
    // Check mapping
    for (const store of stores.slice(0, 2)) {
      const storeCategories = await mongoose.connection.db.collection('categories')
        .find({ storeId: store._id.toString(), status: 'active' }).toArray();
      console.log(`Store ${store.name}: ${storeCategories.length} categories`);
      storeCategories.forEach(cat => console.log(`  - ${cat.name}`));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

main();