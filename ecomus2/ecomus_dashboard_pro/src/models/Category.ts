import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  image: string;
  featured: boolean;
  slug: string;
  storeId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
    },
    image: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    storeId: {
      type: String,
      required: false,
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title cannot be more than 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot be more than 160 characters'],
    },
    seoKeywords: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
