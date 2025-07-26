
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      maxlength: [100, 'Business name cannot be more than 100 characters'],
    },
    businessEmail: {
      type: String,
      required: [true, 'Please provide a business email'],
      unique: true,
      match: [
        /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    taxId: {
      type: String,
      required: [true, 'Please provide a tax ID'],
    },
    businessAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership'],
      default: 'individual',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationDocuments: {
      identityProof: { type: String },
      businessRegistration: { type: String },
      taxCertificate: { type: String },
    },
    bankInfo: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      swiftCode: { type: String },
      routingNumber: { type: String },
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
