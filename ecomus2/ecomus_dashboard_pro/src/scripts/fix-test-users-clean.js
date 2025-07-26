// Script pour corriger et initialiser les utilisateurs de test (version avec nettoyage d'index)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Schéma utilisateur simplifié (sans slug)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'user'],
    default: 'user'
  },
  isActive: { type: Boolean, default: true },
  storeId: { type: String },
  avatar: { type: String },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Ajouter une méthode pour obtenir le nom complet
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Assurer que les virtuels sont inclus lors de la conversion en JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

// Fonction de connexion à MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI n\'est pas défini dans .env.local');
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('✅ Connexion à MongoDB réussie');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
}

// Fonction pour nettoyer les index problématiques
async function cleanupProblematicIndexes() {
  try {
    console.log('🧹 Nettoyage des index problématiques...');
    
    // Obtenir la collection utilisateur
    const userCollection = mongoose.connection.db.collection('users');
    
    // Lister tous les index
    const indexes = await userCollection.indexes();
    console.log('📋 Index existants:', indexes.map(i => i.name));
    
    // Vérifier si l'index slug_1 existe et le supprimer
    const slugIndex = indexes.find(i => i.name === 'slug_1');
    if (slugIndex) {
      console.log('🗑️ Suppression de l\'index slug_1...');
      await userCollection.dropIndex('slug_1');
      console.log('✅ Index slug_1 supprimé');
    } else {
      console.log('ℹ️ Index slug_1 n\'existe pas');
    }
    
    // Supprimer tous les documents ayant un champ slug null
    const result = await userCollection.updateMany(
      { slug: { $exists: true } },
      { $unset: { slug: "" } }
    );
    console.log(`📝 Champs slug supprimés de ${result.modifiedCount} documents`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des index:', error);
    // Ne pas arrêter le script, continuer avec les utilisateurs
  }
}

// Utilisateurs de test à créer/corriger
const testUsers = [
  {
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@ecomus.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567890',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345',
      country: 'USA'
    }
  },
  {
    firstName: 'Vendor',
    lastName: 'User',
    email: 'vendor@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    storeId: 'store_001',
    phone: '+1234567891',
    address: {
      street: '456 Vendor Avenue',
      city: 'Vendor City',
      state: 'VC',
      zipCode: '67890',
      country: 'USA'
    }
  },
  {
    firstName: 'Vendor',
    lastName: 'One',
    email: 'vendor1@ecomus.com',
    password: 'vendor123',
    role: 'vendor',
    storeId: 'store_002',
    phone: '+1234567892',
    address: {
      street: '789 Commerce Blvd',
      city: 'Commerce City',
      state: 'CC',
      zipCode: '11111',
      country: 'USA'
    }
  },
  {
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@ecomus.com',
    password: 'user123',
    role: 'user',
    phone: '+1234567893',
    address: {
      street: '321 User Lane',
      city: 'User Town',
      state: 'UT',
      zipCode: '22222',
      country: 'USA'
    }
  },
  {
    firstName: 'Test',
    lastName: 'Client',
    email: 'client@ecomus.com',
    password: 'client123',
    role: 'user',
    phone: '+1234567894',
    address: {
      street: '654 Client Road',
      city: 'Client Village',
      state: 'CV',
      zipCode: '33333',
      country: 'USA'
    }
  }
];

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function createOrUpdateUser(userData) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log(`📝 Mise à jour de l'utilisateur existant: ${userData.email}`);
      
      // Préparer les données de mise à jour sans l'email
      const { email: _, ...updateData } = userData;
      updateData.password = await hashPassword(userData.password);
      
      // Mettre à jour l'utilisateur existant
      const updatedUser = await User.findOneAndUpdate(
        { email: userData.email },
        updateData,
        { new: true, runValidators: true }
      );
      
      console.log(`✅ Utilisateur mis à jour: ${updatedUser.email} (${updatedUser.role})`);
      return updatedUser;
    } else {
      console.log(`👤 Création d'un nouvel utilisateur: ${userData.email}`);
      
      // Hasher le mot de passe
      const hashedPassword = await hashPassword(userData.password);
      
      // Créer un nouvel utilisateur (sans slug)
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      console.log(`✅ Utilisateur créé: ${savedUser.email} (${savedUser.role})`);
      return savedUser;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création/mise à jour de ${userData.email}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Démarrage du script de correction des utilisateurs de test...');
    
    // Se connecter à MongoDB
    await connectDB();
    
    // Nettoyer les index problématiques
    await cleanupProblematicIndexes();
    
    // Compter les utilisateurs existants
    const userCount = await User.countDocuments();
    console.log(`📊 Nombre d'utilisateurs existants: ${userCount}`);
    
    // Créer ou mettre à jour chaque utilisateur de test
    const results = [];
    for (const userData of testUsers) {
      try {
        const user = await createOrUpdateUser(userData);
        results.push({ success: true, user: user.email, role: user.role });
      } catch (error) {
        results.push({ success: false, email: userData.email, error: error.message });
      }
    }
    
    // Afficher le résumé
    console.log('\n📋 Résumé des opérations:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Succès: ${successful.length}`);
    successful.forEach(r => console.log(`  - ${r.user} (${r.role})`));
    
    if (failed.length > 0) {
      console.log(`❌ Échecs: ${failed.length}`);
      failed.forEach(r => console.log(`  - ${r.email}: ${r.error}`));
    }
    
    // Vérifier les utilisateurs finaux
    console.log('\n🔍 Vérification des utilisateurs de test:');
    for (const userData of testUsers) {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        console.log(`✅ ${user.email} - Rôle: ${user.role} - Actif: ${user.isActive}`);
      } else {
        console.log(`❌ ${userData.email} - Non trouvé`);
      }
    }
    
    console.log('\n🎉 Script terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});
