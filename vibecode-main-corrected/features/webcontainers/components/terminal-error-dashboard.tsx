"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Zap,
  Bug,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useErrorStats, useTerminalErrorMonitor } from "../hooks/use-terminal-error-monitor";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className={cn("flex items-center text-xs mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SeverityChartProps {
  data: Record<string, number>;
  total: number;
}

const SeverityChart: React.FC<SeverityChartProps> = ({ data, total }) => {
  const severityConfig = {
    critical: { color: 'bg-red-500', label: 'Critique' },
    high: { color: 'bg-orange-500', label: 'Élevée' },
    medium: { color: 'bg-yellow-500', label: 'Moyenne' },
    low: { color: 'bg-blue-500', label: 'Faible' }
  };

  return (
    <div className="space-y-3">
      {Object.entries(severityConfig).map(([severity, config]) => {
        const count = data[severity] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={severity} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", config.color)} />
                <span>{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{count}</span>
                <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
};

interface CategoryChartProps {
  data: Record<string, number>;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const categoryConfig = {
    syntax: { icon: <Bug className="h-3 w-3" />, label: 'Syntaxe' },
    permission: { icon: <Shield className="h-3 w-3" />, label: 'Permissions' },
    dependency: { icon: <Activity className="h-3 w-3" />, label: 'Dépendances' },
    path: { icon: <BarChart3 className="h-3 w-3" />, label: 'Chemins' },
    configuration: { icon: <Zap className="h-3 w-3" />, label: 'Configuration' },
    other: { icon: <AlertTriangle className="h-3 w-3" />, label: 'Autres' }
  };

  const sortedCategories = Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // Top 5 catégories

  return (
    <div className="space-y-2">
      {sortedCategories.map(([category, count]) => {
        const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other;
        
        return (
          <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {config.icon}
              <span className="text-sm">{config.label}</span>
            </div>
            <Badge variant="secondary">{count}</Badge>
          </div>
        );
      })}
    </div>
  );
};

interface TerminalErrorDashboardProps {
  className?: string;
}

const TerminalErrorDashboard: React.FC<TerminalErrorDashboardProps> = ({ className }) => {
  const stats = useErrorStats();
  const { isMonitoring, startMonitoring, stopMonitoring, refreshErrors } = useTerminalErrorMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousStats, setPreviousStats] = useState(stats);

  // Calculer les tendances
  const getTrend = (current: number, previous: number) => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendValue = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff === 0) return 'Stable';
    return `${diff > 0 ? '+' : ''}${diff}`;
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPreviousStats(stats);
    refreshErrors();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Calculer le taux de résolution (simulation)
  const resolutionRate = stats.total > 0 ? Math.max(0, 100 - (stats.recentErrors.length / stats.total) * 100) : 100;

  // Calculer la santé globale du système
  const systemHealth = () => {
    const criticalCount = stats.bySeverity.critical || 0;
    const highCount = stats.bySeverity.high || 0;
    
    if (criticalCount > 0) return { status: 'critical', label: 'Critique', color: 'text-red-500' };
    if (highCount > 2) return { status: 'warning', label: 'Attention', color: 'text-orange-500' };
    if (stats.total > 10) return { status: 'moderate', label: 'Modéré', color: 'text-yellow-500' };
    return { status: 'good', label: 'Bon', color: 'text-green-500' };
  };

  const health = systemHealth();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Surveillance des Erreurs</h2>
          <p className="text-muted-foreground">
            Tableau de bord de surveillance et correction automatique des erreurs du terminal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Actualiser
          </Button>
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Arrêter' : 'Démarrer'}
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des erreurs"
          value={stats.total}
          description="Erreurs détectées"
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          trend={getTrend(stats.total, previousStats.total)}
          trendValue={getTrendValue(stats.total, previousStats.total)}
        />
        
        <StatCard
          title="Erreurs critiques"
          value={stats.bySeverity.critical || 0}
          description="Nécessitent une attention immédiate"
          icon={<XCircle className="h-4 w-4 text-red-500" />}
          trend={getTrend(stats.bySeverity.critical || 0, previousStats.bySeverity.critical || 0)}
          trendValue={getTrendValue(stats.bySeverity.critical || 0, previousStats.bySeverity.critical || 0)}
        />
        
        <StatCard
          title="Taux de résolution"
          value={`${resolutionRate.toFixed(1)}%`}
          description="Erreurs résolues automatiquement"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        />
        
        <StatCard
          title="Santé du système"
          value={health.label}
          description="État global du terminal"
          icon={<Activity className={cn("h-4 w-4", health.color)} />}
          className={health.status === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-950' : ''}
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Répartition par sévérité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition par sévérité
            </CardTitle>
            <CardDescription>
              Distribution des erreurs selon leur niveau de gravité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeverityChart data={stats.bySeverity} total={stats.total} />
          </CardContent>
        </Card>

        {/* Top catégories d'erreurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Catégories principales
            </CardTitle>
            <CardDescription>
              Types d'erreurs les plus fréquents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.byCategory).length > 0 ? (
              <CategoryChart data={stats.byCategory} />
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Aucune erreur détectée</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Erreurs récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Erreurs récentes
          </CardTitle>
          <CardDescription>
            Les 5 dernières erreurs détectées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentErrors.length > 0 ? (
            <div className="space-y-3">
              {stats.recentErrors.slice(0, 5).map((error) => (
                <div key={error.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      error.severity === 'critical' ? 'bg-red-500' :
                      error.severity === 'high' ? 'bg-orange-500' :
                      error.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{error.command}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Aucune erreur récente</p>
                <p className="text-xs">Le terminal fonctionne parfaitement</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* État de la surveillance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            État de la surveillance IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              )} />
              <div>
                <p className="text-sm font-medium">
                  {isMonitoring ? 'Surveillance active' : 'Surveillance inactive'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isMonitoring 
                    ? 'L\'IA analyse automatiquement les erreurs et propose des corrections'
                    : 'Cliquez sur "Démarrer" pour activer la surveillance intelligente'
                  }
                </p>
              </div>
            </div>
            {!isMonitoring && (
              <Button onClick={startMonitoring} size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Activer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TerminalErrorDashboard;