import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: mongoose.Types.ObjectId;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  readTime: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'L\'extrait ne peut pas dépasser 300 caractères'],
    },
    featuredImage: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères'],
    },
    seoKeywords: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ categories: 1 });
BlogSchema.index({ tags: 1 });

// Middleware pour calculer le temps de lecture
BlogSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Middleware pour définir la date de publication
BlogSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
