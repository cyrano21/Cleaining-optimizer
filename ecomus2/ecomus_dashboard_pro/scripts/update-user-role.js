const mongoose = require('mongoose');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Schéma utilisateur simplifié
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  storeId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function updateUserRole() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🔄 Mise à jour du rôle utilisateur...');
    const result = await User.updateOne(
      { email: 'louiscyrano@gmail.com' },
      { role: 'super_admin' }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Rôle mis à jour avec succès: louiscyrano@gmail.com → super_admin');
      
      // Vérifier la mise à jour
      const updatedUser = await User.findOne({ email: 'louiscyrano@gmail.com' });
      console.log('\n📋 Informations utilisateur mises à jour:');
      console.log(`   👤 Nom: ${updatedUser.name}`);
      console.log(`   📧 Email: ${updatedUser.email}`);
      console.log(`   🔰 Rôle: ${updatedUser.role}`);
      console.log(`   🟢 Actif: ${updatedUser.isActive ? 'Oui' : 'Non'}`);
    } else {
      console.log('❌ Aucune modification effectuée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

updateUserRole();
