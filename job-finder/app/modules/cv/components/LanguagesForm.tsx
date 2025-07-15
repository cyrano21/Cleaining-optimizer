'use client'

import { useState } from 'react'
import { useCV } from '../utils/cv-context'
import { Language } from '../utils/types'
import { v4 as uuidv4 } from 'uuid'

export default function LanguagesForm() {
  const { cv, addSectionItem, updateSectionItem, removeSectionItem } = useCV()
  const languagesSection = cv.sections.find((section) => section.id === 'languages')
  const languages = Array.isArray(languagesSection?.content) ? languagesSection.content as Language[] : []

  const [newLanguage, setNewLanguage] = useState<Language>({
    id: '',
    name: '',
    level: 'B2',
  })

  const [editMode, setEditMode] = useState<string | null>(null)

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault()
    
    const languageWithId = {
      ...newLanguage,
      id: uuidv4(),
    }
    
    addSectionItem('languages', languageWithId)
    
    setNewLanguage({
      id: '',
      name: '',
      level: 'B2',
    })
  }

  const handleEditLanguage = (language: Language) => {
    setEditMode(language.id)
    setNewLanguage(language)
  }

  const handleUpdateLanguage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode) {
      updateSectionItem('languages', editMode, newLanguage)
      setEditMode(null)
      setNewLanguage({
        id: '',
        name: '',
        level: 'B2',
      })
    }
  }

  const handleDeleteLanguage = (id: string) => {
    removeSectionItem('languages', id)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewLanguage((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Langues</h3>
      
      {languages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(languages as Language[]).map((language) => (
            <div key={language.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{language.name}</h4>
                  <p className="text-sm text-gray-600">
                    Niveau: {language.level === 'native' ? 'Langue maternelle' : language.level}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLanguage(language)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteLanguage(language.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={editMode ? handleUpdateLanguage : handleAddLanguage} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Langue
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newLanguage.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Niveau
          </label>
          <select
            id="level"
            name="level"
            value={newLanguage.level}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="A1">A1 (Débutant)</option>
            <option value="A2">A2 (Élémentaire)</option>
            <option value="B1">B1 (Intermédiaire)</option>
            <option value="B2">B2 (Intermédiaire avancé)</option>
            <option value="C1">C1 (Avancé)</option>
            <option value="C2">C2 (Maîtrise)</option>
            <option value="native">Langue maternelle</option>
          </select>
        </div>
        
        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
          
          {editMode && (
            <button
              type="button"
              onClick={() => {
                setEditMode(null)
                setNewLanguage({
                  id: '',
                  name: '',
                  level: 'B2',
                })
              }}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
