
import dbConnect from '../../../../utils/dbConnect';
import Product from '../../../../models/Product';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        // Incrémenter le compteur de vues du produit
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { $inc: { viewCount: 1 } },
          { new: true }
        );

        if (!updatedProduct) {
          return res.status(404).json({ success: false, error: 'Produit non trouvé' });
        }

        res.status(200).json({ success: true, data: { viewCount: updatedProduct.viewCount } });
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ success: false, error: `Méthode ${method} non autorisée` });
  }
}
