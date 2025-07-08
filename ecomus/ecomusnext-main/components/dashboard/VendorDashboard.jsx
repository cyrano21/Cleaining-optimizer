'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import StatsCard from './StatsCard'
import { SalesChart, TopProductsChart, OrderStatusChart } from './Charts'
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  CurrencyEuroIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function VendorDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    if (session?.user?.storeId) {
      fetchStats()
    }
  }, [period, session])

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

  if (!session?.user?.storeId) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <BuildingStorefrontIcon />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Aucune boutique associée
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Contactez l'administrateur pour associer une boutique à votre compte.
        </p>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Ma Boutique</h1>
          <p className="text-gray-600">Tableau de bord vendeur</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Mes Produits"
          value={stats.overview.totalProducts}
          icon={ShoppingBagIcon}
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
        <StatsCard
          title="Panier Moyen"
          value={Math.round(stats.overview.averageOrderValue)}
          prefix="€"
          icon={ChartBarIcon}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.charts.salesTrend && stats.charts.salesTrend.length > 0 && (
          <SalesChart 
            data={stats.charts.salesTrend} 
            title="Évolution de mes ventes"
          />
        )}
        
        {stats.charts.ordersByStatus && stats.charts.ordersByStatus.length > 0 && (
          <OrderStatusChart 
            data={stats.charts.ordersByStatus} 
            title="Statut des commandes"
          />
        )}
      </div>

      {/* Top Products */}
      {stats.charts.topProducts && stats.charts.topProducts.length > 0 && (
        <TopProductsChart 
          data={stats.charts.topProducts} 
          title="Mes meilleurs produits"
        />
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Actions rapides
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Gérer les produits
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Voir les commandes
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Rapports détaillés
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
