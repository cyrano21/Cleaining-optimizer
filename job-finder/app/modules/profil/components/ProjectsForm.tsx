'use client'

import { useState } from 'react'
import { useProfile } from '../utils/profile-context'
import { Project } from '../utils/types'

export default function ProjectsForm() {
  const { profile, addProject, updateProject, removeProject } = useProfile()
  
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    tags: [],
    startDate: '',
    endDate: ''
  })
  
  const [tagInput, setTagInput] = useState('')
  const [editMode, setEditMode] = useState<string | null>(null)
  
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newProject.title || !newProject.description) return
    
    addProject(newProject)
    
    setNewProject({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      tags: [],
      startDate: '',
      endDate: ''
    })
    
    setTagInput('')
  }
  
  const handleEditProject = (project: Project) => {
    setEditMode(project.id)
    setNewProject({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl || '',
      projectUrl: project.projectUrl || '',
      tags: [...project.tags],
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    })
  }
  
  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode && newProject.title && newProject.description) {
      updateProject(editMode, newProject)
      setEditMode(null)
      setNewProject({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        tags: [],
        startDate: '',
        endDate: ''
      })
      
      setTagInput('')
    }
  }
  
  const handleDeleteProject = (id: string) => {
    removeProject(id)
  }
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return
    
    setNewProject((prev) => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()]
    }))
    
    setTagInput('')
  }
  
  const handleRemoveTag = (tag: string) => {
    setNewProject((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }))
  }
  
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Projets</h3>
      
      {profile.projects.length > 0 && (
        <div className="space-y-4">
          {profile.projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {project.startDate} {project.endDate && `- ${project.endDate}`}
                    </p>
                  )}
                  
                  {project.projectUrl && (
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline mt-1 block"
                    >
                      Voir le projet
                    </a>
                  )}
                  
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
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
      
      <form onSubmit={editMode ? handleUpdateProject : handleAddProject} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre du projet
          </label>
          <input
            type="text"
            id="title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Mon projet génial"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Description de votre projet..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début (optionnel)
          </label>
          <input
            type="text"
            id="startDate"
            value={newProject.startDate}
            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="MM/YYYY"
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin (optionnel)
          </label>
          <input
            type="text"
            id="endDate"
            value={newProject.endDate}
            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="MM/YYYY ou Présent"
          />
        </div>
        
        <div>
          <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL du projet (optionnel)
          </label>
          <input
            type="url"
            id="projectUrl"
            value={newProject.projectUrl}
            onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://..."
          />
        </div>
        
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL de l&apos;image (optionnel)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={newProject.imageUrl}
            onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://..."
          />
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md"
              placeholder="React, JavaScript, etc."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
            >
              Ajouter
            </button>
          </div>
          
          {newProject.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {newProject.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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
                setNewProject({
                  title: '',
                  description: '',
                  imageUrl: '',
                  projectUrl: '',
                  tags: [],
                  startDate: '',
                  endDate: ''
                })
                setTagInput('')
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