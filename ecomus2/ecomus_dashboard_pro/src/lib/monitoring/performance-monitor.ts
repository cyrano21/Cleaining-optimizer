/**
 * Système de monitoring des performances pour les collections dynamiques
 * Surveille les métriques importantes et optimise l'expérience utilisateur
 */

import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, any>;
}

interface ComponentMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  errorCount: number;
  lastError?: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observer pour les métriques de navigation
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        logger.warn('Failed to initialize navigation observer', { error });
      }

      // Observer pour les métriques de ressources
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry as PerformanceResourceTiming);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        logger.warn('Failed to initialize resource observer', { error });
      }

      // Observer pour les métriques de mesure personnalisées
      try {
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordCustomMetric(entry.name, entry.duration, 'ms', {
                startTime: entry.startTime
              });
            }
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.set('measure', measureObserver);
      } catch (error) {
        logger.warn('Failed to initialize measure observer', { error });
      }
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      'page-load-time': entry.loadEventEnd - entry.navigationStart,
      'dom-content-loaded': entry.domContentLoadedEventEnd - entry.navigationStart,
      'first-paint': 0, // Sera mis à jour par les Paint Timing API
      'time-to-interactive': entry.domInteractive - entry.navigationStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordCustomMetric(`navigation.${name}`, value, 'ms');
    });
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    // Surveiller spécifiquement les ressources liées aux collections
    if (entry.name.includes('collections') || entry.name.includes('api/collections')) {
      this.recordCustomMetric(
        'api.collection-request-time',
        entry.responseEnd - entry.requestStart,
        'ms',
        {
          url: entry.name,
          size: entry.transferSize,
          cached: entry.transferSize === 0
        }
      );
    }
  }

  // Méthodes publiques pour enregistrer des métriques
  recordCustomMetric(name: string, value: number, unit: string = 'ms', context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // Garder seulement les 100 dernières métriques par type
    if (metricArray.length > 100) {
      metricArray.shift();
    }

    // Logger les métriques importantes
    if (this.isImportantMetric(name, value)) {
      logger.performance(name, value, context);
    }
  }

  private isImportantMetric(name: string, value: number): boolean {
    const thresholds = {
      'collection.load-time': 2000, // 2 secondes
      'collection.render-time': 100, // 100ms
      'api.collection-request-time': 1000, // 1 seconde
      'component.mount-time': 50 // 50ms
    };

    return value > (thresholds[name as keyof typeof thresholds] || Infinity);
  }

  // Métriques spécifiques aux collections
  startCollectionLoad(collectionId: string) {
    if (this.isClient) {
      performance.mark(`collection-load-start-${collectionId}`);
    }
  }

  endCollectionLoad(collectionId: string, itemCount: number) {
    if (this.isClient) {
      const endMark = `collection-load-end-${collectionId}`;
      performance.mark(endMark);
      performance.measure(
        `collection-load-${collectionId}`,
        `collection-load-start-${collectionId}`,
        endMark
      );

      // Enregistrer des métriques supplémentaires
      this.recordCustomMetric('collection.items-loaded', itemCount, 'count', {
        collectionId
      });
    }
  }

  startComponentRender(componentName: string) {
    if (this.isClient) {
      performance.mark(`component-render-start-${componentName}`);
    }
  }

  endComponentRender(componentName: string) {
    if (this.isClient) {
      const endMark = `component-render-end-${componentName}`;
      performance.mark(endMark);
      performance.measure(
        `component-render-${componentName}`,
        `component-render-start-${componentName}`,
        endMark
      );
    }
  }

  // Gestion des métriques de composants
  recordComponentMount(componentName: string, mountTime: number) {
    const existing = this.componentMetrics.get(componentName) || {
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      errorCount: 0
    };

    this.componentMetrics.set(componentName, {
      ...existing,
      mountTime
    });

    this.recordCustomMetric(`component.mount-time`, mountTime, 'ms', {
      component: componentName
    });
  }

  recordComponentUpdate(componentName: string) {
    const existing = this.componentMetrics.get(componentName) || {
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      errorCount: 0
    };

    this.componentMetrics.set(componentName, {
      ...existing,
      updateCount: existing.updateCount + 1
    });
  }

  recordComponentError(componentName: string, error: string) {
    const existing = this.componentMetrics.get(componentName) || {
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      errorCount: 0
    };

    this.componentMetrics.set(componentName, {
      ...existing,
      errorCount: existing.errorCount + 1,
      lastError: error
    });
  }

  // Méthodes d'analyse
  getMetricSummary(metricName: string) {
    const metrics = this.metrics.get(metricName) || [];
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const median = this.calculateMedian(values);
    const p95 = this.calculatePercentile(values, 95);

    return {
      count: metrics.length,
      average: avg,
      median,
      min,
      max,
      p95,
      unit: metrics[0].unit
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getComponentMetrics(componentName?: string) {
    if (componentName) {
      return this.componentMetrics.get(componentName);
    }
    return Object.fromEntries(this.componentMetrics.entries());
  }

  // Génération de rapports
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {} as Record<string, any>,
      components: Object.fromEntries(this.componentMetrics.entries()),
      recommendations: [] as string[]
    };

    // Analyser toutes les métriques
    for (const [name] of this.metrics) {
      report.metrics[name] = this.getMetricSummary(name);
    }

    // Générer des recommandations
    report.recommendations = this.generateRecommendations(report.metrics);

    return report;
  }

  private generateRecommendations(metrics: Record<string, any>): string[] {
    const recommendations: string[] = [];

    // Vérifier les temps de chargement des collections
    const collectionLoadTime = metrics['collection.load-time'];
    if (collectionLoadTime && collectionLoadTime.average > 1000) {
      recommendations.push('Optimiser le temps de chargement des collections (actuellement > 1s)');
    }

    // Vérifier les temps de rendu des composants
    const componentRenderTime = metrics['component.render-time'];
    if (componentRenderTime && componentRenderTime.average > 50) {
      recommendations.push('Optimiser le temps de rendu des composants (actuellement > 50ms)');
    }

    // Vérifier les requêtes API
    const apiRequestTime = metrics['api.collection-request-time'];
    if (apiRequestTime && apiRequestTime.average > 500) {
      recommendations.push('Optimiser les requêtes API des collections (actuellement > 500ms)');
    }

    return recommendations;
  }

  // Nettoyage
  cleanup() {
    for (const [name, observer] of this.observers) {
      observer.disconnect();
    }
    this.observers.clear();
    this.metrics.clear();
    this.componentMetrics.clear();
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

// Hook React pour utiliser le monitoring dans les composants
export function usePerformanceMonitoring(componentName: string) {
  const startRender = () => performanceMonitor.startComponentRender(componentName);
  const endRender = () => performanceMonitor.endComponentRender(componentName);
  const recordMount = (time: number) => performanceMonitor.recordComponentMount(componentName, time);
  const recordUpdate = () => performanceMonitor.recordComponentUpdate(componentName);
  const recordError = (error: string) => performanceMonitor.recordComponentError(componentName, error);

  return {
    startRender,
    endRender,
    recordMount,
    recordUpdate,
    recordError
  };
}

// Fonctions utilitaires
export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().then(
    (result) => {
      const duration = performance.now() - start;
      performanceMonitor.recordCustomMetric(name, duration, 'ms');
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      performanceMonitor.recordCustomMetric(`${name}.error`, duration, 'ms');
      throw error;
    }
  );
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    performanceMonitor.recordCustomMetric(name, duration, 'ms');
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordCustomMetric(`${name}.error`, duration, 'ms');
    throw error;
  }
}