#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connexion à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
}

// Schéma utilisateur (simplifié pour le test)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
}, { timestamps: true });

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testAuth() {
  await connectDB();
  
  console.log('🔍 Test de l\'authentification...\n');
  
  // 1. Vérifier si l'utilisateur existe
  const user = await User.findOne({ email: 'louiscyrano@gmail.com' });
  
  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return;
  }
  
  console.log('✅ Utilisateur trouvé:');
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Nom: ${user.name}`);
  console.log(`   - Rôle: ${user.role}`);
  console.log(`   - Password hash: ${user.password.substring(0, 20)}...`);
  
  // 2. Tester la comparaison de mot de passe
  console.log('\n🔐 Test de comparaison de mot de passe...');
  
  const testPassword = 'Figoro21';
  const isValid = await user.comparePassword(testPassword);
  
  console.log(`   - Mot de passe testé: ${testPassword}`);
  console.log(`   - Résultat: ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
  
  // 3. Test avec un mauvais mot de passe
  const wrongPassword = 'mauvais123';
  const isWrong = await user.comparePassword(wrongPassword);
  console.log(`   - Mauvais mot de passe: ${wrongPassword}`);
  console.log(`   - Résultat: ${isWrong ? '❌ ERREUR' : '✅ CORRECT (rejeté)'}`);
  
  mongoose.disconnect();
}

testAuth().catch(console.error);
