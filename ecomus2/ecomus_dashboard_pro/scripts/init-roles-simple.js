/**
 * Script d'initialisation simple des rôles système
 * Version JavaScript compatible pour une exécution rapide
 */

const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

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
      'manage_settings', 'manage_categories'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'vendor',
    description: 'Vendeur gérant sa boutique',
    permissions: [
      'read', 'write',
      'manage_products', 'manage_orders', 'view_analytics'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'customer',
    description: 'Client avec accès aux achats',
    permissions: ['read'],
    isActive: true,
    isSystem: true
  }
];

async function initRoles() {
  try {
    console.log('🚀 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('👥 Initialisation des rôles...');
    
    for (const roleData of systemRoles) {
      try {
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          console.log(`⚠️  Rôle "${roleData.name}" existe déjà`);
          // Mettre à jour les permissions
          existingRole.permissions = roleData.permissions;
          existingRole.description = roleData.description;
          await existingRole.save();
          console.log(`🔄 Permissions mises à jour pour "${roleData.name}"`);
        } else {
          const newRole = new Role(roleData);
          await newRole.save();
          console.log(`✅ Rôle "${roleData.name}" créé`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour le rôle "${roleData.name}":`, error.message);
      }
    }

    console.log('\n📊 Rôles système créés :');
    const allRoles = await Role.find({ isSystem: true });
    allRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.permissions.length} permissions`);
    });

    console.log('\n🎉 Initialisation terminée !');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter
initRoles();
