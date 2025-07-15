'use client'

import { useState } from 'react'
import { useCoaching } from '../utils/coaching-context'

export default function AffirmationGenerator() {
  const { dailyAffirmations, generateAffirmations } = useCoaching()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  
  const handleGenerateAffirmations = async () => {
    setIsGenerating(true)
    try {
      await generateAffirmations(selectedCategory || undefined)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'confidence': return 'Confiance'
      case 'motivation': return 'Motivation'
      case 'resilience': return 'Résilience'
      case 'growth': return 'Croissance'
      case 'success': return 'Succès'
      default: return category
    }
  }
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'confidence': return 'bg-blue-100 text-blue-800'
      case 'motivation': return 'bg-purple-100 text-purple-800'
      case 'resilience': return 'bg-green-100 text-green-800'
      case 'growth': return 'bg-amber-100 text-amber-800'
      case 'success': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Générateur d&apos;affirmations positives</h3>
      
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          Les affirmations positives peuvent vous aider à maintenir une attitude constructive pendant votre recherche d&apos;emploi. Générez des affirmations personnalisées selon vos besoins.
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Toutes les catégories</option>
            <option value="confidence">Confiance</option>
            <option value="motivation">Motivation</option>
            <option value="resilience">Résilience</option>
            <option value="growth">Croissance</option>
            <option value="success">Succès</option>
          </select>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleGenerateAffirmations}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isGenerating ? 'Génération en cours...' : 'Générer des affirmations'}
          </button>
        </div>
        
        {dailyAffirmations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Vos affirmations quotidiennes</h4>
            
            <div className="space-y-3">
              {dailyAffirmations.map((affirmation) => (
                <div key={affirmation.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(affirmation.category)}`}>
                      {getCategoryLabel(affirmation.category)}
                    </span>
                  </div>
                  <p className="text-gray-700 italic">&quot;{affirmation.text}&quot;</p>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Conseil :</strong> Répétez ces affirmations chaque matin et avant vos entretiens pour renforcer votre état d&apos;esprit positif.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
