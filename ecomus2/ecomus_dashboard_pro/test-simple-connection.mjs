import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  try {
    console.log('🔌 Test de connexion MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;
    console.log('URI:', mongoUri ? 'Définie' : 'Non définie');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connexion OK');
    
    // Test simple: lister les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Test simple: compter les utilisateurs
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log('👥 Nombre d\'utilisateurs:', userCount);
    
    // Test simple: récupérer un utilisateur
    const user = await mongoose.connection.db.collection('users').findOne();
    console.log('👤 Premier utilisateur:', user ? user.email : 'Aucun');
    
    console.log('✅ Tous les tests OK');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté');
  }
}

testConnection();
