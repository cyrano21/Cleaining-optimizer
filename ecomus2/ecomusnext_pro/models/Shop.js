
import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a shop name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a shop description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    logo: {
      type: String,
      required: [true, 'Please provide a shop logo'],
    },
    banner: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide a contact email'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      pinterest: { type: String, default: '' },
    },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // Pourcentage de commission prélevé par la plateforme
    },
    featured: {
      type: Boolean,
      default: false,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
