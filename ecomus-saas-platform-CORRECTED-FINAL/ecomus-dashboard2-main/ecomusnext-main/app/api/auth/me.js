
// pages/api/auth/me.js
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import User from '../../../models/User';
import dbConnect from '../../../utils/dbConnect';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // 1. Vérifier la session NextAuth d'abord
  const session = await getServerSession(req, res, authOptions);
  
  if (session) {
    console.log('[API] Session NextAuth utilisée pour /api/auth/me');
    return res.status(200).json({ user: session.user });
  }
  
  // 2. Si pas de session, vérifier le token Authorization
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET);
      
      // Connexion à la base de données
      await dbConnect();
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      console.log(`[API] Authentification par token JWT réussie pour ${user.email || user.name}`);
      
      return res.status(200).json({ 
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        } 
      });
    } catch (error) {
      console.error('[API] Erreur de validation du token JWT:', error.message);
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  }
  
  // 3. Vérifier les cookies directement comme fallback
  const cookies = req.headers.cookie;
  if (cookies) {
    console.log('[API] Tentative de récupération de session via cookies');
  }
  
  // Aucune méthode d'authentification réussie
  console.log('[API] Aucune méthode d\'authentification valide pour /api/auth/me');
  return res.status(401).json({ error: 'Non authentifié' });
}
