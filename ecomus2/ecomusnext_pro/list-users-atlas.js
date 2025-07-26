const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority";

// Schéma User simplifié pour la lecture
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  password: String,
  createdAt: Date
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    const users = await User.find({}, 'name email role createdAt');
    
    console.log(`\n📊 ${users.length} utilisateur(s) trouvé(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Pas de nom'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Rôle: ${user.role || 'Pas de rôle'}`);
      console.log(`   📅 Créé: ${user.createdAt || 'Date inconnue'}`);
      console.log('');
    });

    // Vérifier spécifiquement louiscyrano
    const louisUser = await User.findOne({ email: 'louiscyrano@gmail.com' });
    if (louisUser) {
      console.log('🎯 Utilisateur louiscyrano trouvé:');
      console.log(`   📧 Email: ${louisUser.email}`);
      console.log(`   👤 Rôle: ${louisUser.role}`);
      console.log(`   🔒 Mot de passe hashé: ${louisUser.password ? 'Oui' : 'Non'}`);
    } else {
      console.log('❌ Utilisateur louiscyrano@gmail.com non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

listUsers();
