const mongoose = require('mongoose');
const User = require('../src/models/User.ts');
const Role = require('../src/models/Role.ts');
const Store = require('../src/models/Store');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
}

async function setupVendorUser() {
  try {
    await connectToDatabase();

    // 1. S'assurer qu'un rôle vendeur existe
    let vendorRole = await Role.findOne({ name: 'vendor' });
    if (!vendorRole) {
      vendorRole = new Role({
        name: 'vendor',
        description: 'Vendeur - Peut gérer ses produits et commandes',
        permissions: [
          'products.create',
          'products.read',
          'products.update',
          'products.delete',
          'orders.read',
          'orders.update',
          'analytics.read'
        ]
      });
      await vendorRole.save();
      console.log('✅ Rôle vendeur créé');
    }

    // 2. Trouver ou créer un utilisateur test
    let testUser = await User.findOne({ email: 'vendor@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Vendeur Test',
        email: 'vendor@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewNePLxgNkDhQFB2', // "password"
        role: vendorRole._id,
        emailVerified: new Date(),
        isActive: true,
        profile: {
          firstName: 'Vendeur',
          lastName: 'Test',
          phone: '+33123456789'
        }
      });
      await testUser.save();
      console.log('✅ Utilisateur vendeur test créé');
    } else {
      // Mettre à jour le rôle s'il n'est pas déjà vendeur
      if (testUser.role?.toString() !== vendorRole._id.toString()) {
        testUser.role = vendorRole._id;
        await testUser.save();
        console.log('✅ Rôle vendeur attribué à l\'utilisateur existant');
      }
    }

    // 3. Créer une boutique pour le vendeur
    let vendorStore = await Store.findOne({ vendor: testUser._id });
    if (!vendorStore) {
      vendorStore = new Store({
        name: 'Ma Boutique Test',
        slug: 'ma-boutique-test',
        description: 'Boutique de démonstration pour tester les fonctionnalités vendeur',
        vendor: testUser._id,
        settings: {
          currency: 'EUR',
          language: 'fr',
          timezone: 'Europe/Paris'
        },
        contact: {
          email: 'vendor@example.com',
          phone: '+33123456789'
        },
        isActive: true
      });
      await vendorStore.save();
      console.log('✅ Boutique créée pour le vendeur');

      // Associer la boutique à l'utilisateur
      testUser.store = vendorStore._id;
      await testUser.save();
    }

    // 4. Attribuer le rôle vendeur à tous les utilisateurs existants pour les tests
    const allUsers = await User.find({ role: { $exists: false } });
    for (const user of allUsers) {
      user.role = vendorRole._id;
      await user.save();
      console.log(`✅ Rôle vendeur attribué à: ${user.email}`);
    }

    console.log('🎉 Configuration vendeur terminée !');
    console.log(`📧 Email: vendor@example.com`);
    console.log(`🔑 Mot de passe: password`);

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

setupVendorUser();
