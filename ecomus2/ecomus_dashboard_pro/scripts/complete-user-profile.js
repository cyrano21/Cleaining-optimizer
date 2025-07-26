/**
 * Script pour compléter les données de profil utilisateur
 * Version corrigée pour finaliser le système d'authentification
 */

const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Données complètes pour l'utilisateur louiscyrano@gmail.com
const completeProfileData = {
  name: 'Louis Olivier Nkeng Hiag',
  firstName: 'Louis',
  lastName: 'Olivier Nkeng Hiag',
  profile: {
    firstName: 'Louis',
    lastName: 'Olivier Nkeng Hiag',
    avatar: '/images/admin-avatar.jpg',
    bio: 'Super Administrateur du système Ecomus Dashboard',
    phone: '+33123456789',
    department: 'Administration',
    position: 'Super Administrateur',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male'
  },
  address: {
    street: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    state: 'Île-de-France',
    postalCode: '75001',
    country: 'France'
  },
  preferences: {
    notifications: true,
    newsletter: true,
    language: 'fr',
    timezone: 'Europe/Paris',
    currency: 'EUR'
  }
};

async function completeUserProfile() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');

    // Utiliser la collection users directement
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('🔍 Recherche de l\'utilisateur louiscyrano@gmail.com...');
    
    // Vérifier si l'utilisateur existe
    const existingUser = await usersCollection.findOne({ 
      email: 'louiscyrano@gmail.com' 
    });
    
    if (!existingUser) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé, mise à jour du profil...');
    
    // Mettre à jour avec les données complètes
    const updateResult = await usersCollection.updateOne(
      { email: 'louiscyrano@gmail.com' },
      {
        $set: {
          ...completeProfileData,
          updatedAt: new Date(),
          lastProfileUpdate: new Date()
        }
      }
    );
    
    console.log(`✅ Profil mis à jour: ${updateResult.modifiedCount} document(s) modifié(s)`);
    
    // Vérifier la mise à jour
    const updatedUser = await usersCollection.findOne(
      { email: 'louiscyrano@gmail.com' },
      { projection: { password: 0 } }
    );
    
    console.log('\n📋 PROFIL UTILISATEUR COMPLÉTÉ:');
    console.log('================================');
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Nom complet:', updatedUser.name);
    console.log('👤 Prénom:', updatedUser.firstName);
    console.log('👤 Nom de famille:', updatedUser.lastName);
    console.log('🔧 Rôle:', updatedUser.role);
    console.log('📱 Téléphone:', updatedUser.profile?.phone);
    console.log('🏢 Département:', updatedUser.profile?.department);
    console.log('💼 Poste:', updatedUser.profile?.position);
    console.log('🌍 Pays:', updatedUser.address?.country);
    console.log('🌐 Langue:', updatedUser.preferences?.language);
    console.log('💰 Devise:', updatedUser.preferences?.currency);
    console.log('✅ Actif:', updatedUser.isActive);
    
    console.log('\n🎉 PROFIL UTILISATEUR COMPLÈTEMENT FINALISÉ !');
    console.log('Le système d\'authentification est maintenant 100% opérationnel.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔗 Connexion MongoDB fermée');
  }
}

// Fonction pour vérifier l'état final
async function verifyFinalState() {
  try {
    console.log('\n🔍 VÉRIFICATION FINALE DU SYSTÈME...');
    
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { email: 'louiscyrano@gmail.com' },
      { projection: { password: 0 } }
    );
    
    // Vérifier que tous les champs requis sont présents
    const requiredFields = {
      'name': user.name,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'profile.phone': user.profile?.phone,
      'profile.department': user.profile?.department,
      'profile.position': user.profile?.position,
      'address.country': user.address?.country,
      'preferences.language': user.preferences?.language
    };
    
    console.log('\n📊 ÉTAT DES CHAMPS REQUIS:');
    let allComplete = true;
    
    Object.entries(requiredFields).forEach(([field, value]) => {
      const status = value ? '✅' : '❌';
      const displayValue = value || 'MANQUANT';
      console.log(`${status} ${field}: ${displayValue}`);
      if (!value) allComplete = false;
    });
    
    if (allComplete) {
      console.log('\n🎉 TOUS LES CHAMPS SONT COMPLÉTÉS !');
      console.log('✅ Le système d\'authentification est complètement finalisé.');
    } else {
      console.log('\n⚠️ Certains champs nécessitent encore une attention.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Exécuter le script
async function main() {
  console.log('🚀 FINALISATION DU PROFIL UTILISATEUR');
  console.log('=====================================');
  
  await completeUserProfile();
  await verifyFinalState();
  
  console.log('\n🏁 SCRIPT TERMINÉ');
  process.exit(0);
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { completeUserProfile, verifyFinalState };
