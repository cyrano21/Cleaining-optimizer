import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

async function fixUserRole() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');

    const db = mongoose.connection.db;
    
    // Mettre à jour le rôle de votre utilisateur
    const result = await db.collection('users').updateOne(
      { email: 'louiscyrano@gmail.com' },
      { 
        $set: { 
          role: 'SUPER_ADMIN',
          permissions: [
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
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Rôle mis à jour avec succès !');
      console.log(`📋 Documents modifiés: ${result.modifiedCount}`);
      
      // Vérifier la mise à jour
      const user = await db.collection('users').findOne(
        { email: 'louiscyrano@gmail.com' },
        { projection: { password: 0 } }
      );
      
      console.log('📋 Utilisateur mis à jour:');
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Nom: ${user.name}`);
      console.log(`  - Rôle: ${user.role}`);
      console.log(`  - Permissions: ${user.permissions?.length || 0} permissions`);
      console.log(`  - Actif: ${user.isActive}`);
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔗 Connexion MongoDB fermée');
  }
}

fixUserRole();
