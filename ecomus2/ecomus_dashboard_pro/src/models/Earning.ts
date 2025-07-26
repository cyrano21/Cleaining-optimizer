import mongoose, { Document, Schema } from 'mongoose';

export interface IEarning extends Document {
  seller: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  orderNumber: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paymentDate?: Date;
  period: {
    year: number;
    month: number;
    quarter: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EarningSchema = new Schema<IEarning>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price must be positive']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be positive']
    },
    commissionRate: {
      type: Number,
      required: true,
      min: [0, 'Commission rate must be positive'],
      max: [100, 'Commission rate cannot exceed 100%']
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: [0, 'Commission amount must be positive']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending'
    },
    paymentDate: {
      type: Date
    },
    period: {
      year: {
        type: Number,
        required: true
      },
      month: {
        type: Number,
        required: true
      },
      quarter: {
        type: Number,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Index composés pour les requêtes fréquentes
EarningSchema.index({ seller: 1, period: 1 });
EarningSchema.index({ seller: 1, status: 1 });
EarningSchema.index({ seller: 1, createdAt: -1 });
EarningSchema.index({ period: 1, status: 1 });

export default mongoose.models.Earning || mongoose.model<IEarning>('Earning', EarningSchema); 