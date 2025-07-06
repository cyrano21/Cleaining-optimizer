
import dbConnect from '../../../../../utils/dbConnect';
import User from '../../../../../models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  
  await dbConnect();
  
  const { method } = req;
  const userId = session.user.id;
  const { id } = req.query; // ID de l'adresse
  
  // Seule la méthode PUT est autorisée pour définir une adresse par défaut
  if (method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Si votre modèle User contient directement les adresses
    const addressIndex = user.addresses?.findIndex(addr => addr._id.toString() === id);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Adresse non trouvée' });
    }
    
    // Mettre à jour toutes les adresses pour qu'elles ne soient plus par défaut
    user.addresses.forEach((addr, index) => {
      addr.isDefault = index === addressIndex;
    });
    
    await user.save();
    
    return res.status(200).json(user.addresses[addressIndex]);
  } catch (error) {
    console.error('Erreur lors de la définition de l\'adresse par défaut:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
