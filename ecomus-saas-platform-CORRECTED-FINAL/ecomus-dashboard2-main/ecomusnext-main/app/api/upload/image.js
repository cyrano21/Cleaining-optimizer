
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Désactiver le body parser par défaut pour pouvoir utiliser formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Image upload request received');
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);

  // Vérification de l'authentification et des permissions
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Session details:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error('No session found');
      return res.status(401).json({ 
        error: 'Non authentifié', 
        details: 'Aucune session valide trouvée' 
      });
    }
    
    if (!session.user || session.user.role !== 'admin') {
      console.error('Unauthorized access attempt:', session.user);
      return res.status(403).json({ 
        error: 'Accès refusé', 
        details: 'Droits administrateur requis' 
      });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée', 
      details: 'Seules les requêtes POST sont acceptées' 
    });
  }

  try {
    // Parsing du formulaire avec l'image
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10 Mo max
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Erreur lors du parsing du formulaire:', err);
          res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
          return resolve();
        }

        const imageFile = files.image;
        
        if (!imageFile || !imageFile[0]) {
          res.status(400).json({ error: 'Aucune image trouvée dans la requête' });
          return resolve();
        }

        try {
          // Upload de l'image vers Cloudinary
          const result = await cloudinary.uploader.upload(imageFile[0].filepath, {
            folder: 'sponsors',
            resource_type: 'image',
          });

          res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
          });
          return resolve();
        } catch (uploadError) {
          console.error('Erreur Cloudinary:', uploadError);
          res.status(500).json({ error: 'Erreur lors de l\'upload vers Cloudinary' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
