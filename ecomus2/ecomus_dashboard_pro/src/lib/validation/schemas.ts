/**
 * Schémas de validation Zod pour l'application Ecomus
 * Améliore la sûreté des types et la validation runtime
 */

import { z } from 'zod';

// Schémas de base
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const SlugSchema = z.string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

export const UrlSchema = z.string().url('Invalid URL format');

export const ColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format');

// Schéma SEO
export const SeoSchema = z.object({
  title: z.string().min(1).max(60, 'SEO title must be under 60 characters').optional(),
  description: z.string().min(1).max(160, 'SEO description must be under 160 characters').optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: UrlSchema.optional(),
  canonical: UrlSchema.optional()
});

// Schéma Store
export const StoreSchema = z.object({
  _id: ObjectIdSchema,
  name: z.string().min(1, 'Store name is required'),
  slug: SlugSchema,
  description: z.string().optional(),
  logo: UrlSchema.optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schéma Product (simplifié)
export const ProductSchema = z.object({
  _id: ObjectIdSchema,
  title: z.string().min(1, 'Product title is required'),
  slug: SlugSchema,
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  images: z.array(UrlSchema).min(1, 'At least one image is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  storeId: ObjectIdSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schéma Collection complet
export const CollectionSchema = z.object({
  _id: ObjectIdSchema.optional(), // Optional pour la création
  title: z.string().min(1, 'Collection title is required').max(100, 'Title too long'),
  slug: SlugSchema,
  description: z.string().max(500, 'Description too long').optional(),
  imgSrc: UrlSchema.optional(),
  image: UrlSchema.optional(),
  altText: z.string().max(125, 'Alt text too long').optional(),
  subheading: z.string().max(100, 'Subheading too long').optional(),
  heading: z.string().max(100, 'Heading too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  originalPrice: z.number().positive('Original price must be positive').optional(),
  backgroundColor: ColorSchema.optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  category: z.string().optional(),
  products: z.array(ObjectIdSchema).default([]),
  itemCount: z.number().int().min(0, 'Item count cannot be negative').default(0),
  storeId: ObjectIdSchema,
  store: StoreSchema.optional(),
  tags: z.array(z.string()).default([]),
  seo: SeoSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).refine((data) => {
  // Validation personnalisée : si originalPrice existe, elle doit être >= price
  if (data.price && data.originalPrice) {
    return data.originalPrice >= data.price;
  }
  return true;
}, {
  message: 'Original price must be greater than or equal to current price',
  path: ['originalPrice']
});

// Schémas pour les opérations CRUD
export const CreateCollectionSchema = CollectionSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  store: true
});

export const UpdateCollectionSchema = CollectionSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  store: true
});

// Schémas pour les filtres et pagination
export const CollectionFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  storeId: ObjectIdSchema.optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  tags: z.array(z.string()).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional()
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['priceMax']
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schémas pour les réponses API
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

export const PaginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  timestamp: z.date().default(() => new Date())
});

// Types TypeScript dérivés des schémas
export type Collection = z.infer<typeof CollectionSchema>;
export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollection = z.infer<typeof UpdateCollectionSchema>;
export type CollectionFilters = z.infer<typeof CollectionFiltersSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type Store = z.infer<typeof StoreSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Seo = z.infer<typeof SeoSchema>;

// Fonctions utilitaires de validation
export function validateCollection(data: unknown): Collection {
  return CollectionSchema.parse(data);
}

export function validateCreateCollection(data: unknown): CreateCollection {
  return CreateCollectionSchema.parse(data);
}

export function validateUpdateCollection(data: unknown): UpdateCollection {
  return UpdateCollectionSchema.parse(data);
}

export function validateCollectionFilters(data: unknown): CollectionFilters {
  return CollectionFiltersSchema.parse(data);
}

export function validatePagination(data: unknown): Pagination {
  return PaginationSchema.parse(data);
}

// Validation safe (retourne un résultat au lieu de throw)
export function safeValidateCollection(data: unknown) {
  return CollectionSchema.safeParse(data);
}

export function safeValidateCreateCollection(data: unknown) {
  return CreateCollectionSchema.safeParse(data);
}

export function safeValidateUpdateCollection(data: unknown) {
  return UpdateCollectionSchema.safeParse(data);
}