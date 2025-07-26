const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

async function createUserAccount() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Utilisateur avec les identifiants fournis
    const userData = {
      name: "Louis Cyrano",
      email: "louiscyrano@gmail.com",
      password: "Figoro21",
      role: "super_admin",
      avatar: "/images/avatar.webp"
    };

    console.log('🔐 Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Supprimer l'utilisateur existant s'il existe
    await User.deleteOne({ email: userData.email });
    
    // Créer le nouvel utilisateur
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });

    await newUser.save();
    console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
    
    console.log('\n🎉 Création terminée !');
    console.log(`\n📋 Compte créé:\n👑 ${userData.name}: ${userData.email} / ${userData.password}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

createUserAccount();
