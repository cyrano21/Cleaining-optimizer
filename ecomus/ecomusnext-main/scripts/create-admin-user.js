#!/usr/bin/env node
// Script pour créer l'utilisateur administrateur principal
// Usage: node scripts/create-admin-user.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Schéma utilisateur simplifié pour le script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendor', 'client'], default: 'client' },
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: true },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'fr' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },
  profile: {
    bio: String,
    website: String,
    company: String,
    position: String,
    skills: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String,
      facebook: String
    }
  },
  dashboardAccess: {
    isEnabled: { type: Boolean, default: true },
    permissions: [{
      resource: String,
      actions: [String]
    }],
    customDashboard: {
      widgets: [String],
      layout: String,
      theme: String
    }
  },
  aiInteractions: {
    totalQueries: { type: Number, default: 0 },
    lastInteraction: Date,
    preferredModel: { type: String, default: 'ollama' },
    chatHistory: [{
      message: String,
      response: String,
      model: String,
      timestamp: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    console.log('🚀 Création de l\'utilisateur administrateur...\n');

    // Données de l'administrateur principal
    const adminData = {
      name: 'Louis Cyrano',
      email: 'louiscyrano@gmail.com',
      password: await bcrypt.hash('Figoro21', 12),
      role: 'admin',
      avatar: '/images/avatars/admin-avatar.png',
      phone: '+33 6 00 00 00 00',
      address: {
        street: '123 Admin Street',
        city: 'Paris',
        state: 'Île-de-France',
        zipCode: '75001',
        country: 'France'
      },
      isActive: true,
      isEmailVerified: true,
      preferences: {
        theme: 'dark',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          marketing: true
        }
      },
      profile: {
        bio: 'Administrateur principal du système Ecomus SaaS. Expert en e-commerce et technologies IA.',
        website: 'https://ecomus.com',
        company: 'Ecomus SaaS',
        position: 'CEO & Founder',
        skills: ['E-commerce', 'IA', 'Management', 'Strategy', 'Innovation'],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/louiscyrano',
          twitter: 'https://twitter.com/louiscyrano',
          instagram: 'https://instagram.com/louiscyrano',
          facebook: 'https://facebook.com/louiscyrano'
        }
      },
      dashboardAccess: {
        isEnabled: true,
        permissions: [
          { resource: 'products', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'orders', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'users', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'analytics', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'ai', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'settings', actions: ['read', 'write', 'delete', 'admin'] }
        ],
        customDashboard: {
          widgets: ['analytics', 'orders', 'products', 'users', 'ai-stats', 'revenue'],
          layout: 'grid',
          theme: 'dark'
        }
      },
      aiInteractions: {
        totalQueries: 0,
        preferredModel: 'ollama'
      }
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur admin existe déjà. Mise à jour...');
      
      // Mettre à jour l'utilisateur existant
      const updatedUser = await User.findOneAndUpdate(
        { email: adminData.email },
        adminData,
        { new: true, runValidators: true }
      );
      
      console.log('✅ Utilisateur admin mis à jour avec succès!');
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`👤 Nom: ${updatedUser.name}`);
      console.log(`🔒 Rôle: ${updatedUser.role}`);
      
    } else {
      // Créer un nouvel utilisateur
      const newUser = new User(adminData);
      await newUser.save();
      
      console.log('✅ Utilisateur admin créé avec succès!');
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Nom: ${newUser.name}`);
      console.log(`🔒 Rôle: ${newUser.role}`);
    }

    console.log('\n## 🔑 Identifiants Admin');
    console.log('**Email :** `louiscyrano@gmail.com`');
    console.log('**Mot de passe :** `Figoro21`');
    console.log('**Rôle :** Administrateur complet');
    
    console.log('\n✨ Fonctionnalités disponibles:');
    console.log('- ✅ Dashboard administrateur complet');
    console.log('- ✅ Gestion des produits et catégories');
    console.log('- ✅ Analytics et statistiques avancées');
    console.log('- ✅ Gestion des utilisateurs et rôles');
    console.log('- ✅ Configuration IA et chatbot');
    console.log('- ✅ Upload de modèles 3D');
    console.log('- ✅ Accès à toutes les APIs');
    console.log('- ✅ Personnalisation du dashboard');
    console.log('- ✅ Historique des interactions IA');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await createAdminUser();
    
    console.log('\n🎉 Script terminé avec succès!');
    console.log('🌐 Vous pouvez maintenant vous connecter sur http://localhost:3001');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
main();
