import connectDB from '../../../config/db';
import mongoose from 'mongoose';
import { deleteImage } from '../../../config/cloudinary';

// utilser le même schéma que dans index.js
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  cloudinaryId: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: false,
    default: 'Admin'
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    author: String,
    content: String,
    date: { type: Date, default: Date.now },
    approved: { type: Boolean, default: false } // Add an approved field
  }]
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID du blog manquant' });
  }

  try {
    // Connexion à MongoDB
    const conn = await connectDB();

    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }

    switch (req.method) {
      case 'GET':
        try {
          // Récupérer un blog spécifique avec mise à jour des vues et récupération des commentaires
          const blog = await Blog.findByIdAndUpdate(
            id, 
            { $inc: { views: 1 } }, 
            { new: true }
          );
          
          if (!blog) {
            return res.status(404).json({ error: 'Blog non trouvé' });
          }

          // S'assurer que la propriété comments existe
          if (!blog.comments) {
            blog.comments = [];
          }
          
          // Filtrer les commentaires pour n'afficher que ceux qui sont approuvés
          blog.comments = blog.comments.filter(comment => comment.approved);
          
          console.log(`Blog récupéré avec ${blog.comments.length} commentaires approuvés`);
          return res.status(200).json(blog);
        } catch (error) {
          console.error('Erreur lors de la récupération du blog:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération du blog', details: error.message });
        }

      case 'PUT':
        // Mettre à jour un blog
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBlog) {
          return res.status(404).json({ error: 'Blog non trouvé' });
        }
        return res.status(200).json(updatedBlog);

      case 'DELETE':
        // Supprimer un blog
        const blogToDelete = await Blog.findById(id);
        if (!blogToDelete) {
          return res.status(404).json({ error: 'Blog non trouvé' });
        }

        // Si le blog a une image Cloudinary, la supprimer également
        if (blogToDelete.cloudinaryId) {
          try {
            await deleteImage(blogToDelete.cloudinaryId);
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'image:', error);
            // Continuer malgré l'erreur de suppression d'image
          }
        }

        await Blog.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Blog supprimé avec succès' });

      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API blog:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}