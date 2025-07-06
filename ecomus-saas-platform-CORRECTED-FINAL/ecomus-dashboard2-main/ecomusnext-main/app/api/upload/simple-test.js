// pages/api/upload/simple-test.js
// Une API simplifiée pour tester l'upload vers Cloudinary

// Importer directement cloudinary
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier la configuration de Cloudinary
    console.log('🔍 [API] Variables Cloudinary:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'définie' : 'NON DÉFINIE',
      api_key: process.env.CLOUDINARY_API_KEY ? 'définie' : 'NON DÉFINIE',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'définie' : 'NON DÉFINIE',
    });

    // Tester l'upload d'une image simple (base64)
    // Utilisons une petite image de test en base64
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    try {
      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(testImage, {
        folder: 'ewebsite2-francise/test',
        resource_type: 'auto'
      });

      console.log('✅ [API] Test upload réussi:', {
        public_id: result.public_id,
        url: result.secure_url
      });

      // Retourner les informations de l'image uploadée
      return res.status(200).json({
        success: true,
        message: 'Test d\'upload réussi',
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (cloudinaryError) {
      console.error('❌ [API] Erreur Cloudinary:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du test d\'upload vers Cloudinary',
        error: cloudinaryError.message
      });
    }
  } catch (error) {
    console.error('❌ [API] Erreur générale:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur générale',
      error: error.message
    });
  }
}
