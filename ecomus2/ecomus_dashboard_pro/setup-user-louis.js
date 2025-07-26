const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://louiscyrano:Figoro21@cluster0.hl34ag2.mongodb.net/ecomusnext?retryWrites=true&w=majority&appName=Cluster0';

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
  ]
};

async function setupLouisUser() {
  let client;
  
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
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
            role: 'admin',
            permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
            isActive: true,
            isVerified: true,
            updatedAt: new Date(),
            profile: {
              ...existingUser.profile,
              firstName: existingUser.profile?.firstName || 'Louis',
              lastName: existingUser.profile?.lastName || 'Cyrano',
              department: 'Administration',
              position: 'Super Administrateur'
            }
          }
        }
      );
      
      console.log('✅ Permissions mises à jour:', updateResult.modifiedCount, 'document(s) modifié(s)');
      
    } else {
      console.log('❌ Utilisateur louiscyrano@gmail.com non trouvé');
      console.log('🔧 Création du compte super admin...');
      
      // Créer le compte super admin
      const hashedPassword = await bcrypt.hash('Figoro21', 12);
      
      const newAdmin = {
        email: 'louiscyrano@gmail.com',
        firstName: 'Louis',
        lastName: 'Cyrano',
        password: hashedPassword,
        role: 'admin',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        isActive: true,
        isVerified: true,
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
    
    // Vérifier le compte final
    const finalUser = await usersCollection.findOne(
      { email: 'louiscyrano@gmail.com' },
      { projection: { password: 0 } }
    );
    
    console.log('\n📋 Utilisateur configuré:');
    console.log('  - Email:', finalUser.email);
    console.log('  - Nom:', finalUser.firstName, finalUser.lastName);
    console.log('  - Rôle:', finalUser.role);
    console.log('  - Permissions:', finalUser.permissions?.length || 0, 'permissions');
    console.log('  - Actif:', finalUser.isActive);
    console.log('  - Vérifié:', finalUser.isVerified);
    
    console.log('\n🎉 Configuration terminée !');
    console.log('🔗 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: louiscyrano@gmail.com');
    console.log('   Mot de passe: Figoro21');
    console.log('   Rôle: admin/super-admin');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔗 Connexion MongoDB fermée');
    }
  }
}

// Exécuter le script
setupLouisUser();
