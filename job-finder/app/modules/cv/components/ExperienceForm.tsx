'use client'

import { useState } from 'react'
import { useCV } from '../utils/cv-context'
import { Experience } from '../utils/types'
import { v4 as uuidv4 } from 'uuid'

export default function ExperienceForm() {
  const { cv, addSectionItem, updateSectionItem, removeSectionItem } = useCV()
  const experienceSection = cv.sections.find((section) => section.id === 'experience')
  const experiences = Array.isArray(experienceSection?.content) ? experienceSection.content as Experience[] : []

  const [newExperience, setNewExperience] = useState<Experience>({
    id: '',
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  })

  const [editMode, setEditMode] = useState<string | null>(null)

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault()
    
    const experienceWithId = {
      ...newExperience,
      id: uuidv4(),
    }
    
    addSectionItem('experience', experienceWithId)
    
    setNewExperience({
      id: '',
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    })
  }

  const handleEditExperience = (experience: Experience) => {
    setEditMode(experience.id)
    setNewExperience(experience)
  }

  const handleUpdateExperience = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode) {
      updateSectionItem('experience', editMode, newExperience)
      setEditMode(null)
      setNewExperience({
        id: '',
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      })
    }
  }

  const handleDeleteExperience = (id: string) => {
    removeSectionItem('experience', id)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewExperience((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNewExperience((prev) => ({
      ...prev,
      [name]: checked,
      endDate: checked ? null : prev.endDate,
    }))
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Expérience professionnelle</h3>
      
      {experiences.length > 0 && (
        <div className="space-y-4">
          {(experiences as Experience[]).map((experience) => (
            <div key={experience.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{experience.title}</h4>
                  <p className="text-sm text-gray-600">
                    {experience.company}, {experience.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                  </p>
                  <p className="mt-2 text-sm">{experience.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditExperience(experience)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteExperience(experience.id)}
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
      
      <form onSubmit={editMode ? handleUpdateExperience : handleAddExperience}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Poste
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newExperience.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={newExperience.company}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={newExperience.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={newExperience.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="current"
              name="current"
              checked={newExperience.current}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label htmlFor="current" className="text-sm font-medium text-gray-700">
              Poste actuel
            </label>
          </div>
          
          {!newExperience.current && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newExperience.endDate || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required={!newExperience.current}
              />
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newExperience.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mt-4">
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
                setNewExperience({
                  id: '',
                  title: '',
                  company: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  current: false,
                  description: '',
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
