import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'order_created' | 'order_updated' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 
        'payment_received' | 'payment_failed' | 'product_low_stock' | 'product_out_of_stock' | 
        'review_received' | 'message_received' | 'shop_approved' | 'shop_suspended' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'order_created',
        'order_updated',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'payment_received',
        'payment_failed',
        'product_low_stock',
        'product_out_of_stock',
        'review_received',
        'message_received',
        'shop_approved',
        'shop_suspended',
        'general'
      ],
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      maxlength: [500, 'Message cannot be more than 500 characters']
    },
    data: {
      type: Schema.Types.Mixed
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

// Index pour améliorer les performances
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
