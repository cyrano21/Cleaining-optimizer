import mongoose, { Schema, Document } from 'mongoose';

export interface IAttribute extends Document {
  category: string;
  value: string;
  description?: string;
  storeId?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSchema = new Schema<IAttribute>({
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  value: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    maxlength: 1000
  },
  storeId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
AttributeSchema.index({ category: 1, isActive: 1 });
AttributeSchema.index({ createdBy: 1 });
AttributeSchema.index({ storeId: 1, isActive: 1 });

// Index unique pour éviter les doublons par store
AttributeSchema.index({ category: 1, value: 1, storeId: 1 }, { unique: true });

const Attribute = mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);

export default Attribute;
