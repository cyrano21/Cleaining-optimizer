import mongoose, { Schema, Document } from 'mongoose';

// Interface pour une page avec ses restrictions d'abonnement
export interface PageSubscriptionDocument extends Document {
  pageId: string;
  name: string;
  description: string;
  category: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageSubscriptionSchema = new Schema<PageSubscriptionDocument>(
  {
    pageId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['info', 'contact', 'support', 'locations', 'brands', 'business'],
      trim: true
    },
    subscriptionTier: {
      type: String,
      required: true,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour optimiser les requêtes
PageSubscriptionSchema.index({ subscriptionTier: 1, isActive: 1, sortOrder: 1 });
PageSubscriptionSchema.index({ category: 1, subscriptionTier: 1 });
// Note: pageId index is automatically created by unique: true property

export default mongoose.models.PageSubscription ||
  mongoose.model<PageSubscriptionDocument>('PageSubscription', PageSubscriptionSchema);