const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

async function fixUserRole() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log('🔍 Recherche de l\'utilisateur louiscyrano@gmail.com...');
    const user = await User.findOne({ email: 'louiscyrano@gmail.com' });
    
    if (user) {
      console.log('✅ Utilisateur trouvé:', {
        name: user.name,
        email: user.email,
        currentRole: user.role,
        isActive: user.isActive
      });
      
      // Mettre à jour le rôle et ajouter les champs manquants
      const updateResult = await User.updateOne(
        { email: 'louiscyrano@gmail.com' },
        {
          $set: {
            role: 'SUPER_ADMIN',
            name: user.name || 'Louis Olivier Nkeng Hiag', // S'assurer que le champ name existe
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
            profile: {
              firstName: user.profile?.firstName || user.name?.split(' ')[0] || 'Louis',
              lastName: user.profile?.lastName || user.name?.split(' ').slice(1).join(' ') || 'Olivier Nkeng Hiag',
              avatar: user.avatar || '',
              phone: user.phoneNumber || user.phone || '',
              department: 'Administration',
              position: 'Super Administrateur'
            },
            lastLogin: null,
            createdBy: 'system',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Utilisateur mis à jour:', updateResult.modifiedCount, 'document(s) modifié(s)');
      
      // Vérifier la mise à jour
      const updatedUser = await User.findOne({ email: 'louiscyrano@gmail.com' });
      console.log('📋 Utilisateur après mise à jour:', {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions?.length || 0,
        isActive: updatedUser.isActive,
        profile: updatedUser.profile
      });
      
    } else {
      console.log('❌ Utilisateur non trouvé');
    }
    
    console.log('🎉 Correction terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔗 Connexion MongoDB fermée');
  }
}

fixUserRole();
