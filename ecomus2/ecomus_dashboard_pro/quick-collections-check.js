const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Schéma simple pour les collections
const collectionSchema = new mongoose.Schema({
  title: String,
  featured: Boolean,
  status: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const categorySchema = new mongoose.Schema({
  name: String
});

const Collection = mongoose.model('Collection', collectionSchema);
const Category = mongoose.model('Category', categorySchema);

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const collections = await Collection.find({}).populate('category');
    console.log(`\nTotal collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\nCollections list:');
      collections.forEach((c, i) => {
        console.log(`${i+1}. ${c.title} - ${c.featured ? 'Featured' : 'Regular'} - ${c.status}`);
      });
      
      const featured = collections.filter(c => c.featured).length;
      const active = collections.filter(c => c.status === 'active').length;
      console.log(`\nStats: ${featured} featured, ${active} active`);
    }
    
    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();