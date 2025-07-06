
import dbConnect from '../../../utils/dbConnect';
import Review from '../../../models/Review';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;
  
  // Connecter à la base de données
  await dbConnect();
  
  // Vérifier l'authentification
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  switch (method) {
    case 'POST':
      try {
        const { reviewId, isHelpful } = req.body;
        const userId = session.user.id;
        
        if (!reviewId) {
          return res.status(400).json({ success: false, message: 'ID d\'avis requis' });
        }
        
        const review = await Review.findById(reviewId);
        
        if (!review) {
          return res.status(404).json({ success: false, message: 'Avis non trouvé' });
        }
        
        // Initialiser les tableaux s'ils n'existent pas
        if (!review.helpfulVotes) review.helpfulVotes = [];
        if (!review.unhelpfulVotes) review.unhelpfulVotes = [];
        
        // Retirer l'utilisateur des deux tableaux de votes
        review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
        review.unhelpfulVotes = review.unhelpfulVotes.filter(id => id.toString() !== userId);
        
        // Ajouter le vote de l'utilisateur selon l'action demandée
        if (isHelpful) {
          review.helpfulVotes.push(userId);
        } else {
          review.unhelpfulVotes.push(userId);
        }
        
        // Calculer le nombre total de votes utiles
        review.helpfulCount = review.helpfulVotes.length;
        
        await review.save();
        
        return res.status(200).json({
          success: true,
          data: {
            helpfulCount: review.helpfulCount,
            isHelpful: isHelpful
          }
        });
      } catch (error) {
        console.error('Erreur lors du vote:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur serveur lors du vote',
          error: error.message
        });
      }
      
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ success: false, message: `Méthode ${method} non autorisée` });
  }
}
