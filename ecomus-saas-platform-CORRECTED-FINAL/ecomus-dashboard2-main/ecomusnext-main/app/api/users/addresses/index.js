
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
  
  switch (method) {
    // Récupérer toutes les adresses d'un utilisateur
    case 'GET':
      try {
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Si votre modèle User contient directement les adresses
        if (user.addresses) {
          return res.status(200).json(user.addresses);
        }
        
        // Si vous avez un modèle Address séparé
        // const addresses = await Address.find({ userId });
        // return res.status(200).json(addresses);
        
        return res.status(200).json([]);
      } catch (error) {
        console.error('Erreur de récupération des adresses:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
    // Ajouter une nouvelle adresse
    case 'POST':
      try {
        const { address } = req.body;
        
        if (!address) {
          return res.status(400).json({ message: 'Données d\'adresse manquantes' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Si votre modèle User contient directement les adresses
        if (!user.addresses) {
          user.addresses = [];
        }
        
        // Si c'est la première adresse, la définir par défaut
        if (user.addresses.length === 0) {
          address.isDefault = true;
        }
        
        user.addresses.push(address);
        await user.save();
        
        return res.status(201).json(address);
        
        // Si vous avez un modèle Address séparé
        // const newAddress = new Address({ ...address, userId });
        // await newAddress.save();
        // return res.status(201).json(newAddress);
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'adresse:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
