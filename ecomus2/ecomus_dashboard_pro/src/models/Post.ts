import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  images?: string[];
  categories: mongoose.Types.ObjectId[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  views: number;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    content: {
      type: String,
      required: [true, 'Please provide post content']
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    featuredImage: {
      type: String
    },
    images: [{
      type: String
    }],
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: {
      type: Date
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title cannot be more than 60 characters']
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot be more than 160 characters']
    }
  },
  {
    timestamps: true
  }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ tags: 1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
