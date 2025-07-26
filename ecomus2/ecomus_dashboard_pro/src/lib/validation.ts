/**
 * Système de validation centralisé avec Zod
 * Assure la sécurité et la cohérence des données dans l'application
 */

import { z } from 'zod';

// ============================================================================
// SCHÉMAS DE BASE
// ============================================================================

// Schéma pour les IDs MongoDB
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID MongoDB invalide');

// Schéma pour les emails
export const emailSchema = z.string().email('Adresse email invalide').toLowerCase();

// Schéma pour les mots de passe
export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/^(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/^(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/^(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/^(?=.*[@$!%*?&])/, 'Le mot de passe doit contenir au moins un caractère spécial');

// Schéma pour les URLs
export const urlSchema = z.string().url('URL invalide');

// Schéma pour les slugs
export const slugSchema = z.string()
  .min(1, 'Le slug ne peut pas être vide')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets');

// Schéma pour les numéros de téléphone
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide');

// ============================================================================
// SCHÉMAS UTILISATEUR
// ============================================================================

export const userRoleSchema = z.enum(['admin', 'vendor', 'customer', 'super_admin']);
export const userStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended']);

export const addressSchema = z.object({
  street: z.string().min(1, 'Rue requise').optional(),
  city: z.string().min(1, 'Ville requise').optional(),
  state: z.string().min(1, 'État/Province requis').optional(),
  country: z.string().min(2, 'Code pays requis (2 lettres)').max(2).optional(),
  zipCode: z.string().min(1, 'Code postal requis').optional()
});

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').optional(),
  lastName: z.string().min(1, 'Nom requis').optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  avatar: urlSchema.optional(),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  website: urlSchema.optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional()
  }).optional()
});

export const userSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: userRoleSchema,
  status: userStatusSchema.default('pending'),
  emailVerified: z.boolean().default(false),
  profile: userProfileSchema.optional()
});

export const userCreateSchema = userSchema.extend({
  password: passwordSchema
});

export const userUpdateSchema = userSchema.partial().omit({ email: true });

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional()
});

// ============================================================================
// SCHÉMAS PRODUIT
// ============================================================================

export const productStatusSchema = z.enum(['draft', 'active', 'inactive', 'archived']);
export const productTypeSchema = z.enum(['simple', 'variable', 'grouped', 'external']);

export const dimensionsSchema = z.object({
  length: z.number().positive('La longueur doit être positive').optional(),
  width: z.number().positive('La largeur doit être positive').optional(),
  height: z.number().positive('La hauteur doit être positive').optional(),
  weight: z.number().positive('Le poids doit être positif').optional()
});

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nom de variante requis'),
  sku: z.string().min(1, 'SKU requis'),
  price: z.number().positive('Le prix doit être positif'),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  images: z.array(urlSchema).optional(),
  attributes: z.record(z.string()).optional()
});

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom du produit est requis'),
  title: z.string().min(1, 'Le titre du produit est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  shortDescription: z.string().max(160, 'La description courte ne peut pas dépasser 160 caractères').optional(),
  price: z.number().positive('Le prix doit être positif'),
  comparePrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  sku: z.string().min(1, 'Le SKU est requis'),
  barcode: z.string().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  lowStockThreshold: z.number().int().min(0).optional(),
  trackQuantity: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  category: z.string().min(1, 'La catégorie est requise'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(urlSchema).min(1, 'Au moins une image est requise'),
  status: productStatusSchema.default('draft'),
  type: productTypeSchema.default('simple'),
  variants: z.array(productVariantSchema).optional(),
  dimensions: dimensionsSchema.optional(),
  seoTitle: z.string().max(60, 'Le titre SEO ne peut pas dépasser 60 caractères').optional(),
  seoDescription: z.string().max(160, 'La description SEO ne peut pas dépasser 160 caractères').optional(),
  featured: z.boolean().default(false),
  digital: z.boolean().default(false),
  downloadable: z.boolean().default(false),
  virtual: z.boolean().default(false)
});

export const productCreateSchema = productSchema;
export const productUpdateSchema = productSchema.partial();

// ============================================================================
// SCHÉMAS COMMANDE
// ============================================================================

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
]);

export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded'
]);

export const orderItemSchema = z.object({
  productId: mongoIdSchema,
  variantId: z.string().optional(),
  quantity: z.number().int().positive('La quantité doit être positive'),
  price: z.number().positive('Le prix doit être positif'),
  total: z.number().positive('Le total doit être positif')
});

export const shippingAddressSchema = addressSchema.required({
  street: true,
  city: true,
  country: true,
  zipCode: true
});

export const orderSchema = z.object({
  customerId: mongoIdSchema,
  items: z.array(orderItemSchema).min(1, 'Au moins un article est requis'),
  subtotal: z.number().positive('Le sous-total doit être positif'),
  tax: z.number().min(0, 'La taxe ne peut pas être négative'),
  shipping: z.number().min(0, 'Les frais de livraison ne peuvent pas être négatifs'),
  discount: z.number().min(0, 'La remise ne peut pas être négative'),
  total: z.number().positive('Le total doit être positif'),
  currency: z.string().length(3, 'Code devise invalide (3 lettres)').default('EUR'),
  status: orderStatusSchema.default('pending'),
  paymentStatus: paymentStatusSchema.default('pending'),
  shippingAddress: shippingAddressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional()
});

// ============================================================================
// SCHÉMAS BOUTIQUE
// ============================================================================

export const storeStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended']);
export const subscriptionTierSchema = z.enum(['free', 'basic', 'premium', 'enterprise']);

export const storeSettingsSchema = z.object({
  currency: z.string().length(3).default('EUR'),
  timezone: z.string().default('Europe/Paris'),
  language: z.string().length(2).default('fr'),
  taxRate: z.number().min(0).max(1).default(0.2),
  shippingEnabled: z.boolean().default(true),
  digitalProductsEnabled: z.boolean().default(false),
  inventoryTracking: z.boolean().default(true),
  lowStockNotifications: z.boolean().default(true),
  orderNotifications: z.boolean().default(true)
});

export const storeSchema = z.object({
  name: z.string().min(1, 'Le nom de la boutique est requis'),
  slug: slugSchema,
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  logo: urlSchema.optional(),
  banner: urlSchema.optional(),
  ownerId: mongoIdSchema,
  status: storeStatusSchema.default('pending'),
  subscriptionTier: subscriptionTierSchema.default('free'),
  settings: storeSettingsSchema.default({}),
  contactEmail: emailSchema,
  contactPhone: phoneSchema.optional(),
  address: addressSchema.optional(),
  socialLinks: z.object({
    website: urlSchema.optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional()
  }).optional()
});

// ============================================================================
// SCHÉMAS API
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Terme de recherche requis'),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape
});

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Valide des données avec un schéma Zod
 * @param schema - Le schéma Zod à utiliser
 * @param data - Les données à valider
 * @returns Résultat de validation avec données ou erreurs
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    };
  }
}

/**
 * Valide des données de manière asynchrone
 * @param schema - Le schéma Zod à utiliser
 * @param data - Les données à valider
 * @returns Promise du résultat de validation
 */
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{
  success: boolean;
  data?: T;
  errors?: string[];
}> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    };
  }
}

/**
 * Crée un middleware de validation pour les APIs
 * @param schema - Le schéma à utiliser pour la validation
 * @returns Fonction middleware
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateData(schema, data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors?.join(', ')}`);
    }
    return result.data!;
  };
}

/**
 * Sanitise une chaîne pour éviter les injections XSS
 * @param input - La chaîne à sanitiser
 * @returns Chaîne sanitisée
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    })
    .trim();
}

/**
 * Valide et sanitise les données d'entrée
 * @param schema - Le schéma Zod
 * @param data - Les données à valider et sanitiser
 * @returns Données validées et sanitisées
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  // Sanitiser les chaînes dans les données
  const sanitizedData = sanitizeObjectStrings(data);
  
  // Valider avec le schéma
  return validateData(schema, sanitizedData);
}

/**
 * Sanitise récursivement toutes les chaînes dans un objet
 * @param obj - L'objet à sanitiser
 * @returns Objet avec chaînes sanitisées
 */
function sanitizeObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }
  
  return obj;
}

// ============================================================================
// EXPORTS DE TYPES
// ============================================================================

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;

export type Product = z.infer<typeof productSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductType = z.infer<typeof productTypeSchema>;

export type Order = z.infer<typeof orderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export type Store = z.infer<typeof storeSchema>;
export type StoreStatus = z.infer<typeof storeStatusSchema>;
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export type Pagination = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchSchema>;