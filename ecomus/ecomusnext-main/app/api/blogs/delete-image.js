import { deleteImage } from '../../../config/cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }
  const { publicId } = req.query;
  if (!publicId) {
    return res.status(400).json({ error: 'publicId requis' });
  }
  try {
    await deleteImage(publicId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
