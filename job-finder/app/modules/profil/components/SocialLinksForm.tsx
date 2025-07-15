'use client'

import { useState } from 'react'
import { useProfile } from '../utils/profile-context'
import { SocialLink } from '../utils/types'

export default function SocialLinksForm() {
  const { profile, addSocialLink, updateSocialLink, removeSocialLink } = useProfile()
  
  const [newLink, setNewLink] = useState<Omit<SocialLink, 'id'>>({
    platform: 'linkedin',
    url: '',
    label: '',
  })
  
  const [editMode, setEditMode] = useState<string | null>(null)
  
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newLink.url) return
    
    addSocialLink(newLink)
    
    setNewLink({
      platform: 'linkedin',
      url: '',
      label: '',
    })
  }
  
  const handleEditLink = (link: SocialLink) => {
    setEditMode(link.id)
    setNewLink({
      platform: link.platform,
      url: link.url,
      label: link.label || '',
    })
  }
  
  const handleUpdateLink = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode && newLink.url) {
      updateSocialLink(editMode, newLink)
      setEditMode(null)
      setNewLink({
        platform: 'linkedin',
        url: '',
        label: '',
      })
    }
  }
  
  const handleDeleteLink = (id: string) => {
    removeSocialLink(id)
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return '🔗 LinkedIn'
      case 'github':
        return '💻 GitHub'
      case 'twitter':
        return '🐦 Twitter'
      case 'portfolio':
        return '🌐 Portfolio'
      default:
        return '🔗 Autre'
    }
  }
  
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Liens sociaux</h3>
      
      {profile.socialLinks.length > 0 && (
        <div className="space-y-3">
          {profile.socialLinks.map((link) => (
            <div key={link.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{getPlatformIcon(link.platform)}</h4>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {link.label || link.url}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLink(link)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
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
      
      <form onSubmit={editMode ? handleUpdateLink : handleAddLink} className="space-y-4">
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
            Plateforme
          </label>
          <select
            id="platform"
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value as 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'other' })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="linkedin">LinkedIn</option>
            <option value="github">GitHub</option>
            <option value="twitter">Twitter</option>
            <option value="portfolio">Portfolio</option>
            <option value="other">Autre</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Libellé (optionnel)
          </label>
          <input
            type="text"
            id="label"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Mon profil LinkedIn"
          />
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
                setNewLink({
                  platform: 'linkedin',
                  url: '',
                  label: '',
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
