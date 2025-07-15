'use client'

import { useState } from 'react'
import { useCV } from '../utils/cv-context'
import { Education } from '../utils/types'
import { v4 as uuidv4 } from 'uuid'

export default function EducationForm() {
  const { cv, addSectionItem, updateSectionItem, removeSectionItem } = useCV()
  const educationSection = cv.sections.find((section) => section.id === 'education')
  const educations = Array.isArray(educationSection?.content) ? educationSection.content as Education[] : []

  const [newEducation, setNewEducation] = useState<Education>({
    id: '',
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  })

  const [editMode, setEditMode] = useState<string | null>(null)

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault()
    
    const educationWithId = {
      ...newEducation,
      id: uuidv4(),
    }
    
    addSectionItem('education', educationWithId)
    
    setNewEducation({
      id: '',
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    })
  }

  const handleEditEducation = (education: Education) => {
    setEditMode(education.id)
    setNewEducation(education)
  }

  const handleUpdateEducation = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode) {
      updateSectionItem('education', editMode, newEducation)
      setEditMode(null)
      setNewEducation({
        id: '',
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      })
    }
  }

  const handleDeleteEducation = (id: string) => {
    removeSectionItem('education', id)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEducation((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNewEducation((prev) => ({
      ...prev,
      [name]: checked,
      endDate: checked ? null : prev.endDate,
    }))
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Formation</h3>
      
      {educations.length > 0 && (
        <div className="space-y-4">
          {(educations as Education[]).map((education) => (
            <div key={education.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{education.degree}</h4>
                  <p className="text-sm text-gray-600">
                    {education.institution}, {education.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {education.startDate} - {education.current ? 'En cours' : education.endDate}
                  </p>
                  <p className="mt-2 text-sm">{education.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEducation(education)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteEducation(education.id)}
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
      
      <form onSubmit={editMode ? handleUpdateEducation : handleAddEducation}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
              Diplôme / Formation
            </label>
            <input
              type="text"
              id="degree"
              name="degree"
              value={newEducation.degree}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Établissement
            </label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={newEducation.institution}
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
              value={newEducation.location}
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
              value={newEducation.startDate}
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
              checked={newEducation.current}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label htmlFor="current" className="text-sm font-medium text-gray-700">
              Formation en cours
            </label>
          </div>
          
          {!newEducation.current && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newEducation.endDate || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required={!newEducation.current}
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
            value={newEducation.description}
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
                setNewEducation({
                  id: '',
                  degree: '',
                  institution: '',
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
