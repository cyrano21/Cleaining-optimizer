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

// Utilisateurs de test
const testUsers = [
  {
    name: "Super Admin",
    email: "admin@ecomus.com",
    password: "admin123",
    role: "admin",
    avatar: "/images/avatar.webp"
  },
  {
    name: "Vendeur Test",
    email: "vendor@ecomus.com", 
    password: "vendor123",
    role: "vendor",
    avatar: "/images/avatar.webp"
  },
  {
    name: "Client Test",
    email: "user@ecomus.com",
    password: "user123", 
    role: "user",
    avatar: "/images/avatar.webp"
  }
];

async function initUsers() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les utilisateurs existants (optionnel)
    console.log('🗑️ Suppression des utilisateurs existants...');
    await User.deleteMany({});

    // Créer les nouveaux utilisateurs avec mots de passe hashés
    console.log('👤 Création des utilisateurs de test...');
    
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Initialisation terminée !');
    console.log('\n📋 Comptes de test créés:');
    console.log('👑 Admin: admin@ecomus.com / admin123');
    console.log('🏪 Vendeur: vendor@ecomus.com / vendor123');
    console.log('👤 Client: user@ecomus.com / user123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
initUsers();
