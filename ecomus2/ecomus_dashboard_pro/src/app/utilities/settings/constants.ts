import { SettingsState } from './types';

// Valeurs par défaut pour tous les paramètres
export const defaultSettingsState: SettingsState = {
  recentOrder: {
    showTimestamp: true,
    operations: "Enter your operations",
    purchaseCode: "Enter your purchase code",
    adminEmail: "admin@example.com",
  },
  
  generalInfo: {
    adminEmail: "admin@example.com",
    timezone: "UTC",
    rtlLanguage: false,
  },
    adminAppearance: {
    avatar: "Option 1",
    favicon: "Option 1",
    adminTitle: "",
    adminLanguageDirection: "English",
    rightToLeft: false,
  },
    cache: {
    enableCache: true,
    cacheAutoCleanup: false,
  },
  
  database: {
    defaultStoreCreatedMethod: false,
    defaultStoreSelectMethod: false,
  },
    optimizePageSpeed: {
    enableOptimizeSpeed: true,
  },
    theme: {
    enableSetTheme: true,
    chooseTheme: "No",
    additionalFooterText: false,
  },
    contact: {
    workdayKeywords: "",
    workdayEmailDomains: "",
  },
    googleAnalytics: {
    googleTagId: "Enter your Google Tag ID",
    propertyData: "Enter your Property ID here",
  },
    blog: {
    enableBlog: false,
    showSidebar: false,
  },
  
  newsletter: {
    enableNewsletterSection: true,
  },
    captcha: {
    enableCaptcha: false,
  },
  
  simpleSliders: {
    chooseDefaultProduct: true,
  },
};

// Options pour les selects
export const timezoneOptions = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

export const compressionLevelOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const themeOptions = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "custom", label: "Custom" },
];

export const newsletterProviderOptions = [
  { value: "mailchimp", label: "MailChimp" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "constant-contact", label: "Constant Contact" },
];

export const captchaProviderOptions = [
  { value: "recaptcha", label: "reCAPTCHA" },
  { value: "hcaptcha", label: "hCaptcha" },
  { value: "turnstile", label: "Cloudflare Turnstile" },
];
