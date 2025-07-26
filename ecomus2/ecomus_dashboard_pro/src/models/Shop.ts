import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
  name: string;
  slug: string;
  description: string;
  seller: mongoose.Types.ObjectId;
  logo?: string;
  banner?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalProducts: number;
  isActive: boolean;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'suspended' | 'closed';
  subscription?: {
    plan: 'basic' | 'premium' | 'enterprise';
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a shop name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a shop description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      website: {
        type: String,
      },
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'closed'],
      default: 'pending',
    },
    subscription: {
      plan: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        default: 'basic',
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
ShopSchema.index({ slug: 1 });
ShopSchema.index({ seller: 1 });
ShopSchema.index({ status: 1, isActive: 1 });

export default mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);
