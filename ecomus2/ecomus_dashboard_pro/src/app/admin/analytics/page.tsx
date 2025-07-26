"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Shield
} from "lucide-react";
import AdminGuard from "@/components/admin/admin-guard";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { useAnalytics } from "@/hooks/useAnalytics";

const AdminAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { data, meta, loading, error, refetch, setPeriod } = useAnalytics(selectedPeriod);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    setPeriod(newPeriod);
  };

  // Données admin spécifiques (différentes de la page générale)
  const adminStats = {
    totalUsers: 1250,
    totalVendors: 45,
    totalStores: 89,
    totalRevenue: 125420,
    systemLoad: 68,
    activeConnections: 234
  };

  // Message de différenciation en haut de la page admin
  const adminMessage = (
    <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          🛠️ ADMIN ANALYTICS - Vue Système Complète
        </h2>
      </div>
      <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
        Cette page contient des analytics système avancés accessibles uniquement aux administrateurs.
        Différente de la page /analytics générale qui redirige selon les rôles.
      </p>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
          <strong>Utilisateurs système:</strong> {adminStats.totalUsers}
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
          <strong>Charge serveur:</strong> {adminStats.systemLoad}%
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
          <strong>Connexions actives:</strong> {adminStats.activeConnections}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-300">Chargement des analytics...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-[50vh]">
          <GlassmorphismCard className="p-8 text-center max-w-md">
            <div className="text-red-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{typeof error === 'string' ? error : 'Erreur de chargement des données'}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </GlassmorphismCard>
        </div>
      </AdminGuard>
    );
  }

  if (!data) return null;

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    color = "blue",
    change
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    trend?: 'up' | 'down';
    color?: string;
    change?: number;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-indigo-600",
      green: "from-green-500 to-emerald-600",
      purple: "from-purple-500 to-pink-600",
      orange: "from-orange-500 to-red-600",
    };

    return (
      <GlassmorphismCard className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10`}>
            <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-clip-text text-transparent`}>
              {React.isValidElement(icon) ? icon : null}
            </div>
          </div>
          {trend && change !== undefined && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{typeof title === 'string' ? title : 'Titre non disponible'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' && title.includes('€') 
              ? `${value.toLocaleString('fr-FR')} €`
              : typeof value === 'number'
              ? value.toLocaleString('fr-FR')
              : value
            }
          </p>
        </div>
      </GlassmorphismCard>
    );
  };
  return (
    <AdminGuard>
      <div className="px-4 py-8">
          {/* Message de différenciation admin */}
          {adminMessage}
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🛠️ Analytics Admin - Vue Système
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Dernière mise à jour: {meta && new Date(meta.lastUpdated).toLocaleString('fr-FR')}
              </p>
            </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Sélectionner la période d'analyse"
                aria-label="Sélectionner la période d'analyse"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              
              <button
                onClick={refetch}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          {/* Message de différenciation pour la page admin */}
          {adminMessage}

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Visiteurs totaux"
              value={data.overview.totalVisitors}
              icon={<Users className="h-6 w-6" />}
              color="blue"
              trend="up"
              change={data.growth.users.growthRate}
            />
            <StatCard
              title="Ventes totales"
              value={data.overview.totalSales}
              icon={<ShoppingCart className="h-6 w-6" />}
              color="green"
              trend="up"
              change={5.2}
            />
            <StatCard
              title="Revenus"
              value={data.overview.totalRevenue}
              icon={<DollarSign className="h-6 w-6" />}
              color="purple"
              trend="up"
              change={12.3}
            />
            <StatCard
              title="Taux de conversion"
              value={`${data.overview.conversionRate}%`}
              icon={<TrendingUp className="h-6 w-6" />}
              color="orange"
              trend="up"
              change={2.1}
            />
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Traffic Sources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Sources de trafic
                </h3>
                <div className="space-y-4">
                  {data.traffic.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-1">
                          {source.source}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {source.visitors.toLocaleString('fr-FR')}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {source.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassmorphismCard>
            </motion.div>

            {/* Device Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-green-600" />
                  Répartition par appareil
                </h3>
                <div className="space-y-4">
                  {data.devices.map((device, index) => {
                    const DeviceIcon = device.device === 'Desktop' ? Monitor : 
                                     device.device === 'Mobile' ? Smartphone : Tablet;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DeviceIcon className="h-4 w-4 mr-3 text-gray-600 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {device.device}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {device.users.toLocaleString('fr-FR')}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {device.percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassmorphismCard>
            </motion.div>
          </div>

          {/* Top Pages and Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Pages les plus visitées
                </h3>
                <div className="space-y-3">
                  {data.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.page}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {page.uniqueVisitors.toLocaleString('fr-FR')} visiteurs uniques
                        </div>
                      </div>
                      <div className="text-sm font-bold text-purple-600">
                        {page.views.toLocaleString('fr-FR')} vues
                      </div>
                    </div>
                  ))}
                </div>
              </GlassmorphismCard>
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                  Produits les plus vendus
                </h3>
                <div className="space-y-3">
                  {data.topProducts.length > 0 ? (
                    data.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.totalSold} unités vendues
                          </div>
                        </div>
                        <div className="text-sm font-bold text-orange-600">
                          {product.revenue.toLocaleString('fr-FR')} €
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune vente de produits enregistrée</p>
                    </div>
                  )}
                </div>
              </GlassmorphismCard>
            </motion.div>
          </div>
        </div>
    </AdminGuard>
  );
};

export default AdminAnalyticsPage;
