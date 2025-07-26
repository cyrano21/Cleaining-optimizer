const mongoose = require('mongoose');
const User = require('./src/models/User');
const Store = require('./src/models/Store');

// Charger les variables d'environnement
require('dotenv').config();

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

async function fixStoreOwner() {
  try {
    await connectToDatabase();

    // Trouver l'utilisateur vendor@example.com
    const user = await User.findOne({ email: 'vendor@example.com' });
    if (!user) {
      console.log('❌ Utilisateur vendor@example.com non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', user.email, 'ID:', user._id);

    // Chercher un store existant avec ce vendor
    let store = await Store.findOne({ vendor: user._id });
    
    if (store) {
      // Mettre à jour le champ owner
      store.owner = user._id;
      await store.save();
      console.log('✅ Store mis à jour avec le champ owner:', store.name);
    } else {
      // Créer un nouveau store
      store = new Store({
        name: 'Ma Boutique Test',
        slug: 'ma-boutique-test',
        description: 'Boutique de démonstration pour tester les fonctionnalités vendeur',
        owner: user._id,
        vendor: user._id,
        homeTheme: 'default',
        homeTemplate: 'default',
        homeName: 'Ma Boutique Test',
        homeDescription: 'Boutique de démonstration',
        isActive: true,
        status: 'active',
        vendorStatus: 'approved'
      });
      await store.save();
      console.log('✅ Nouveau store créé avec owner:', store.name);
    }

    // Vérifier que le store est bien trouvé avec owner
    const verifyStore = await Store.findOne({ owner: user._id });
    if (verifyStore) {
      console.log('✅ Vérification réussie - Store trouvé avec owner:', verifyStore.name);
    } else {
      console.log('❌ Erreur - Store non trouvé avec owner');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de la base de données');
  }
}

fixStoreOwner();