import { NextRequest } from 'next/server'

// Interface pour les métriques
interface Metric {
  name: string
  value: number
  timestamp: number
  labels?: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

// Interface pour les événements de monitoring
interface MonitoringEvent {
  type: 'api_request' | 'database_query' | 'cache_operation' | 'error' | 'performance'
  data: Record<string, any>
  timestamp: number
  userId?: string
  sessionId?: string
  requestId?: string
}

// Classe principale de monitoring
export class MonitoringService {
  private static instance: MonitoringService
  private metrics: Map<string, Metric[]> = new Map()
  private events: MonitoringEvent[] = []
  private maxEvents = 10000 // Limite pour éviter la surcharge mémoire
  private maxMetrics = 1000

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Enregistrer une métrique
  recordMetric(metric: Omit<Metric, 'timestamp'>): void {
    const fullMetric: Metric = {
      ...metric,
      timestamp: Date.now()
    }

    const key = this.getMetricKey(metric.name, metric.labels)
    const existing = this.metrics.get(key) || []
    existing.push(fullMetric)

    // Limiter le nombre de métriques stockées
    if (existing.length > this.maxMetrics) {
      existing.splice(0, existing.length - this.maxMetrics)
    }

    this.metrics.set(key, existing)
  }

  // Enregistrer un événement
  recordEvent(event: Omit<MonitoringEvent, 'timestamp'>): void {
    const fullEvent: MonitoringEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.events.push(fullEvent)

    // Limiter le nombre d'événements stockés
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents)
    }
  }

  // Obtenir les métriques
  getMetrics(name?: string, timeRange?: { start: number; end: number }): Metric[] {
    let allMetrics: Metric[] = []

    if (name) {
      // Rechercher toutes les métriques avec ce nom
      for (const [key, metrics] of this.metrics.entries()) {
        if (key.startsWith(name)) {
          allMetrics.push(...metrics)
        }
      }
    } else {
      // Toutes les métriques
      for (const metrics of this.metrics.values()) {
        allMetrics.push(...metrics)
      }
    }

    // Filtrer par plage de temps si spécifiée
    if (timeRange) {
      allMetrics = allMetrics.filter(
        metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
      )
    }

    return allMetrics.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Obtenir les événements
  getEvents(type?: string, timeRange?: { start: number; end: number }): MonitoringEvent[] {
    let filteredEvents = this.events

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type)
    }

    if (timeRange) {
      filteredEvents = filteredEvents.filter(
        event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      )
    }

    return filteredEvents.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Obtenir des statistiques agrégées
  getAggregatedStats(timeRange?: { start: number; end: number }) {
    const events = this.getEvents(undefined, timeRange)
    const metrics = this.getMetrics(undefined, timeRange)

    const stats = {
      totalEvents: events.length,
      totalMetrics: metrics.length,
      eventsByType: {} as Record<string, number>,
      metricsByName: {} as Record<string, number>,
      errorRate: 0,
      averageResponseTime: 0,
      requestCount: 0
    }

    // Compter les événements par type
    events.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1
    })

    // Compter les métriques par nom
    metrics.forEach(metric => {
      stats.metricsByName[metric.name] = (stats.metricsByName[metric.name] || 0) + 1
    })

    // Calculer le taux d'erreur
    const errorEvents = events.filter(event => event.type === 'error')
    const requestEvents = events.filter(event => event.type === 'api_request')
    stats.errorRate = requestEvents.length > 0 ? (errorEvents.length / requestEvents.length) * 100 : 0
    stats.requestCount = requestEvents.length

    // Calculer le temps de réponse moyen
    const responseTimeMetrics = metrics.filter(metric => metric.name === 'api_response_time')
    if (responseTimeMetrics.length > 0) {
      const totalTime = responseTimeMetrics.reduce((sum, metric) => sum + metric.value, 0)
      stats.averageResponseTime = totalTime / responseTimeMetrics.length
    }

    return stats
  }

  // Nettoyer les anciennes données
  cleanup(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan

    // Nettoyer les événements
    this.events = this.events.filter(event => event.timestamp > cutoff)

    // Nettoyer les métriques
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(metric => metric.timestamp > cutoff)
      if (filteredMetrics.length === 0) {
        this.metrics.delete(key)
      } else {
        this.metrics.set(key, filteredMetrics)
      }
    }
  }

  // Générer une clé unique pour les métriques
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }

    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',')

    return `${name}{${labelString}}`
  }

  // Exporter les données pour analyse externe
  exportData(format: 'json' | 'csv' = 'json') {
    const data = {
      metrics: this.getMetrics(),
      events: this.getEvents(),
      stats: this.getAggregatedStats(),
      exportedAt: new Date().toISOString()
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    }

    // Format CSV basique pour les métriques
    const csvLines = ['timestamp,name,value,type,labels']
    data.metrics.forEach(metric => {
      const labels = metric.labels ? JSON.stringify(metric.labels) : ''
      csvLines.push(`${metric.timestamp},${metric.name},${metric.value},${metric.type},"${labels}"`)
    })

    return csvLines.join('\n')
  }
}

// Instance singleton
export const monitoring = MonitoringService.getInstance()

// Middleware de monitoring pour les API routes
export function withMonitoring(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async function monitoredHandler(req: NextRequest, context?: any): Promise<Response> {
    const startTime = Date.now()
    const requestId = generateRequestId()
    const method = req.method
    const url = req.url
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Enregistrer le début de la requête
    monitoring.recordEvent({
      type: 'api_request',
      data: {
        method,
        url,
        userAgent,
        requestId,
        stage: 'start'
      },
      requestId
    })

    try {
      const response = await handler(req, context)
      const duration = Date.now() - startTime

      // Enregistrer les métriques de succès
      monitoring.recordMetric({
        name: 'api_response_time',
        value: duration,
        type: 'histogram',
        labels: {
          method,
          status: response.status.toString(),
          endpoint: new URL(url).pathname
        }
      })

      monitoring.recordMetric({
        name: 'api_requests_total',
        value: 1,
        type: 'counter',
        labels: {
          method,
          status: response.status.toString()
        }
      })

      monitoring.recordEvent({
        type: 'api_request',
        data: {
          method,
          url,
          status: response.status,
          duration,
          requestId,
          stage: 'complete'
        },
        requestId
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Enregistrer les métriques d'erreur
      monitoring.recordMetric({
        name: 'api_errors_total',
        value: 1,
        type: 'counter',
        labels: {
          method,
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        }
      })

      monitoring.recordEvent({
        type: 'error',
        data: {
          method,
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          duration,
          requestId
        },
        requestId
      })

      throw error
    }
  }
}

// Fonctions utilitaires
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Métriques prédéfinies
export const metrics = {
  // Incrémenter un compteur
  increment: (name: string, labels?: Record<string, string>) => {
    monitoring.recordMetric({
      name,
      value: 1,
      type: 'counter',
      labels
    })
  },

  // Définir une valeur de gauge
  gauge: (name: string, value: number, labels?: Record<string, string>) => {
    monitoring.recordMetric({
      name,
      value,
      type: 'gauge',
      labels
    })
  },

  // Enregistrer une durée
  timing: (name: string, duration: number, labels?: Record<string, string>) => {
    monitoring.recordMetric({
      name,
      value: duration,
      type: 'histogram',
      labels
    })
  },

  // Mesurer le temps d'exécution d'une fonction
  time: async <T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T> => {
    const start = Date.now()
    try {
      const result = await fn()
      metrics.timing(name, Date.now() - start, labels)
      return result
    } catch (error) {
      metrics.timing(name, Date.now() - start, { ...labels, error: 'true' })
      throw error
    }
  }
}

// Nettoyage automatique toutes les heures
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    monitoring.cleanup()
  }, 60 * 60 * 1000) // 1 heure
}