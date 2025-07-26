// Types pour les paramètres d'utilités
export interface RecentOrderSettings {
  showTimestamp: boolean;
  operations: string;
  purchaseCode: string;
  adminEmail: string;
}

export interface GeneralInfoSettings {
  adminEmail: string;
  timezone: string;
  rtlLanguage: boolean;
}

export interface AdminAppearanceSettings {
  avatar: string;
  favicon: string;
  adminTitle: string;
  adminLanguageDirection: string;
  rightToLeft: boolean;
}

export interface CacheSettings {
  enableCache: boolean;
  cacheAutoCleanup: boolean;
}

export interface DatabaseSettings {
  defaultStoreCreatedMethod: boolean;
  defaultStoreSelectMethod: boolean;
}

export interface OptimizePageSpeedSettings {
  enableOptimizeSpeed: boolean;
}

export interface ThemeSettings {
  enableSetTheme: boolean;
  chooseTheme: string;
  additionalFooterText: boolean;
}

export interface ContactSettings {
  workdayKeywords: string;
  workdayEmailDomains: string;
}

export interface GoogleAnalyticsSettings {
  googleTagId: string;
  propertyData: string;
}

export interface BlogSettings {
  enableBlog: boolean;
  showSidebar: boolean;
}

export interface NewsletterSettings {
  enableNewsletterSection: boolean;
}

export interface CaptchaSettings {
  enableCaptcha: boolean;
}

export interface SimpleSlidersSettings {
  chooseDefaultProduct: boolean;
}

export interface SettingsState {
  recentOrder: RecentOrderSettings;
  generalInfo: GeneralInfoSettings;
  adminAppearance: AdminAppearanceSettings;
  cache: CacheSettings;
  database: DatabaseSettings;
  optimizePageSpeed: OptimizePageSpeedSettings;
  theme: ThemeSettings;
  contact: ContactSettings;
  googleAnalytics: GoogleAnalyticsSettings;
  blog: BlogSettings;
  newsletter: NewsletterSettings;
  captcha: CaptchaSettings;
  simpleSliders: SimpleSlidersSettings;
}

export type SettingsSectionType = keyof SettingsState;
