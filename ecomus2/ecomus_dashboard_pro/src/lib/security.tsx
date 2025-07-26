/**
 * Système de sécurité centralisé
 * Fournit des utilitaires pour la sécurisation de l'application
 */

import React from 'react';
import {logger} from './logger';
import {AppError, ErrorType, ErrorSeverity} from './error-handler';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface SecurityConfig {
    maxLoginAttempts : number;
    lockoutDuration : number; // en millisecondes
    sessionTimeout : number; // en millisecondes
    passwordMinLength : number;
    passwordRequireSpecialChars : boolean;
    passwordRequireNumbers : boolean;
    passwordRequireUppercase : boolean;
    passwordRequireLowercase : boolean;
    enableCSRFProtection : boolean;
    enableRateLimiting : boolean;
    maxRequestsPerMinute : number;
}

export interface SecurityEvent {
    type : SecurityEventType;
    userId?: string;
    ip?: string;
    userAgent?: string;
    timestamp : Date;
    details?: Record < string,
    any >;
    severity : SecuritySeverity;
}

export enum SecurityEventType {
    LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    XSS_ATTEMPT = 'XSS_ATTEMPT',
    SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
    CSRF_ATTEMPT = 'CSRF_ATTEMPT',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
    DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT'
}

export enum SecuritySeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface RateLimitEntry {
    count : number;
    resetTime : number;
    blocked : boolean;
}

// ============================================================================
// CONFIGURATION PAR DÉFAUT
// ============================================================================

const DEFAULT_SECURITY_CONFIG : SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 heures
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    enableCSRFProtection: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 60
};

// ============================================================================
// GESTIONNAIRE DE SÉCURITÉ PRINCIPAL
// ============================================================================

export class SecurityManager {
    private static instance : SecurityManager;
    private config : SecurityConfig;
    private loginAttempts = new Map < string, {count: number;
        lastAttempt: number} > ();
    private rateLimits = new Map < string,
    RateLimitEntry > ();
    private securityEvents : SecurityEvent[] = [];
    private blockedIPs = new Set < string > ();
    private suspiciousPatterns : RegExp[];

    private constructor(config : Partial < SecurityConfig > = {}) {
        this.config = {
            ...DEFAULT_SECURITY_CONFIG,
            ...config
        };
        this.suspiciousPatterns = this.initializeSuspiciousPatterns();
        this.startCleanupInterval();
    }

    public static getInstance(config?: Partial < SecurityConfig >) : SecurityManager {
        if(!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager(config);
        }
        return SecurityManager.instance;
    }

    /**
   * Initialise les patterns suspects pour la détection d'attaques
   */
    private initializeSuspiciousPatterns() : RegExp[] {
        return [
            // XSS patterns
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,

            // SQL Injection patterns
            /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
            /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,

            // Path traversal
            /\.\.[\/\\]/gi,

            // Command injection
            /(;|\||&|`|\$\(|\$\{)/gi
        ];
    }

    /**
   * Valide la force d'un mot de passe
   */
    public validatePassword(password : string) : {
        isValid: boolean;
        errors: string[];
        strength: 'weak' | 'medium' | 'strong';
    }
    {
        const errors: string[] = [];
        let score = 0;

        // Longueur minimale
        if (password.length < this.config.passwordMinLength) {
            errors.push(`Le mot de passe doit contenir au moins ${this.config.passwordMinLength} caractères`);
        } else {
            score += 1;
        }

        // Caractères spéciaux
        if (this.config.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins un caractère spécial');
        } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        }

        // Chiffres
        if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins un chiffre');
        } else if (/\d/.test(password)) {
            score += 1;
        }

        // Majuscules
        if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins une majuscule');
        } else if (/[A-Z]/.test(password)) {
            score += 1;
        }

        // Minuscules
        if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins une minuscule');
        } else if (/[a-z]/.test(password)) {
            score += 1;
        }

        // Longueur bonus
        if (password.length >= 12) 
            score += 1;
        if (password.length >= 16) 
            score += 1;
        
        // Déterminer la force
        let strength: 'weak' | 'medium' | 'strong';
        if (score <= 2) 
            strength = 'weak';
        else if (score <= 4) 
            strength = 'medium';
        else 
            strength = 'strong';
        
        return {
            isValid: errors.length === 0,
            errors,
            strength
        };
    }

    /**
   * Gère les tentatives de connexion
   */
    public handleLoginAttempt(identifier : string, // email ou IP
            success : boolean, userId?: string, ip?: string, userAgent?: string) : {
        allowed: boolean;
        remainingAttempts?: number;
        lockoutTime?: number
    }
    {
        const now = Date.now();
        const attempts = this
            .loginAttempts
            .get(identifier) || {
            count: 0,
            lastAttempt: 0
        };

        // Vérifier si le compte est encore verrouillé
        if (attempts.count >= this.config.maxLoginAttempts) {
            const timeSinceLock = now - attempts.lastAttempt;
            if (timeSinceLock < this.config.lockoutDuration) {
                this.logSecurityEvent({
                    type: SecurityEventType.LOGIN_ATTEMPT,
                    userId,
                    ip,
                    userAgent,
                    timestamp: new Date(),
                    details: {
                        identifier,
                        blocked: true
                    },
                    severity: SecuritySeverity.MEDIUM
                });

                return {
                    allowed: false,
                    lockoutTime: this.config.lockoutDuration - timeSinceLock
                };
            } else {
                // Réinitialiser après expiration du verrouillage
                this
                    .loginAttempts
                    .delete(identifier);
            }
        }

        if (success) {
            // Connexion réussie - réinitialiser les tentatives
            this
                .loginAttempts
                .delete(identifier);

            this.logSecurityEvent({
                type: SecurityEventType.LOGIN_SUCCESS,
                userId,
                ip,
                userAgent,
                timestamp: new Date(),
                details: {
                    identifier
                },
                severity: SecuritySeverity.LOW
            });

            return {allowed: true};
        } else {
            // Échec de connexion - incrémenter les tentatives
            attempts.count++;
            attempts.lastAttempt = now;
            this
                .loginAttempts
                .set(identifier, attempts);

            const remainingAttempts = this.config.maxLoginAttempts - attempts.count;

            this.logSecurityEvent({
                type: SecurityEventType.LOGIN_FAILURE,
                userId,
                ip,
                userAgent,
                timestamp: new Date(),
                details: {
                    identifier,
                    attemptCount: attempts.count,
                    remainingAttempts
                },
                severity: remainingAttempts <= 1
                    ? SecuritySeverity.HIGH
                    : SecuritySeverity.MEDIUM
            });

            if (attempts.count >= this.config.maxLoginAttempts) {
                this.logSecurityEvent({
                    type: SecurityEventType.ACCOUNT_LOCKED,
                    userId,
                    ip,
                    userAgent,
                    timestamp: new Date(),
                    details: {
                        identifier,
                        lockoutDuration: this.config.lockoutDuration
                    },
                    severity: SecuritySeverity.HIGH
                });

                return {allowed: false, lockoutTime: this.config.lockoutDuration};
            }

            return {allowed: true, remainingAttempts};
        }
    }

    /**
   * Vérifie la limite de taux pour une IP
   */
    public checkRateLimit(ip : string) : {
        allowed: boolean;
        resetTime?: number
    }
    {
        if(!this.config.enableRateLimiting) {
            return {allowed: true};
        }

        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const entry = this
            .rateLimits
            .get(ip);

        if (!entry) {
            this
                .rateLimits
                .set(ip, {
                    count: 1,
                    resetTime: now + windowMs,
                    blocked: false
                });
            return {allowed: true};
        }

        // Réinitialiser si la fenêtre est expirée
        if (now > entry.resetTime) {
            entry.count = 1;
            entry.resetTime = now + windowMs;
            entry.blocked = false;
            return {allowed: true};
        }

        entry.count++;

        if (entry.count > this.config.maxRequestsPerMinute) {
            entry.blocked = true;

            this.logSecurityEvent({
                type: SecurityEventType.RATE_LIMIT_EXCEEDED,
                ip,
                timestamp: new Date(),
                details: {
                    requestCount: entry.count,
                    limit: this.config.maxRequestsPerMinute
                },
                severity: SecuritySeverity.MEDIUM
            });

            return {
                allowed: false,
                resetTime: entry.resetTime - now
            };
        }

        return {allowed: true};
    }

    /**
   * Sanitise une chaîne pour éviter les attaques XSS
   */
    public sanitizeInput(input : string) : string {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
   * Valide une entrée utilisateur contre les patterns suspects
   */
    public validateInput(input : string, context : string = 'general', ip?: string, userId?: string) : {
        isValid: boolean;
        threats: string[]
    }
    {
        const threats: string[] = [];

        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(input)) {
                const threatType = this.identifyThreatType(pattern);
                threats.push(threatType);

                this.logSecurityEvent({
                    type: this.getSecurityEventType(threatType),
                    userId,
                    ip,
                    timestamp: new Date(),
                    details: {
                        input: input.substring(0, 100),
                        context,
                        threatType
                    },
                    severity: SecuritySeverity.HIGH
                });
            }
        }

        return {
            isValid: threats.length === 0,
            threats
        };
    }

    /**
   * Génère un token CSRF
   */
    public generateCSRFToken() : string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array
            .from(array, byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
   * Valide un token CSRF
   */
    public validateCSRFToken(token : string, expectedToken : string) : boolean {
        if(!this.config.enableCSRFProtection) {
            return true;
        }

        return token === expectedToken;
    }

    /**
   * Hache un mot de passe de manière sécurisée
   */
    public async hashPassword(password : string) : Promise < string > {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + this.getSalt());
        const hashBuffer = await crypto
            .subtle
            .digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
   * Vérifie un mot de passe haché
   */
    public async verifyPassword(password : string, hash : string) : Promise < boolean > {
        const hashedPassword = await this.hashPassword(password);
        return hashedPassword === hash;
    }

    /**
   * Bloque une IP suspecte
   */
    public blockIP(ip : string, reason : string) : void {
        this
            .blockedIPs
            .add(ip);

        this.logSecurityEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            ip,
            timestamp: new Date(),
            details: {
                action: 'IP_BLOCKED',
                reason
            },
            severity: SecuritySeverity.HIGH
        });
    }

    /**
   * Vérifie si une IP est bloquée
   */
    public isIPBlocked(ip : string) : boolean {
        return this
            .blockedIPs
            .has(ip);
    }

    /**
   * Débloque une IP
   */
    public unblockIP(ip : string) : void {
        this
            .blockedIPs
            .delete(ip);
    }

    /**
   * Récupère les événements de sécurité récents
   */
    public getSecurityEvents(limit : number = 100, severity?: SecuritySeverity) : SecurityEvent[] {
        let events = [...this.securityEvents];

        if (severity) {
            events = events.filter(event => event.severity === severity);
        }

        return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    }

    /**
   * Analyse les patterns d'attaque
   */
    public analyzeSecurityTrends() : {
        totalEvents: number;
        eventsByType: Record < SecurityEventType,
        number >;
        eventsBySeverity: Record < SecuritySeverity,
        number >;
        topAttackerIPs: Array < {
            ip: string;
            count: number
        } >;
        recentTrends: Array < {
            date: string;
            count: number
        } >;
    }
    {
        const eventsByType = {} as Record<SecurityEventType, number>;
        const eventsBySeverity = {} as Record<SecuritySeverity, number>;
        const ipCounts = new Map<string, number>();
        const dailyCounts = new Map<string, number>();

        for (const event of this.securityEvents) {
            // Par type
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

            // Par sévérité
            eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

            // Par IP
            if (event.ip) {
                ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1);
            }

            // Par jour
            const dateKey = event
                .timestamp
                .toISOString()
                .split('T')[0];
            dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
        }

        const topAttackerIPs = Array
            .from(ipCounts.entries())
            .map(([ip, count]) => ({ip, count}))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const recentTrends = Array
            .from(dailyCounts.entries())
            .map(([date, count]) => ({date, count}))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30); // 30 derniers jours

        return {totalEvents: this.securityEvents.length, eventsByType, eventsBySeverity, topAttackerIPs, recentTrends};
    }

    /**
   * Met à jour la configuration de sécurité
   */
    public updateConfig(newConfig: Partial<SecurityConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
   * Récupère la configuration actuelle
   */
    public getConfig(): SecurityConfig {
        return {
            ...this.config
        };
    }

    // ============================================================================
    // MÉTHODES PRIVÉES
    // ============================================================================

    private logSecurityEvent(event : SecurityEvent) : void {
        this
            .securityEvents
            .push(event);

        // Limiter le nombre d'événements stockés
        if (this.securityEvents.length > 10000) {
            this.securityEvents = this
                .securityEvents
                .slice(-5000);
        }

        // Logger l'événement
        logger.warn('Événement de sécurité détecté', {
            type: event.type,
            severity: event.severity,
            userId: event.userId,
            ip: event.ip,
            details: event.details
        });

        // Alertes pour les événements critiques
        if (event.severity === SecuritySeverity.CRITICAL) {
            this.handleCriticalSecurityEvent(event);
        }
    }

    private handleCriticalSecurityEvent(event : SecurityEvent) : void {
        // Ici, vous pourriez envoyer des alertes par email, SMS, etc.
        logger.error('ALERTE SÉCURITÉ CRITIQUE', event);

        // Bloquer automatiquement l'IP en cas d'attaque critique
        if (event.ip && event.type !== SecurityEventType.LOGIN_FAILURE) {
            this.blockIP(event.ip, `Événement critique: ${event.type}`);
        }
    }

    private identifyThreatType(pattern : RegExp) : string {
        const patternStr = pattern.toString();

        if (patternStr.includes('script') || patternStr.includes('javascript')) {
            return 'XSS';
        }
        if (patternStr.includes('union') || patternStr.includes('select')) {
            return 'SQL_INJECTION';
        }
        if (patternStr.includes('\\.\\.')) {
            return 'PATH_TRAVERSAL';
        }
        if (patternStr.includes('\\|') || patternStr.includes('\\$')) {
            return 'COMMAND_INJECTION';
        }

        return 'UNKNOWN_THREAT';
    }

    private getSecurityEventType(threatType : string) : SecurityEventType {
        switch(threatType) {
            case 'XSS':
                return SecurityEventType.XSS_ATTEMPT;
            case 'SQL_INJECTION':
                return SecurityEventType.SQL_INJECTION_ATTEMPT;
            default:
                return SecurityEventType.SUSPICIOUS_ACTIVITY;
        }
    }

    private getSalt() : string {
        // En production, utilisez une vraie clé secrète depuis les variables
        // d'environnement
        return process.env.PASSWORD_SALT || 'default-salt-change-in-production';
    }

    private startCleanupInterval() : void {
        // Nettoyage toutes les heures
        setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000);
    }

    private cleanup() : void {
        const now = Date.now();

        // Nettoyer les tentatives de connexion expirées
        for (const [key,
            attempts]of this.loginAttempts.entries()) {
            if (now - attempts.lastAttempt > this.config.lockoutDuration) {
                this
                    .loginAttempts
                    .delete(key);
            }
        }

        // Nettoyer les limites de taux expirées
        for (const [key,
            entry]of this.rateLimits.entries()) {
            if (now > entry.resetTime) {
                this
                    .rateLimits
                    .delete(key);
            }
        }

        // Nettoyer les anciens événements de sécurité (garder seulement 30 jours)
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        this.securityEvents = this
            .securityEvents
            .filter(event => event.timestamp.getTime() > thirtyDaysAgo);
    }
}

// ============================================================================
// MIDDLEWARE ET UTILITAIRES
// ============================================================================

/**
 * Middleware de sécurité pour les requêtes
 */
export function createSecurityMiddleware(security : SecurityManager) {
    return (req : any, res : any, next : any) => {
        const ip = req.ip || req.connection.remoteAddress;

        // Vérifier si l'IP est bloquée
        if (security.isIPBlocked(ip)) {
            return res
                .status(403)
                .json({error: 'IP bloquée'});
        }

        // Vérifier la limite de taux
        const rateLimit = security.checkRateLimit(ip);
        if (!rateLimit.allowed) {
            return res
                .status(429)
                .json({error: 'Limite de taux dépassée', resetTime: rateLimit.resetTime});
        }

        // Valider les entrées
        const body = req.body;
        if (body && typeof body === 'object') {
            for (const [key,
                value]of Object.entries(body)) {
                if (typeof value === 'string') {
                    const validation = security.validateInput(value, key, ip);
                    if (!validation.isValid) {
                        return res
                            .status(400)
                            .json({error: 'Entrée invalide détectée', threats: validation.threats});
                    }
                }
            }
        }

        next();
    };
}

/**
 * Hook React pour la sécurité
 */
export function useSecurity() {
    const security = SecurityManager.getInstance();

    return {
        validatePassword: security
            .validatePassword
            .bind(security),
        sanitizeInput: security
            .sanitizeInput
            .bind(security),
        validateInput: security
            .validateInput
            .bind(security),
        generateCSRFToken: security
            .generateCSRFToken
            .bind(security),
        validateCSRFToken: security
            .validateCSRFToken
            .bind(security)
    };
}

/**
 * Composant React pour la protection CSRF
 */
export function CSRFProtection({children} : {
    children: React.ReactNode
}) {
    const security = SecurityManager.getInstance();
    const [csrfToken] = React.useState(() => security.generateCSRFToken());

    React.useEffect(() => {
        // Ajouter le token CSRF aux en-têtes par défaut
        const meta = document.createElement('meta');
        meta.name = 'csrf-token';
        meta.content = csrfToken;
        document
            .head
            .appendChild(meta);

        return () => {
            document
                .head
                .removeChild(meta);
        };
    }, [csrfToken]);

    return <>
        {children}
    </>;
}

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const security = SecurityManager.getInstance();

// ============================================================================
// UTILITAIRES SUPPLÉMENTAIRES
// ============================================================================

/**
 * Génère un mot de passe sécurisé
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Assurer au moins un caractère de chaque type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Remplir le reste
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Vérifie si une URL est sûre
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Protocoles autorisés
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }
    
    // Vérifier les domaines suspects
    const suspiciousDomains = ['bit.ly', 'tinyurl.com', 't.co'];
    if (suspiciousDomains.some(domain => parsed.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Masque les données sensibles pour les logs
 */
export function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credit', 'ssn'];
  
  if (typeof data === 'string') {
    return data.length > 4 ? data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2) : '***';
  }
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  
  if (data && typeof data === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field)
      );
      
      if (isSensitive) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }
  
  return data;
}