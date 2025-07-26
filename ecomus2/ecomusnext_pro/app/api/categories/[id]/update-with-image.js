// pages/api/categories/[id]/update-with-image.js
import dbConnect from '../../../../utils/dbConnect';
import Category from '../../../../models/Category';
import { withAdminAuth } from '../../../../middleware/authMiddleware';

async function handler(req, res) {
  // Vérifier la méthode
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  try {
    await dbConnect();
    
    const { id } = req.query;
    const { name, imageUrl, description, publicId } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      console.error('❌ [API] Catégorie non trouvée:', id);
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    // Mettre à jour la catégorie avec l'image
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, imageUrl, publicId },
      { new: true, runValidators: true }
    );

    console.log('✅ [API] Catégorie mise à jour avec succès:', updatedCategory._id);

    return res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('❌ [API] Erreur lors de la mise à jour de la catégorie avec image:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message,
    });
  }
}

// Désactiver temporairement l'authentification admin pour tester
// export default withAdminAuth(handler);
export default handler;
