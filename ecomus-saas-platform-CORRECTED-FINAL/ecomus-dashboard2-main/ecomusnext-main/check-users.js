const mongoose = require('mongoose');

async function checkUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus');
    console.log('✅ Connecté à MongoDB');
    
    // Définir le schéma User simple
    const userSchema = new mongoose.Schema({
      email: String,
      role: String,
      name: String
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Chercher tous les utilisateurs
    const users = await User.find({}).select('email role name');
    console.log(`\n📊 Utilisateurs trouvés: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 Liste des utilisateurs:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role} (${user.name || 'Sans nom'})`);
      });
    } else {
      console.log('\n❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Vous devez créer des utilisateurs de test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();