'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { ModernChart } from '@/components/ui/modern-chart';
import { GlassMorphismCard } from '@/components/ui/glass-morphism-card';

interface MetricData {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  description: string;
  target?: number;
}

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  description: string;
}

const MetricsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Données de métriques simulées
  const [metrics] = useState<MetricData[]>([
    {
      id: '1',
      name: 'Revenus totaux',
      value: 125430,
      change: 12.5,
      trend: 'up',
      category: 'business',
      description: 'Revenus générés sur la période sélectionnée',
      target: 150000
    },
    {
      id: '2',
      name: 'Utilisateurs actifs',
      value: 8945,
      change: -2.3,
      trend: 'down',
      category: 'users',
      description: 'Nombre d\'utilisateurs uniques actifs'
    },
    {
      id: '3',
      name: 'Taux de conversion',
      value: 3.2,
      change: 0.8,
      trend: 'up',
      category: 'performance',
      description: 'Pourcentage de visiteurs qui effectuent un achat',
      target: 4.0
    },
    {
      id: '4',
      name: 'Panier moyen',
      value: 89.50,
      change: 5.2,
      trend: 'up',
      category: 'business',
      description: 'Valeur moyenne des commandes'
    },
    {
      id: '5',
      name: 'Temps de chargement',
      value: 1.8,
      change: -15.2,
      trend: 'up',
      category: 'performance',
      description: 'Temps moyen de chargement des pages (secondes)'
    },
    {
      id: '6',
      name: 'Taux de rebond',
      value: 42.1,
      change: -8.5,
      trend: 'up',
      category: 'performance',
      description: 'Pourcentage de visiteurs qui quittent après une page'
    }
  ]);

  // Web Vitals simulées
  const [webVitals] = useState<WebVital[]>([
    {
      name: 'LCP (Largest Contentful Paint)',
      value: 1.2,
      rating: 'good',
      threshold: { good: 2.5, poor: 4.0 },
      description: 'Temps de chargement du plus grand élément visible'
    },
    {
      name: 'FID (First Input Delay)',
      value: 45,
      rating: 'good',
      threshold: { good: 100, poor: 300 },
      description: 'Délai avant la première interaction utilisateur'
    },
    {
      name: 'CLS (Cumulative Layout Shift)',
      value: 0.08,
      rating: 'needs-improvement',
      threshold: { good: 0.1, poor: 0.25 },
      description: 'Stabilité visuelle de la page'
    },
    {
      name: 'FCP (First Contentful Paint)',
      value: 0.9,
      rating: 'good',
      threshold: { good: 1.8, poor: 3.0 },
      description: 'Temps d\'affichage du premier contenu'
    }
  ]);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'business', label: 'Business' },
    { value: 'users', label: 'Utilisateurs' },
    { value: 'performance', label: 'Performance' }
  ];

  const periods = [
    { value: '24h', label: 'Dernières 24h' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '90 derniers jours' }
  ];

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleExport = () => {
    // Logique d'export des données
    console.log('Export des métriques...');
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Métriques & Analytics Avancées
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Surveillance en temps réel des performances et métriques business
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Dernière mise à jour: {lastUpdated.toLocaleString('fr-FR')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </motion.div>

        {/* Onglets principaux */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="business">Métriques Business</TabsTrigger>
            <TabsTrigger value="performance">Performance Web</TabsTrigger>
            <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StatCard
                    title={metric.name}
                    value={metric.value.toLocaleString('fr-FR')}
                    subtitle={metric.description}
                    trend={{
                      value: Math.abs(metric.change),
                      isPositive: metric.trend === 'up',
                      label: metric.trend === 'stable' ? 'stable' : undefined
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Graphiques de tendances */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution des revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Évolution des revenus"
                    type="line"
                    data={[
                      { name: 'Jan', value: 95000 },
                      { name: 'Fév', value: 105000 },
                      { name: 'Mar', value: 115000 },
                      { name: 'Avr', value: 125000 },
                      { name: 'Mai', value: 125430 }
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>

              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Utilisateurs actifs"
                    type="line"
                    data={[
                      { name: 'Jan', value: 8200 },
                      { name: 'Fév', value: 8500 },
                      { name: 'Mar', value: 9100 },
                      { name: 'Avr', value: 9200 },
                      { name: 'Mai', value: 8945 }
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>
            </div>
          </TabsContent>

          {/* Métriques Business */}
          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Objectifs Business</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredMetrics
                    .filter(m => m.target)
                    .map(metric => {
                      const progress = (metric.value / (metric.target || 1)) * 100;
                      return (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <span className="text-sm text-gray-500">
                              {metric.value.toLocaleString('fr-FR')} / {metric.target?.toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {progress.toFixed(1)}% de l'objectif atteint
                          </div>
                        </div>
                      );
                    })
                  }
                </CardContent>
              </GlassMorphismCard>

              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Répartition des revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Répartition des revenus"
                    type="bar"
                    data={[
                      { name: 'Produits physiques', value: 65 },
                      { name: 'Services', value: 20 },
                      { name: 'Abonnements', value: 10 },
                      { name: 'Autres', value: 5 }
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>
            </div>
          </TabsContent>

          {/* Performance Web */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {webVitals.map((vital, index) => (
                <motion.div
                  key={vital.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassMorphismCard className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{vital.name}</h3>
                        <Badge variant={getRatingBadgeVariant(vital.rating)}>
                          {vital.rating === 'good' ? 'Bon' : 
                           vital.rating === 'needs-improvement' ? 'À améliorer' : 'Mauvais'}
                        </Badge>
                      </div>
                      
                      <div className={`text-2xl font-bold ${getRatingColor(vital.rating)}`}>
                        {vital.value}{vital.name.includes('CLS') ? '' : 
                         vital.name.includes('FID') ? 'ms' : 's'}
                      </div>
                      
                      <p className="text-xs text-gray-500">{vital.description}</p>
                      
                      <div className="text-xs text-gray-400">
                        Seuils: Bon &lt; {vital.threshold.good}, Mauvais &gt; {vital.threshold.poor}
                      </div>
                    </div>
                  </GlassMorphismCard>
                </motion.div>
              ))}
            </div>

            <GlassMorphismCard className="p-6">
              <CardHeader>
                <CardTitle>Évolution des Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <ModernChart
                  title="Évolution des Core Web Vitals"
                  type="line"
                  data={[
                    { name: 'Sem 1', value: 1.5, LCP: 1.5, FID: 50, CLS: 0.12 },
                    { name: 'Sem 2', value: 1.3, LCP: 1.3, FID: 45, CLS: 0.10 },
                    { name: 'Sem 3', value: 1.2, LCP: 1.2, FID: 45, CLS: 0.08 },
                    { name: 'Sem 4', value: 1.2, LCP: 1.2, FID: 45, CLS: 0.08 }
                  ]}
                  height={300}
                />
              </CardContent>
            </GlassMorphismCard>
          </TabsContent>

          {/* Temps Réel */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Visiteurs en ligne"
                value="247"
                trend={{ value: 5.2, isPositive: true, label: "vs hier" }}
                subtitle="Utilisateurs actifs maintenant"
                icon={<Eye className="h-5 w-5" />}
              />
              
              <StatCard
                title="Pages vues/min"
                value="156"
                trend={{ value: 2.1, isPositive: false, label: "vs hier" }}
                subtitle="Pages consultées par minute"
                icon={<Activity className="h-5 w-5" />}
              />
              
              <StatCard
                title="Commandes/heure"
                value="23"
                trend={{ value: 12.8, isPositive: true, label: "vs hier" }}
                subtitle="Nouvelles commandes cette heure"
                icon={<ShoppingCart className="h-5 w-5" />}
              />
            </div>

            <GlassMorphismCard className="p-6">
              <CardHeader>
                <CardTitle>Activité en temps réel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '14:32:15', event: 'Nouvelle commande', user: 'Marie D.', amount: '€89.50' },
                    { time: '14:31:42', event: 'Inscription utilisateur', user: 'Pierre M.', amount: null },
                    { time: '14:31:28', event: 'Produit ajouté au panier', user: 'Sophie L.', amount: '€45.00' },
                    { time: '14:30:55', event: 'Page produit visitée', user: 'Thomas R.', amount: null },
                    { time: '14:30:33', event: 'Nouvelle commande', user: 'Julie B.', amount: '€156.75' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 font-mono">{activity.time}</div>
                        <div className="text-sm font-medium">{activity.event}</div>
                        <div className="text-sm text-gray-600">{activity.user}</div>
                      </div>
                      {activity.amount && (
                        <Badge variant="outline">{activity.amount}</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </GlassMorphismCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetricsPage;