import connectDB from '../../../config/db';
import mongoose from 'mongoose';
import { withAuth } from 'middleware/authMiddleware';
import formidable from 'formidable';
import cloudinary from '../../../config/cloudinary';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const readFileAsync = promisify(fs.readFile);

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  title: { type: String },
  content: { type: String },
  pros: { type: String },
  cons: { type: String },
  useCase: { type: String },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  unhelpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  helpfulCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function handler(req, res) {
  const { method } = req;

  try {
    const conn = await connectDB();

    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }

    switch (method) {
      case 'GET':
        try {
          const {
            productId,
            filter = 'all',
            sort = 'newest',
            page = 1,
            limit = 10
          } = req.query;

          if (!productId) {
            return res.status(400).json({ success: false, message: 'ID de produit requis' });
          }

          const query = { product: productId };

          if (filter !== 'all' && filter !== 'media') {
            query.rating = parseInt(filter);
          }

          if (filter === 'media') {
            query['images.0'] = { $exists: true };
          }

          let sortOptions = {};

          switch (sort) {
            case 'newest':
              sortOptions = { createdAt: -1 };
              break;
            case 'oldest':
              sortOptions = { createdAt: 1 };
              break;
            case 'highest':
              sortOptions = { rating: -1 };
              break;
            case 'lowest':
              sortOptions = { rating: 1 };
              break;
            case 'most_helpful':
              sortOptions = { helpfulCount: -1 };
              break;
            default:
              sortOptions = { createdAt: -1 };
          }

          const session = await getServerSession(req, res, authOptions);
          const userId = session?.user?.id;

          const pageNumber = parseInt(page);
          const limitNumber = parseInt(limit);
          const skip = (pageNumber - 1) * limitNumber;

          const totalReviews = await Review.countDocuments(query);
          const totalPages = Math.ceil(totalReviews / limitNumber);

          const reviews = await Review.find(query)
            .populate('user', 'name email image')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

          const reviewsWithUserInfo = reviews.map(review => {
            const reviewObj = review.toObject();

            if (userId) {
              reviewObj.isHelpfulByUser = review.helpfulVotes
                ? review.helpfulVotes.some(id => id.toString() === userId)
                : false;
            }

            return reviewObj;
          });

          const allReviews = await Review.find({ product: productId });
          const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

          const distribution = [0, 0, 0, 0, 0];

          allReviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
              distribution[review.rating - 1]++;
            }
          });

          return res.status(200).json({
            success: true,
            reviews: reviewsWithUserInfo,
            page: pageNumber,
            totalPages,
            totalReviews,
            stats: {
              average: averageRating,
              total: allReviews.length,
              distribution
            }
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des avis:', error);
          return res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des avis',
            error: error.message
          });
        }

      case 'POST':
        try {
          const session = await getServerSession(req, res, authOptions);
          if (!session) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
          }

          const form = formidable({ multiples: true });

          const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) reject(err);
              resolve([fields, files]);
            });
          });

          const { productId, rating, content, title, pros, cons, useCase } = fields;

          if (!productId || !rating || !content) {
            return res.status(400).json({
              success: false,
              message: 'Produit, note et contenu sont requis'
            });
          }

          const existingReview = await Review.findOne({
            product: productId,
            user: session.user.id
          });

          if (existingReview) {
            return res.status(400).json({
              success: false,
              message: 'Vous avez déjà publié un avis pour ce produit'
            });
          }

          const hasOrdered = await Order.findOne({
            user: session.user.id,
            'items.product': productId,
            status: { $in: ['delivered', 'completed'] }
          });

          let imageUrls = [];

          if (files.images) {
            const images = Array.isArray(files.images) ? files.images : [files.images];
            const imagesToUpload = images.slice(0, 3);

            for (const image of imagesToUpload) {
              try {
                const fileData = await readFileAsync(image.filepath);

                const uploadResult = await cloudinary.uploader.upload(image.filepath, {
                  folder: 'reviews',
                  public_id: `review_${uuidv4()}`
                });

                imageUrls.push(uploadResult.secure_url);
              } catch (uploadError) {
                console.error('Erreur lors du téléchargement de l\'image:', uploadError);
              }
            }
          }

          const review = await Review.create({
            product: productId,
            user: session.user.id,
            rating: parseInt(rating),
            title,
            content,
            pros,
            cons,
            useCase,
            images: imageUrls,
            isVerifiedPurchase: !!hasOrdered,
            helpfulVotes: [],
            unhelpfulVotes: [],
            helpfulCount: 0
          });


          const allReviews = await Review.find({ product: productId });
          const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

          await Product.findByIdAndUpdate(productId, {
            rating: averageRating,
            reviewCount: allReviews.length
          });

          return res.status(201).json({
            success: true,
            data: review
          });
        } catch (error) {
          console.error('Erreur lors de la création de l\'avis:', error);
          return res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de l\'avis',
            error: error.message
          });
        }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Méthode ${method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur API avis:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}


async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({
      product: productId,
      isApproved: true
    });

    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const Product = mongoose.models.Product;
    if (Product) {
      await Product.findByIdAndUpdate(productId, {
        rating: averageRating
      });
    }
  } catch (error) {
    console.error('Erreur de mise à jour de la note du produit:', error);
  }
}

export default function reviewsHandler(req, res) {
  if (req.method === 'POST') {
    return withAuth(handler)(req, res);
  } else {
    return handler(req, res);
  }
}