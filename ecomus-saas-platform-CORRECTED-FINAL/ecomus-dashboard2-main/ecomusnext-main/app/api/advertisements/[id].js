import dbConnect from '../../../utils/dbConnect';
import Advertisement from '../../../models/Advertisement';
import { withAdminAuth } from '../../../middleware/authMiddleware';

async function handler(req, res) {
  const {
    query: { id },
    method
  } = req;

  // Connexion à la base de données
  await dbConnect();


  // Vérifier que l'ID fourni est valide
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'ID de publicité invalide' });
  }

  switch (method) {
    case 'GET':
      try {
        // Récupérer la publicité par ID
        const advertisement = await Advertisement.findById(id)
          .populate('client', 'name email')
          .populate('createdBy', 'name email');

        if (!advertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }

        res.status(200).json({ success: true, data: advertisement });
      } catch (error) {
        console.error('Erreur lors de la récupération de la publicité:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;

    case 'PUT':
      try {
        // Extraire les données de la requête
        const data = req.body;
        
        // Mise à jour des champs
        data.updatedAt = new Date();
        
        // Rechercher et mettre à jour la publicité
        const advertisement = await Advertisement.findByIdAndUpdate(
          id,
          data,
          { new: true, runValidators: true }
        );

        if (!advertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }

        res.status(200).json({
          success: true,
          data: advertisement,
          message: 'Publicité mise à jour avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la publicité:', error);
        
        // Gérer les erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
          const validationErrors = {};
          
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          
          return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: validationErrors
          });
        }
        
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        // Supprimer la publicité
        const deletedAdvertisement = await Advertisement.findByIdAndDelete(id);

        if (!deletedAdvertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }

        res.status(200).json({
          success: true,
          data: {},
          message: 'Publicité supprimée avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la publicité:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;

    // Route spéciale pour incrémenter les stats
    case 'PATCH':
      try {
        const { action } = req.body;
        const advertisement = await Advertisement.findById(id);

        if (!advertisement) {
          return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
        }

        // Incrémenter la métrique appropriée
        switch (action) {
          case 'impression':
            await advertisement.incrementImpressions();
            break;
          case 'click':
            await advertisement.incrementClicks();
            break;
          case 'conversion':
            await advertisement.incrementConversions();
            break;
          default:
            return res.status(400).json({ success: false, message: 'Action non reconnue' });
        }

        res.status(200).json({
          success: true,
          data: advertisement,
          message: `Statistique ${action} incrémentée avec succès`
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
      break;

    // Gérer les méthodes HTTP non autorisées
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
      res.status(405).json({ success: false, message: `Méthode ${method} non autorisée` });
  }
}

export default withAdminAuth(handler);
