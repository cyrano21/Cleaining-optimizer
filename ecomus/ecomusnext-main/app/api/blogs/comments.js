
import { connectToDatabase } from '../../../utils/db';
import mongoose from 'mongoose';
import Blog from '@/components/homes/home-giftcard/Blog';

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      // Ajouter un commentaire
      const { blogId, author, email, content } = req.body;
      
      if (!blogId || !author || !email || !content) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
      }

      const comment = {
        author,
        email,
        content,
        date: new Date(),
        approved: true // Auto-approuvé pour simplifier
      };

      console.log(`Ajout d'un nouveau commentaire pour le blog ${blogId} par ${author}`);

      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $push: { comments: comment } },
        { new: true, runValidators: true }
      );
      
      console.log(`Blog mis à jour, nombre de commentaires: ${updatedBlog.comments.length}`);

      if (!updatedBlog) {
        return res.status(404).json({ success: false, message: 'Blog non trouvé' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Commentaire ajouté avec succès',
        comment 
      });
    } 
    
    else if (req.method === 'GET') {
      // Récupérer les commentaires d'un blog
      const { blogId } = req.query;
      
      if (!blogId) {
        return res.status(400).json({ success: false, message: 'ID du blog requis' });
      }

      const blog = await Blog.findById(blogId);
      
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog non trouvé' });
      }

      return res.status(200).json({ 
        success: true, 
        comments: blog.comments.filter(comment => comment.approved)
      });
    }
    
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur avec les commentaires:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
