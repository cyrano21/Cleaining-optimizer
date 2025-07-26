#!/usr/bin/env node

/**
 * Script pour associer un utilisateur à une boutique existante
 * Usage: node associate-user-store.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Schemas simplifiés
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
}, { collection: 'users' });

const StoreSchema = new mongoose.Schema({
  name: String,
  slug: String,
  ownerId: String,
  isActive: Boolean,
}, { collection: 'stores' });

const User = mongoose.model('User', UserSchema);
const Store = mongoose.model('Store', StoreSchema);

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}

async function associateUserToStore() {
  try {
    console.log('🔗 Association utilisateur-boutique');
    console.log('===================================');

    // 1. Trouver les utilisateurs
    const users = await User.find({ role: { $in: ['vendor', 'admin', 'super_admin'] } });
    console.log(`👥 Utilisateurs trouvés: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // 2. Trouver les boutiques sans propriétaire
    const storesWithoutOwner = await Store.find({ ownerId: { $exists: false } });
    console.log(`\n🏪 Boutiques sans propriétaire: ${storesWithoutOwner.length}`);

    // 3. Boutiques avec propriétaire
    const storesWithOwner = await Store.find({ ownerId: { $exists: true } });
    console.log(`🏪 Boutiques avec propriétaire: ${storesWithOwner.length}`);

    if (storesWithoutOwner.length > 0 && users.length > 0) {
      // Associer le premier utilisateur vendor/admin à la première boutique
      const targetUser = users.find(u => u.role === 'vendor') || users[0];
      const targetStore = storesWithoutOwner[0];

      console.log(`\n🎯 Association en cours:`);
      console.log(`   Utilisateur: ${targetUser.email} (${targetUser.role})`);
      console.log(`   Boutique: ${targetStore.name} (${targetStore.slug})`);

      // Mettre à jour la boutique
      await Store.findByIdAndUpdate(targetStore._id, {
        ownerId: targetUser._id.toString()
      });

      console.log(`✅ Association réussie !`);
      console.log(`\n📋 Résultat:`);
      console.log(`   URL boutique: http://localhost:3001/${targetStore.slug}`);
      console.log(`   Dashboard: http://localhost:3000/vendor-dashboard/templates`);
      
      // Vérification
      const updatedStore = await Store.findById(targetStore._id);
      console.log(`\n✓ Vérification: ownerId = ${updatedStore.ownerId}`);
    } else {
      console.log(`\n⚠️ Impossible d'associer:`);
      console.log(`   - Boutiques sans propriétaire: ${storesWithoutOwner.length}`);
      console.log(`   - Utilisateurs disponibles: ${users.length}`);
    }

    // Afficher un résumé final
    console.log(`\n📊 Résumé final:`);
    const finalStoresWithOwner = await Store.find({ ownerId: { $exists: true } });
    console.log(`   Boutiques avec propriétaire: ${finalStoresWithOwner.length}`);
    console.log(`   Boutiques sans propriétaire: ${51 - finalStoresWithOwner.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'association:', error);
  }
}

async function main() {
  await connectDB();
  await associateUserToStore();
  await mongoose.disconnect();
  console.log('\n👋 Déconnexion de MongoDB');
}

// Exécution du script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { associateUserToStore };
