import dbConnect from '../../lib/dbConnect';
import ThemeSettings from '../../models/ThemeSettings';
import ParallaxBanner from '../../models/ParallaxBanner';
import SlidingAd from '../../models/SlidingAd';
import BlogPost from '../../models/BlogPost';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { type, page } = req.query;
        
        if (type === 'theme') {
          // Récupérer les paramètres de thème
          let themeSettings = await ThemeSettings.findOne();
          
          if (!themeSettings) {
            // Créer des paramètres par défaut si aucun n'existe
            themeSettings = new ThemeSettings({
              general: {
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                accentColor: '#28a745',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                fontFamily: 'Inter, sans-serif',
                borderRadius: 8,
                enableAnimations: true,
                enableParallax: true,
                enableGradients: true,
              },
              productPage: {
                showParallaxBanners: true,
                showSlidingAds: true,
                showBlogSidebar: true,
                enableProductAnimations: true,
                showRelatedProducts: true,
                enableZoomEffect: true,
              }
            });
            await themeSettings.save();
          }
          
          res.status(200).json({ success: true, data: themeSettings });
        } else if (type === 'banners') {
          // Récupérer les bannières parallax actives
          const banners = await ParallaxBanner.find({
            isActive: true,
            $or: [
              { targetPages: page || 'product' },
              { targetPages: 'all' },
              { targetPages: { $exists: false } }
            ],
            $or: [
              { startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
              { startDate: { $exists: false }, endDate: { $exists: false } }
            ]
          }).sort({ displayOrder: 1, createdAt: -1 });
          
          res.status(200).json({ success: true, data: banners });
        } else if (type === 'ads') {
          // Récupérer les publicités coulissantes actives
          const ads = await SlidingAd.find({
            isActive: true,
            $or: [
              { targetPages: page || 'product' },
              { targetPages: 'all' },
              { targetPages: { $exists: false } }
            ],
            $or: [
              { startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
              { startDate: { $exists: false }, endDate: { $exists: false } }
            ]
          }).sort({ priority: 1, createdAt: -1 });
          
          res.status(200).json({ success: true, data: ads });
        } else if (type === 'blog') {
          // Récupérer les articles de blog pour la sidebar
          const posts = await BlogPost.getSidebarPosts(page || 'product', 5);
          
          res.status(200).json({ success: true, data: posts });
        } else {
          // Récupérer toutes les données pour une page
          const [themeSettings, banners, ads, blogPosts] = await Promise.all([
            ThemeSettings.findOne(),
            ParallaxBanner.find({
              isActive: true,
              $or: [
                { targetPages: page || 'product' },
                { targetPages: 'all' },
                { targetPages: { $exists: false } }
              ]
            }).sort({ displayOrder: 1 }),
            SlidingAd.find({
              isActive: true,
              $or: [
                { targetPages: page || 'product' },
                { targetPages: 'all' },
                { targetPages: { $exists: false } }
              ]
            }).sort({ priority: 1 }),
            BlogPost.getSidebarPosts(page || 'product', 5)
          ]);
          
          res.status(200).json({
            success: true,
            data: {
              theme: themeSettings,
              banners,
              ads,
              blogPosts
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const session = await getSession({ req });
        
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'seller')) {
          return res.status(401).json({ success: false, error: 'Non autorisé' });
        }

        const { type, data } = req.body;
        
        if (type === 'theme') {
          // Mettre à jour ou créer les paramètres de thème
          let themeSettings = await ThemeSettings.findOne();
          
          if (themeSettings) {
            Object.assign(themeSettings, data);
            themeSettings.updatedBy = session.user.id;
          } else {
            themeSettings = new ThemeSettings({
              ...data,
              createdBy: session.user.id
            });
          }
          
          await themeSettings.save();
          res.status(200).json({ success: true, data: themeSettings });
        } else if (type === 'banner') {
          // Créer une nouvelle bannière parallax
          const banner = new ParallaxBanner({
            ...data,
            createdBy: session.user.id
          });
          
          await banner.save();
          res.status(201).json({ success: true, data: banner });
        } else if (type === 'ad') {
          // Créer une nouvelle publicité coulissante
          const ad = new SlidingAd({
            ...data,
            createdBy: session.user.id
          });
          
          await ad.save();
          res.status(201).json({ success: true, data: ad });
        } else if (type === 'blog') {
          // Créer un nouveau post de blog
          const post = new BlogPost({
            ...data,
            author: session.user.id,
            createdBy: session.user.id
          });
          
          await post.save();
          res.status(201).json({ success: true, data: post });
        } else {
          res.status(400).json({ success: false, error: 'Type non supporté' });
        }
      } catch (error) {
        console.error('Erreur lors de la création:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const session = await getSession({ req });
        
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'seller')) {
          return res.status(401).json({ success: false, error: 'Non autorisé' });
        }

        const { type, id, data } = req.body;
        
        if (type === 'banner') {
          const banner = await ParallaxBanner.findByIdAndUpdate(
            id,
            { ...data, updatedBy: session.user.id },
            { new: true, runValidators: true }
          );
          
          if (!banner) {
            return res.status(404).json({ success: false, error: 'Bannière non trouvée' });
          }
          
          res.status(200).json({ success: true, data: banner });
        } else if (type === 'ad') {
          const ad = await SlidingAd.findByIdAndUpdate(
            id,
            { ...data, updatedBy: session.user.id },
            { new: true, runValidators: true }
          );
          
          if (!ad) {
            return res.status(404).json({ success: false, error: 'Publicité non trouvée' });
          }
          
          res.status(200).json({ success: true, data: ad });
        } else if (type === 'blog') {
          const post = await BlogPost.findByIdAndUpdate(
            id,
            { ...data, updatedBy: session.user.id },
            { new: true, runValidators: true }
          );
          
          if (!post) {
            return res.status(404).json({ success: false, error: 'Article non trouvé' });
          }
          
          res.status(200).json({ success: true, data: post });
        } else {
          res.status(400).json({ success: false, error: 'Type non supporté' });
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const session = await getSession({ req });
        
        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({ success: false, error: 'Non autorisé' });
        }

        const { type, id } = req.query;
        
        if (type === 'banner') {
          const banner = await ParallaxBanner.findByIdAndDelete(id);
          if (!banner) {
            return res.status(404).json({ success: false, error: 'Bannière non trouvée' });
          }
        } else if (type === 'ad') {
          const ad = await SlidingAd.findByIdAndDelete(id);
          if (!ad) {
            return res.status(404).json({ success: false, error: 'Publicité non trouvée' });
          }
        } else if (type === 'blog') {
          const post = await BlogPost.findByIdAndDelete(id);
          if (!post) {
            return res.status(404).json({ success: false, error: 'Article non trouvé' });
          }
        } else {
          return res.status(400).json({ success: false, error: 'Type non supporté' });
        }
        
        res.status(200).json({ success: true, message: 'Supprimé avec succès' });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Méthode non supportée' });
      break;
  }
}