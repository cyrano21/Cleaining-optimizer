/**
 * Système de gestion d'erreurs centralisé
 * Fournit une gestion cohérente des erreurs dans toute l'application
 */

import React from 'react';
import { logger } from './logger';

// ============================================================================
// TYPES D'ERREURS
// ============================================================================

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// ============================================================================
// CLASSES D'ERREURS PERSONNALISÉES
// ============================================================================

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();
    this.requestId = requestId;

    // Maintenir la stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      stack: this.stack
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      400,
      true,
      context,
      requestId
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      401,
      true,
      context,
      requestId
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      403,
      true,
      context,
      requestId
    );
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.NOT_FOUND,
      ErrorSeverity.LOW,
      404,
      true,
      context,
      requestId
    );
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.CONFLICT,
      ErrorSeverity.MEDIUM,
      409,
      true,
      context,
      requestId
    );
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      429,
      true,
      context,
      requestId
    );
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      502,
      true,
      context,
      requestId
    );
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.DATABASE,
      ErrorSeverity.HIGH,
      500,
      true,
      context,
      requestId
    );
  }
}

export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(
      message,
      ErrorType.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      400,
      true,
      context,
      requestId
    );
  }
}

// ============================================================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================================================

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: Map<ErrorType, Array<(error: AppError) => void>> = new Map();

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Configure les gestionnaires d'erreurs globaux
   */
  private setupGlobalHandlers(): void {
    // Gestionnaire pour les erreurs non capturées
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(new AppError(
          event.error?.message || 'Erreur JavaScript non capturée',
          ErrorType.INTERNAL,
          ErrorSeverity.HIGH,
          500,
          false,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }
        ));
      });

      // Gestionnaire pour les promesses rejetées
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new AppError(
          event.reason?.message || 'Promise rejetée non gérée',
          ErrorType.INTERNAL,
          ErrorSeverity.HIGH,
          500,
          false,
          {
            reason: event.reason,
            stack: event.reason?.stack
          }
        ));
      });
    }
  }

  /**
   * Gère une erreur de manière centralisée
   */
  public handleError(error: Error | AppError, requestId?: string): void {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(
        error.message,
        ErrorType.INTERNAL,
        ErrorSeverity.MEDIUM,
        500,
        false,
        { originalError: error.name, stack: error.stack },
        requestId
      );
    }

    // Logger l'erreur
    this.logError(appError);

    // Exécuter les callbacks spécifiques au type d'erreur
    this.executeCallbacks(appError);

    // Notifier les services de monitoring si nécessaire
    this.notifyMonitoring(appError);
  }

  /**
   * Enregistre un callback pour un type d'erreur spécifique
   */
  public onError(type: ErrorType, callback: (error: AppError) => void): void {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, []);
    }
    this.errorCallbacks.get(type)!.push(callback);
  }

  /**
   * Supprime un callback pour un type d'erreur
   */
  public offError(type: ErrorType, callback: (error: AppError) => void): void {
    const callbacks = this.errorCallbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Exécute les callbacks pour un type d'erreur
   */
  private executeCallbacks(error: AppError): void {
    const callbacks = this.errorCallbacks.get(error.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(error);
        } catch (callbackError) {
          logger.error('Erreur dans le callback de gestion d\'erreur', {
            originalError: error.toJSON(),
            callbackError: callbackError instanceof Error ? callbackError.message : callbackError
          });
        }
      });
    }
  }

  /**
   * Log l'erreur avec le niveau approprié
   */
  private logError(error: AppError): void {
    const logData = {
      ...error.toJSON(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        logger.warn(error.message, logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.error(error.message, logData);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        logger.error(error.message, logData);
        break;
    }
  }

  /**
   * Notifie les services de monitoring pour les erreurs critiques
   */
  private notifyMonitoring(error: AppError): void {
    if (error.severity === ErrorSeverity.CRITICAL || !error.isOperational) {
      // Ici, vous pouvez intégrer des services comme Sentry, Bugsnag, etc.
      logger.error('Erreur critique détectée', error.toJSON());
    }
  }
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Wrapper pour les fonctions async qui gère automatiquement les erreurs
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: Error) => void
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : 'Erreur inconnue',
        ErrorType.INTERNAL,
        ErrorSeverity.MEDIUM
      );

      if (errorHandler) {
        errorHandler(appError);
      } else {
        ErrorHandler.getInstance().handleError(appError);
      }

      throw appError;
    }
  };
}

/**
 * Wrapper pour les fonctions synchrones qui gère automatiquement les erreurs
 */
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  errorHandler?: (error: Error) => void
) {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : 'Erreur inconnue',
        ErrorType.INTERNAL,
        ErrorSeverity.MEDIUM
      );

      if (errorHandler) {
        errorHandler(appError);
      } else {
        ErrorHandler.getInstance().handleError(appError);
      }

      throw appError;
    }
  };
}

/**
 * Crée une réponse d'erreur standardisée pour les APIs
 */
export function createErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      code: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      requestId: error.requestId,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        context: error.context
      })
    }
  };
}

/**
 * Vérifie si une erreur est récupérable
 */
export function isRecoverableError(error: Error | AppError): boolean {
  if (error instanceof AppError) {
    return error.isOperational && error.severity !== ErrorSeverity.CRITICAL;
  }
  return false;
}

/**
 * Extrait les informations d'erreur d'une réponse HTTP
 */
export function extractErrorFromResponse(response: Response, requestId?: string): AppError {
  const statusCode = response.status;
  let type: ErrorType;
  let severity: ErrorSeverity;

  switch (statusCode) {
    case 400:
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      break;
    case 401:
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
      break;
    case 403:
      type = ErrorType.AUTHORIZATION;
      severity = ErrorSeverity.MEDIUM;
      break;
    case 404:
      type = ErrorType.NOT_FOUND;
      severity = ErrorSeverity.LOW;
      break;
    case 409:
      type = ErrorType.CONFLICT;
      severity = ErrorSeverity.MEDIUM;
      break;
    case 429:
      type = ErrorType.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      type = ErrorType.EXTERNAL_SERVICE;
      severity = ErrorSeverity.HIGH;
      break;
    default:
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
  }

  return new AppError(
    `Erreur HTTP ${statusCode}: ${response.statusText}`,
    type,
    severity,
    statusCode,
    true,
    {
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    },
    requestId
  );
}

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const errorHandler = ErrorHandler.getInstance();

// ============================================================================
// HOOKS REACT (si nécessaire)
// ============================================================================

/**
 * Hook React pour gérer les erreurs dans les composants
 */
export function useErrorHandler() {
  const handleError = (error: Error | AppError, context?: Record<string, any>) => {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorType.INTERNAL,
      ErrorSeverity.MEDIUM,
      500,
      true,
      context
    );

    errorHandler.handleError(appError);
  };

  return { handleError };
}

/**
 * Hook pour s'abonner aux erreurs d'un type spécifique
 */
export function useErrorSubscription(
  type: ErrorType,
  callback: (error: AppError) => void
) {
  React.useEffect(() => {
    errorHandler.onError(type, callback);
    return () => {
      errorHandler.offError(type, callback);
    };
  }, [type, callback]);
}

// Note: Importez React si vous utilisez les hooks
// import React from 'react';