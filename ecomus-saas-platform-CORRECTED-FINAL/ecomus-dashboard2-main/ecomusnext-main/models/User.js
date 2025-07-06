
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: [30, 'Username cannot be more than 30 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin', 'super_admin'],
      default: 'user',
    },
    profile: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      bio: { type: String, default: '' },
      avatar: { type: String, default: '' },
      phone: { type: String, default: '' },
      
      address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' }
      },
      
      professional: {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        experience: { type: String, default: '' },
        skills: [{ type: String }],
        website: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' }
      }
    },
    permissions: [{ type: String }],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
