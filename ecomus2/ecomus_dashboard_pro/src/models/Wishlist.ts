import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  dateAdded: Date;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index pour éviter les doublons
WishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });

// Index pour les requêtes par utilisateur
WishlistItemSchema.index({ user: 1, dateAdded: -1 });

const WishlistItem = mongoose.models.WishlistItem || mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema);

export default WishlistItem;
