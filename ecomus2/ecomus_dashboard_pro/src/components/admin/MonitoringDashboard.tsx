'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Download, 
  RefreshCw, 
  Server, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MonitoringStats {
  totalEvents: number
  totalMetrics: number
  eventsByType: Record<string, number>
  metricsByName: Record<string, number>
  errorRate: number
  averageResponseTime: number
  requestCount: number
}

interface MonitoringEvent {
  type: string
  data: Record<string, any>
  timestamp: number
  userId?: string
  sessionId?: string
  requestId?: string
}

interface Metric {
  name: string
  value: number
  timestamp: number
  labels?: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<MonitoringStats | null>(null)
  const [events, setEvents] = useState<MonitoringEvent[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('60') // minutes
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fonction pour récupérer les données
  const fetchMonitoringData = async (type: 'stats' | 'events' | 'metrics' = 'stats') => {
    try {
      const response = await fetch(`/api/monitoring?type=${type}&timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }
      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  // Charger toutes les données
  const loadAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [statsData, eventsData, metricsData] = await Promise.all([
        fetchMonitoringData('stats'),
        fetchMonitoringData('events'),
        fetchMonitoringData('metrics')
      ])

      if (statsData) setStats(statsData)
      if (eventsData) setEvents(eventsData)
      if (metricsData) setMetrics(metricsData)
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Effet pour charger les données initiales
  useEffect(() => {
    loadAllData()
  }, [timeRange])

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadAllData()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

  // Fonction pour exporter les données
  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/monitoring?type=export&format=${format}&timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Erreur lors de l\'export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monitoring-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Erreur lors de l\'export des données')
    }
  }

  // Fonction pour nettoyer les anciennes données
  const cleanupData = async () => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanHours: 24 })
      })
      
      if (!response.ok) throw new Error('Erreur lors du nettoyage')
      
      await loadAllData() // Recharger les données
    } catch (err) {
      setError('Erreur lors du nettoyage des données')
    }
  }

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    if (!metrics.length) return null

    // Graphique des temps de réponse
    const responseTimeMetrics = metrics
      .filter(m => m.name === 'api_response_time')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-20) // Derniers 20 points

    const responseTimeData = {
      labels: responseTimeMetrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
      datasets: [{
        label: 'Temps de réponse (ms)',
        data: responseTimeMetrics.map(m => m.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    // Graphique des requêtes par statut
    const requestMetrics = metrics.filter(m => m.name === 'api_requests_total')
    const statusCounts: Record<string, number> = {}
    requestMetrics.forEach(m => {
      const status = m.labels?.status || 'unknown'
      statusCounts[status] = (statusCounts[status] || 0) + m.value
    })

    const statusData = {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#10b981', // 2xx - vert
          '#f59e0b', // 3xx - orange
          '#ef4444', // 4xx - rouge
          '#8b5cf6'  // 5xx - violet
        ]
      }]
    }

    return { responseTimeData, statusData }
  }

  const chartData = prepareChartData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des métriques...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring</h1>
          <p className="text-muted-foreground">Surveillance et métriques de l'application</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="60">1 heure</SelectItem>
              <SelectItem value="360">6 heures</SelectItem>
              <SelectItem value="1440">24 heures</SelectItem>
              <SelectItem value="10080">7 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadAllData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Métriques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requêtes totales</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requestCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Dernière période</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de réponse moyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageResponseTime)}ms</div>
              <p className="text-xs text-muted-foreground">Moyenne</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'erreur</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.errorRate.toFixed(2)}%
                <Badge 
                  variant={stats.errorRate > 5 ? "destructive" : stats.errorRate > 1 ? "secondary" : "default"}
                  className="ml-2"
                >
                  {stats.errorRate > 5 ? "Élevé" : stats.errorRate > 1 ? "Moyen" : "Faible"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Pourcentage d'erreurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements totaux</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Tous types confondus</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets pour les différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Graphique des temps de réponse */}
            {chartData?.responseTimeData && (
              <Card>
                <CardHeader>
                  <CardTitle>Temps de réponse API</CardTitle>
                  <CardDescription>Évolution des temps de réponse</CardDescription>
                </CardHeader>
                <CardContent>
                  <Line 
                    data={chartData.responseTimeData} 
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Temps (ms)'
                          }
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Graphique des statuts de réponse */}
            {chartData?.statusData && (
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des statuts HTTP</CardTitle>
                  <CardDescription>Distribution des codes de réponse</CardDescription>
                </CardHeader>
                <CardContent>
                  <Doughnut 
                    data={chartData.statusData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Métriques de performance détaillées */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métriques par nom</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.metricsByName).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-sm">{name}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Événements par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.eventsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Liste des événements récents */}
          <Card>
            <CardHeader>
              <CardTitle>Événements récents</CardTitle>
              <CardDescription>Derniers événements enregistrés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.slice(0, 50).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.type === 'error' ? 'destructive' : 'default'}>
                        {event.type}
                      </Badge>
                      <span className="text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-md truncate">
                      {JSON.stringify(event.data)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          {/* Options d'export et de maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export des données</CardTitle>
                <CardDescription>Télécharger les métriques et événements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => exportData('json')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en JSON
                </Button>
                <Button onClick={() => exportData('csv')} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Nettoyage et optimisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={cleanupData} variant="destructive" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Nettoyer les anciennes données
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supprime les données de plus de 24 heures
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}