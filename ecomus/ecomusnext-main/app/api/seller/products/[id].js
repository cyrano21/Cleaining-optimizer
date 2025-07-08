
import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  // Vérifier l'authentification et les permissions
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est un vendeur approuvé
  if (session.user.sellerStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé. Votre compte vendeur n\'est pas approuvé.' });
  }

  await dbConnect();
  const sellerId = session.user.id;

  // Vérifier que le produit appartient au vendeur
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  }

  if (product.seller.toString() !== sellerId) {
    return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à accéder à ce produit' });
  }

  // GET - Récupérer les détails d'un produit
  if (req.method === 'GET') {
    try {
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // PUT - Mettre à jour un produit
  if (req.method === 'PUT') {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // DELETE - Supprimer un produit
  if (req.method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Produit supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
