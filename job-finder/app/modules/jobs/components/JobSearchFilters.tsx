'use client'

import { useJobs } from '../utils/jobs-context'
import type { JobSearchFilters } from '../utils/types'
import { defaultFilters } from '../utils/types'
import { useState } from 'react'
import { ChevronDown, MapPin, Search, Filter, Globe, TrendingUp } from 'lucide-react'

export default function JobSearchFilters() {
  const { 
    filters, 
    updateFilters, 
    searchJobs, 
    loading, 
    selectedCountry, 
    setCountry, 
    availableCountries,
    getSearchStats,
    aiRecommendations 
  } = useJobs()
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  
  const stats = getSearchStats()
  const currentCountry = availableCountries.find(c => c.code === selectedCountry)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchJobs()
  }
  
  const handleContractTypeChange = (type: string) => {
    const currentTypes = filters.contractType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    updateFilters({ contractType: newTypes })
  }
  
  const handleExperienceLevelChange = (level: string) => {
    const currentLevels = filters.experienceLevel || []
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level]
    
    updateFilters({ experienceLevel: newLevels })
  }
  
  const handleRemoteChange = (remote: string) => {
    const currentRemote = filters.remote || []
    const newRemote = currentRemote.includes(remote)
      ? currentRemote.filter(r => r !== remote)
      : [...currentRemote, remote]
    
    updateFilters({ remote: newRemote })
  }
  
  return (
    <div className="space-y-6">
      {/* Header avec sélection de pays */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Search className="w-6 h-6 mr-2" />
            Recherche d'emploi mondiale
          </h3>
          
          {/* Sélecteur de pays */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-2xl">{currentCountry?.flag}</span>
              <span className="font-medium">{currentCountry?.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[280px] max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">Europe</div>
                  {availableCountries.filter(country => 
                    ['france', 'uk', 'germany', 'spain', 'italy', 'netherlands'].includes(country.code)
                  ).map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setCountry(country.code)
                        setShowCountryDropdown(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                        selectedCountry === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </button>
                  ))}
                  
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide border-t border-gray-100 mt-2">Afrique</div>
                  {availableCountries.filter(country => 
                    ['morocco', 'tunisia', 'algeria', 'senegal', 'cotedivoire', 'southafrica'].includes(country.code)
                  ).map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setCountry(country.code)
                        setShowCountryDropdown(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                        selectedCountry === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats rapides */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">{stats.total}</div>
              <div className="text-white/80">Offres trouvées</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">{stats.averageMatch}%</div>
              <div className="text-white/80">Match moyen</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recommandations IA */}
      {aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 flex items-center mb-3">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recommandations IA
          </h4>
          <div className="space-y-2">
            {aiRecommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
                <div className="font-medium text-green-800 text-sm">{rec.title}</div>
                <div className="text-green-700 text-xs mt-1">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formulaire de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recherche principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Mots-clés
              </label>
              <input
                type="text"
                id="query"
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Titre, compétences, entreprise..."
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Localisation
              </label>
              <input
                type="text"
                id="location"
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ville, région..."
              />
            </div>
          </div>
          
          {/* Rayon de recherche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rayon de recherche
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.radius || 50}
                onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-gray-500">0 km</span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {filters.radius || 50} km
                </span>
                <span className="text-xs text-gray-500">100 km</span>
              </div>
            </div>
          </div>
          
          {/* Bouton filtres avancés */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres avancés
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => updateFilters(defaultFilters)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Filtres avancés */}
          {showAdvanced && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              {/* Type de contrat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de contrat
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'full-time', label: 'CDI' },
                    { id: 'part-time', label: 'Temps partiel' },
                    { id: 'freelance', label: 'Freelance' },
                    { id: 'internship', label: 'Stage' },
                    { id: 'apprenticeship', label: 'Alternance' }
                  ].map((contract) => (
                    <label key={contract.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.contractType?.includes(contract.id) || false}
                        onChange={() => handleContractTypeChange(contract.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{contract.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Niveau d'expérience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Niveau d'expérience
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'entry', label: 'Débutant' },
                    { id: 'intermediate', label: 'Intermédiaire' },
                    { id: 'senior', label: 'Senior' },
                    { id: 'executive', label: 'Direction' }
                  ].map((level) => (
                    <label key={level.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.experienceLevel?.includes(level.id) || false}
                        onChange={() => handleExperienceLevelChange(level.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Télétravail */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Modalités de travail
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'no', label: 'Sur site uniquement' },
                    { id: 'hybrid', label: 'Hybride' },
                    { id: 'full', label: '100% télétravail' }
                  ].map((remote) => (
                    <label key={remote.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.remote?.includes(remote.id) || false}
                        onChange={() => handleRemoteChange(remote.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{remote.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Date de publication */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date de publication
                </label>
                <select
                  value={filters.postedSince || 'any'}
                  onChange={(e) => updateFilters({ postedSince: e.target.value as JobSearchFilters['postedSince'] })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Toutes les dates</option>
                  <option value="day">Dernières 24 heures</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
