require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Collection = require('./models/Collection');

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const count = await Collection.countDocuments();
    console.log(`📊 Collections in database: ${count}`);
    
    if (count > 0) {
      const collections = await Collection.find({}).select('title featured status');
      console.log('\n📋 Collections list:');
      collections.forEach((col, index) => {
        console.log(`${index + 1}. ${col.title} ${col.featured ? '⭐' : ''} (${col.status})`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickCheck();