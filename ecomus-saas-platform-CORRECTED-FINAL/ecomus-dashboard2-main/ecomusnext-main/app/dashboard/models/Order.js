
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number']
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      required: true
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: {
      type: Object,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    trackingNumber: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
