'use client'

import { useState, useEffect } from 'react'
import StatsCard from './StatsCard'
import { SalesChart, CategoryChart } from './Charts'
import { 
  ShoppingBagIcon, 
  BuildingStorefrontIcon, 
  UsersIcon, 
  CurrencyEuroIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/stats?period=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Impossible de charger les statistiques</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
        </div>
        <div>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">1 an</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Produits"
          value={stats.overview.totalProducts}
          icon={ShoppingBagIcon}
        />
        <StatsCard
          title="Boutiques Actives"
          value={stats.overview.totalStores}
          icon={BuildingStorefrontIcon}
        />
        <StatsCard
          title="Utilisateurs"
          value={stats.overview.totalUsers}
          icon={UsersIcon}
        />
        <StatsCard
          title="Commandes"
          value={stats.overview.totalOrders}
          icon={ShoppingCartIcon}
        />
        <StatsCard
          title="Revenus"
          value={stats.overview.revenue}
          prefix="€"
          icon={CurrencyEuroIcon}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.charts.salesTrend && stats.charts.salesTrend.length > 0 && (
          <SalesChart 
            data={stats.charts.salesTrend} 
            title="Évolution des ventes"
          />
        )}
        
        {stats.charts.productsByCategory && stats.charts.productsByCategory.length > 0 && (
          <CategoryChart 
            data={stats.charts.productsByCategory} 
            title="Répartition des produits"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Activité récente
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Nouvelles commandes ({period} jours)
                </p>
                <p className="text-sm text-gray-500">
                  {stats.overview.recentOrders} commandes
                </p>
              </div>
              <div className="text-sm text-indigo-600">
                Voir toutes
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Revenus récents
                </p>
                <p className="text-sm text-gray-500">
                  €{stats.overview.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-indigo-600">
                Rapport détaillé
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
