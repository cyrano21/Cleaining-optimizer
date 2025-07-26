import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a collection title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a collection description'],
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Subtitle cannot be more than 200 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a collection image URL'],
    },
    backgroundImage: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ featured: 1, isActive: 1 });
CollectionSchema.index({ shop: 1, isActive: 1 });
CollectionSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);