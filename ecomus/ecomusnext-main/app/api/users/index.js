import connectDB from '../../../config/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définition du schéma User pour MongoDB
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

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  try {
    // Connexion à MongoDB
    const conn = await connectDB();
    
    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
    
    switch (req.method) {
      case 'GET':
        // Récupérer tous les utilisateurs avec filtres avancés
        const {
          status,
          minOrders,
          maxOrders,
          minSpent,
          maxSpent
        } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
          query.isActive = status === 'Active';
        }
        // Les champs orders et totalSpent sont fictifs, donc on ne filtre que s'ils existent
        let usersList = await User.find(query).select('-password');
        // Filtrage JS pour les champs non natifs
        if (minOrders) {
          usersList = usersList.filter(u => (u.orders || 0) >= parseInt(minOrders));
        }
        if (maxOrders) {
          usersList = usersList.filter(u => (u.orders || 0) <= parseInt(maxOrders));
        }
        if (minSpent) {
          usersList = usersList.filter(u => (u.totalSpent || 0) >= parseFloat(minSpent));
        }
        if (maxSpent) {
          usersList = usersList.filter(u => (u.totalSpent || 0) <= parseFloat(maxSpent));
        }
        return res.status(200).json({ users: usersList });
        
      case 'POST':
        // Créer un nouvel utilsateur (inscription)
        const { email } = req.body;
        
        // Vérifier si l'utilsateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Cet email est déjà utilsé' });
        }
        
        const newUser = new User(req.body);
        await newUser.save();
        
        // Ne pas renvoyer le mot de passe
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        return res.status(201).json(userResponse);
        
      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API utilsateurs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
