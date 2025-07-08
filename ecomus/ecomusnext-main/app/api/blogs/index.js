import connectDB from '../../../config/db';
import mongoose from 'mongoose';

// Définition du schéma Blog pour MongoDB s'il n'existe pas déjà
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
  image: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      // Paramètres de pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Filtres optionnels
      const filters = {};
      if (req.query.category) filters.category = req.query.category;
      if (req.query.tag) filters.tags = { $in: [req.query.tag] };
      if (req.query.exclude) filters._id = { $ne: req.query.exclude };

      // Pour l'admin, afficher tous les blogs. Pour le public, uniquement ceux publiés
      if (!req.query.isAdmin) {
        filters.isPublished = true;
      }

      // Tri
      const sortField = req.query.sortBy || 'date';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };

      // Exécution de la requête
      const blogs = await Blog.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await Blog.countDocuments(filters);

      res.status(200).json({
        data: blogs,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des blogs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des blogs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, imageUrl, cloudinaryId, category, author, tags, isPublished, image } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Le titre et le contenu sont obligatoires' });
      }

      const newBlog = new Blog({
        title,
        content,
        imageUrl,
        cloudinaryId,
        category,
        author: author || 'Admin',
        tags: tags || [],
        isPublished: isPublished !== undefined ? isPublished : true,
        date: new Date(),
        image
      });

      await newBlog.save();

      res.status(201).json(newBlog);
    } catch (error) {
      console.error('Erreur lors de la création du blog:', error);
      res.status(500).json({ error: 'Erreur lors de la création du blog' });
    }
  } else {
    res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }
}