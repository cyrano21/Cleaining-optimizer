/**
 * Configuration centralisée de l'application
 * Gère tous les paramètres et variables d'environnement
 */

import { z } from 'zod';

// ============================================================================
// SCHÉMAS DE VALIDATION
// ============================================================================

const envSchema = z.object({
  // Base
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_NAME: z.string().default('Ecommerce Dashboard'),
  
  // URLs
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Base de données
  MONGODB_URI: z.string().min(1, 'MONGODB_URI est requis'),
  DATABASE_URL: z.string().optional(),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET doit faire au moins 32 caractères'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  
  // Providers OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Stockage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Paiement
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  
  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  MIXPANEL_TOKEN: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Features flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_CACHE: z.string().transform(val => val === 'true').default('true'),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  
  // Limites
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).default('10485760'), // 10MB
  MAX_PRODUCTS_PER_STORE: z.string().transform(val => parseInt(val, 10)).default('1000'),
  MAX_STORES_PER_USER: z.string().transform(val => parseInt(val, 10)).default('5'),
  
  // Cache
  REDIS_URL: z.string().optional(),
  CACHE_TTL: z.string().transform(val => parseInt(val, 10)).default('3600'), // 1 heure
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(val => parseInt(val, 10)).default('100'),
});

// ============================================================================
// CONFIGURATION PRINCIPALE
// ============================================================================

class ConfigManager {
  private static instance: ConfigManager;
  private config: z.infer<typeof envSchema>;
  private isValidated = false;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): z.infer<typeof envSchema> {
    try {
      const env = {
        NODE_ENV: process.env.NODE_ENV,
        APP_VERSION: process.env.APP_VERSION,
        APP_NAME: process.env.APP_NAME,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        MONGODB_URI: process.env.MONGODB_URI,
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        EMAIL_FROM: process.env.EMAIL_FROM,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
        GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
        MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: process.env.LOG_LEVEL,
        ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
        ENABLE_MONITORING: process.env.ENABLE_MONITORING,
        ENABLE_CACHE: process.env.ENABLE_CACHE,
        ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
        MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
        MAX_PRODUCTS_PER_STORE: process.env.MAX_PRODUCTS_PER_STORE,
        MAX_STORES_PER_USER: process.env.MAX_STORES_PER_USER,
        REDIS_URL: process.env.REDIS_URL,
        CACHE_TTL: process.env.CACHE_TTL,
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
      };

      const result = envSchema.parse(env);
      this.isValidated = true;
      return result;
    } catch (error) {
      console.error('❌ Erreur de configuration:', error);
      throw new Error('Configuration invalide. Vérifiez vos variables d\'environnement.');
    }
  }

  /**
   * Valide la configuration
   */
  public validate(): boolean {
    if (!this.isValidated) {
      try {
        this.config = this.loadConfig();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Récupère toute la configuration
   */
  public getAll(): z.infer<typeof envSchema> {
    return this.config;
  }

  /**
   * Récupère une valeur de configuration
   */
  public get<K extends keyof z.infer<typeof envSchema>>(
    key: K
  ): z.infer<typeof envSchema>[K] {
    return this.config[key];
  }

  /**
   * Vérifie si on est en développement
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Vérifie si on est en production
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Vérifie si on est en test
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Récupère l'URL de base de l'application
   */
  public getBaseUrl(): string {
    return this.config.NEXT_PUBLIC_APP_URL || 
           this.config.NEXTAUTH_URL || 
           (this.isDevelopment() ? 'http://localhost:3000' : 'https://app.example.com');
  }

  /**
   * Récupère la configuration de la base de données
   */
  public getDatabaseConfig(): {
    uri: string;
    options: Record<string, any>;
  } {
    return {
      uri: this.config.MONGODB_URI,
      options: {
        maxPoolSize: this.isProduction() ? 10 : 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      }
    };
  }

  /**
   * Récupère la configuration d'authentification
   */
  public getAuthConfig(): {
    secret: string;
    jwtSecret: string;
    providers: {
      google?: { clientId: string; clientSecret: string };
      github?: { clientId: string; clientSecret: string };
    };
  } {
    const providers: any = {};
    
    if (this.config.GOOGLE_CLIENT_ID && this.config.GOOGLE_CLIENT_SECRET) {
      providers.google = {
        clientId: this.config.GOOGLE_CLIENT_ID,
        clientSecret: this.config.GOOGLE_CLIENT_SECRET
      };
    }
    
    if (this.config.GITHUB_CLIENT_ID && this.config.GITHUB_CLIENT_SECRET) {
      providers.github = {
        clientId: this.config.GITHUB_CLIENT_ID,
        clientSecret: this.config.GITHUB_CLIENT_SECRET
      };
    }

    return {
      secret: this.config.NEXTAUTH_SECRET,
      jwtSecret: this.config.JWT_SECRET,
      providers
    };
  }

  /**
   * Récupère la configuration email
   */
  public getEmailConfig(): {
    enabled: boolean;
    smtp?: {
      host: string;
      port: number;
      user: string;
      password: string;
    };
    from?: string;
  } {
    const hasSmtpConfig = this.config.SMTP_HOST && 
                         this.config.SMTP_PORT && 
                         this.config.SMTP_USER && 
                         this.config.SMTP_PASSWORD;

    return {
      enabled: !!hasSmtpConfig,
      smtp: hasSmtpConfig ? {
        host: this.config.SMTP_HOST!,
        port: parseInt(this.config.SMTP_PORT!, 10),
        user: this.config.SMTP_USER!,
        password: this.config.SMTP_PASSWORD!
      } : undefined,
      from: this.config.EMAIL_FROM
    };
  }

  /**
   * Récupère la configuration de stockage
   */
  public getStorageConfig(): {
    cloudinary?: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    };
    aws?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      bucket: string;
    };
  } {
    const config: any = {};

    if (this.config.CLOUDINARY_CLOUD_NAME && 
        this.config.CLOUDINARY_API_KEY && 
        this.config.CLOUDINARY_API_SECRET) {
      config.cloudinary = {
        cloudName: this.config.CLOUDINARY_CLOUD_NAME,
        apiKey: this.config.CLOUDINARY_API_KEY,
        apiSecret: this.config.CLOUDINARY_API_SECRET
      };
    }

    if (this.config.AWS_ACCESS_KEY_ID && 
        this.config.AWS_SECRET_ACCESS_KEY && 
        this.config.AWS_REGION && 
        this.config.AWS_S3_BUCKET) {
      config.aws = {
        accessKeyId: this.config.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
        region: this.config.AWS_REGION,
        bucket: this.config.AWS_S3_BUCKET
      };
    }

    return config;
  }

  /**
   * Récupère la configuration de paiement
   */
  public getPaymentConfig(): {
    stripe?: {
      publicKey: string;
      secretKey: string;
      webhookSecret?: string;
    };
    paypal?: {
      clientId: string;
      clientSecret: string;
    };
  } {
    const config: any = {};

    if (this.config.STRIPE_PUBLIC_KEY && this.config.STRIPE_SECRET_KEY) {
      config.stripe = {
        publicKey: this.config.STRIPE_PUBLIC_KEY,
        secretKey: this.config.STRIPE_SECRET_KEY,
        webhookSecret: this.config.STRIPE_WEBHOOK_SECRET
      };
    }

    if (this.config.PAYPAL_CLIENT_ID && this.config.PAYPAL_CLIENT_SECRET) {
      config.paypal = {
        clientId: this.config.PAYPAL_CLIENT_ID,
        clientSecret: this.config.PAYPAL_CLIENT_SECRET
      };
    }

    return config;
  }

  /**
   * Récupère la configuration des features
   */
  public getFeatureFlags(): {
    analytics: boolean;
    monitoring: boolean;
    cache: boolean;
    rateLimiting: boolean;
  } {
    return {
      analytics: this.config.ENABLE_ANALYTICS,
      monitoring: this.config.ENABLE_MONITORING,
      cache: this.config.ENABLE_CACHE,
      rateLimiting: this.config.ENABLE_RATE_LIMITING
    };
  }

  /**
   * Récupère les limites de l'application
   */
  public getLimits(): {
    maxFileSize: number;
    maxProductsPerStore: number;
    maxStoresPerUser: number;
  } {
    return {
      maxFileSize: this.config.MAX_FILE_SIZE,
      maxProductsPerStore: this.config.MAX_PRODUCTS_PER_STORE,
      maxStoresPerUser: this.config.MAX_STORES_PER_USER
    };
  }

  /**
   * Récupère la configuration du cache
   */
  public getCacheConfig(): {
    enabled: boolean;
    redis?: string;
    ttl: number;
  } {
    return {
      enabled: this.config.ENABLE_CACHE,
      redis: this.config.REDIS_URL,
      ttl: this.config.CACHE_TTL
    };
  }

  /**
   * Récupère la configuration du rate limiting
   */
  public getRateLimitConfig(): {
    enabled: boolean;
    windowMs: number;
    max: number;
  } {
    return {
      enabled: this.config.ENABLE_RATE_LIMITING,
      windowMs: this.config.RATE_LIMIT_WINDOW,
      max: this.config.RATE_LIMIT_MAX
    };
  }

  /**
   * Génère un rapport de configuration (sans les secrets)
   */
  public generateReport(): {
    environment: string;
    version: string;
    features: Record<string, boolean>;
    services: {
      database: boolean;
      email: boolean;
      storage: string[];
      payment: string[];
      analytics: string[];
    };
    limits: Record<string, number>;
  } {
    const storageConfig = this.getStorageConfig();
    const paymentConfig = this.getPaymentConfig();
    const emailConfig = this.getEmailConfig();
    const features = this.getFeatureFlags();
    const limits = this.getLimits();

    return {
      environment: this.config.NODE_ENV,
      version: this.config.APP_VERSION,
      features,
      services: {
        database: !!this.config.MONGODB_URI,
        email: emailConfig.enabled,
        storage: [
          ...(storageConfig.cloudinary ? ['cloudinary'] : []),
          ...(storageConfig.aws ? ['aws-s3'] : [])
        ],
        payment: [
          ...(paymentConfig.stripe ? ['stripe'] : []),
          ...(paymentConfig.paypal ? ['paypal'] : [])
        ],
        analytics: [
          ...(this.config.GOOGLE_ANALYTICS_ID ? ['google-analytics'] : []),
          ...(this.config.MIXPANEL_TOKEN ? ['mixpanel'] : [])
        ]
      },
      limits
    };
  }
}

// ============================================================================
// INSTANCE GLOBALE ET EXPORTS
// ============================================================================

export const config = ConfigManager.getInstance();

// Validation au démarrage
if (typeof window === 'undefined') {
  try {
    config.validate();
    console.log('✅ Configuration validée avec succès');
  } catch (error) {
    console.error('❌ Erreur de configuration:', error);
    process.exit(1);
  }
}

// Types utiles
export type Config = z.infer<typeof envSchema>;
export type FeatureFlags = ReturnType<typeof config.getFeatureFlags>;
export type DatabaseConfig = ReturnType<typeof config.getDatabaseConfig>;
export type AuthConfig = ReturnType<typeof config.getAuthConfig>;
export type EmailConfig = ReturnType<typeof config.getEmailConfig>;
export type StorageConfig = ReturnType<typeof config.getStorageConfig>;
export type PaymentConfig = ReturnType<typeof config.getPaymentConfig>;

// Utilitaires
export const isDev = () => config.isDevelopment();
export const isProd = () => config.isProduction();
export const isTest = () => config.isTest();
export const getBaseUrl = () => config.getBaseUrl();

// Hook React pour la configuration
export function useConfig() {
  return {
    config: config.getAll(),
    features: config.getFeatureFlags(),
    limits: config.getLimits(),
    baseUrl: config.getBaseUrl(),
    isDev: config.isDevelopment(),
    isProd: config.isProduction(),
    isTest: config.isTest()
  };
}

export default config;