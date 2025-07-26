
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
    },
    image: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
