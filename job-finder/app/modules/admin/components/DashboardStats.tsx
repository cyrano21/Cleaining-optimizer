'use client'

import { useState } from 'react'
import { AdminStats, mockAdminStats } from '../utils/types'

export default function DashboardStats() {
  const [stats] = useState<AdminStats>(mockAdminStats)
  
  // Formater les nombres avec séparateurs de milliers
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }
  
  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-6">Statistiques générales</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Utilisateurs totaux</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
          <p className="text-xs text-blue-500 mt-1">+{stats.newUsersThisWeek} cette semaine</p>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Abonnements actifs</p>
          <p className="text-2xl font-bold">{formatNumber(stats.activeSubscriptions)}</p>
          <p className="text-xs text-green-500 mt-1">{Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)}% de conversion</p>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Documents créés</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalCVs + stats.totalCoverLetters)}</p>
          <p className="text-xs text-purple-500 mt-1">{formatNumber(stats.totalCVs)} CV, {formatNumber(stats.totalCoverLetters)} lettres</p>
        </div>
        
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-sm text-amber-600 mb-1">Revenu mensuel</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</p>
          <p className="text-xs text-amber-500 mt-1">Moyenne de {formatCurrency(stats.revenueThisMonth / stats.activeSubscriptions)} par abonné</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-3">Répartition des utilisateurs</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Gratuit</span>
                <span className="text-sm">{stats.usersByRole.FREE} ({Math.round((stats.usersByRole.FREE / stats.totalUsers) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full" 
                  style={{ width: `${(stats.usersByRole.FREE / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Pro</span>
                <span className="text-sm">{stats.usersByRole.PRO} ({Math.round((stats.usersByRole.PRO / stats.totalUsers) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.usersByRole.PRO / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Coach</span>
                <span className="text-sm">{stats.usersByRole.COACH} ({Math.round((stats.usersByRole.COACH / stats.totalUsers) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats.usersByRole.COACH / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Admin</span>
                <span className="text-sm">{stats.usersByRole.ADMIN} ({Math.round((stats.usersByRole.ADMIN / stats.totalUsers) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.usersByRole.ADMIN / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-3">Activité des utilisateurs</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-md border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">CV créés</p>
              <p className="text-xl font-bold">{formatNumber(stats.totalCVs)}</p>
              <p className="text-xs text-gray-500 mt-1">Moyenne de {(stats.totalCVs / stats.totalUsers).toFixed(1)} par utilisateur</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Lettres créées</p>
              <p className="text-xl font-bold">{formatNumber(stats.totalCoverLetters)}</p>
              <p className="text-xs text-gray-500 mt-1">Moyenne de {(stats.totalCoverLetters / stats.totalUsers).toFixed(1)} par utilisateur</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Candidatures</p>
              <p className="text-xl font-bold">{formatNumber(stats.totalJobApplications)}</p>
              <p className="text-xs text-gray-500 mt-1">Moyenne de {(stats.totalJobApplications / stats.totalUsers).toFixed(1)} par utilisateur</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Nouveaux utilisateurs</p>
              <p className="text-xl font-bold">{formatNumber(stats.newUsersThisWeek)}</p>
              <p className="text-xs text-gray-500 mt-1">Cette semaine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
