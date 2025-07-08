
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    transactionId: {
      type: String,
    },
    paymentDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
