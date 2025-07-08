
import connectDB from '../../../config/db';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';

export default async function handler(req, res) {
  // Cette API ne devrait être appelée qu'en POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Connexion à MongoDB
    const conn = await connectDB();
    
    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
    
    const { email, oldPassword, newPassword } = req.body;
    
    // Vérifier si tous les champs nécessaires sont fournis
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }
    
    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }
    
    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
    
  } catch (error) {
    console.error('Erreur API reset-password:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
