import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

export interface IAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface IPaymentDetails {
  transactionId?: string;
  paymentDate?: Date;
  amount?: number;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  customerEmail?: string;
  store: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: IAddress;
  billingAddress: IAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentDetails: IPaymentDetails;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  couponCode: string;
  total: number;
  trackingNumber: string;
  shippingCarrier: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes: string;
  refundAmount: number;
  refundReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
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

const AddressSchema = new Schema<IAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String }
});

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false // Rendu optionnel car on utilise customer
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false // Pour compatibilité avec les anciennes données
    },
    customerEmail: {
      type: String,
      required: false
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    shippingAddress: {
      type: AddressSchema,
      required: true
    },
    billingAddress: {
      type: AddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    paymentDetails: {
      transactionId: String,
      paymentDate: Date,
      amount: Number
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
    discount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    total: {
      type: Number,
      required: true
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    shippingCarrier: {
      type: String,
      default: ''
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
