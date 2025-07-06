// filepath: g:\ewebsite2\pages\api\products\[id]\reviews\[reviewId].js
import { MongoClient, ObjectId } from 'mongodb';
import { isAuthenticated, isAdmin } from '../../../../../middleware/auth';

const handler = async (req, res) => {
  // Cette API ne gère que la suppression d'avis
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    // Journalisation détaillée pour le débogage
    console.log('[API delete-review] Début du traitement');
    console.log('[API delete-review] ID Produit:', req.query.id);
    console.log('[API delete-review] ID Avis:', req.query.reviewId);

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, {});
    await client.connect();
    console.log('[API delete-review] Connexion à MongoDB réussie');

    const db = client.db();
    const { id: productId, reviewId } = req.query;

    // Vérification que les IDs sont bien des chaînes valides
    if (!productId || !reviewId) {
      await client.close();
      console.log('[API delete-review] IDs manquants:', { productId, reviewId });
      return res.status(400).json({ success: false, message: 'ID de produit ou d\'avis non fourni' });
    }

    // Conversion des IDs en ObjectId
    let objectIdProductId;
    let objectIdReviewId;
    
    try {
      objectIdProductId = new ObjectId(productId);
      
      // Pour reviewId, nous essayons de le convertir, mais il pourrait être stocké sous forme de chaîne
      try {
        objectIdReviewId = new ObjectId(reviewId);
      } catch (error) {
        // Si la conversion échoue, nous utiliserons reviewId comme chaîne
        console.log('[API delete-review] reviewId n\'est pas un ObjectId valide, utilisation comme chaîne');
      }
    } catch (error) {
      await client.close();
      console.log('[API delete-review] Erreur de conversion des IDs:', error.message);
      return res.status(400).json({ success: false, message: 'IDs invalides' });
    }

    // Tentative de suppression de l'avis par pullAll avec ObjectId
    let result;
    if (objectIdReviewId) {
      result = await db.collection('products').updateOne(
        { _id: objectIdProductId },
        { $pull: { reviews: { _id: objectIdReviewId } } }
      );
      
      console.log('[API delete-review] Résultat de la suppression avec ObjectId:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }

    // Si aucun document n'a été modifié, essayer avec l'ID comme chaîne
    if (!result || result.modifiedCount === 0) {
      result = await db.collection('products').updateOne(
        { _id: objectIdProductId },
        { $pull: { reviews: { _id: reviewId } } }
      );
      
      console.log('[API delete-review] Résultat de la suppression avec chaîne:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }

    // Si toujours aucun résultat, essayer une approche plus détaillée
    if (!result || result.modifiedCount === 0) {
      // Récupérer le produit pour mieux comprendre la structure
      const product = await db.collection('products').findOne({ _id: objectIdProductId });
      
      if (!product) {
        await client.close();
        console.log('[API delete-review] Produit non trouvé');
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      
      if (!product.reviews || !Array.isArray(product.reviews)) {
        await client.close();
        console.log('[API delete-review] Le produit n\'a pas de tableau reviews');
        return res.status(404).json({ success: false, message: 'Le produit n\'a pas d\'avis' });
      }
      
      // Afficher les détails du tableau d'avis pour le débogage
      console.log('[API delete-review] Structure du tableau reviews:', 
        product.reviews.map(r => ({ id: r._id, type: typeof r._id }))
      );
      
      // Recherche manuelle de l'avis
      const reviewToDelete = product.reviews.find(r => {
        if (r._id) {
          if (typeof r._id === 'string') {
            return r._id === reviewId;
          } else {
            try {
              return r._id.toString() === reviewId;
            } catch (e) {
              return false;
            }
          }
        }
        return false;
      });
      
      if (!reviewToDelete) {
        await client.close();
        console.log('[API delete-review] Avis non trouvé dans le produit');
        return res.status(404).json({ success: false, message: 'Avis non trouvé dans le produit' });
      }
      
      // Maintenant que nous avons trouvé l'avis, essayons de le supprimer à nouveau
      // avec les informations exactes de son _id
      const reviewIdToUse = reviewToDelete._id;
      
      if (typeof reviewIdToUse === 'string') {
        result = await db.collection('products').updateOne(
          { _id: objectIdProductId },
          { $pull: { reviews: { _id: reviewIdToUse } } }
        );
      } else {
        result = await db.collection('products').updateOne(
          { _id: objectIdProductId },
          { $pull: { reviews: { _id: reviewToDelete._id } } }
        );
      }
      
      console.log('[API delete-review] Résultat de la suppression après recherche manuelle:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }

    await client.close();
    console.log('[API delete-review] Connexion à MongoDB fermée');

    if (!result || result.modifiedCount === 0) {
      console.log('[API delete-review] Échec de la suppression');
      return res.status(400).json({ success: false, message: 'Impossible de supprimer l\'avis' });
    }

    console.log('[API delete-review] Suppression réussie');
    return res.status(200).json({ success: true, message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('[API delete-review] Erreur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

export default isAuthenticated(isAdmin(handler));