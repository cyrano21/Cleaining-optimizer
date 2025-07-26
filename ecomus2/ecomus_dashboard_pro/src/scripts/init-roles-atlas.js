/**
 * Script d'initialisation des rôles avec chargement explicite de .env
 * Version corrigée pour MongoDB Atlas
 */

// Chargement explicite des variables d'environnement
require('dotenv').config();
const mongoose = require('mongoose');

// Configuration MongoDB - utilise la variable d'environnement
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🚀 Connexion à MongoDB Atlas...');
console.log('📡 URI MongoDB:', MONGODB_URI ? 'Configuré' : 'NON CONFIGURÉ');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non trouvé dans .env');
  process.exit(1);
}

// Schéma Role simplifié
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

// Rôles système par défaut
const systemRoles = [
  {
    name: 'admin',
    description: 'Administrateur système avec accès complet',
    permissions: [
      'read', 'write', 'delete',
      'manage_users', 'manage_roles', 'manage_products', 
      'manage_orders', 'manage_stores', 'view_analytics',
      'manage_settings', 'system_admin'
    ],
    isSystem: true,
    isActive: true
  },
  {
    name: 'vendor',
    description: 'Vendeur avec accès à ses produits et commandes',
    permissions: [
      'read', 'write',
      'manage_own_products', 'view_own_orders', 
      'manage_own_store', 'view_own_analytics'
    ],
    isSystem: true,
    isActive: true
  },
  {
    name: 'client',
    description: 'Client avec accès aux fonctionnalités de base',
    permissions: [
      'read', 'browse_products', 'place_orders', 
      'view_own_orders', 'manage_own_profile'
    ],
    isSystem: true,
    isActive: true
  },
  {
    name: 'customer',
    description: 'Client/Acheteur standard',
    permissions: [
      'read', 'browse_products', 'place_orders', 
      'view_own_orders', 'manage_own_profile',
      'write_reviews'
    ],
    isSystem: true,
    isActive: true
  },
  {
    name: 'manager',
    description: 'Gestionnaire avec accès modéré',
    permissions: [
      'read', 'write',
      'manage_products', 'manage_orders', 
      'view_analytics', 'manage_users'
    ],
    isSystem: true,
    isActive: true
  },
  {
    name: 'moderator',
    description: 'Modérateur de contenu',
    permissions: [
      'read', 'write',
      'moderate_content', 'manage_reviews',
      'manage_comments'
    ],
    isSystem: true,
    isActive: true
  }
];

async function initializeRoles() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    // Création des rôles
    console.log('\n📋 Initialisation des rôles système...');
    
    for (const roleData of systemRoles) {
      try {
        // Vérifier si le rôle existe déjà
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          // Mettre à jour le rôle existant
          await Role.findOneAndUpdate(
            { name: roleData.name },
            roleData,
            { new: true }
          );
          console.log(`🔄 Rôle "${roleData.name}" mis à jour`);
        } else {
          // Créer un nouveau rôle
          const newRole = new Role(roleData);
          await newRole.save();
          console.log(`✨ Rôle "${roleData.name}" créé`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Rôle "${roleData.name}" existe déjà`);
        } else {
          console.error(`❌ Erreur pour le rôle "${roleData.name}":`, error.message);
        }
      }
    }

    // Vérification finale
    const totalRoles = await Role.countDocuments();
    console.log(`\n📊 Total des rôles en base: ${totalRoles}`);
    
    const rolesList = await Role.find({}).select('name description isActive');
    console.log('\n📝 Liste des rôles:');
    rolesList.forEach(role => {
      console.log(`  - ${role.name}: ${role.description} (${role.isActive ? 'Actif' : 'Inactif'})`);
    });

    console.log('\n🎉 Initialisation des rôles terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
    process.exit(0);
  }
}

// Exécution du script
console.log('🚀 Démarrage de l\'initialisation des rôles...');
initializeRoles();
