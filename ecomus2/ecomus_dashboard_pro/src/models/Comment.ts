import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  isApproved: boolean;
  isSpam: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Please provide comment content'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isApproved: {
      type: Boolean,
      default: false
    },
    isSpam: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parent: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
