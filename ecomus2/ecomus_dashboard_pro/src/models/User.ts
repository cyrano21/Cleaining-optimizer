import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "vendor" | "customer";
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  profile: {
    avatar?: string;
    avatarPublicId?: string; // ID Cloudinary pour suppression
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other";
    // Champs dynamiques pour l'administration
    company?: string;
    position?: string;
    website?: string;
    location?: string;
    skills?: string[];
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
    [key: string]: any; // Permettre des champs dynamiques
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    timezone: string;
    currency: string;
  };

  // Champs spécifiques aux vendeurs
  vendor?: {
    businessName?: string;
    businessType?: string;
    description?: string;
    category?: string;
    taxId?: string;
    verificationDocuments?: string[];
    isVerified: boolean;
    verifiedAt?: Date;
    stores: mongoose.Types.ObjectId[];
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    logo?: string;
    bannerImage?: string;
  };

  // Champs spécifiques aux clients
  customer?: {
    wishlist: mongoose.Types.ObjectId[];
    orders: mongoose.Types.ObjectId[];
    reviews: mongoose.Types.ObjectId[];
    favoriteStores: mongoose.Types.ObjectId[];
    rewardPoints: number;
    membershipLevel: "bronze" | "silver" | "gold" | "platinum";
  };

  // Statistiques
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageRating: number;
    reviewCount: number;
  };

  // Relations sociales
  social: {
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    followingVendors: mongoose.Types.ObjectId[];
  };

  createdAt: Date;
  updatedAt: Date;

  // Méthodes d'instance
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  isAccountLocked(): boolean;
  incLoginAttempts(): Promise<IUser>;
}

// Constantes pour la sécurité
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 heures

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
      maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },
    lastName: {
      type: String,
      required: [true, "Le nom de famille est requis"],
      trim: true,
      maxlength: [50, "Le nom de famille ne peut pas dépasser 50 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    profile: {
      avatar: String,
      avatarPublicId: String, // ID Cloudinary pour suppression
      bio: {
        type: String,
        maxlength: [500, "La bio ne peut pas dépasser 500 caractères"],
      },
      phone: {
        type: String,
        trim: true,
      },
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      // Champs dynamiques pour l'administration
      company: String,
      position: String,
      website: String,
      location: String,
      skills: [String],
      socialLinks: {
        linkedin: String,
        twitter: String,
        instagram: String,
        facebook: String,
      },
      // Permettre des champs dynamiques supplémentaires
      type: Schema.Types.Mixed,
    },

    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    preferences: {
      notifications: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      language: { type: String, default: "fr" },
      timezone: { type: String, default: "Europe/Paris" },
      currency: { type: String, default: "EUR" },
    },

    vendor: {
      businessName: String,
      businessType: String,
      description: String,
      category: String,
      taxId: String,
      verificationDocuments: [String],
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      stores: [{ type: Schema.Types.ObjectId, ref: "Store" }],
    },

    customer: {
      wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
      reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
      favoriteStores: [{ type: Schema.Types.ObjectId, ref: "Store" }],
      rewardPoints: { type: Number, default: 0 },
      membershipLevel: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
    },

    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },

    social: {
      followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      following: [{ type: Schema.Types.ObjectId, ref: "User" }],
      followingVendors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches (email a déjà unique: true, pas besoin d'index supplémentaire)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ "vendor.isVerified": 1 });
UserSchema.index({ createdAt: -1 });

// Virtual pour le nom complet
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual pour vérifier si le compte est verrouillé
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date(Date.now()));
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le nom complet
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// Méthode pour vérifier si le compte est verrouillé
UserSchema.methods.isAccountLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date(Date.now()));
};

// Méthode pour incrémenter les tentatives de connexion
UserSchema.methods.incLoginAttempts = async function (): Promise<IUser> {
  // Si nous avons un verrou antérieur et qu'il a expiré, redémarrer à 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Si nous atteignons le max d'essais et qu'il n'y a pas de verrou, verrouiller le compte
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isAccountLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  return this.updateOne(updates);
};

// Middleware pour hasher le mot de passe avant sauvegarde
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Middleware pour initialiser les champs spécifiques au rôle
UserSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    if (this.role === "vendor" && !this.vendor) {
      this.vendor = {
        businessName: "",
        businessType: "",
        description: "",
        category: "",
        taxId: "",
        verificationDocuments: [],
        isVerified: false,
        stores: [],
      };
    }

    if (this.role === "customer" && !this.customer) {
      this.customer = {
        wishlist: [],
        orders: [],
        reviews: [],
        favoriteStores: [],
        rewardPoints: 0,
        membershipLevel: "bronze",
      };
    }
  }
  next();
});

// Méthodes statiques
UserSchema.statics.findByRole = function (role: string) {
  return this.find({ role, isActive: true });
};

UserSchema.statics.findVendors = function () {
  return this.find({ role: "vendor", isActive: true });
};

UserSchema.statics.findCustomers = function () {
  return this.find({ role: "customer", isActive: true });
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
