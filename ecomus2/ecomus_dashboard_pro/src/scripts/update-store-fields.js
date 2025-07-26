// Script pour mettre à jour la boutique existante avec les champs manquants
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard';

async function updateStoreFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Mettre à jour toutes les boutiques qui n'ont pas les champs logo et banner
    const result = await mongoose.connection.db.collection('stores').updateMany(
      {
        $or: [
          { logo: { $exists: false } },
          { banner: { $exists: false } },
          { logo: null },
          { banner: null }
        ]
      },
      {
        $set: {
          logo: '',
          banner: '',
          // Ajouter d'autres champs manquants si nécessaire
          'contact.email': '',
          'contact.phone': '',
          socialMedia: {}
        }
      }
    );

    console.log(`🔄 ${result.modifiedCount} boutique(s) mise(s) à jour`);

    // Vérifier le résultat
    const stores = await mongoose.connection.db.collection('stores').find({}).toArray();
    console.log('\n📋 Boutiques après mise à jour:');
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   - Logo: ${store.logo || 'VIDE'}`);
      console.log(`   - Banner: ${store.banner || 'VIDE'}`);
      console.log(`   - Status: ${store.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

updateStoreFields();
