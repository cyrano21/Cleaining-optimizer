/**
 * Système de middleware centralisé
 * Gère l'authentification, validation, rate limiting, sécurité, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { security } from './security';
import { logger } from './logger';
import { config } from './config';
import { monitoring } from './monitoring';
import { validateDataAsync, sanitizeString } from './validation';
import { z } from 'zod';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface MiddlewareContext {
  req: NextRequest;
  res?: NextResponse;
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  startTime: number;
  requestId: string;
  metadata: Record<string, any>;
}

export interface MiddlewareConfig {
  auth?: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
    redirectTo?: string;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
    keyGenerator?: (req: NextRequest) => string;
  };
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  };
  security?: {
    csrf?: boolean;
    sanitize?: boolean;
    headers?: Record<string, string>;
  };
  monitoring?: {
    enabled: boolean;
    operationName?: string;
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
    key?: string;
  };
}

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

export type RouteHandler = (
  req: NextRequest,
  context: { params?: Record<string, string> }
) => Promise<NextResponse>;

// ============================================================================
// MIDDLEWARE DE BASE
// ============================================================================

/**
 * Middleware de logging des requêtes
 */
export const requestLoggingMiddleware: MiddlewareFunction = async (context, next) => {
  const { req, requestId, startTime } = context;
  
  logger.info('Requête entrante', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  });

  const response = await next();
  
  const duration = Date.now() - startTime;
  logger.info('Requête terminée', {
    requestId,
    status: response.status,
    duration
  });

  return response;
};

/**
 * Middleware d'authentification
 */
export const authMiddleware = (authConfig: NonNullable<MiddlewareConfig['auth']>): MiddlewareFunction => {
  return async (context, next) => {
    const { req } = context;
    
    try {
      const token = await getToken({ 
        req, 
        secret: config.get('JWT_SECRET') 
      });

      if (!token && authConfig.required) {
        logger.warn('Accès non autorisé - Token manquant', {
          requestId: context.requestId,
          url: req.url
        });
        
        return NextResponse.json(
          { error: 'Non autorisé', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      if (token) {
        context.user = {
          id: token.sub!,
          email: token.email!,
          role: token.role as string || 'user',
          permissions: token.permissions as string[] || []
        };

        // Vérification des rôles
        if (authConfig.roles && !authConfig.roles.includes(context.user.role)) {
          logger.warn('Accès refusé - Rôle insuffisant', {
            requestId: context.requestId,
            userRole: context.user.role,
            requiredRoles: authConfig.roles
          });
          
          return NextResponse.json(
            { error: 'Accès refusé', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }

        // Vérification des permissions
        if (authConfig.permissions) {
          const hasPermission = authConfig.permissions.some(permission => 
            context.user!.permissions.includes(permission)
          );
          
          if (!hasPermission) {
            logger.warn('Accès refusé - Permission insuffisante', {
              requestId: context.requestId,
              userPermissions: context.user.permissions,
              requiredPermissions: authConfig.permissions
            });
            
            return NextResponse.json(
              { error: 'Permission insuffisante', code: 'INSUFFICIENT_PERMISSIONS' },
              { status: 403 }
            );
          }
        }
      }

      return next();
    } catch (error) {
      logger.error('Erreur d\'authentification', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Erreur d\'authentification', code: 'AUTH_ERROR' },
        { status: 500 }
      );
    }
  };
};

/**
 * Middleware de rate limiting
 */
export const rateLimitMiddleware = (rateLimitConfig: NonNullable<MiddlewareConfig['rateLimit']>): MiddlewareFunction => {
  return async (context, next) => {
    const { req } = context;
    
    try {
      const key = rateLimitConfig.keyGenerator ? 
        rateLimitConfig.keyGenerator(req) : 
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      
      const rateLimitResult = security.checkRateLimit(key);

      if (!rateLimitResult.allowed) {
        logger.warn('Rate limit dépassé', {
          requestId: context.requestId,
          key,
          url: req.url
        });
        
        return NextResponse.json(
          { error: 'Trop de requêtes', code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        );
      }

      return next();
    } catch (error) {
      logger.error('Erreur de rate limiting', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // En cas d'erreur, on laisse passer la requête
      return next();
    }
  };
};

/**
 * Middleware de validation
 */
export const validationMiddleware = (validationConfig: NonNullable<MiddlewareConfig['validation']>): MiddlewareFunction => {
  return async (context, next) => {
    const { req } = context;
    
    try {
      // Validation du body
      if (validationConfig.body && req.method !== 'GET') {
        const body = await req.json().catch(() => ({}));
        const result = await validateDataAsync(validationConfig.body, body);
        
        if (!result.success) {
          logger.warn('Validation du body échouée', {
            requestId: context.requestId,
            errors: result.errors
          });
          
          return NextResponse.json(
            { 
              error: 'Données invalides', 
              code: 'VALIDATION_ERROR',
              details: result.errors 
            },
            { status: 400 }
          );
        }
        
        context.metadata.validatedBody = result.data;
      }

      // Validation des query parameters
      if (validationConfig.query) {
        const query = Object.fromEntries(new URL(req.url).searchParams);
        const result = await validateDataAsync(validationConfig.query, query);
        
        if (!result.success) {
          logger.warn('Validation des query params échouée', {
            requestId: context.requestId,
            errors: result.errors
          });
          
          return NextResponse.json(
            { 
              error: 'Paramètres invalides', 
              code: 'VALIDATION_ERROR',
              details: result.errors 
            },
            { status: 400 }
          );
        }
        
        context.metadata.validatedQuery = result.data;
      }

      return next();
    } catch (error) {
      logger.error('Erreur de validation', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Erreur de validation', code: 'VALIDATION_ERROR' },
        { status: 500 }
      );
    }
  };
};

/**
 * Middleware de sécurité
 */
export const securityMiddleware = (securityConfig: NonNullable<MiddlewareConfig['security']>): MiddlewareFunction => {
  return async (context, next) => {
    const { req } = context;
    
    try {
      // Sanitisation des entrées
      if (securityConfig.sanitize) {
        const url = new URL(req.url);
        
        // Sanitiser les query parameters
        for (const [key, value] of url.searchParams) {
          const sanitized = sanitizeString(value);
          if (sanitized !== value) {
            url.searchParams.set(key, sanitized);
          }
        }
      }

      const response = await next();

      // Ajouter les headers de sécurité
      if (securityConfig.headers) {
        Object.entries(securityConfig.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      // Headers de sécurité par défaut
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      if (config.isProduction()) {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      return response;
    } catch (error) {
      logger.error('Erreur de sécurité', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return next();
    }
  };
};

/**
 * Middleware de monitoring
 */
export const monitoringMiddleware = (monitoringConfig: NonNullable<MiddlewareConfig['monitoring']>): MiddlewareFunction => {
  return async (context, next) => {
    if (!monitoringConfig.enabled) {
      return next();
    }

    const operationName = monitoringConfig.operationName || 
      `${context.req.method} ${new URL(context.req.url).pathname}`;
    
    const startTime = Date.now();
    
    // Enregistrer le début de l'opération
    monitoring.recordEvent({
      type: 'api_request',
      data: {
        operation: operationName,
        method: context.req.method,
        url: context.req.url,
        userAgent: context.req.headers.get('user-agent'),
        userId: context.user?.id,
        phase: 'start'
      },
      requestId: context.requestId,
      userId: context.user?.id
    });

    try {
      const response = await next();
      const duration = Date.now() - startTime;
      
      // Enregistrer la fin de l'opération avec succès
      monitoring.recordEvent({
        type: 'api_request',
        data: {
          operation: operationName,
          method: context.req.method,
          url: context.req.url,
          status: response.status,
          duration,
          success: response.status < 400,
          phase: 'end'
        },
        requestId: context.requestId,
        userId: context.user?.id
      });
      
      // Enregistrer la métrique de temps de réponse
      monitoring.recordMetric({
        name: 'api_response_time',
        value: duration,
        type: 'histogram',
        labels: {
          method: context.req.method,
          endpoint: new URL(context.req.url).pathname,
          status: response.status.toString()
        }
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Enregistrer l'erreur
      monitoring.recordEvent({
        type: 'error',
        data: {
          operation: operationName,
          method: context.req.method,
          url: context.req.url,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
          phase: 'error'
        },
        requestId: context.requestId,
        userId: context.user?.id
      });
      
      throw error;
    }
  };
};

/**
 * Middleware de gestion d'erreurs
 */
export const errorHandlingMiddleware: MiddlewareFunction = async (context, next) => {
  try {
    return await next();
  } catch (error) {
    logger.error('Erreur non gérée dans l\'API', {
      requestId: context.requestId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      url: context.req.url,
      method: context.req.method,
      userId: context.user?.id
    });

    // Réponse d'erreur générique
    return NextResponse.json(
      {
        error: config.isProduction() ? 
          'Une erreur interne s\'est produite' : 
          error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
        requestId: context.requestId
      },
      { status: 500 }
    );
  }
};

// ============================================================================
// COMPOSEUR DE MIDDLEWARE
// ============================================================================

/**
 * Compose plusieurs middlewares en un seul
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return async (context, next) => {
    let index = 0;

    async function dispatch(): Promise<NextResponse> {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      return middleware(context, dispatch);
    }

    return dispatch();
  };
}

/**
 * Crée un middleware basé sur la configuration
 */
export function createMiddleware(middlewareConfig: MiddlewareConfig): MiddlewareFunction {
  const middlewares: MiddlewareFunction[] = [];

  // Toujours ajouter le logging en premier
  middlewares.push(requestLoggingMiddleware);

  // Rate limiting
  if (middlewareConfig.rateLimit) {
    middlewares.push(rateLimitMiddleware(middlewareConfig.rateLimit));
  }

  // Sécurité
  if (middlewareConfig.security) {
    middlewares.push(securityMiddleware(middlewareConfig.security));
  }

  // Authentification
  if (middlewareConfig.auth) {
    middlewares.push(authMiddleware(middlewareConfig.auth));
  }

  // Validation
  if (middlewareConfig.validation) {
    middlewares.push(validationMiddleware(middlewareConfig.validation));
  }

  // Monitoring
  if (middlewareConfig.monitoring) {
    middlewares.push(monitoringMiddleware(middlewareConfig.monitoring));
  }

  // Gestion d'erreurs en dernier
  middlewares.push(errorHandlingMiddleware);

  return composeMiddleware(...middlewares);
}

// ============================================================================
// WRAPPER POUR LES ROUTES API
// ============================================================================

/**
 * Wrapper pour les routes API avec middleware
 */
export function withMiddleware(
  handler: RouteHandler,
  middlewareConfig: MiddlewareConfig = {}
) {
  const middleware = createMiddleware(middlewareConfig);

  return async (req: NextRequest, routeContext: { params?: Record<string, string> }) => {
    const context: MiddlewareContext = {
      req,
      startTime: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    };

    return middleware(context, async () => {
      return handler(req, routeContext);
    });
  };
}

// ============================================================================
// MIDDLEWARES PRÉDÉFINIS
// ============================================================================

/**
 * Middleware pour les routes publiques
 */
export const publicRouteMiddleware = createMiddleware({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requêtes par IP
  },
  security: {
    sanitize: true,
    headers: {
      'Cache-Control': 'public, max-age=300'
    }
  },
  monitoring: {
    enabled: config.getFeatureFlags().monitoring
  }
});

/**
 * Middleware pour les routes d'authentification
 */
export const authRouteMiddleware = createMiddleware({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 tentatives de connexion par IP
  },
  security: {
    sanitize: true,
    csrf: true
  },
  monitoring: {
    enabled: config.getFeatureFlags().monitoring,
    operationName: 'auth_attempt'
  }
});

/**
 * Middleware pour les routes protégées
 */
export const protectedRouteMiddleware = createMiddleware({
  auth: {
    required: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // 1000 requêtes par utilisateur authentifié
  },
  security: {
    sanitize: true
  },
  monitoring: {
    enabled: config.getFeatureFlags().monitoring
  }
});

/**
 * Middleware pour les routes admin
 */
export const adminRouteMiddleware = createMiddleware({
  auth: {
    required: true,
    roles: ['admin', 'super_admin']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // 500 requêtes par admin
  },
  security: {
    sanitize: true,
    headers: {
      'X-Admin-Access': 'true'
    }
  },
  monitoring: {
    enabled: true,
    operationName: 'admin_operation'
  }
});

/**
 * Middleware pour les routes vendor
 */
export const vendorRouteMiddleware = createMiddleware({
  auth: {
    required: true,
    roles: ['vendor', 'admin', 'super_admin']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000 // 2000 requêtes par vendor
  },
  security: {
    sanitize: true
  },
  monitoring: {
    enabled: config.getFeatureFlags().monitoring,
    operationName: 'vendor_operation'
  }
});

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Extrait les données validées du contexte
 */
export function getValidatedData<T = any>(context: MiddlewareContext): {
  body?: T;
  query?: T;
  params?: T;
} {
  return {
    body: context.metadata.validatedBody,
    query: context.metadata.validatedQuery,
    params: context.metadata.validatedParams
  };
}

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
export function hasPermission(context: MiddlewareContext, permission: string): boolean {
  return context.user?.permissions.includes(permission) || false;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(context: MiddlewareContext, role: string): boolean {
  return context.user?.role === role;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 */
export function hasAnyRole(context: MiddlewareContext, roles: string[]): boolean {
  return context.user ? roles.includes(context.user.role) : false;
}

export default {
  withMiddleware,
  createMiddleware,
  composeMiddleware,
  publicRouteMiddleware,
  authRouteMiddleware,
  protectedRouteMiddleware,
  adminRouteMiddleware,
  vendorRouteMiddleware,
  getValidatedData,
  hasPermission,
  hasRole,
  hasAnyRole
};