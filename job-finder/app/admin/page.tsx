'use client'

import { useState } from 'react'
import DashboardStats from '../modules/admin/components/DashboardStats'
import UserManagement from '../modules/admin/components/UserManagement'
import ActivityLogs from '../modules/admin/components/ActivityLogs'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'logs'>('stats')
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Exporter les données
          </button>
        </div>
      </div>
      
      <div className="flex mb-6 border-b overflow-x-auto">
        <button
          className={`px-4 py-2 whitespace-nowrap ${
            activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${
            activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${
            activeTab === 'logs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          Journaux d&apos;activité
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'stats' && <DashboardStats />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'logs' && <ActivityLogs />}
      </div>
    </div>
  )
}
