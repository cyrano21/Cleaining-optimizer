import mongoose from 'mongoose';

export interface ISystemSettings {
  _id: string;
  settingKey: string;
  settingValue: any;
  category: 'logos' | 'branding' | 'general' | 'email' | 'notifications';
  label: string;
  description: string;
  type: 'text' | 'image' | 'url' | 'boolean' | 'number' | 'json';
  isEditable: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema = new mongoose.Schema<ISystemSettings>({
  settingKey: {
    type: String,
    required: true,
    unique: true
  },
  settingValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    enum: ['logos', 'branding', 'general', 'email', 'notifications'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'url', 'boolean', 'number', 'json'],
    required: true
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes par catégorie
SystemSettingsSchema.index({ category: 1, isEditable: 1 });
SystemSettingsSchema.index({ isPublic: 1 });

const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;

// Types pour TypeScript
export interface LogoSettings {
  mainLogo: string;
  authLogo: string;
  ecommerceLogo: string;
  faviconLogo: string;
  storeLogo: string;
  adminLogo: string;
  emailLogo: string;
}

export interface BrandingSettings {
  companyName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export type SettingsByCategory = {
  logos: LogoSettings;
  branding: BrandingSettings;
  [key: string]: any;
};
