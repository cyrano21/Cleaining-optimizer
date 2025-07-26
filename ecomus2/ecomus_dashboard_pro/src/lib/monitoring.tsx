/**
 * Système de monitoring et métriques
 * Surveille les performances, erreurs et métriques business de l'application
 */

import React from 'react';
import { logger } from './logger';
import { AppError, ErrorType } from './error-handler';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  unit?: MetricUnit;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BusinessMetric {
  name: string;
  value: number;
  timestamp: Date;
  category: BusinessMetricCategory;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  uptime: number;
  version: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
  details?: Record<string, any>;
}

export enum MetricUnit {
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  MILLISECONDS = 'milliseconds',
  SECONDS = 'seconds',
  BYTES = 'bytes',
  KILOBYTES = 'kilobytes',
  MEGABYTES = 'megabytes'
}

export enum BusinessMetricCategory {
  SALES = 'sales',
  USERS = 'users',
  PRODUCTS = 'products',
  ORDERS = 'orders',
  REVENUE = 'revenue',
  CONVERSION = 'conversion',
  ENGAGEMENT = 'engagement'
}

export interface MonitoringConfig {
  enablePerformanceTracking: boolean;
  enableBusinessMetrics: boolean;
  enableHealthChecks: boolean;
  performanceThresholds: {
    apiResponse: number;
    pageLoad: number;
    databaseQuery: number;
  };
  healthCheckInterval: number;
  metricsRetentionDays: number;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
  };
}

// ============================================================================
// CONFIGURATION PAR DÉFAUT
// ============================================================================

const DEFAULT_CONFIG: MonitoringConfig = {
  enablePerformanceTracking: true,
  enableBusinessMetrics: true,
  enableHealthChecks: true,
  performanceThresholds: {
    apiResponse: 1000, // 1 seconde
    pageLoad: 3000, // 3 secondes
    databaseQuery: 500 // 500ms
  },
  healthCheckInterval: 60000, // 1 minute
  metricsRetentionDays: 30,
  alertThresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 secondes
    memoryUsage: 0.85 // 85%
  }
};

// ============================================================================
// GESTIONNAIRE DE MONITORING PRINCIPAL
// ============================================================================

export class MonitoringManager {
  private static instance: MonitoringManager;
  private config: MonitoringConfig;
  private metrics: MetricData[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private lastHealthCheck?: SystemHealth;
  private startTime: Date;
  private activeRequests = new Map<string, { start: Date; metadata?: any }>();

  private constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = new Date();
    this.initializeDefaultHealthChecks();
    this.startHealthCheckInterval();
    this.startMetricsCleanup();
  }

  public static getInstance(config?: Partial<MonitoringConfig>): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager(config);
    }
    return MonitoringManager.instance;
  }

  // ============================================================================
  // MÉTRIQUES GÉNÉRALES
  // ============================================================================

  /**
   * Enregistre une métrique
   */
  public recordMetric(
    name: string,
    value: number,
    unit?: MetricUnit,
    tags?: Record<string, string>
  ): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: new Date(),
      unit,
      tags
    };

    this.metrics.push(metric);
    this.cleanupOldMetrics();

    logger.debug('Métrique enregistrée', metric);
  }

  /**
   * Incrémente un compteur
   */
  public incrementCounter(
    name: string,
    increment: number = 1,
    tags?: Record<string, string>
  ): void {
    this.recordMetric(name, increment, MetricUnit.COUNT, tags);
  }

  /**
   * Enregistre une valeur de gauge
   */
  public recordGauge(
    name: string,
    value: number,
    unit?: MetricUnit,
    tags?: Record<string, string>
  ): void {
    this.recordMetric(name, value, unit, tags);
  }

  /**
   * Enregistre un histogramme (pour les durées)
   */
  public recordHistogram(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.recordMetric(name, value, MetricUnit.MILLISECONDS, tags);
  }

  // ============================================================================
  // MÉTRIQUES DE PERFORMANCE
  // ============================================================================

  /**
   * Démarre le suivi d'une opération
   */
  public startOperation(operationId: string, metadata?: any): void {
    if (!this.config.enablePerformanceTracking) return;

    this.activeRequests.set(operationId, {
      start: new Date(),
      metadata
    });
  }

  /**
   * Termine le suivi d'une opération
   */
  public endOperation(
    operationId: string,
    operationName: string,
    success: boolean = true,
    error?: string
  ): void {
    if (!this.config.enablePerformanceTracking) return;

    const operation = this.activeRequests.get(operationId);
    if (!operation) {
      logger.warn('Opération non trouvée pour endOperation', { operationId });
      return;
    }

    const duration = Date.now() - operation.start.getTime();
    const metric: PerformanceMetric = {
      name: operationName,
      duration,
      timestamp: new Date(),
      success,
      error,
      metadata: operation.metadata
    };

    this.performanceMetrics.push(metric);
    this.activeRequests.delete(operationId);

    // Vérifier les seuils de performance
    this.checkPerformanceThresholds(operationName, duration);

    logger.debug('Opération terminée', metric);
  }

  /**
   * Mesure automatiquement la durée d'une fonction
   */
  public async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const operationId = this.generateOperationId();
    this.startOperation(operationId, metadata);

    try {
      const result = await operation();
      this.endOperation(operationId, operationName, true);
      return result;
    } catch (error) {
      this.endOperation(
        operationId,
        operationName,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Mesure la durée d'une fonction synchrone
   */
  public measureSyncOperation<T>(
    operationName: string,
    operation: () => T,
    metadata?: any
  ): T {
    const start = Date.now();

    try {
      const result = operation();
      const duration = Date.now() - start;
      
      this.performanceMetrics.push({
        name: operationName,
        duration,
        timestamp: new Date(),
        success: true,
        metadata
      });

      this.checkPerformanceThresholds(operationName, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      this.performanceMetrics.push({
        name: operationName,
        duration,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata
      });

      throw error;
    }
  }

  // ============================================================================
  // MÉTRIQUES BUSINESS
  // ============================================================================

  /**
   * Enregistre une métrique business
   */
  public recordBusinessMetric(
    name: string,
    value: number,
    category: BusinessMetricCategory,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enableBusinessMetrics) return;

    const metric: BusinessMetric = {
      name,
      value,
      timestamp: new Date(),
      category,
      metadata
    };

    this.businessMetrics.push(metric);
    logger.info('Métrique business enregistrée', metric);
  }

  /**
   * Enregistre une vente
   */
  public recordSale(amount: number, currency: string = 'EUR', metadata?: any): void {
    this.recordBusinessMetric('sale', amount, BusinessMetricCategory.SALES, {
      currency,
      ...metadata
    });
  }

  /**
   * Enregistre une inscription utilisateur
   */
  public recordUserRegistration(userType: string = 'customer', metadata?: any): void {
    this.recordBusinessMetric('user_registration', 1, BusinessMetricCategory.USERS, {
      userType,
      ...metadata
    });
  }

  /**
   * Enregistre une commande
   */
  public recordOrder(orderValue: number, itemCount: number, metadata?: any): void {
    this.recordBusinessMetric('order', orderValue, BusinessMetricCategory.ORDERS, {
      itemCount,
      ...metadata
    });
  }

  /**
   * Enregistre une conversion
   */
  public recordConversion(conversionType: string, value: number = 1, metadata?: any): void {
    this.recordBusinessMetric(`conversion_${conversionType}`, value, BusinessMetricCategory.CONVERSION, metadata);
  }

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  /**
   * Enregistre un health check
   */
  public registerHealthCheck(
    name: string,
    check: () => Promise<HealthCheck>
  ): void {
    this.healthChecks.set(name, check);
  }

  /**
   * Exécute tous les health checks
   */
  public async runHealthChecks(): Promise<SystemHealth> {
    if (!this.config.enableHealthChecks) {
      return {
        status: 'healthy',
        timestamp: new Date(),
        checks: [],
        uptime: this.getUptime(),
        version: this.getVersion()
      };
    }

    const checks: HealthCheck[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, checkFn] of this.healthChecks) {
      try {
        const start = Date.now();
        const result = await Promise.race([
          checkFn(),
          new Promise<HealthCheck>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        
        result.duration = Date.now() - start;
        checks.push(result);

        if (result.status === 'fail') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'warn' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks.push({
          name,
          status: 'fail',
          duration: 5000,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        overallStatus = 'unhealthy';
      }
    }

    const health: SystemHealth = {
      status: overallStatus,
      timestamp: new Date(),
      checks,
      uptime: this.getUptime(),
      version: this.getVersion()
    };

    this.lastHealthCheck = health;
    logger.info('Health check terminé', { status: overallStatus, checksCount: checks.length });

    return health;
  }

  /**
   * Récupère le dernier health check
   */
  public getLastHealthCheck(): SystemHealth | undefined {
    return this.lastHealthCheck;
  }

  // ============================================================================
  // ANALYTICS ET RAPPORTS
  // ============================================================================

  /**
   * Calcule les statistiques de performance
   */
  public getPerformanceStats(operationName?: string): {
    count: number;
    averageDuration: number;
    medianDuration: number;
    p95Duration: number;
    p99Duration: number;
    successRate: number;
    errorRate: number;
  } {
    let metrics = this.performanceMetrics;
    
    if (operationName) {
      metrics = metrics.filter(m => m.name === operationName);
    }

    if (metrics.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        medianDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        successRate: 0,
        errorRate: 0
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const successCount = metrics.filter(m => m.success).length;

    return {
      count: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      medianDuration: durations[Math.floor(durations.length / 2)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      successRate: successCount / metrics.length,
      errorRate: (metrics.length - successCount) / metrics.length
    };
  }

  /**
   * Récupère les métriques business agrégées
   */
  public getBusinessMetricsAggregated(
    category?: BusinessMetricCategory,
    timeRange?: { start: Date; end: Date }
  ): {
    totalValue: number;
    count: number;
    averageValue: number;
    byName: Record<string, { total: number; count: number; average: number }>;
  } {
    let metrics = this.businessMetrics;

    if (category) {
      metrics = metrics.filter(m => m.category === category);
    }

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    const totalValue = metrics.reduce((sum, m) => sum + m.value, 0);
    const count = metrics.length;
    const averageValue = count > 0 ? totalValue / count : 0;

    const byName: Record<string, { total: number; count: number; average: number }> = {};
    
    for (const metric of metrics) {
      if (!byName[metric.name]) {
        byName[metric.name] = { total: 0, count: 0, average: 0 };
      }
      byName[metric.name].total += metric.value;
      byName[metric.name].count += 1;
    }

    for (const name in byName) {
      byName[name].average = byName[name].total / byName[name].count;
    }

    return {
      totalValue,
      count,
      averageValue,
      byName
    };
  }

  /**
   * Génère un rapport de monitoring
   */
  public generateReport(): {
    summary: {
      uptime: number;
      totalMetrics: number;
      totalPerformanceMetrics: number;
      totalBusinessMetrics: number;
      lastHealthCheck?: SystemHealth;
    };
    performance: {
      count: number;
      averageDuration: number;
      medianDuration: number;
      p95Duration: number;
      p99Duration: number;
      successRate: number;
      errorRate: number;
    };
    business: {
      totalValue: number;
      count: number;
      averageValue: number;
      byName: Record<string, { total: number; count: number; average: number }>;
    };
    alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: Date;
    }>;
  } {
    const alerts = this.generateAlerts();

    return {
      summary: {
        uptime: this.getUptime(),
        totalMetrics: this.metrics.length,
        totalPerformanceMetrics: this.performanceMetrics.length,
        totalBusinessMetrics: this.businessMetrics.length,
        lastHealthCheck: this.lastHealthCheck
      },
      performance: this.getPerformanceStats(),
      business: this.getBusinessMetricsAggregated(),
      alerts
    };
  }

  // ============================================================================
  // MÉTHODES PRIVÉES
  // ============================================================================

  private initializeDefaultHealthChecks(): void {
    // Health check mémoire
    this.registerHealthCheck('memory', async () => {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        return {
          name: 'memory',
          status: usedPercent > 0.9 ? 'fail' : usedPercent > 0.8 ? 'warn' : 'pass',
          duration: 0,
          message: `Utilisation mémoire: ${(usedPercent * 100).toFixed(1)}%`,
          details: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          }
        };
      }
      
      return {
        name: 'memory',
        status: 'pass',
        duration: 0,
        message: 'Informations mémoire non disponibles'
      };
    });

    // Health check localStorage
    this.registerHealthCheck('localStorage', async () => {
      try {
        const testKey = '__health_check_test__';
        localStorage.setItem(testKey, 'test');
        const value = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        return {
          name: 'localStorage',
          status: value === 'test' ? 'pass' : 'fail',
          duration: 0,
          message: value === 'test' ? 'localStorage fonctionne' : 'localStorage défaillant'
        };
      } catch (error) {
        return {
          name: 'localStorage',
          status: 'fail',
          duration: 0,
          message: 'localStorage inaccessible',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    });
  }

  private startHealthCheckInterval(): void {
    setInterval(() => {
      this.runHealthChecks().catch(error => {
        logger.error('Erreur lors du health check automatique', { error });
      });
    }, this.config.healthCheckInterval);
  }

  private startMetricsCleanup(): void {
    // Nettoyage toutes les heures
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);
  }

  private cleanupOldMetrics(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);

    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoffDate);
    this.businessMetrics = this.businessMetrics.filter(m => m.timestamp > cutoffDate);
  }

  private checkPerformanceThresholds(operationName: string, duration: number): void {
    const thresholds = this.config.performanceThresholds;
    let threshold: number;

    if (operationName.includes('api') || operationName.includes('request')) {
      threshold = thresholds.apiResponse;
    } else if (operationName.includes('page') || operationName.includes('load')) {
      threshold = thresholds.pageLoad;
    } else if (operationName.includes('db') || operationName.includes('query')) {
      threshold = thresholds.databaseQuery;
    } else {
      threshold = thresholds.apiResponse; // Par défaut
    }

    if (duration > threshold) {
      logger.warn('Seuil de performance dépassé', {
        operationName,
        duration,
        threshold,
        exceedBy: duration - threshold
      });
    }
  }

  private generateAlerts(): Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }> {
    const alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: Date;
    }> = [];

    // Vérifier le taux d'erreur
    const stats = this.getPerformanceStats();
    if (stats.errorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        message: `Taux d'erreur élevé: ${(stats.errorRate * 100).toFixed(1)}%`,
        severity: stats.errorRate > 0.1 ? 'high' : 'medium',
        timestamp: new Date()
      });
    }

    // Vérifier le temps de réponse
    if (stats.averageDuration > this.config.alertThresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        message: `Temps de réponse élevé: ${stats.averageDuration.toFixed(0)}ms`,
        severity: stats.averageDuration > this.config.alertThresholds.responseTime * 2 ? 'high' : 'medium',
        timestamp: new Date()
      });
    }

    // Vérifier la santé du système
    if (this.lastHealthCheck && this.lastHealthCheck.status !== 'healthy') {
      alerts.push({
        type: 'system_health',
        message: `Système en état ${this.lastHealthCheck.status}`,
        severity: this.lastHealthCheck.status === 'unhealthy' ? 'high' : 'medium',
        timestamp: new Date()
      });
    }

    return alerts;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  private getVersion(): string {
    return process.env.APP_VERSION || '1.0.0';
  }
}

// ============================================================================
// DÉCORATEURS ET UTILITAIRES
// ============================================================================

/**
 * Décorateur pour mesurer automatiquement les performances d'une méthode
 */
export function monitored(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const monitoring = MonitoringManager.getInstance();
      return monitoring.measureOperation(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Hook React pour le monitoring
 */
export function useMonitoring() {
  const monitoring = MonitoringManager.getInstance();
  
  return {
    recordMetric: monitoring.recordMetric.bind(monitoring),
    recordBusinessMetric: monitoring.recordBusinessMetric.bind(monitoring),
    measureOperation: monitoring.measureOperation.bind(monitoring),
    startOperation: monitoring.startOperation.bind(monitoring),
    endOperation: monitoring.endOperation.bind(monitoring)
  };
}

/**
 * Composant React pour afficher les métriques
 */
export function MetricsDisplay() {
  const [report, setReport] = React.useState<any>(null);
  const monitoring = MonitoringManager.getInstance();

  React.useEffect(() => {
    const updateReport = () => {
      setReport(monitoring.generateReport());
    };

    updateReport();
    const interval = setInterval(updateReport, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, [monitoring]);

  if (!report) return <div>Chargement des métriques...</div>;

  return (
    <div className="metrics-display">
      <h3>Métriques du système</h3>
      <div className="metrics-summary">
        <p>Uptime: {Math.floor(report.summary.uptime / 1000 / 60)} minutes</p>
        <p>Métriques totales: {report.summary.totalMetrics}</p>
        <p>Taux de succès: {(report.performance.successRate * 100).toFixed(1)}%</p>
        <p>Temps de réponse moyen: {report.performance.averageDuration.toFixed(0)}ms</p>
      </div>
      
      {report.alerts.length > 0 && (
        <div className="alerts">
          <h4>Alertes</h4>
          {report.alerts.map((alert: any, index: number) => (
            <div key={index} className={`alert alert-${alert.severity}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const monitoring = MonitoringManager.getInstance();

// ============================================================================
// MIDDLEWARE ET INTÉGRATIONS
// ============================================================================

/**
 * Middleware pour mesurer automatiquement les requêtes API
 */
export function createMonitoringMiddleware(monitoring: MonitoringManager) {
  return (req: any, res: any, next: any) => {
    const operationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operationName = `${req.method} ${req.path}`;
    
    monitoring.startOperation(operationId, {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    const originalSend = res.send;
    res.send = function (data: any) {
      const success = res.statusCode < 400;
      monitoring.endOperation(
        operationId,
        operationName,
        success,
        success ? undefined : `HTTP ${res.statusCode}`
      );
      
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Intégration avec React Router pour mesurer les navigations
 */
export function useRouteMonitoring() {
  const monitoring = MonitoringManager.getInstance();
  
  React.useEffect(() => {
    const startTime = Date.now();
    const path = window.location.pathname;
    
    monitoring.recordMetric('page_view', 1, MetricUnit.COUNT, { path });
    
    return () => {
      const duration = Date.now() - startTime;
      monitoring.recordHistogram('page_duration', duration, { path });
    };
  }, [window.location.pathname]);
}

// Note: Importez React si vous utilisez les hooks et composants
// import React from 'react';