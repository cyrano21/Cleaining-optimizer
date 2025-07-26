import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'direct' | 'support' | 'system' | 'marketing';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    type: {
      type: String,
      enum: ['direct', 'support', 'system', 'marketing'],
      default: 'direct'
    }
  },
  {
    timestamps: true
  }
);

// Index pour optimiser les requêtes
MessageSchema.index({ recipient: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
