/**
 * Système de logging centralisé pour l'application
 * Remplace les console.log en production par un système plus robuste
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
}

interface LoggerConfig {
  isDevelopment: boolean;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  maxLogLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private isFlushingQueue = false;
  
  constructor() {
    this.config = {
      isDevelopment: process.env.NODE_ENV === 'development',
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
      maxLogLevel: this.getMaxLogLevel()
    };
  }
  
  private getMaxLogLevel(): LogLevel {
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel;
    return level || (this.config.isDevelopment ? 'debug' : 'warn');
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.maxLogLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
  
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };
  }
  
  private getCurrentUserId(): string | undefined {
    // Récupérer l'ID utilisateur depuis le contexte d'auth
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).id : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  
  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
    return undefined;
  }
  
  private async log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }
    
    const entry = this.createLogEntry(level, message, context);
    
    // Log en console si activé
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
    
    // Ajouter à la queue pour envoi distant
    if (this.config.enableRemoteLogging) {
      this.logQueue.push(entry);
      this.flushQueueDebounced();
    }
    
    // Log critique immédiat
    if (level === 'error') {
      await this.sendCriticalLog(entry);
    }
  }
  
  private logToConsole(entry: LogEntry) {
    const { level, message, context, timestamp } = entry;
    const timeStr = timestamp.toISOString();
    
    switch (level) {
      case 'debug':
        console.debug(`[${timeStr}] DEBUG:`, message, context || '');
        break;
      case 'info':
        console.info(`[${timeStr}] INFO:`, message, context || '');
        break;
      case 'warn':
        console.warn(`[${timeStr}] WARN:`, message, context || '');
        break;
      case 'error':
        console.error(`[${timeStr}] ERROR:`, message, context || '');
        break;
    }
  }
  
  private flushQueueDebounced = this.debounce(async () => {
    await this.flushQueue();
  }, 1000);
  
  private async flushQueue() {
    if (this.isFlushingQueue || this.logQueue.length === 0) {
      return;
    }
    
    this.isFlushingQueue = true;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];
    
    try {
      await this.sendLogsToRemote(logsToSend);
    } catch (error) {
      // En cas d'erreur, remettre les logs dans la queue
      this.logQueue.unshift(...logsToSend);
      console.error('Failed to send logs to remote:', error);
    } finally {
      this.isFlushingQueue = false;
    }
  }
  
  private async sendCriticalLog(entry: LogEntry) {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) {
      return;
    }
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: [entry], critical: true })
      });
    } catch (error) {
      console.error('Failed to send critical log:', error);
    }
  }
  
  private async sendLogsToRemote(logs: LogEntry[]) {
    if (!this.config.remoteEndpoint) {
      return;
    }
    
    const response = await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logs })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  
  // Méthodes publiques
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }
  
  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }
  
  // Méthodes spécialisées
  apiError(endpoint: string, error: any, context?: Record<string, any>) {
    this.error(`API Error: ${endpoint}`, {
      endpoint,
      error: error.message || error,
      stack: error.stack,
      ...context
    });
  }
  
  userAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, context);
  }
  
  performance(metric: string, value: number, context?: Record<string, any>) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit: 'ms',
      ...context
    });
  }
  
  // Méthodes utilitaires
  async flush() {
    await this.flushQueue();
  }
  
  setUserId(userId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify({ id: userId }));
    }
  }
  
  clearUserId() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }
}

// Instance singleton
export const logger = new Logger();

// Fonction helper pour migrer facilement depuis console.log
export function logInfo(message: string, ...args: any[]) {
  logger.info(message, args.length > 0 ? { args } : undefined);
}

export function logError(message: string, error?: any) {
  logger.error(message, error ? { error: error.message || error, stack: error.stack } : undefined);
}

export function logWarn(message: string, ...args: any[]) {
  logger.warn(message, args.length > 0 ? { args } : undefined);
}

export function logDebug(message: string, ...args: any[]) {
  logger.debug(message, args.length > 0 ? { args } : undefined);
}

// Export des types pour utilisation externe
export type { LogLevel, LogEntry };