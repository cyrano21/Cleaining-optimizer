const lesson3 = {
  id: '15-3',
  title: 'Surveillance et Métriques de Performance',
  description:
    "Mise en place d'une surveillance complète des performances : monitoring en temps réel, alertes automatiques, et optimisation continue basée sur les données.",
  difficulty: 'avancé',
  duration: 45,
  tags: ['Next.js', 'Monitoring', 'Analytics', 'Performance', 'Real-time'],
  prerequisites: ['15-1', '15-2'],

  content: {
    theory: `
      <h2>📊 Surveillance et Métriques de Performance</h2>
      
      <h3>1. Système de Monitoring en Temps Réel</h3>
      <p>Implémentation d'un système complet de surveillance des performances avec alertes automatiques.</p>
      
      <div class="code-example">
        <pre><code>// lib/performance-monitor.js
export class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      endpoint: '/api/metrics',
      batchSize: 50,
      flushInterval: 5000,
      enableRealTime: true,
      thresholds: {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        TTFB: { good: 800, poor: 1800 }
      },
      ...config
    }
    
    this.metricsQueue = []
    this.alerts = new Map()
    this.realTimeMetrics = new Map()
    
    this.initializeMonitoring()
  }
  
  initializeMonitoring() {
    // Observer les métriques de performance
    this.observeWebVitals()
    this.observeCustomMetrics()
    this.observeResourceTiming()
    this.observeUserInteractions()
    
    // Démarrer le flush périodique
    this.startPeriodicFlush()
    
    // Surveillance en temps réel
    if (this.config.enableRealTime) {
      this.initializeRealTimeMonitoring()
    }
  }
  
  observeWebVitals() {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const vitalsCallback = (metric) => {
        this.recordMetric({
          type: 'web-vital',
          name: metric.name,
          value: metric.value,
          rating: this.getRating(metric.name, metric.value),
          timestamp: Date.now(),
          url: window.location.href,
          id: metric.id
        })
        
        // Vérifier les seuils d'alerte
        this.checkThresholds(metric.name, metric.value)
      }
      
      getCLS(vitalsCallback)
      getFID(vitalsCallback)
      getFCP(vitalsCallback)
      getLCP(vitalsCallback)
      getTTFB(vitalsCallback)
    })
  }
  
  observeCustomMetrics() {
    // Observer les métriques personnalisées
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          type: 'custom',
          name: entry.name,
          value: entry.duration,
          timestamp: entry.startTime,
          url: window.location.href
        })
      }
    })
    
    observer.observe({ entryTypes: ['measure', 'navigation'] })
  }
  
  observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Analyser les ressources lentes
        if (entry.duration > 1000) {
          this.recordMetric({
            type: 'slow-resource',
            name: entry.name,
            value: entry.duration,
            size: entry.transferSize,
            timestamp: Date.now()
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
  
  checkThresholds(metricName, value) {
    const threshold = this.config.thresholds[metricName]
    if (!threshold) return
    
    let severity = 'info'
    if (value > threshold.poor) {
      severity = 'critical'
    } else if (value > threshold.good) {
      severity = 'warning'
    }
    
    if (severity !== 'info') {
      this.triggerAlert({
        metric: metricName,
        value,
        severity,
        threshold: threshold.poor,
        timestamp: Date.now()
      })
    }
  }
  
  triggerAlert(alert) {
    // Éviter les alertes en double
    const alertKey = \`\${alert.metric}-\${alert.severity}\`
    const lastAlert = this.alerts.get(alertKey)
    
    if (lastAlert && Date.now() - lastAlert.timestamp < 30000) {
      return // Cooldown de 30 secondes
    }
    
    this.alerts.set(alertKey, alert)
    
    // Envoyer l'alerte
    this.sendAlert(alert)
  }
  
  sendAlert(alert) {
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...alert,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      })
    }).catch(err => console.error('Failed to send alert:', err))
  }
  
  initializeRealTimeMonitoring() {
    // WebSocket pour les métriques en temps réel
    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      const ws = new WebSocket('ws://localhost:3001/metrics')
      
      ws.onopen = () => {
        console.log('Real-time monitoring connected')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleRealTimeData(data)
      }
    }
  }
}</code></pre>
      </div>
      
      <h3>2. Analytics et Reporting Avancés</h3>
      <p>Système d'analyse des données de performance avec rapports automatisés.</p>
      
      <div class="code-example">
        <pre><code>// lib/performance-analytics.js
export class PerformanceAnalytics {
  constructor() {
    this.dataStore = new Map()
    this.aggregations = new Map()
    this.trends = new Map()
  }
  
  // Analyse des tendances de performance
  analyzeTrends(metrics, timeframe = '24h') {
    const now = Date.now()
    const timeframeDuration = this.parseTimeframe(timeframe)
    const startTime = now - timeframeDuration
    
    // Filtrer les métriques par période
    const filteredMetrics = metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= now
    )
    
    // Grouper par métrique
    const groupedMetrics = this.groupByMetric(filteredMetrics)
    
    // Calculer les tendances
    const trends = {}
    for (const [metricName, values] of Object.entries(groupedMetrics)) {
      trends[metricName] = this.calculateTrend(values)
    }
    
    return trends
  }
  
  calculateTrend(values) {
    if (values.length < 2) return { trend: 'insufficient-data' }
    
    // Régression linéaire simple
    const n = values.length
    const sumX = values.reduce((sum, _, i) => sum + i, 0)
    const sumY = values.reduce((sum, v) => sum + v.value, 0)
    const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0)
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Calculer les statistiques
    const currentValue = values[values.length - 1].value
    const previousValue = values[0].value
    const change = ((currentValue - previousValue) / previousValue) * 100
    
    return {
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      slope,
      intercept,
      change: Math.round(change * 100) / 100,
      current: currentValue,
      previous: previousValue,
      confidence: this.calculateConfidence(values, slope, intercept)
    }
  }
  
  // Génération de rapports automatisés
  generateReport(timeframe = '24h') {
    const metrics = this.getMetrics(timeframe)
    const trends = this.analyzeTrends(metrics, timeframe)
    const insights = this.generateInsights(trends)
    const recommendations = this.generateRecommendations(trends)
    
    return {
      period: timeframe,
      generated: new Date().toISOString(),
      summary: this.generateSummary(trends),
      metrics: this.aggregateMetrics(metrics),
      trends,
      insights,
      recommendations,
      alerts: this.getActiveAlerts(),
      performance_score: this.calculatePerformanceScore(trends)
    }
  }
  
  generateInsights(trends) {
    const insights = []
    
    for (const [metric, trend] of Object.entries(trends)) {
      if (Math.abs(trend.change) > 10) {
        insights.push({
          type: trend.change > 0 ? 'degradation' : 'improvement',
          metric,
          change: trend.change,
          severity: Math.abs(trend.change) > 25 ? 'high' : 'medium',
          description: this.getInsightDescription(metric, trend)
        })
      }
    }
    
    return insights
  }
  
  generateRecommendations(trends) {
    const recommendations = []
    
    // Recommandations basées sur les métriques
    if (trends.LCP && trends.LCP.current > 2500) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        metric: 'LCP',
        title: 'Optimiser le Largest Contentful Paint',
        description: 'Votre LCP est trop élevé. Considérez l\'optimisation des images et le préchargement des ressources critiques.',
        actions: [
          'Optimiser les images above-the-fold',
          'Implémenter le préchargement des ressources critiques',
          'Réduire la taille des images hero',
          'Utiliser un CDN pour les ressources statiques'
        ]
      })
    }
    
    if (trends.FID && trends.FID.current > 100) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        metric: 'FID',
        title: 'Améliorer la responsivité',
        description: 'Le temps de réponse aux interactions est trop lent.',
        actions: [
          'Réduire le JavaScript de main thread',
          'Diviser les tâches longues',
          'Utiliser les Web Workers pour les calculs intensifs',
          'Implémenter le code splitting'
        ]
      })
    }
    
    return recommendations
  }
  
  // Export des données pour analysis externe
  exportData(format = 'json', timeframe = '7d') {
    const data = {
      metrics: this.getMetrics(timeframe),
      trends: this.analyzeTrends(this.getMetrics(timeframe), timeframe),
      report: this.generateReport(timeframe)
    }
    
    switch (format) {
      case 'csv':
        return this.convertToCSV(data.metrics)
      case 'json':
        return JSON.stringify(data, null, 2)
      default:
        return data
    }
  }
}</code></pre>
      </div>
      
      <h3>3. Dashboard de Performance en Temps Réel</h3>
      <p>Interface utilisateur pour visualiser les métriques de performance en temps réel.</p>
      
      <div class="code-example">
        <pre><code>// components/PerformanceDashboard.js
import { useState, useEffect, useRef } from 'react'
import { Line, Bar, Gauge } from 'react-chartjs-2'
import { PerformanceMonitor } from '../lib/performance-monitor'
import { PerformanceAnalytics } from '../lib/performance-analytics'

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({})
  const [trends, setTrends] = useState({})
  const [alerts, setAlerts] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  
  const monitorRef = useRef(null)
  const analyticsRef = useRef(null)
  
  useEffect(() => {
    // Initialiser le monitoring
    monitorRef.current = new PerformanceMonitor({
      onMetric: handleNewMetric,
      onAlert: handleNewAlert
    })
    
    analyticsRef.current = new PerformanceAnalytics()
    
    setIsMonitoring(true)
    
    // Mise à jour périodique
    const interval = setInterval(() => {
      updateDashboard()
    }, 5000)
    
    return () => {
      clearInterval(interval)
      if (monitorRef.current) {
        monitorRef.current.disconnect()
      }
    }
  }, [])
  
  const handleNewMetric = (metric) => {
    setMetrics(prev => ({
      ...prev,
      [metric.name]: {
        ...metric,
        history: [...(prev[metric.name]?.history || []), metric].slice(-50)
      }
    }))
  }
  
  const handleNewAlert = (alert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]) // Garder 10 dernières alertes
  }
  
  const updateDashboard = () => {
    if (analyticsRef.current) {
      const currentTrends = analyticsRef.current.analyzeTrends(
        Object.values(metrics).flatMap(m => m.history || [])
      )
      setTrends(currentTrends)
    }
  }
  
  const getMetricColor = (metricName, value) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    }
    
    const threshold = thresholds[metricName]
    if (!threshold) return '#6B7280'
    
    if (value <= threshold.good) return '#10B981'
    if (value <= threshold.poor) return '#F59E0B'
    return '#EF4444'
  }
  
  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard de Performance</h1>
        <div className="status-indicator">
          <span className={\`status \${isMonitoring ? 'active' : 'inactive'}\`}>
            {isMonitoring ? '🟢 Monitoring Actif' : '🔴 Monitoring Inactif'}
          </span>
        </div>
      </div>
      
      {/* Métriques principales */}
      <div className="metrics-grid">
        {Object.entries(metrics).map(([name, metric]) => (
          <div key={name} className="metric-card">
            <div className="metric-header">
              <h3>{name}</h3>
              <span 
                className="metric-value"
                style={{ color: getMetricColor(name, metric.value) }}
              >
                {Math.round(metric.value)}
                {name === 'CLS' ? '' : 'ms'}
              </span>
            </div>
            
            {metric.history && metric.history.length > 1 && (
              <div className="metric-chart">
                <Line
                  data={{
                    labels: metric.history.map((_, i) => i),
                    datasets: [{
                      data: metric.history.map(h => h.value),
                      borderColor: getMetricColor(name, metric.value),
                      backgroundColor: \`\${getMetricColor(name, metric.value)}20\`,
                      fill: true,
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { display: false },
                      y: { display: false }
                    }
                  }}
                />
              </div>
            )}
            
            {trends[name] && (
              <div className="metric-trend">
                <span className={\`trend \${trends[name].trend}\`}>
                  {trends[name].trend === 'increasing' ? '📈' : 
                   trends[name].trend === 'decreasing' ? '📉' : '➡️'}
                  {Math.abs(trends[name].change)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>🚨 Alertes Récentes</h2>
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className={\`alert alert-\${alert.severity}\`}>
                <div className="alert-content">
                  <strong>{alert.metric}</strong>: {alert.value}ms
                  <small>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                <div className="alert-actions">
                  <button onClick={() => dismissAlert(index)}>
                    Ignorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommandations */}
      <div className="recommendations-section">
        <h2>💡 Recommandations</h2>
        <RecommendationsList trends={trends} />
      </div>
      
      <style jsx>{\`
        .performance-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .status.active {
          color: #10B981;
        }
        
        .status.inactive {
          color: #EF4444;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #E5E7EB;
        }
        
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: bold;
        }
        
        .metric-chart {
          height: 60px;
          margin: 1rem 0;
        }
        
        .metric-trend {
          text-align: center;
        }
        
        .trend.increasing {
          color: #EF4444;
        }
        
        .trend.decreasing {
          color: #10B981;
        }
        
        .alerts-list {
          space-y: 0.5rem;
        }
        
        .alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        .alert-critical {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
        }
        
        .alert-warning {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          color: #D97706;
        }
      \`}</style>
    </div>
  )
}

function RecommendationsList({ trends }) {
  // Component pour afficher les recommandations...
  return (
    <div className="recommendations">
      {/* Contenu des recommandations */}
    </div>
  )
}</code></pre>
      </div>
      
      <h3>4. API de Métriques et Alertes</h3>
      <p>Backend pour collecter, stocker et analyser les données de performance.</p>
      
      <div class="code-example">
        <pre><code>// pages/api/metrics.js
import { connectToDatabase } from '../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { db } = await connectToDatabase()
    const metricsCollection = db.collection('performance_metrics')
    
    const metrics = Array.isArray(req.body) ? req.body : [req.body]
    
    // Enrichir les métriques avec des métadonnées
    const enrichedMetrics = metrics.map(metric => ({
      ...metric,
      timestamp: new Date(metric.timestamp || Date.now()),
      sessionId: req.headers['x-session-id'] || 'anonymous',
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      country: req.headers['cf-ipcountry'] || 'unknown'
    }))
    
    // Insérer les métriques
    await metricsCollection.insertMany(enrichedMetrics)
    
    // Vérifier les seuils d'alerte
    for (const metric of enrichedMetrics) {
      await checkAlertThresholds(metric, db)
    }
    
    res.status(200).json({ 
      success: true, 
      count: enrichedMetrics.length 
    })
    
  } catch (error) {
    console.error('Error saving metrics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function checkAlertThresholds(metric, db) {
  const thresholds = {
    LCP: 4000,
    FID: 300,
    CLS: 0.25,
    TTFB: 1800
  }
  
  const threshold = thresholds[metric.name]
  if (!threshold || metric.value <= threshold) return
  
  // Créer une alerte
  const alertsCollection = db.collection('performance_alerts')
  
  await alertsCollection.insertOne({
    metric: metric.name,
    value: metric.value,
    threshold,
    severity: metric.value > threshold * 1.5 ? 'critical' : 'warning',
    url: metric.url,
    timestamp: new Date(),
    sessionId: metric.sessionId,
    resolved: false
  })
  
  // Envoyer une notification (webhook, email, etc.)
  await sendAlertNotification({
    metric: metric.name,
    value: metric.value,
    threshold,
    url: metric.url
  })
}</code></pre>
      </div>
    `,

    practicalExample: `
      <h3>💡 Exemple Pratique : Système d'Alerte Intelligent</h3>
      
      <div class="code-example">
        <pre><code>// lib/intelligent-alerting.js
export class IntelligentAlerting {
  constructor() {
    this.alertRules = new Map()
    this.alertHistory = new Map()
    this.suppressions = new Set()
  }
  
  // Configuration des règles d'alerte dynamiques
  configureAlertRules() {
    // Règle basée sur les percentiles
    this.addRule('lcp-p95', {
      metric: 'LCP',
      condition: (values) => {
        const p95 = this.calculatePercentile(values, 95)
        return p95 > 3000
      },
      severity: 'warning',
      message: 'LCP P95 dépasse 3 secondes'
    })
    
    // Règle de dégradation rapide
    this.addRule('rapid-degradation', {
      metric: '*',
      condition: (values) => {
        if (values.length < 10) return false
        const recent = values.slice(-5)
        const previous = values.slice(-10, -5)
        const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length
        const previousAvg = previous.reduce((sum, v) => sum + v, 0) / previous.length
        return (recentAvg - previousAvg) / previousAvg > 0.5
      },
      severity: 'critical',
      message: 'Dégradation rapide détectée'
    })
    
    // Règle d'anomalie statistique
    this.addRule('statistical-anomaly', {
      metric: '*',
      condition: (values) => {
        if (values.length < 20) return false
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        const stdDev = Math.sqrt(variance)
        const latest = values[values.length - 1]
        return Math.abs(latest - mean) > 3 * stdDev
      },
      severity: 'warning',
      message: 'Anomalie statistique détectée'
    })
  }
  
  // Évaluation intelligente des alertes
  evaluateAlerts(metricName, values) {
    const applicableRules = Array.from(this.alertRules.values())
      .filter(rule => rule.metric === '*' || rule.metric === metricName)
    
    const triggeredAlerts = []
    
    for (const rule of applicableRules) {
      if (this.isRuleSuppressed(rule.id)) continue
      
      try {
        if (rule.condition(values)) {
          const alert = {
            ruleId: rule.id,
            metric: metricName,
            severity: rule.severity,
            message: rule.message,
            timestamp: Date.now(),
            context: this.buildAlertContext(metricName, values)
          }
          
          // Vérifier si c'est un doublon récent
          if (!this.isRecentDuplicate(alert)) {
            triggeredAlerts.push(alert)
            this.recordAlert(alert)
          }
        }
      } catch (error) {
        console.error(\`Error evaluating rule \${rule.id}:\`, error)
      }
    }
    
    return triggeredAlerts
  }
  
  // Auto-résolution des alertes
  autoResolveAlerts(metricName, values) {
    const activeAlerts = this.getActiveAlerts(metricName)
    
    for (const alert of activeAlerts) {
      const rule = this.alertRules.get(alert.ruleId)
      if (!rule) continue
      
      // Vérifier si la condition n'est plus remplie
      if (!rule.condition(values)) {
        this.resolveAlert(alert.id, 'auto-resolved')
      }
    }
  }
  
  // Machine learning pour réduire les faux positifs
  async trainAnomalyDetection(historicalData) {
    // Implémentation simplifiée d'un détecteur d'anomalies
    const features = this.extractFeatures(historicalData)
    const model = await this.buildAnomalyModel(features)
    
    this.anomalyModel = model
  }
  
  extractFeatures(data) {
    return data.map(point => ({
      value: point.value,
      timeOfDay: new Date(point.timestamp).getHours(),
      dayOfWeek: new Date(point.timestamp).getDay(),
      trend: this.calculateTrend(point.context),
      volatility: this.calculateVolatility(point.context)
    }))
  }
}</code></pre>
      </div>
    `,

    interactiveExercise: {
      type: 'monitoring-setup',
      title: "Défi : Configuration d'un Système de Monitoring",
      description:
        'Configurez un système complet de monitoring avec alertes personnalisées.',

      starterCode: `// lib/monitoring-config.js
export class MonitoringConfig {
  constructor() {
    this.rules = []
    this.thresholds = {}
    this.notifications = []
  }
  
  // TODO: Ajouter des règles d'alerte
  addAlertRule(rule) {
    // Votre code ici
  }
  
  // TODO: Configurer les seuils adaptatifs
  setAdaptiveThresholds(metric, config) {
    // Votre code ici
  }
  
  // TODO: Configurer les notifications
  addNotificationChannel(channel) {
    // Votre code ici
  }
}`,

      solution: `// lib/monitoring-config.js
export class MonitoringConfig {
  constructor() {
    this.rules = []
    this.thresholds = new Map()
    this.notifications = []
    this.adaptiveConfig = new Map()
  }
  
  addAlertRule(rule) {
    const alertRule = {
      id: rule.id || \`rule-\${Date.now()}\`,
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      severity: rule.severity || 'warning',
      enabled: rule.enabled !== false,
      cooldown: rule.cooldown || 300000, // 5 minutes
      ...rule
    }
    
    this.rules.push(alertRule)
    return alertRule.id
  }
  
  setAdaptiveThresholds(metric, config) {
    this.adaptiveConfig.set(metric, {
      baseThreshold: config.base,
      adaptationRate: config.adaptationRate || 0.1,
      windowSize: config.windowSize || 100,
      minThreshold: config.min,
      maxThreshold: config.max
    })
    
    // Calculer le seuil initial
    this.updateThreshold(metric, config.base)
  }
  
  updateThreshold(metric, newValue) {
    const config = this.adaptiveConfig.get(metric)
    if (!config) return
    
    const currentThreshold = this.thresholds.get(metric) || config.baseThreshold
    const adaptedThreshold = currentThreshold + 
      (newValue - currentThreshold) * config.adaptationRate
    
    // Appliquer les limites
    const finalThreshold = Math.max(
      config.minThreshold,
      Math.min(config.maxThreshold, adaptedThreshold)
    )
    
    this.thresholds.set(metric, finalThreshold)
  }
  
  addNotificationChannel(channel) {
    const notificationChannel = {
      id: channel.id || \`channel-\${Date.now()}\`,
      type: channel.type, // 'email', 'slack', 'webhook'
      config: channel.config,
      enabled: channel.enabled !== false,
      severityFilter: channel.severityFilter || ['critical', 'warning'],
      ...channel
    }
    
    this.notifications.push(notificationChannel)
    return notificationChannel.id
  }
}`
    },

    quiz: {
      title: 'Quiz : Surveillance et Métriques de Performance',
      questions: [
        {
          id: 1,
          question:
            'Quelle est la meilleure approche pour réduire les faux positifs dans les alertes de performance ?',
          options: [
            "Augmenter tous les seuils d'alerte",
            "Utiliser des seuils adaptatifs et l'analyse de tendances",
            'Désactiver les alertes automatiques',
            'Ne surveiller que les métriques critiques'
          ],
          correct: 1,
          explanation:
            "Les seuils adaptatifs et l'analyse de tendances permettent de contextualiser les alertes et de réduire les faux positifs en tenant compte de l'historique et des patterns normaux."
        },
        {
          id: 2,
          question:
            "Quelle métrique est la plus importante pour mesurer l'expérience utilisateur perçue ?",
          options: [
            'TTFB (Time to First Byte)',
            'LCP (Largest Contentful Paint)',
            'Bundle size',
            'Server response time'
          ],
          correct: 1,
          explanation:
            "Le LCP mesure quand le contenu principal de la page devient visible, ce qui correspond directement à la perception de rapidité par l'utilisateur."
        },
        {
          id: 3,
          question:
            "Pourquoi est-il important d'avoir un système d'auto-résolution des alertes ?",
          options: [
            "Pour économiser l'espace de stockage",
            "Pour éviter l'accumulation d'alertes obsolètes et la fatigue d'alerte",
            'Pour réduire la charge serveur',
            'Pour simplifier la configuration'
          ],
          correct: 1,
          explanation:
            "L'auto-résolution évite l'accumulation d'alertes qui ne sont plus pertinentes, réduisant ainsi la fatigue d'alerte et permettant de se concentrer sur les vrais problèmes."
        }
      ]
    },

    practicalProject: {
      title: 'Projet : Système de Monitoring Complet',
      description:
        'Créez un système de monitoring complet avec dashboard, alertes intelligentes et rapports automatisés.',

      requirements: [
        'Dashboard temps réel avec graphiques des métriques',
        "Système d'alertes avec règles configurables",
        'Génération automatique de rapports de performance',
        'API pour collecter et analyser les métriques',
        'Notifications multi-canaux (email, Slack, webhook)'
      ],

      hints: [
        'Utilisez WebSockets pour les données temps réel',
        'Implémentez un système de cache pour les métriques',
        'Créez des templates de rapports réutilisables',
        "Ajoutez des seuils adaptatifs basés sur l'historique"
      ],

      evaluation: {
        criteria: [
          'Fonctionnalité complète du dashboard',
          'Précision et pertinence des alertes',
          'Qualité des rapports générés',
          'Performance du système de monitoring',
          "Facilité de configuration et d'utilisation"
        ],
        points: 100
      }
    }
  }
}

export default lesson3
