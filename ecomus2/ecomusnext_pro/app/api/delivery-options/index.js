import dbConnect from '../../../lib/dbConnect';
import DeliveryOption from '../../../models/DeliveryOption';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const options = await DeliveryOption.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, options });
      } catch (error) {
        console.error('Error fetching delivery options:', error);
        res.status(400).json({ success: false, message: 'Erreur lors du chargement des options de livraison' });
      }
      break;

    case 'POST':
      try {
        const { name, description, price, estimatedDays, isActive, type } = req.body;

        if (!name || !description || price === undefined || !estimatedDays) {
          return res.status(400).json({ 
            success: false, 
            message: 'Tous les champs obligatoires doivent être remplis' 
          });
        }

        const deliveryOption = await DeliveryOption.create({
          name,
          description,
          price: parseFloat(price),
          estimatedDays: parseInt(estimatedDays),
          isActive: isActive !== undefined ? isActive : true,
          type: type || 'standard'
        });

        res.status(201).json({ success: true, option: deliveryOption });
      } catch (error) {
        console.error('Error creating delivery option:', error);
        res.status(400).json({ success: false, message: 'Erreur lors de la création de l\'option de livraison' });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Méthode non autorisée' });
      break;
  }
}