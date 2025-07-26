/**
 * Script d'initialisation des rôles système
 * Ce script crée les rôles par défaut nécessaires au fonctionnement de l'application
 */

import connectDB from '../lib/mongodb';
import Role from '../models/Role';
import User from '../models/User';

// Configuration des rôles système
const systemRoles = [
  {
    name: 'admin',
    description: 'Administrateur système avec accès complet à toutes les fonctionnalités',
    permissions: [
      'read', 'write', 'delete',
      'manage_users', 'manage_roles', 'manage_products', 
      'manage_orders', 'manage_stores', 'view_analytics',
      'manage_settings', 'manage_categories'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'vendor',
    description: 'Vendeur gérant sa propre boutique et ses produits',
    permissions: [
      'read', 'write',
      'manage_products', 'manage_orders', 'view_analytics',
      'manage_categories'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'customer',
    description: 'Client avec accès aux fonctionnalités d\'achat et de profil',
    permissions: [
      'read'
    ],
    isActive: true,
    isSystem: true
  }
];

async function initializeSystemRoles() {
  try {
    console.log('🚀 Initialisation des rôles système...');
    
    // Connexion à la base de données
    await connectDB();
    console.log('✅ Connexion à MongoDB établie');

    // Vérifier et créer les rôles système
    for (const roleData of systemRoles) {
      try {
        // Vérifier si le rôle existe déjà
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          console.log(`⚠️  Le rôle "${roleData.name}" existe déjà`);
          
          // Mettre à jour les permissions si nécessaire
          const needsUpdate = JSON.stringify(existingRole.permissions.sort()) !== 
                             JSON.stringify(roleData.permissions.sort());
          
          if (needsUpdate) {
            existingRole.permissions = roleData.permissions;
            existingRole.description = roleData.description;
            await existingRole.save();
            console.log(`🔄 Permissions mises à jour pour le rôle "${roleData.name}"`);
          }
        } else {
          // Créer le nouveau rôle
          const newRole = new Role(roleData);
          await newRole.save();
          console.log(`✅ Rôle "${roleData.name}" créé avec succès`);
        }      } catch (error: any) {
        console.error(`❌ Erreur lors de la création du rôle "${roleData.name}":`, error.message || error);
      }
    }

    console.log('\n📊 Résumé des rôles système :');
    const allRoles = await Role.find({ isSystem: true });
    allRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.permissions.length} permissions`);
    });

    console.log('\n🎉 Initialisation des rôles terminée avec succès !');
      } catch (error: any) {
    console.error('❌ Erreur lors de l\'initialisation des rôles système:', error.message || error);
    process.exit(1);
  }
}

async function createDefaultAdminUser() {
  try {
    console.log('\n👤 Vérification de l\'utilisateur administrateur par défaut...');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà');
      return;
    }

    // Récupérer le rôle admin
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('❌ Rôle admin non trouvé. Veuillez d\'abord initialiser les rôles.');
      return;
    }

    // Créer l'utilisateur admin par défaut
    const defaultAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@ecomus.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8gv/6oqKxa', // password: admin123
      role: 'admin',
      isActive: true,
      isVerified: true,
      profile: {
        bio: 'Administrateur système par défaut',
        avatar: '/images/avatar.webp'
      }
    });

    await defaultAdmin.save();
    console.log('✅ Utilisateur administrateur par défaut créé');
    console.log('   Email: admin@ecomus.com');
    console.log('   Mot de passe: admin123');
    console.log('   ⚠️  Veuillez changer ce mot de passe lors de la première connexion !');
      } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'admin par défaut:', error.message || error);
  }
}

async function main() {
  try {
    await initializeSystemRoles();
    await createDefaultAdminUser();
    
    console.log('\n🏁 Script d\'initialisation terminé !');
    process.exit(0);
      } catch (error: any) {
    console.error('❌ Erreur fatale:', error.message || error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

export { initializeSystemRoles, createDefaultAdminUser };
