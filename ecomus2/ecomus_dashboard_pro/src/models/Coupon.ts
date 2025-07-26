import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  excludedProducts?: mongoose.Types.ObjectId[];
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true
    },
    value: {
      type: Number,
      required: [true, 'Please provide a value'],
      min: [0, 'Value must be a positive number']
    },
    minimumOrderValue: {
      type: Number,
      min: 0
    },
    maximumDiscount: {
      type: Number,
      min: 0
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    applicableCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    excludedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
