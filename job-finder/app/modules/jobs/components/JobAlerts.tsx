'use client'

import { useState } from 'react'
import { useJobs } from '../utils/jobs-context'
import { JobAlert, JobSearchFilters } from '../utils/types'

export default function JobAlerts() {
  const { filters } = useJobs()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [alertName, setAlertName] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'instant'>('daily')
  
  const handleCreateAlert = () => {
    if (!alertName.trim()) return
    
    const newAlert: JobAlert = {
      id: Date.now().toString(),
      name: alertName,
      filters: { ...filters },
      frequency,
    }
    
    setAlerts([...alerts, newAlert])
    setAlertName('')
    setShowForm(false)
  }
  
  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }
  
  const getFilterSummary = (filters: JobSearchFilters) => {
    const parts = []
    
    if (filters.query) parts.push(`"${filters.query}"`)
    if (filters.location) parts.push(`à ${filters.location}`)
    
    if (filters.contractType && filters.contractType.length > 0) {
      const contractTypes = filters.contractType.map(type => {
        switch (type) {
          case 'full-time': return 'CDI'
          case 'part-time': return 'Temps partiel'
          case 'freelance': return 'Freelance'
          case 'internship': return 'Stage'
          case 'apprenticeship': return 'Alternance'
          default: return type
        }
      })
      parts.push(`en ${contractTypes.join(', ')}`)
    }
    
    if (filters.remote && filters.remote.length > 0) {
      const remoteTypes = filters.remote.map(type => {
        switch (type) {
          case 'no': return 'sur site'
          case 'hybrid': return 'hybride'
          case 'full': return 'télétravail'
          default: return type
        }
      })
      parts.push(`en ${remoteTypes.join(', ')}`)
    }
    
    return parts.join(' ')
  }
  
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Quotidienne'
      case 'weekly': return 'Hebdomadaire'
      case 'instant': return 'Instantanée'
      default: return frequency
    }
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Alertes emploi</h3>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Créer une alerte
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="mb-4 p-4 border rounded-md">
          <h4 className="text-md font-medium mb-2">Nouvelle alerte</h4>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="alertName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l&apos;alerte
              </label>
              <input
                type="text"
                id="alertName"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: Développeur React à Paris"
              />
            </div>
            
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as 'daily' | 'weekly' | 'instant')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="instant">Instantanée</option>
              </select>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">
                Filtres appliqués : {getFilterSummary(filters) || 'Aucun filtre spécifique'}
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateAlert}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{alert.name}</h4>
                  <p className="text-sm text-gray-600">
                    {getFilterSummary(alert.filters)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fréquence : {getFrequencyLabel(alert.frequency)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id!)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          Vous n&apos;avez pas encore créé d&apos;alertes. Créez une alerte pour recevoir des notifications lorsque de nouvelles offres correspondant à vos critères sont publiées.
        </p>
      )}
    </div>
  )
}