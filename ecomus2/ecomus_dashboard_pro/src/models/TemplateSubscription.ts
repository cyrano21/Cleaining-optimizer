import mongoose, { Schema, Document } from 'mongoose';

// Interface pour les fonctionnalités d'un template
export interface TemplateFeature {
  name: string;
  description?: string;
}

// Interface pour un template avec ses restrictions d'abonnement
export interface TemplateSubscriptionDocument extends Document {
  templateId: string;
  name: string;
  description: string;
  category: string;
  previewUrl?: string;
  features: TemplateFeature[];
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSubscriptionSchema = new Schema<TemplateSubscriptionDocument>(
  {
    templateId: {
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
      enum: ['fashion', 'generic', 'accessories', 'footwear', 'bags', 'jewelry', 'beauty', 'skincare', 'tech', 'furniture', 'marketplace', 'baby', 'pod'],
      trim: true
    },
    previewUrl: {
      type: String,
      trim: true
    },
    features: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }],
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
TemplateSubscriptionSchema.index({ subscriptionTier: 1, isActive: 1, sortOrder: 1 });
TemplateSubscriptionSchema.index({ category: 1, subscriptionTier: 1 });
// TemplateSubscriptionSchema.index({ templateId: 1 }); // doublon inutile car unique: true déjà présent

export default mongoose.models.TemplateSubscription ||
  mongoose.model<TemplateSubscriptionDocument>('TemplateSubscription', TemplateSubscriptionSchema);