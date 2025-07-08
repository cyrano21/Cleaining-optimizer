import { cloudinary } from '../../../config/cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }
  try {
    // Récupère les images du dossier blog sur Cloudinary
    const result = await cloudinary.search
      .expression('folder:ewebsite2-francise/blog')
      .sort_by('created_at','desc')
      .max_results(40)
      .execute();
    const images = result.resources.map(img => ({
      publicId: img.public_id,
      url: img.secure_url,
      format: img.format,
      width: img.width,
      height: img.height,
      createdAt: img.created_at
    }));
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
