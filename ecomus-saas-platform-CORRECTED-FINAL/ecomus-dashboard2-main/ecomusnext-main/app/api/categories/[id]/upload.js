// pages/api/categories/upload.js
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '../../../../utils/dbConnect';
import Category from '../../../../models/Category';// Déco Next pour désactiver le bodyParser
export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name:    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:       process.env.CLOUDINARY_API_KEY,
  api_secret:    process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // CORS / pré-vol
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error('[API categories/upload] DB connect error', err);
    return res.status(500).json({ success: false, message: 'Erreur de connexion à la base de données' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });
  return form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[API categories/upload] Form parse error', err);
      return res.status(500).json({ success: false, message: 'Erreur lors du parsing du formulaire' });
    }

    if (!files.image) {
      return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    }

    try {
      // 1) upload sur Cloudinary
      const result = await cloudinary.uploader.upload(files.image.filepath, {
        folder: 'categories',
        resource_type: 'image',
      });

      // 2) préparer les données
      const categoryData = {
        name:        fields.name,
        description: fields.description || '',
        imageUrl:    result.secure_url,
        cloudinaryId: result.public_id,
      };

      let category;
      if (fields.id) {
        // MAJ existante
        category = await Category.findByIdAndUpdate(fields.id, categoryData, {
          new: true, runValidators: true
        });
        if (!category) {
          return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
      } else {
        // Création
        category = await Category.create(categoryData);
      }

      // 3) renvoyer la catégorie
      return res.status(fields.id ? 200 : 201).json({
        success: true,
        data:    category
      });
    } catch (uploadErr) {
      console.error('[API categories/upload] Error', uploadErr);
      return res.status(500).json({ success: false, message: uploadErr.message });
    }
  });
}
