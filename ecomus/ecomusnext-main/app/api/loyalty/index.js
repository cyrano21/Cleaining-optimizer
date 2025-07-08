
import dbConnect from '../../../utils/dbConnect';
import LoyaltyPoint from '../../../models/LoyaltyPoint';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ success: false, message: 'Vous devez être connecté pour accéder à cette ressource.' });
  }
  
  const userId = session.user.id;
  
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        let loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });
        
        if (!loyaltyPoints) {
          // Créer un nouvel enregistrement si l'utilisateur n'a pas encore de points
          loyaltyPoints = await LoyaltyPoint.create({
            user: userId,
            points: 0,
            history: [],
            totalEarned: 0,
            totalSpent: 0
          });
        }
        
        return res.status(200).json({
          success: true,
          data: loyaltyPoints
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des points de fidélité:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des points de fidélité',
          error: error.message
        });
      }
      
    case 'POST':
      try {
        const { action, amount, reason, reference } = req.body;
        
        if (!action || !amount || !reason) {
          return res.status(400).json({
            success: false,
            message: 'Les paramètres action, amount et reason sont requis'
          });
        }
        
        let loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });
        
        if (!loyaltyPoints) {
          loyaltyPoints = await LoyaltyPoint.create({
            user: userId,
            points: 0,
            history: [],
            totalEarned: 0,
            totalSpent: 0
          });
        }
        
        // Mettre à jour les points selon l'action
        if (action === 'earned' || action === 'bonus') {
          loyaltyPoints.points += amount;
          loyaltyPoints.totalEarned += amount;
          
          loyaltyPoints.history.push({
            amount,
            type: action,
            reason,
            reference,
            createdAt: new Date()
          });
        } else if (action === 'spent') {
          // Vérifier si l'utilisateur a assez de points
          if (loyaltyPoints.points < amount) {
            return res.status(400).json({
              success: false,
              message: 'Pas assez de points disponibles'
            });
          }
          
          loyaltyPoints.points -= amount;
          loyaltyPoints.totalSpent += amount;
          
          loyaltyPoints.history.push({
            amount: -amount,
            type: 'spent',
            reason,
            reference,
            createdAt: new Date()
          });
        } else if (action === 'expired') {
          loyaltyPoints.points -= amount;
          
          loyaltyPoints.history.push({
            amount: -amount,
            type: 'expired',
            reason,
            reference,
            createdAt: new Date()
          });
        }
        
        loyaltyPoints.lastUpdated = new Date();
        await loyaltyPoints.save();
        
        return res.status(200).json({
          success: true,
          message: 'Points de fidélité mis à jour avec succès',
          data: loyaltyPoints
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des points de fidélité:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour des points de fidélité',
          error: error.message
        });
      }
      
    default:
      return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
}
