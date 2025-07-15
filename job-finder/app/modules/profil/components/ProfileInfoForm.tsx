'use client'

import { useProfile } from '../utils/profile-context'

export default function ProfileInfoForm() {
  const { profile, updateField, generateSlug } = useProfile()
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    updateField('title', title)
    generateSlug(title)
  }
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Informations du profil</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre du profil
          </label>
          <input
            type="text"
            id="title"
            value={profile.title}
            onChange={handleTitleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Ex: Développeur Web Full Stack"
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            URL personnalisée
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">monsite.com/profil/</span>
            <input
              type="text"
              id="slug"
              value={profile.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="mon-nom"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cette URL sera utilisée pour accéder à votre profil public.
          </p>
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Biographie
          </label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Présentez-vous en quelques lignes..."
          />
        </div>
      </div>
    </div>
  )
}