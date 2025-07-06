import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUser = async () => {
  try {
    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'louiscyrano@gmail.com' });
    if (existingUser) {
      console.log('👤 Utilisateur déjà existant:', existingUser.email);
      return;
    }

    // Créer un nouvel utilisateur
    const user = new User({
      name: 'Louis Cyrano',
      email: 'louiscyrano@gmail.com',
      password: 'password123', // Le middleware pre('save') va hasher automatiquement
      role: 'admin',
      isEmailVerified: true,
    });

    await user.save();
    console.log('✅ Utilisateur créé avec succès:', user.email);
    console.log('📧 Email:', user.email);
    console.log('🔑 Mot de passe: password123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

seedUser();
