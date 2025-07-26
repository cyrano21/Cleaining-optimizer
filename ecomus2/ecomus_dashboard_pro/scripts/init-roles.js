/**
 * Script d'initialisation des rôles système (Version JavaScript)
 * Ce script crée les rôles par défaut nécessaires au fonctionnement de l'application
 */

const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

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

// Schéma Role
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Role = mongoose.models?.Role || mongoose.model('Role', roleSchema);

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connexion à MongoDB établie');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error;
  }
}

async function initializeSystemRoles() {
  try {
    console.log('🚀 Initialisation des rôles système...');
    
    // Connexion à la base de données
    await connectDB();

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
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création du rôle "${roleData.name}":`, error.message);
      }
    }

    console.log('\n📊 Résumé des rôles système :');
    const allRoles = await Role.find({ isSystem: true });
    allRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.permissions.length} permissions`);
    });

    console.log('\n🎉 Initialisation des rôles terminée avec succès !');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des rôles système:', error.message);
    return false;
  }
}

async function main() {
  try {
    const success = await initializeSystemRoles();
    
    if (success) {
      console.log('\n🏁 Script d\'initialisation terminé avec succès !');
      process.exit(0);
    } else {
      console.log('\n❌ Script terminé avec des erreurs');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

module.exports = { initializeSystemRoles };
