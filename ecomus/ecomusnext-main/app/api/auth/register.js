import db from 'config/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Schéma User pour MongoDB (même que dans users/index.js)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },
  cloudinaryId: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  // Vérifier si la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  
  try {
    // Connexion à MongoDB
    const conn = await db();
    
    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
    
    const { name, email, password } = req.body;
    
    // Vérifier si tous les champs requis sont fournis
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Vérifier si l'utilsateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilsé' });
    }
    
    // Créer un nouvel utilsateur
    const newUser = new User({
      name,
      email,
      password,
      // Par défaut, le rôle est 'user'
    });
    
    // Sauvegarder l'utilsateur dans la base de données
    await newUser.save();
    
    // Créer un token JWT
    const token = jwt.sign(
      { 
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Renvoyer le token et les informations de l'utilsateur (sans le mot de passe)
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Erreur API register:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
