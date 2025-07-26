// pages/api/upload/categoryImage.js
// Version simplifiée sans utiliser next-connect pour éviter les problèmes potentiels

import multer from 'multer';
import { promisify } from 'util';

// Importer directement cloudinary
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configuration de multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Créer un middleware multer promisifié
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    console.log('❌ [API] Méthode non autorisée:', req.method);
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  console.log('🔍 [API] Début de la requête d\'upload d\'image de catégorie');
  console.log('🔍 [API] Headers de la requête:', req.headers);
  console.log('🔍 [API] Variables Cloudinary:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NON DÉFINIE',
    api_key: process.env.CLOUDINARY_API_KEY ? 'définie (longueur: ' + process.env.CLOUDINARY_API_KEY.length + ')' : 'NON DÉFINIE',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'définie (longueur: ' + process.env.CLOUDINARY_API_SECRET.length + ')' : 'NON DÉFINIE',
  });

  try {
    // Exécuter le middleware multer
    await runMiddleware(req, res, upload.single('image'));

    // Vérifier si un fichier a été envoyé
    if (!req.file) {
      console.error('❌ [API] Aucun fichier envoyé');
      return res.status(400).json({ success: false, error: 'Aucun fichier envoyé' });
    }

    console.log('🔍 [API] Fichier reçu:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    try {
      // Convertir le buffer en base64
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      console.log('🔍 [API] Tentative d\'upload vers Cloudinary...');
      
      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'ewebsite2-francise/categories',
        resource_type: 'auto'
      });

      console.log('✅ [API] Upload réussi:', {
        public_id: result.public_id,
        url: result.secure_url
      });

      // Retourner les informations nécessaires
      return res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (cloudinaryError) {
      console.error('❌ [API] Erreur Cloudinary:', cloudinaryError);
      return res.status(500).json({
        success: false,
        error: `Erreur Cloudinary: ${cloudinaryError.message}`
      });
    }
  } catch (err) {
    console.error('❌ [API] Erreur générale:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

// Désactiver le bodyParser par défaut de Next.js pour permettre à multer de fonctionner
export const config = {
  api: {
    bodyParser: false,
  },
};
