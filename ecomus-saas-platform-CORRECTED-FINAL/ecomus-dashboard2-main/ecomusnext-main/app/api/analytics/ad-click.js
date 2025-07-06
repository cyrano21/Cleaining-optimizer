// API endpoint pour enregistrer les clics sur les publicités
import dbConnect from '../../../lib/dbConnect';
import SlidingAd from '../../../models/SlidingAd';
import ParallaxBanner from '../../../models/ParallaxBanner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();

    const { adId, productId } = req.body;

    if (!adId) {
      return res.status(400).json({ success: false, message: 'ID de publicité requis' });
    }

    // Essayer de trouver la publicité dans SlidingAd
    let ad = await SlidingAd.findById(adId);
    let isParallaxBanner = false;

    // Si pas trouvé dans SlidingAd, chercher dans ParallaxBanner
    if (!ad) {
      ad = await ParallaxBanner.findById(adId);
      isParallaxBanner = true;
    }

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Publicité non trouvée' });
    }

    // Incrémenter le compteur de clics
    ad.statistics.clicks = (ad.statistics.clicks || 0) + 1;
    ad.statistics.lastClickDate = new Date();

    // Ajouter des informations sur le produit si fourni
    if (productId) {
      if (!ad.statistics.clicksByProduct) {
        ad.statistics.clicksByProduct = new Map();
      }
      const currentClicks = ad.statistics.clicksByProduct.get(productId) || 0;
      ad.statistics.clicksByProduct.set(productId, currentClicks + 1);
    }

    await ad.save();

    res.status(200).json({ 
      success: true, 
      message: 'Clic enregistré avec succès',
      data: {
        adId,
        totalClicks: ad.statistics.clicks,
        type: isParallaxBanner ? 'parallax_banner' : 'sliding_ad'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'enregistrement du clic' 
    });
  }
}