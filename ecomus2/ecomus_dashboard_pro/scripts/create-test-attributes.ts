import { connectDB } from '../src/lib/mongodb';
import Attribute from '../src/models/Attribute';
import User from '../src/models/User';

async function createTestAttributes() {
  try {
    await connectDB();
    console.log('Connexion à MongoDB établie');

    // Find an admin user or create a test user
    let testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      testUser = await User.findOne();
    }
    
    if (!testUser) {
      console.log('Aucun utilisateur trouvé. Créons un utilisateur de test...');
      testUser = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        password: 'hashedpassword', // In real app, this would be properly hashed
      });
      await testUser.save();
    }

    console.log(`Utilisation de l'utilisateur: ${testUser.name} (${testUser.email})`);

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
      {
        category: 'Power',
        value: '100W, 200W, 500W, 1000W, 1500W',
        description: 'Power ratings for electrical appliances',
        createdBy: testUser._id,
      },
      {
        category: 'Warranty',
        value: '6 months, 1 year, 2 years, 3 years, 5 years',
        description: 'Warranty periods',
        createdBy: testUser._id,
      },
    ];

    // Delete existing test attributes to avoid duplicates
    await Attribute.deleteMany({ createdBy: testUser._id });
    console.log('Attributs de test existants supprimés');

    // Insert new attributes
    const createdAttributes = await Attribute.insertMany(sampleAttributes);
    console.log(`${createdAttributes.length} attributs de test créés avec succès`);

    // Display created attributes
    createdAttributes.forEach((attr, index) => {
      console.log(`${index + 1}. ${attr.category}: ${attr.value}`);
    });

    console.log('\n✅ Création des attributs de test terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création des attributs de test:', error);
    process.exit(1);
  }
}

createTestAttributes();
