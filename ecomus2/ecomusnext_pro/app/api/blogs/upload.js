import nextConnect from 'next-connect';
import multer from 'multer';
import { uploadImage } from '../../../config/cloudinary';

// Multer config: stocke le fichier temporairement en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Erreur upload: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  },
});

// Route POST pour upload d'image (drag & drop, galerie, etc.)
apiRoute.use(upload.single('image'));

apiRoute.post(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }
    // Convertir le buffer en base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await uploadImage(base64, { folder: 'ewebsite2-francise/blog' });
    res.status(200).json({ url: result.url, publicId: result.publicId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Désactive le bodyParser Next.js par défaut pour multer
  },
};

export default apiRoute;
