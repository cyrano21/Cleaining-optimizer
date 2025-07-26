require('dotenv').config();
const { MongoClient } = require('mongodb');

// Utiliser MONGODB_URI du .env ou une valeur par défaut
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

console.log('🚀 Initialisation des rôles...');
console.log('🔗 URI MongoDB:', uri ? 'Configuré' : '❌ Non configuré');

const defaultRoles = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access to all system features',
    permissions: [
      'read_all',
      'write_all',
      'delete_all',
      'manage_users',
      'manage_roles',
      'manage_settings',
      'view_analytics',
      'manage_products',
      'manage_orders',
      'manage_inventory'
    ],
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'vendor',
    displayName: 'Vendor',
    description: 'Access to vendor dashboard and product management',
    permissions: [
      'read_own_products',
      'write_own_products',
      'manage_own_inventory',
      'view_own_orders',
      'view_own_analytics',
      'manage_own_profile'
    ],
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'customer',
    displayName: 'Customer',
    description: 'Basic customer access for shopping and orders',
    permissions: [
      'view_products',
      'place_orders',
      'view_own_orders',
      'manage_own_profile',
      'write_reviews'
    ],
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Content moderation and basic management',
    permissions: [
      'read_all_content',
      'moderate_content',
      'manage_reviews',
      'view_reports',
      'manage_support_tickets'
    ],
    isSystemRole: true,
    isActive: true
  }
];

async function initRoles() {
  let client;
  
  try {
    console.log('📡 Connexion à MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const rolesCollection = db.collection('roles');
    
    console.log('✅ Connecté à MongoDB');
    
    // Vérifier les rôles existants
    const existingRoles = await rolesCollection.find({}).toArray();
    console.log(`📋 Rôles existants: ${existingRoles.length}`);
    
    for (const role of defaultRoles) {
      const existingRole = await rolesCollection.findOne({ name: role.name });
      
      if (existingRole) {
        console.log(`⚡ Mise à jour du rôle: ${role.name}`);
        await rolesCollection.updateOne(
          { name: role.name },
          { 
            $set: {
              ...role,
              updatedAt: new Date()
            }
          }
        );
      } else {
        console.log(`➕ Création du rôle: ${role.name}`);
        await rolesCollection.insertOne({
          ...role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Afficher le résultat final
    const finalRoles = await rolesCollection.find({}).toArray();
    console.log('\n🎉 Initialisation terminée !');
    console.log(`📊 Total des rôles: ${finalRoles.length}`);
    console.log('📝 Rôles disponibles:');
    finalRoles.forEach(role => {
      console.log(`   - ${role.name} (${role.displayName})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔚 Connexion fermée');
    }
  }
}

initRoles();
