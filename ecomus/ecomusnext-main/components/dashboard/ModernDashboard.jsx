'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

const ModernDashboard = ({ role = 'client', user = {} }) => {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Charger les statistiques
      const statsRes = await fetch('/api/dashboard/stats')
      const statsData = await statsRes.json()
      
      // Charger les produits récents avec filtre selon le rôle
      const productsEndpoint = role === 'vendor' && user.storeId 
        ? `/api/products?storeId=${user.storeId}&limit=6&sort=createdAt&order=desc`
        : '/api/products?limit=6&sort=createdAt&order=desc'
      
      const productsRes = await fetch(productsEndpoint)
      const productsData = await productsRes.json()
      
      setStats(statsData.data)
      setProducts(productsData.data?.products || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {product.mainImage ? (
          <img 
            src={product.mainImage} 
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {product.hasCloudinaryImages && (
          <div className="absolute top-2 right-2">
            <CloudIcon className="w-5 h-5 text-blue-500 bg-white rounded-full p-1" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.category?.name}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">{product.price}€</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.inventory?.quantity > 10 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            Stock: {product.inventory?.quantity || 0}
          </span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec navigation par onglets */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {session?.user?.name} 👋
            </h1>
            <p className="mt-2 opacity-90">
              {role === 'admin' && 'Administration globale de la plateforme'}
              {role === 'vendor' && 'Gestion de votre boutique'}
              {role === 'client' && 'Votre espace personnel'}
            </p>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex mt-4 lg:mt-0 space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Produits
            </button>
            {(role === 'admin' || role === 'vendor') && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Analytics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu dynamique selon l'onglet actif */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Produits"
              value={stats?.overview?.totalProducts || 0}
              change="+12% ce mois"
              trend="up"
              icon={ShoppingBagIcon}
              color="blue"
            />
            <StatCard
              title="Commandes"
              value={stats?.overview?.totalOrders || 0}
              change="+8% cette semaine"
              trend="up"
              icon={ChartBarIcon}
              color="green"
            />
            <StatCard
              title="Revenus"
              value={`${stats?.overview?.revenue || 0}€`}
              change="+23% ce mois"
              trend="up"
              icon={CurrencyDollarIcon}
              color="purple"
            />
            <StatCard
              title="Images Cloudinary"
              value={stats?.overview?.cloudinaryImages || 0}
              change={`${stats?.overview?.optimizationRate || 0}% optimisées`}
              icon={CloudIcon}
              color="orange"
            />
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Produits Récents
                </h2>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Voir tout
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tous les Produits
              </h2>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Nouveau Produit
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Import Cloudinary
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} showActions={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (role === 'admin' || role === 'vendor') && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Analytics Cloudinary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.overview?.cloudinaryImages || 0}
                </div>
                <div className="text-gray-600">Images uploadées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats?.overview?.optimizationRate || 0}%
                </div>
                <div className="text-gray-600">Taux d'optimisation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.overview?.productsWithCloudinary || 0}
                </div>
                <div className="text-gray-600">Produits optimisés</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Ajouter un Produit</h3>
            <p className="text-blue-700 text-sm mb-4">
              Créez un nouveau produit avec upload Cloudinary
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Nouveau Produit
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Gérer les Commandes</h3>
            <p className="text-green-700 text-sm mb-4">
              Suivez et traitez vos commandes en cours
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Voir Commandes
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Analytics</h3>
            <p className="text-purple-700 text-sm mb-4">
              Analysez les performances de votre boutique
            </p>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voir Stats
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernDashboard
