// API endpoint pour enregistrer les clics sur les articles de blog
import dbConnect from '../../../lib/dbConnect';
import BlogPost from '../../../models/BlogPost';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();

    const { postId, productId } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: 'ID de l\'article requis' });
    }

    // Trouver l'article de blog
    const blogPost = await BlogPost.findById(postId);

    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'Article de blog non trouvé' });
    }

    // Incrémenter le compteur de clics
    blogPost.statistics.clicks = (blogPost.statistics.clicks || 0) + 1;
    blogPost.statistics.lastClickDate = new Date();

    // Ajouter des informations sur le produit si fourni
    if (productId) {
      if (!blogPost.statistics.clicksByProduct) {
        blogPost.statistics.clicksByProduct = new Map();
      }
      const currentClicks = blogPost.statistics.clicksByProduct.get(productId) || 0;
      blogPost.statistics.clicksByProduct.set(productId, currentClicks + 1);
    }

    // Calculer le taux d'engagement
    const views = blogPost.statistics.views || 1;
    const clicks = blogPost.statistics.clicks || 0;
    blogPost.statistics.engagementRate = (clicks / views) * 100;

    await blogPost.save();

    res.status(200).json({ 
      success: true, 
      message: 'Clic sur l\'article enregistré avec succès',
      data: {
        postId,
        totalClicks: blogPost.statistics.clicks,
        engagementRate: blogPost.statistics.engagementRate,
        title: blogPost.title
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic sur l\'article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'enregistrement du clic sur l\'article' 
    });
  }
}