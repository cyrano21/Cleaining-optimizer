import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  providerId?: string;
  providerResponse?: any;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount must be a positive number']
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    providerId: {
      type: String
    },
    providerResponse: {
      type: Schema.Types.Mixed
    },
    refundAmount: {
      type: Number,
      min: 0
    },
    refundReason: {
      type: String
    },
    refundedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ transactionId: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
