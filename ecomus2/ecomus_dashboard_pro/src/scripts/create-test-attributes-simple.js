// Simple script to create test attributes
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = 'mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define schemas
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String,
}, { timestamps: true });

const AttributeSchema = new mongoose.Schema({
  category: String,
  value: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Attribute = mongoose.models.Attribute || mongoose.model('Attribute', AttributeSchema);

async function createTestAttributes() {
  try {
    await connectDB();

    // Find an admin user or any user
    let testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      testUser = await User.findOne();
    }
    
    if (!testUser) {
      console.log('Créons un utilisateur de test...');
      testUser = new User({
        email: 'admin@test.com',
        name: 'Admin Test',
        role: 'admin',
        password: 'hashed_password',
      });
      await testUser.save();
    }

    console.log(`Utilisation de l'utilisateur: ${testUser.name}`);

    // Sample attributes data
    const sampleAttributes = [
      {
        category: 'Color',
        value: 'Red, Blue, Green, Yellow, Black, White',
        description: 'Available colors for products',
        createdBy: testUser._id,
      },
      {
        category: 'Size',
        value: 'XS, S, M, L, XL, XXL',
        description: 'Clothing sizes',
        createdBy: testUser._id,
      },
      {
        category: 'Material',
        value: 'Cotton, Polyester, Wool, Silk, Leather',
        description: 'Product materials',
        createdBy: testUser._id,
      },
      {
        category: 'Style',
        value: 'Classic, Modern, Vintage, Casual, Formal',
        description: 'Product styles',
        createdBy: testUser._id,
      },
      {
        category: 'Brand',
        value: 'Nike, Adidas, Puma, Reebok, Under Armour',
        description: 'Available brands',
        createdBy: testUser._id,
      },
      {
        category: 'Storage',
        value: '16GB, 32GB, 64GB, 128GB, 256GB, 512GB',
        description: 'Storage capacities for electronic devices',
        createdBy: testUser._id,
      },
      {
        category: 'Screen Size',
        value: '5.5", 6.1", 6.5", 6.7", 7.0"',
        description: 'Screen sizes for mobile devices',
        createdBy: testUser._id,
      },
      {
        category: 'Weight',
        value: '1kg, 2kg, 3kg, 5kg, 10kg',
        description: 'Product weights',
        createdBy: testUser._id,
      },
    ];

    // Clear existing test attributes
    await Attribute.deleteMany({ createdBy: testUser._id });
    console.log('Attributs existants supprimés');

    // Insert new attributes
    const createdAttributes = await Attribute.insertMany(sampleAttributes);
    console.log(`${createdAttributes.length} attributs créés avec succès:`);

    createdAttributes.forEach((attr, index) => {
      console.log(`${index + 1}. ${attr.category}: ${attr.value}`);
    });

    console.log('\n✅ Script terminé avec succès');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestAttributes();
