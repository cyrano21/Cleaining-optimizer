const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard2';

async function initTestUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Supprimer les anciens utilisateurs de test
    await usersCollection.deleteMany({
      email: { $in: ['admin@ecomus.com', 'vendor1@ecomus.com', 'client@ecomus.com'] }
    });
    
    // Hasher les mots de passe
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedVendorPassword = await bcrypt.hash('vendor123', 10);
    const hashedClientPassword = await bcrypt.hash('client123', 10);
    
    // Créer les utilisateurs de test
    const testUsers = [
      {
        name: 'Administrator',
        email: 'admin@ecomus.com',
        password: hashedAdminPassword,
        role: 'admin',
        isEmailVerified: true,
        avatar: '',
        phoneNumber: '+1234567890',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '12345',
          country: 'Admin Country'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vendor User',
        email: 'vendor1@ecomus.com',
        password: hashedVendorPassword,
        role: 'vendor',
        isEmailVerified: true,
        avatar: '',
        phoneNumber: '+1234567891',
        storeId: 'store_vendor_1',
        address: {
          street: '456 Vendor Street',
          city: 'Vendor City',
          state: 'Vendor State',
          zipCode: '67890',
          country: 'Vendor Country'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client User',
        email: 'client@ecomus.com',
        password: hashedClientPassword,
        role: 'user',
        isEmailVerified: true,
        avatar: '',
        phoneNumber: '+1234567892',
        address: {
          street: '789 Client Street',
          city: 'Client City',
          state: 'Client State',
          zipCode: '11111',
          country: 'Client Country'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insérer les utilisateurs
    const result = await usersCollection.insertMany(testUsers);
    console.log(`✅ ${result.insertedCount} utilisateurs de test créés`);
    
    // Afficher les informations de connexion
    console.log('\n🔐 UTILISATEURS DE TEST CRÉÉS:');
    console.log('================================');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@ecomus.com');
    console.log('   Mot de passe: admin123');
    console.log('\n🏪 VENDOR:');
    console.log('   Email: vendor1@ecomus.com');
    console.log('   Mot de passe: vendor123');
    console.log('\n👤 CLIENT:');
    console.log('   Email: client@ecomus.com');
    console.log('   Mot de passe: client123');
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  initTestUsers().then(() => {
    console.log('✅ Initialisation terminée');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  });
}

module.exports = { initTestUsers };
