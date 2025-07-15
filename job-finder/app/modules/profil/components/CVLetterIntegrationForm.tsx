'use client'

import { useState } from 'react'
import { useProfile } from '../utils/profile-context'


import { useCVs } from '../../cv/utils/cvs-context'
import { useCoverLetters } from '../../lettre/utils/cover-letters-context'

// ...


export default function CVLetterIntegrationForm() {
  const { updateField } = useProfile()
  const { cvs } = useCVs()
  const { coverLetters } = useCoverLetters()
  const [selectedCV, setSelectedCV] = useState<string>('')
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  
  const handleCVChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cvId = e.target.value
    setSelectedCV(cvId)
    updateField('cvId', cvId)
  }
  
  const handleLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const letterId = e.target.value
    const isChecked = e.target.checked
    
    if (isChecked) {
      setSelectedLetters((prev) => [...prev, letterId])
    } else {
      setSelectedLetters((prev) => prev.filter((id) => id !== letterId))
    }
    
    // Dans une implémentation réelle, nous mettrions à jour le profil avec les IDs des lettres sélectionnées
  }
  
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Intégration CV et lettres de motivation</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
            Sélectionner un CV
          </label>
          <select
            id="cv"
            value={selectedCV || ''}
            onChange={handleCVChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Aucun CV sélectionné</option>
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.title} - {cv.personalInfo.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Le CV sélectionné sera affiché sur votre profil public.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sélectionner des lettres de motivation
          </label>
          <div className="space-y-2">
            {coverLetters.map((letter) => (
              <div key={letter.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`letter-${letter.id}`}
                  value={letter.id}
                  checked={letter.id ? selectedLetters.includes(letter.id) : false}
                  onChange={handleLetterChange}
                  className="mr-2"
                />
                <label htmlFor={`letter-${letter.id}`} className="text-sm">
                  {letter.title} - {letter.position} chez {letter.company}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Les lettres sélectionnées seront disponibles sur votre profil public.
          </p>
        </div>
      </div>
    </div>
  )
}
