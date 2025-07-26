const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-db';

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT', 
    'ADMIN_MANAGEMENT',
    'VENDOR_ACCESS',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'SYSTEM_SETTINGS',
    'ALL_DASHBOARDS',
    'AUDIT_LOGS',
    'SECURITY_SETTINGS'
  ],
  ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'VENDOR_ACCESS', 
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'ALL_DASHBOARDS'
  ],
  MODERATOR: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT'
  ]
};

async function updateAdminPermissions() {
  let client;
  
  try {
    console.log('🔗 Connexion à MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('🔍 Recherche du compte louiscyrano@gmail.com...');
    
    // Rechercher l'utilisateur existant
    const existingUser = await usersCollection.findOne({ 
      email: 'louiscyrano@gmail.com' 
    });
    
    if (existingUser) {
      console.log('✅ Utilisateur trouvé, mise à jour des permissions...');
      
      // Mettre à jour avec les permissions admin
      const updateResult = await usersCollection.updateOne(
        { email: 'louiscyrano@gmail.com' },
        {
          $set: {
            role: 'SUPER_ADMIN',
            permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
            isActive: true,
            updatedAt: new Date(),
            profile: {
              firstName: existingUser.profile?.firstName || 'Louis',
              lastName: existingUser.profile?.lastName || 'Cyrano',
              avatar: existingUser.profile?.avatar || null,
              phone: existingUser.profile?.phone || null,
              department: 'Administration',
              position: 'Super Administrateur'
            }
          }
        }
      );
      
      console.log('✅ Permissions mises à jour:', updateResult.modifiedCount, 'document(s) modifié(s)');
      
      // Vérifier la mise à jour
      const updatedUser = await usersCollection.findOne(
        { email: 'louiscyrano@gmail.com' },
        { projection: { password: 0 } }
      );
      
      console.log('📋 Utilisateur mis à jour:');
      console.log('  - Email:', updatedUser.email);
      console.log('  - Nom:', updatedUser.name);
      console.log('  - Rôle:', updatedUser.role);
      console.log('  - Permissions:', updatedUser.permissions?.length || 0, 'permissions');
      console.log('  - Actif:', updatedUser.isActive);
      console.log('  - Département:', updatedUser.profile?.department);
      console.log('  - Poste:', updatedUser.profile?.position);
      
    } else {
      console.log('❌ Utilisateur louiscyrano@gmail.com non trouvé');
      console.log('🔧 Création du compte super admin...');
      
      // Créer le compte super admin
      const hashedPassword = await bcrypt.hash('Figoro21', 12);
      
      const newAdmin = {
        email: 'louiscyrano@gmail.com',
        name: 'Louis Cyrano',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        profile: {
          firstName: 'Louis',
          lastName: 'Cyrano',
          avatar: null,
          phone: null,
          department: 'Administration',
          position: 'Super Administrateur'
        }
      };
      
      const insertResult = await usersCollection.insertOne(newAdmin);
      console.log('✅ Compte super admin créé:', insertResult.insertedId);
    }
    
    // Créer quelques comptes de test supplémentaires
    console.log('🔧 Création de comptes de test supplémentaires...');
    
    const testAdmins = [
      {
        email: 'admin@ecomus.com',
        name: 'Admin Test',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        permissions: ROLE_PERMISSIONS.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        profile: {
          firstName: 'Admin',
          lastName: 'Test',
          avatar: null,
          phone: null,
          department: 'Administration',
          position: 'Administrateur'
        }
      },
      {
        email: 'moderator@ecomus.com',
        name: 'Moderator Test',
        password: await bcrypt.hash('moderator123', 12),
        role: 'MODERATOR',
        permissions: ROLE_PERMISSIONS.MODERATOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        profile: {
          firstName: 'Moderator',
          lastName: 'Test',
          avatar: null,
          phone: null,
          department: 'Modération',
          position: 'Modérateur'
        }
      }
    ];
    
    for (const admin of testAdmins) {
      const existing = await usersCollection.findOne({ email: admin.email });
      if (!existing) {
        await usersCollection.insertOne(admin);
        console.log(`✅ Compte créé: ${admin.email} (${admin.role})`);
      } else {
        console.log(`ℹ️ Compte existant: ${admin.email}`);
      }
    }
    
    // Afficher tous les comptes admin
    console.log('\n📋 Comptes administrateurs dans la base:');
    const allAdmins = await usersCollection.find(
      { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } },
      { projection: { password: 0 } }
    ).toArray();
    
    allAdmins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.role}) - ${admin.isActive ? 'Actif' : 'Inactif'}`);
    });
    
    console.log('\n🎉 Configuration administrative terminée !');
    console.log('🔗 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: louiscyrano@gmail.com');
    console.log('   Mot de passe: Figoro21');
    console.log('   Rôle: SUPER_ADMIN');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔗 Connexion MongoDB fermée');
    }
  }
}

// Exécuter le script
updateAdminPermissions();
