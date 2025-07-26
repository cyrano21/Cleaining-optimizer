require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupIndexes() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer la collection products et ses index
    console.log('🗑️ Suppression de la collection products...');
    await mongoose.connection.db.collection('products').drop().catch(() => {
      console.log('ℹ️ Collection products n\'existe pas encore');
    });
    
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

cleanupIndexes();
