import mongoose from 'mongoose';

export interface ISystemConfig {
  _id?: string;
  maintenance?: {
    enabled: boolean;
    message: string;
    allowedRoles: string[];
  };
  security?: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireTwoFactor: boolean;
    sessionTimeout: number;
    passwordPolicy?: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  features?: {
    userRegistration: boolean;
    vendorRegistration: boolean;
    guestCheckout: boolean;
    reviews: boolean;
    wishlist: boolean;
    multiStore: boolean;
  };  email?: {
    enabled: boolean;
    provider: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
  storage?: {
    provider: string;
    maxFileSize: number;
    allowedTypes: string[];
  };
  api?: {
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
  };
  notifications?: {
    systemAlerts: boolean;
    userRegistrations: boolean;
    orderNotifications: boolean;
    securityAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  performance?: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    analyticsEnabled: boolean;
    optimizeImages: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const SystemConfigSchema = new mongoose.Schema<ISystemConfig>({
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: "Le site est en maintenance. Nous reviendrons bientôt !" },
    allowedRoles: [{ type: String, default: ['super_admin', 'admin'] }]
  },
  security: {
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDuration: { type: Number, default: 15 },
    requireTwoFactor: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 24 },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true }
    }
  },
  features: {
    userRegistration: { type: Boolean, default: true },
    vendorRegistration: { type: Boolean, default: true },
    guestCheckout: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    wishlist: { type: Boolean, default: true },
    multiStore: { type: Boolean, default: true }
  },  email: {
    enabled: { type: Boolean, default: true },
    provider: { type: String, default: "smtp" },
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: '' },
      password: { type: String, default: '' }
    }
  },
  storage: {
    provider: { type: String, default: "local" },
    maxFileSize: { type: Number, default: 10 },
    allowedTypes: [{ type: String, default: ["image/jpeg", "image/png", "image/webp"] }]
  },
  api: {
    rateLimit: {
      enabled: { type: Boolean, default: true },
      maxRequests: { type: Number, default: 100 },
      windowMs: { type: Number, default: 900000 }
    }
  },
  notifications: {
    systemAlerts: { type: Boolean, default: true },
    userRegistrations: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false }
  },
  performance: {
    cacheEnabled: { type: Boolean, default: true },
    compressionEnabled: { type: Boolean, default: true },
    cdnEnabled: { type: Boolean, default: false },
    analyticsEnabled: { type: Boolean, default: true },
    optimizeImages: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Méthode pour récupérer ou créer la configuration système
SystemConfigSchema.statics.getSystemConfig = async function() {
  let config = await this.findOne();
  
  if (!config) {
    config = new this({});
    await config.save();
  }
  
  return config;
};

const SystemConfig = mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);

export default SystemConfig;
