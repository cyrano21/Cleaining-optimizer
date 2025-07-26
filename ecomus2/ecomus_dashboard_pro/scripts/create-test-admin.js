const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createTestAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI non trouvé dans .env');
    return;
  }
  
  console.log('🔗 Connexion à MongoDB...');
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connexion MongoDB établie');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Créer un mot de passe haché
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Supprimer l'utilisateur existant s'il existe
    await users.deleteOne({ email: 'testadmin@ecomus.com' });
    
    // Créer le nouvel utilisateur admin
    const adminUser = {
      name: 'Test Admin',
      email: 'testadmin@ecomus.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      avatar: '/public/images/avatar.webp',
      createdAt: new Date(),
      firstName: 'Test',
      lastName: 'Admin'
    };
    
    const result = await users.insertOne(adminUser);
    console.log('✅ Utilisateur admin créé:', {
      id: result.insertedId,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Vérifier que l'utilisateur existe
    const checkUser = await users.findOne({ email: 'testadmin@ecomus.com' });
    if (checkUser) {
      console.log('✅ Vérification: Utilisateur trouvé dans la base');
      console.log('   Email:', checkUser.email);
      console.log('   Rôle:', checkUser.role);
      console.log('   Mot de passe haché:', checkUser.password.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

createTestAdmin();
