
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../../models/User';
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
  
  switch (method) {
    // Récupérer une adresse spécifique
    case 'GET':
      try {
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Si votre modèle User contient directement les adresses
        const address = user.addresses?.find(addr => addr._id.toString() === id);
        
        if (!address) {
          return res.status(404).json({ message: 'Adresse non trouvée' });
        }
        
        return res.status(200).json(address);
      } catch (error) {
        console.error('Erreur de récupération de l\'adresse:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
    // Mettre à jour une adresse
    case 'PUT':
      try {
        const { address: updatedAddress } = req.body;
        
        if (!updatedAddress) {
          return res.status(400).json({ message: 'Données d\'adresse manquantes' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Si votre modèle User contient directement les adresses
        const addressIndex = user.addresses?.findIndex(addr => addr._id.toString() === id);
        
        if (addressIndex === -1) {
          return res.status(404).json({ message: 'Adresse non trouvée' });
        }
        
        // Mettre à jour l'adresse
        user.addresses[addressIndex] = {
          ...user.addresses[addressIndex].toObject(),
          ...updatedAddress
        };
        
        await user.save();
        
        return res.status(200).json(user.addresses[addressIndex]);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
    // Supprimer une adresse
    case 'DELETE':
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
        
        // Vérifier si c'était l'adresse par défaut
        const wasDefault = user.addresses[addressIndex].isDefault;
        
        // Supprimer l'adresse
        user.addresses.splice(addressIndex, 1);
        
        // Si c'était l'adresse par défaut et qu'il reste des adresses, définir la première comme par défaut
        if (wasDefault && user.addresses.length > 0) {
          user.addresses[0].isDefault = true;
        }
        
        await user.save();
        
        return res.status(200).json({ message: 'Adresse supprimée avec succès' });
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
