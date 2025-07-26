'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  AlertTriangle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { useOptimizedData } from '@/hooks/useOptimizedData';

interface PerformanceMetrics {
  totalEndpoints: number;
  totalRequests: number;
  slowestEndpoints: Array<{
    endpoint: string;
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    lastRequest: string;
  }>;
}

interface Alert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  endpoint: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

interface MetricsResponse {
  timestamp: string;
  metrics: PerformanceMetrics;
  recommendations?: Array<{
    endpoint: string;
    issue: string;
    recommendation: string;
  }>;
}

/**
 * Dashboard de performance pour monitorer les métriques de l'application
 */
export default function PerformanceDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertThresholds, setAlertThresholds] = useState({
    maxAvgDuration: 1000,
    maxP95Duration: 2000,
    maxRequestCount: 1000
  });

  // Récupération des métriques avec le hook optimisé
  const { 
    data: metricsData, 
    loading, 
    error, 
    refetch 
  } = useOptimizedData<MetricsResponse>({
    fetcher: async () => {
      const response = await fetch('/api/metrics?optimize=true');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des métriques');
      }
      return response.json();
    },
    key: 'performance-metrics',
    cacheTTL: 30000, // 30 secondes
    revalidateInterval: 60000, // 1 minute
    retryAttempts: 3
  });

  const metrics = metricsData?.metrics;
  const recommendations = metricsData?.recommendations;

  // Génération d'alertes
  const generateAlerts = async () => {
    try {
      const response = await fetch('/api/metrics/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          thresholds: alertThresholds,
          notifications: {
            // Configuration des notifications si nécessaire
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
    }
  };

  // Export des métriques en CSV
  const exportMetrics = async () => {
    try {
      const response = await fetch('/api/metrics?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metrics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Nettoyage des métriques
  const clearMetrics = async () => {
    try {
      await fetch('/api/metrics', { method: 'DELETE' });
      refetch();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  useEffect(() => {
    if (metrics) {
      generateAlerts();
    }
  }, [metrics, alertThresholds]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Chargement des métriques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des métriques: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Monitoring et optimisation des performances de l'application
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportMetrics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={clearMetrics} variant="destructive" size="sm">
            Nettoyer
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEndpoints || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requêtes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Alertes de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <Alert key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.endpoint}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {alert.value} / {alert.threshold}
                    </span>
                  </div>
                  <AlertDescription className="mt-1">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs pour les détails */}
      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints les plus lents</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints les plus lents</CardTitle>
              <CardDescription>
                Analyse des performances par endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.slowestEndpoints?.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{endpoint.endpoint}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.count} requêtes
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{formatDuration(endpoint.avgDuration)}</div>
                        <div className="text-muted-foreground">Moyenne</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatDuration(endpoint.p95Duration)}</div>
                        <div className="text-muted-foreground">P95</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatDuration(endpoint.maxDuration)}</div>
                        <div className="text-muted-foreground">Max</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'optimisation</CardTitle>
              <CardDescription>
                Suggestions automatiques pour améliorer les performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations && recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">{rec.endpoint}</div>
                      <div className="text-sm text-muted-foreground mb-2">{rec.issue}</div>
                      <div className="text-sm">{rec.recommendation}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune recommandation disponible.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration des alertes
              </CardTitle>
              <CardDescription>
                Définir les seuils pour les alertes de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="maxAvgDuration" className="text-sm font-medium">Durée moyenne max (ms)</label>
                  <input
                    id="maxAvgDuration"
                    type="number"
                    value={alertThresholds.maxAvgDuration}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      maxAvgDuration: parseInt(e.target.value)
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="maxP95Duration" className="text-sm font-medium">P95 max (ms)</label>
                  <input
                    id="maxP95Duration"
                    type="number"
                    value={alertThresholds.maxP95Duration}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      maxP95Duration: parseInt(e.target.value)
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="maxRequestCount" className="text-sm font-medium">Nombre de requêtes max</label>
                  <input
                    id="maxRequestCount"
                    type="number"
                    value={alertThresholds.maxRequestCount}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      maxRequestCount: parseInt(e.target.value)
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <Button onClick={generateAlerts} className="w-full">
                  Appliquer les seuils
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}