'use client'

import { useState } from 'react'
import { LogEntry, mockLogs } from '../utils/types'

export default function ActivityLogs() {
  const [logs] = useState<LogEntry[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  
  // Filtrer les logs en fonction de la recherche et du filtre d'action
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userEmail && log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    
    return matchesSearch && matchesAction
  })
  
  // Formater la date et l'heure
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }
  
  // Obtenir la classe de couleur en fonction de l'action
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-100 text-green-800'
      case 'LOGOUT': return 'bg-gray-100 text-gray-800'
      case 'SUBSCRIPTION_CREATED': return 'bg-blue-100 text-blue-800'
      case 'SUBSCRIPTION_UPDATED': return 'bg-purple-100 text-purple-800'
      case 'SUBSCRIPTION_CANCELED': return 'bg-red-100 text-red-800'
      case 'CV_CREATED': return 'bg-indigo-100 text-indigo-800'
      case 'COVER_LETTER_CREATED': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Obtenir les actions uniques pour le filtre
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-6">Journaux d&apos;activité</h3>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par utilisateur, action ou détails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Toutes les actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date et heure
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Détails
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {log.userEmail || 'Système'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {log.userId || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.ip || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredLogs.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Aucun journal d&apos;activité trouvé
        </div>
      )}
    </div>
  )
}
