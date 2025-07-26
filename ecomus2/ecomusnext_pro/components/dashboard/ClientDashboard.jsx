'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import StatsCard from './StatsCard'
import { 
  ShoppingCartIcon, 
  CurrencyEuroIcon,
  HeartIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
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

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=5')
      const data = await response.json()
      
      if (data.success) {
        setRecentOrders(data.data.orders)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session?.user?.name} !
        </h1>
        <p className="text-gray-600">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Mes Commandes"
            value={stats.overview.totalOrders}
            icon={ShoppingCartIcon}
          />
          <StatsCard
            title="Total Dépensé"
            value={stats.overview.totalSpent}
            prefix="€"
            icon={CurrencyEuroIcon}
          />
          <StatsCard
            title="Commandes Récentes"
            value={stats.overview.recentOrders}
            icon={TruckIcon}
          />
          <StatsCard
            title="Panier Moyen"
            value={Math.round(stats.overview.averageOrderValue)}
            prefix="€"
            icon={CurrencyEuroIcon}
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Mes commandes récentes
          </h3>
        </div>
        <div className="p-6">
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Commande #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      €{order.total.toFixed(2)}
                    </p>
                    <p className={`text-xs font-medium ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'shipped' ? 'text-blue-600' :
                      order.status === 'processing' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {order.status === 'delivered' ? 'Livrée' :
                       order.status === 'shipped' ? 'Expédiée' :
                       order.status === 'processing' ? 'En cours' :
                       order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune commande
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore passé de commande.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Commencer mes achats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Voir mes commandes
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <HeartIcon className="h-5 w-5 mr-2" />
              Ma liste de souhaits
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <TruckIcon className="h-5 w-5 mr-2" />
              Suivre une livraison
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
