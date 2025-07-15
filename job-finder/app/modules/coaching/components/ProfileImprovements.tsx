'use client'

import { useState } from 'react'
import { useCoaching } from '../utils/coaching-context'
import { useCV } from '../../cv/utils/cv-context'
import CVPreview from '../../cv/components/CVPreview'
// ProfileImprovement type import removed (unused)

export default function ProfileImprovements() {
  const { profileImprovements, generateProfileImprovements, implementImprovement } = useCoaching()
  const { cv } = useCV()
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleGenerateImprovements = async () => {
    setIsGenerating(true)
    try {
      await generateProfileImprovements()
    } finally {
      setIsGenerating(false)
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-amber-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'skills': return 'Compétences'
      case 'experience': return 'Expérience'
      case 'education': return 'Formation'
      case 'projects': return 'Projets'
      case 'general': return 'Général'
      default: return category
    }
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Aperçu du CV courant */}
      <CVPreview cvOverride={cv} className="mb-4 border max-h-[600px] overflow-y-auto" />
      
      <h3 className="text-lg font-medium mb-4">Suggestions d&apos;amélioration de profil</h3>
      
      {profileImprovements.length === 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Notre IA peut analyser votre profil et vous suggérer des améliorations pour augmenter vos chances de décrocher un entretien.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleGenerateImprovements}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isGenerating ? 'Analyse en cours...' : 'Analyser mon profil'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {profileImprovements.map((improvement) => (
              <div 
                key={improvement.id} 
                className={`p-3 border rounded-md ${
                  improvement.implemented ? 'bg-gray-50 border-gray-200' : 'border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getCategoryLabel(improvement.category)}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(improvement.priority)}`}>
                        {improvement.priority === 'high' ? 'Priorité haute' : 
                         improvement.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                      </span>
                    </div>
                    <h4 className={`font-medium ${improvement.implemented ? 'text-gray-500 line-through' : ''}`}>
                      {improvement.title}
                    </h4>
                    <p className={`text-sm mt-1 ${improvement.implemented ? 'text-gray-400' : 'text-gray-600'}`}>
                      {improvement.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => implementImprovement(improvement.id)}
                    disabled={improvement.implemented}
                    className={`px-3 py-1 text-sm rounded-md ${
                      improvement.implemented 
                        ? 'bg-gray-100 text-gray-400 cursor-default' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {improvement.implemented ? 'Implémenté' : 'Marquer comme implémenté'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerateImprovements}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Rafraîchir les suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
