import mongoose, { Document, Schema } from 'mongoose';

export interface IShopReview extends Document {
  user: mongoose.Types.ObjectId;
  shop: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  reported: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reply?: {
    content: string;
    repliedBy: mongoose.Types.ObjectId;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShopReviewSchema = new Schema<IShopReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    images: [{
      type: String
    }],
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    reported: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reply: {
      content: {
        type: String,
        maxlength: [500, 'Reply cannot be more than 500 characters']
      },
      repliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      repliedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true
  }
);

ShopReviewSchema.index({ shop: 1, rating: -1 });
ShopReviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.ShopReview || mongoose.model<IShopReview>('ShopReview', ShopReviewSchema);
