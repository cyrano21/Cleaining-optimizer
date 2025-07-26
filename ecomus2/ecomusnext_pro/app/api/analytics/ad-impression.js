// API endpoint pour enregistrer les impressions de publicités
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

    // Incrémenter le compteur d'impressions
    ad.statistics.impressions = (ad.statistics.impressions || 0) + 1;
    ad.statistics.lastImpressionDate = new Date();

    // Ajouter des informations sur le produit si fourni
    if (productId) {
      if (!ad.statistics.impressionsByProduct) {
        ad.statistics.impressionsByProduct = new Map();
      }
      const currentImpressions = ad.statistics.impressionsByProduct.get(productId) || 0;
      ad.statistics.impressionsByProduct.set(productId, currentImpressions + 1);
    }

    // Calculer le taux de clic (CTR)
    const clicks = ad.statistics.clicks || 0;
    const impressions = ad.statistics.impressions || 1;
    ad.statistics.ctr = (clicks / impressions) * 100;

    await ad.save();

    res.status(200).json({ 
      success: true, 
      message: 'Impression enregistrée avec succès',
      data: {
        adId,
        totalImpressions: ad.statistics.impressions,
        ctr: ad.statistics.ctr,
        type: isParallaxBanner ? 'parallax_banner' : 'sliding_ad'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'impression:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'enregistrement de l\'impression' 
    });
  }
}