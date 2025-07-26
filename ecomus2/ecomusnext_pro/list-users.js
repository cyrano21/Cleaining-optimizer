require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n👥 Récupération des utilisateurs...');
    const users = await User.find({}, 'name email role createdAt');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
    } else {
      console.log(`\n📊 ${users.length} utilisateur(s) trouvé(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sans nom'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Rôle: ${user.role || 'user'}`);
        console.log(`   📅 Créé: ${user.createdAt || 'Date inconnue'}`);
        console.log('   ─────────────────────');
      });
      
      // Vérifier spécifiquement louiscyrano
      const louisUser = users.find(u => u.email === 'louiscyrano@gmail.com');
      if (louisUser) {
        console.log(`\n✅ Utilisateur louiscyrano trouvé avec le rôle: ${louisUser.role}`);
      } else {
        console.log('\n❌ Utilisateur louiscyrano@gmail.com non trouvé');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

listUsers();
