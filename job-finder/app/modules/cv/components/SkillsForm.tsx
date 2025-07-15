'use client'

import { useState } from 'react'
import { useCV } from '../utils/cv-context'
import { Skill } from '../utils/types'
import { v4 as uuidv4 } from 'uuid'

export default function SkillsForm() {
  const { cv, addSectionItem, updateSectionItem, removeSectionItem } = useCV()
  const skillsSection = cv.sections.find((section) => section.id === 'skills')
  const skills = Array.isArray(skillsSection?.content) ? skillsSection.content as Skill[] : []

  const [newSkill, setNewSkill] = useState<Skill>({
    id: '',
    name: '',
    level: 'intermediate',
  })

  const [editMode, setEditMode] = useState<string | null>(null)

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    
    const skillWithId = {
      ...newSkill,
      id: uuidv4(),
    }
    
    addSectionItem('skills', skillWithId)
    
    setNewSkill({
      id: '',
      name: '',
      level: 'intermediate',
    })
  }

  const handleEditSkill = (skill: Skill) => {
    setEditMode(skill.id)
    setNewSkill(skill)
  }

  const handleUpdateSkill = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode) {
      updateSectionItem('skills', editMode, newSkill)
      setEditMode(null)
      setNewSkill({
        id: '',
        name: '',
        level: 'intermediate',
      })
    }
  }

  const handleDeleteSkill = (id: string) => {
    removeSectionItem('skills', id)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewSkill((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Compétences</h3>
      
      {skills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(skills as Skill[]).map((skill) => (
            <div key={skill.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{skill.name}</h4>
                  <p className="text-sm text-gray-600">
                    Niveau: {skill.level === 'beginner' ? 'Débutant' : 
                            skill.level === 'intermediate' ? 'Intermédiaire' : 
                            skill.level === 'advanced' ? 'Avancé' : 'Expert'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
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
      
      <form onSubmit={editMode ? handleUpdateSkill : handleAddSkill} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Compétence
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newSkill.name}
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
            value={newSkill.level}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
            <option value="expert">Expert</option>
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
                setNewSkill({
                  id: '',
                  name: '',
                  level: 'intermediate',
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
