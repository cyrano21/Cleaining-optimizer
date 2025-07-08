
import mongoose from 'mongoose';

const FavoriteShopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Un utilisateur ne peut avoir qu'une entrée pour une boutique spécifique dans ses favoris
FavoriteShopSchema.index({ user: 1, shop: 1 }, { unique: true });

export default mongoose.models.FavoriteShop || mongoose.model('FavoriteShop', FavoriteShopSchema);
