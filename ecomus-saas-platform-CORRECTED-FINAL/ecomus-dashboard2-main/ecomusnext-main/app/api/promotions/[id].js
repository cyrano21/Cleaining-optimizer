import dbConnect from '../../../utils/dbConnect';
import Promotion from '../../../models/Promotion';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  await dbConnect();

  // GET - Obtenir une promotion spécifique
  if (req.method === 'GET') {
    try {
      const promotion = await Promotion.findById(id)
        .populate('applicableProducts', 'name price imageUrl')
        .populate('applicableCategories', 'name')
        .populate('excludedProducts', 'name price imageUrl');
      
      if (!promotion) {
        return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
      }

      // Vérifier si la promotion est active pour les non-admins
      const isAdmin = session && session.user.role === 'admin';
      if (!isAdmin && 
          (!promotion.isActive || 
           new Date(promotion.startDate) > new Date() || 
           new Date(promotion.endDate) < new Date())) {
        return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
      }

      return res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      console.error('Erreur lors de la récupération de la promotion:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour une promotion (admin uniquement)
  if (req.method === 'PUT') {
    try {
      // Vérifier les permissions (admin uniquement)
      if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const promotion = await Promotion.findById(id);
      
      if (!promotion) {
        return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
      }
      
      // Validation
      if (req.body.type === 'percentage' && (req.body.value < 0 || req.body.value > 100)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le pourcentage de réduction doit être compris entre 0 et 100'
        });
      }
      
      if (req.body.startDate && req.body.endDate && 
          new Date(req.body.startDate) > new Date(req.body.endDate)) {
        return res.status(400).json({ 
          success: false, 
          message: 'La date de début doit être antérieure à la date de fin'
        });
      }
      
      // Vérifier si le code existe déjà si on le modifie
      if (req.body.code && req.body.code !== promotion.code) {
        const existingPromotion = await Promotion.findOne({ code: req.body.code.toUpperCase() });
        if (existingPromotion) {
          return res.status(400).json({ 
            success: false, 
            message: 'Ce code de promotion existe déjà'
          });
        }
      }
      
      // Mettre à jour la promotion
      const updatedPromotion = await Promotion.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({ 
        success: true, 
        message: 'Promotion mise à jour avec succès',
        data: updatedPromotion 
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la promotion:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer une promotion (admin uniquement)
  if (req.method === 'DELETE') {
    try {
      // Vérifier les permissions (admin uniquement)
      if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const promotion = await Promotion.findById(id);
      
      if (!promotion) {
        return res.status(404).json({ success: false, message: 'Promotion non trouvée' });
      }
      
      await Promotion.findByIdAndDelete(id);
      
      return res.status(200).json({ success: true, message: 'Promotion supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la promotion:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
