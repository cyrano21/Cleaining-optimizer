import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  permissions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
RoleSchema.index({ isActive: 1 });

// Méthode pour récupérer les rôles actifs
RoleSchema.statics.getActiveRoles = function() {
  return this.find({ isActive: true });
};

// Validation des permissions
RoleSchema.pre('save', function(next) {
  if (this.permissions.length === 0) {
    next(new Error('Un rôle doit avoir au moins une permission'));
  } else {
    next();
  }
});

const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
