import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteShop extends Document {
  user: mongoose.Types.ObjectId;
  shop: mongoose.Types.ObjectId;
  addedAt: Date;
}

const FavoriteShopSchema = new Schema<IFavoriteShop>(
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
    addedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Index composé pour éviter les doublons
FavoriteShopSchema.index({ user: 1, shop: 1 }, { unique: true });

export default mongoose.models.FavoriteShop || mongoose.model<IFavoriteShop>('FavoriteShop', FavoriteShopSchema);
