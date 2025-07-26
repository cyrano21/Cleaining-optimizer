import mongoose, { Document, Schema } from 'mongoose';

export interface ISeller extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  businessType: 'individual' | 'company' | 'organization';
  businessRegistrationNumber?: string;
  taxId?: string;
  bankAccount: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  isVerified: boolean;
  verificationDocuments?: string[];
  commission: number;
  totalEarnings: number;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      maxlength: [100, 'Business name cannot be more than 100 characters'],
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'organization'],
      required: true
    },
    businessRegistrationNumber: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    },
    bankAccount: {
      accountNumber: {
        type: String,
        required: true
      },
      routingNumber: {
        type: String,
        required: true
      },
      bankName: {
        type: String,
        required: true
      }
    },
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    },
    phone: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      type: String
    }],
    commission: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

SellerSchema.index({ status: 1, isVerified: 1 });

export default mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
