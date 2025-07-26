import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../../../lib/dbConnect';
import Category from '../../../models/Category';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Désactiver le bodyParser par défaut de Next.js pour permettre formidable de traiter le FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Configuration CORS pour permettre les requêtes cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Répondre directement aux requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`[API categories/upload] Méthode: ${req.method}`);

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  try {
    await dbConnect();
    console.log('[API categories/upload] Connexion à la base de données réussie');
  } catch (error) {
    console.error('[API categories/upload] Erreur de connexion à la base de données:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données'
    });
  }

  // Parser la requête avec formidable
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('[API categories/upload] Erreur lors du parsing du formulaire:', err);
        res.status(500).json({ success: false, message: 'Erreur lors du traitement du formulaire' });
        return resolve();
      }

      console.log('[API categories/upload] Champs reçus:', fields);
      console.log('[API categories/upload] Fichiers reçus:', files.image ? 'Image présente' : 'Aucune image');

      // Vérifier si l'image est présente
      if (!files.image) {
        res.status(400).json({ success: false, message: 'Aucune image fournie' });
        return resolve();
      }

      try {
        // Récupérer l'image
        const file = files.image;
        
        // Upload vers Cloudinary
        console.log('[API categories/upload] Upload vers Cloudinary...');
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: 'categories',
          resource_type: 'image',
        });
        
        console.log('[API categories/upload] Résultat Cloudinary:', result.secure_url);

        // Créer ou mettre à jour la catégorie avec l'URL d'image Cloudinary
        let categoryData = {
          name: fields.name,
          imageUrl: result.secure_url,
          cloudinaryId: result.public_id,
        };

        // Si un ID est fourni, rechercher et mettre à jour la catégorie
        let savedCategory;
        if (fields.id) {
          console.log('[API categories/upload] Mise à jour de la catégorie existante:', fields.id);
          savedCategory = await Category.findByIdAndUpdate(
            fields.id,
            { $set: categoryData },
            { new: true }
          );
          
          if (!savedCategory) {
            res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
            return resolve();
          }
        }

        // Renvoyer les informations de l'image uploadée
        res.status(200).json({
          success: true,
          imageUrl: result.secure_url,
          cloudinaryId: result.public_id,
          category: savedCategory
        });
        
        return resolve();
      } catch (error) {
        console.error('[API categories/upload] Erreur:', error);
        res.status(500).json({ success: false, message: error.message });
        return resolve();
      }
    });
  });
}
