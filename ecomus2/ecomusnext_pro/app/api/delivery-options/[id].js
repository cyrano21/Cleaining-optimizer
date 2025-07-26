import dbConnect from '../../../lib/dbConnect';
import DeliveryOption from '../../../models/DeliveryOption';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const deliveryOption = await DeliveryOption.findById(id);
        
        if (!deliveryOption) {
          return res.status(404).json({ success: false, message: 'Option de livraison non trouvée' });
        }
        
        res.status(200).json({ success: true, option: deliveryOption });
      } catch (error) {
        console.error('Error fetching delivery option:', error);
        res.status(400).json({ success: false, message: 'Erreur lors du chargement de l\'option de livraison' });
      }
      break;

    case 'PUT':
      try {
        const { name, description, price, estimatedDays, isActive, type } = req.body;

        if (!name || !description || price === undefined || !estimatedDays) {
          return res.status(400).json({ 
            success: false, 
            message: 'Tous les champs obligatoires doivent être remplis' 
          });
        }

        const updatedOption = await DeliveryOption.findByIdAndUpdate(
          id,
          {
            name,
            description,
            price: parseFloat(price),
            estimatedDays: parseInt(estimatedDays),
            isActive: isActive !== undefined ? isActive : true,
            type: type || 'standard'
          },
          { new: true, runValidators: true }
        );

        if (!updatedOption) {
          return res.status(404).json({ success: false, message: 'Option de livraison non trouvée' });
        }

        res.status(200).json({ success: true, option: updatedOption });
      } catch (error) {
        console.error('Error updating delivery option:', error);
        res.status(400).json({ success: false, message: 'Erreur lors de la mise à jour de l\'option de livraison' });
      }
      break;

    case 'DELETE':
      try {
        const deletedOption = await DeliveryOption.findByIdAndDelete(id);
        
        if (!deletedOption) {
          return res.status(404).json({ success: false, message: 'Option de livraison non trouvée' });
        }
        
        res.status(200).json({ success: true, message: 'Option de livraison supprimée avec succès' });
      } catch (error) {
        console.error('Error deleting delivery option:', error);
        res.status(400).json({ success: false, message: 'Erreur lors de la suppression de l\'option de livraison' });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Méthode non autorisée' });
      break;
  }
}