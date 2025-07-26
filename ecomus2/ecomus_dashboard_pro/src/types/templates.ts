/**
 * Types TypeScript pour le système de templates et abonnements
 */

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  features?: string[];
}

export interface PageInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface SelectedTemplate {
  id: string;
  name: string;
  category: string;
}

export interface AdditionalPage {
  id: string;
  name: string;
  isEnabled: boolean;
}

export interface SubscriptionFeatures {
  maxProducts: number | string;
  maxImages: number | string;
  customDomain: boolean;
  analytics: string | boolean;
  support: string;
  templates: string | number;
  pages: string | number;
  storage: string;
}

export interface StoreSubscription {
  plan: string;
  isActive: boolean;
  expiresAt?: Date;
}

export interface StoreDesign {
  selectedTemplate?: SelectedTemplate;
  additionalPages?: AdditionalPage[];
}

export interface TemplateUpdateData {
  [key: string]: any;
  $push?: {
    [key: string]: any;
  };
}

export type TemplateType = 'home' | 'page';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';
