import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT')
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });

  try {
    // Journalisation détaillée pour le débogage
    console.log('[API approve-review] Début du traitement');
    console.log('[API approve-review] ID Produit:', req.query.id);
    console.log('[API approve-review] ID Avis:', req.query.reviewId);

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, {});
    await client.connect();
    console.log('[API approve-review] Connexion à MongoDB réussie');

    const db = client.db();
    const { id: productId, reviewId } = req.query;

    // Vérification que les IDs sont bien des chaines valides
    if (!productId || !reviewId) {
      await client.close();
      console.log('[API approve-review] IDs manquants:', { productId, reviewId });
      return res.status(400).json({ success: false, message: 'ID de produit ou d\'avis non fourni' });
    }

    // Premièrement, essayer de mettre à jour l'avis en considérant que reviewId pourrait être une chaîne ou un ObjectId
    let result;
    try {
      // Essayer avec ObjectId
      const objectIdReviewId = typeof reviewId === 'string' ? new ObjectId(reviewId) : reviewId;
      const objectIdProductId = typeof productId === 'string' ? new ObjectId(productId) : productId;

      console.log('[API approve-review] Tentative de mise à jour avec ObjectId:', { 
        objectIdProductId: objectIdProductId.toString(), 
        objectIdReviewId: objectIdReviewId.toString() 
      });

      result = await db.collection('products').updateOne(
        { _id: objectIdProductId, 'reviews._id': objectIdReviewId },
        { $set: { 'reviews.$.approved': true, 'reviews.$.approvedAt': new Date() } }
      );

      console.log('[API approve-review] Résultat avec ObjectId:', { 
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.log('[API approve-review] Erreur lors de la tentative avec ObjectId:', error.message);
      // Si la conversion en ObjectId échoue, continuer avec l'approche suivante
    }

    // Si aucun document n'a été modifié, essayer en traitant reviewId comme une chaîne
    if (!result || result.modifiedCount === 0) {
      console.log('[API approve-review] Tentative de mise à jour avec ID comme chaîne');
      
      result = await db.collection('products').updateOne(
        { _id: new ObjectId(productId), 'reviews._id': reviewId },
        { $set: { 'reviews.$.approved': true, 'reviews.$.approvedAt': new Date() } }
      );

      console.log('[API approve-review] Résultat avec ID comme chaîne:', { 
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }

    // Si toujours aucun résultat, essayer de rechercher par index
    if (!result || result.modifiedCount === 0) {
      console.log('[API approve-review] Tentative de recherche plus avancée');
      
      // Récupérer le produit complet
      const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      
      if (product && product.reviews && Array.isArray(product.reviews)) {
        console.log('[API approve-review] Produit trouvé avec', product.reviews.length, 'avis');
        
        // Trouver l'index de l'avis à approuver
        const reviewIndex = product.reviews.findIndex(review => 
          (review._id && review._id.toString() === reviewId) || 
          (review._id && review._id === reviewId)
        );
        
        if (reviewIndex !== -1) {
          console.log('[API approve-review] Avis trouvé à l\'index', reviewIndex);
          
          // Mettre à jour l'avis spécifique par son index
          const updatePath = `reviews.${reviewIndex}.approved`;
          const updatePathDate = `reviews.${reviewIndex}.approvedAt`;
          
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: { [updatePath]: true, [updatePathDate]: new Date() } }
          );
          
          console.log('[API approve-review] Résultat avec mise à jour par index:', { 
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
          });
        } else {
          console.log('[API approve-review] Avis non trouvé dans le tableau reviews');
        }
      } else {
        console.log('[API approve-review] Produit non trouvé ou sans tableau reviews');
      }
    }

    await client.close();
    console.log('[API approve-review] Connexion à MongoDB fermée');

    if (!result || result.modifiedCount === 0) {
      console.log('[API approve-review] Échec de la mise à jour');
      return res.status(400).json({ success: false, message: 'Impossible de mettre à jour l\'avis' });
    }

    console.log('[API approve-review] Mise à jour réussie');
    return res.status(200).json({ success: true, message: 'Avis approuvé' });
  } catch (error) {
    console.error('[API approve-review] Erreur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
