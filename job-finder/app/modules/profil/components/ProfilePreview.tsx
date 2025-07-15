'use client'

import { useProfile } from '../utils/profile-context'

export default function ProfilePreview() {
  const { profile } = useProfile()
  
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
      <h3 className="text-lg font-medium mb-4">Aperçu du profil public</h3>
      
      <div className="max-w-4xl mx-auto bg-white p-8 border shadow-sm rounded-lg">
        {/* En-tête */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.title}</h1>
          
          {profile.slug && (
            <p className="text-sm text-gray-500">
              URL: monsite.com/profil/{profile.slug}
            </p>
          )}
        </header>
        
        {/* Biographie */}
        {profile.bio && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">À propos</h2>
            <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
          </section>
        )}
        
        {/* CV intégré */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">CV</h2>
          {profile.cvId ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-center">CV sélectionné disponible pour consultation</p>
              <div className="mt-2 text-center">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Voir le CV complet
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center">Aucun CV sélectionné</p>
          )}
        </section>
        
        {/* Liens sociaux */}
        {profile.socialLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Liens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="mr-2">{getPlatformIcon(link.platform)}</span>
                  <span>{link.label || link.url}</span>
                </a>
              ))}
            </div>
          </section>
        )}
        
        {/* Projets */}
        {profile.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Projets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map((project) => (
                <div key={project.id} className="border rounded-lg overflow-hidden">
                  {project.imageUrl && (
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Image du projet</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{project.title}</h3>
                    {(project.startDate || project.endDate) && (
                      <p className="text-sm text-gray-600 mb-1">
                        {project.startDate} {project.endDate && `- ${project.endDate}`}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                    
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.map((tag: string) => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {project.projectUrl && (
                      <a 
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Voir le projet
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Lettres de motivation */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Lettres de motivation</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-center">
              {profile.coverLetterIds && profile.coverLetterIds.length > 0
                ? `${profile.coverLetterIds.length} lettre(s) de motivation disponible(s)`
                : 'Aucune lettre de motivation sélectionnée'}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}