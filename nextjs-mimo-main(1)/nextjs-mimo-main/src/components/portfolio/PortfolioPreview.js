"use client";

import { useState, useEffect } from 'react';

export default function PortfolioPreview({ portfolioData, projects }) {
  const [selectedTheme, setSelectedTheme] = useState(portfolioData?.theme || 'modern');
  
  // Filtrer les projets sélectionnés
  const selectedProjects = projects.filter(project => 
    portfolioData?.selectedProjects?.includes(project.id)
  );
  
  // Trier les projets pour mettre en avant ceux qui sont marqués comme "featured"
  const sortedProjects = [...selectedProjects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
  
  return (
    <div className={`portfolio-preview ${selectedTheme}`}>
      {/* En-tête avec informations personnelles */}
      <header className={`py-16 ${
        selectedTheme === 'dark' ? 'bg-gray-900 text-white' : 
        selectedTheme === 'minimal' ? 'bg-white text-gray-900' :
        selectedTheme === 'classic' ? 'bg-blue-700 text-white' :
        'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-4xl font-extrabold ${
              selectedTheme === 'minimal' ? 'text-gray-900' : 'text-white'
            }`}>
              {portfolioData?.name || 'Votre Nom'}
            </h1>
            <p className={`mt-3 text-xl ${
              selectedTheme === 'minimal' ? 'text-gray-600' : 'text-white opacity-90'
            }`}>
              {portfolioData?.title || 'Développeur Next.js'}
            </p>
            
            {portfolioData?.bio && (
              <p className={`mt-5 max-w-2xl mx-auto text-base ${
                selectedTheme === 'minimal' ? 'text-gray-500' : 'text-white opacity-80'
              }`}>
                {portfolioData.bio}
              </p>
            )}
            
            <div className="mt-6 flex justify-center space-x-6">
              {portfolioData?.email && (
                <a 
                  href={`mailto:${portfolioData.email}`} 
                  className={`text-base ${
                    selectedTheme === 'minimal' ? 'text-gray-500 hover:text-gray-900' : 'text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="sr-only">Email</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
              )}
              
              {portfolioData?.github && (
                <a 
                  href={portfolioData.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-base ${
                    selectedTheme === 'minimal' ? 'text-gray-500 hover:text-gray-900' : 'text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              
              {portfolioData?.linkedin && (
                <a 
                  href={portfolioData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-base ${
                    selectedTheme === 'minimal' ? 'text-gray-500 hover:text-gray-900' : 'text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              
              {portfolioData?.website && (
                <a 
                  href={portfolioData.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-base ${
                    selectedTheme === 'minimal' ? 'text-gray-500 hover:text-gray-900' : 'text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="sr-only">Site web</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Section des compétences */}
      <section className={`py-12 ${
        selectedTheme === 'dark' ? 'bg-gray-800 text-white' : 
        selectedTheme === 'minimal' ? 'bg-gray-50 text-gray-900' :
        selectedTheme === 'classic' ? 'bg-gray-100 text-gray-900' :
        'bg-white text-gray-900'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            selectedTheme === 'dark' ? 'text-white' : 
            selectedTheme === 'minimal' ? 'text-gray-900' :
            selectedTheme === 'classic' ? 'text-blue-700' :
            'text-indigo-600'
          }`}>
            Compétences
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {portfolioData?.skills?.map((skill, index) => (
              <span 
                key={index} 
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTheme === 'dark' ? 'bg-gray-700 text-white' : 
                  selectedTheme === 'minimal' ? 'bg-white text-gray-800 border border-gray-200' :
                  selectedTheme === 'classic' ? 'bg-blue-100 text-blue-800' :
                  'bg-indigo-100 text-indigo-800'
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section des projets */}
      <section className={`py-16 ${
        selectedTheme === 'dark' ? 'bg-gray-900 text-white' : 
        selectedTheme === 'minimal' ? 'bg-white text-gray-900' :
        selectedTheme === 'classic' ? 'bg-white text-gray-900' :
        'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold mb-8 ${
            selectedTheme === 'dark' ? 'text-white' : 
            selectedTheme === 'minimal' ? 'text-gray-900' :
            selectedTheme === 'classic' ? 'text-blue-700' :
            'text-indigo-600'
          }`}>
            Projets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedProjects.map((project) => (
              <div 
                key={project.id} 
                className={`overflow-hidden rounded-lg shadow-lg ${
                  selectedTheme === 'dark' ? 'bg-gray-800' : 
                  selectedTheme === 'minimal' ? 'bg-white border border-gray-200' :
                  selectedTheme === 'classic' ? 'bg-white border border-gray-200' :
                  'bg-white'
                } ${project.featured ? 'md:col-span-2' : ''}`}
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${
                      selectedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {project.title}
                    </h3>
                    
                    {project.featured && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTheme === 'dark' ? 'bg-indigo-500 text-white' : 
                        selectedTheme === 'minimal' ? 'bg-gray-100 text-gray-800' :
                        selectedTheme === 'classic' ? 'bg-blue-100 text-blue-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        Projet phare
                      </span>
                    )}
                  </div>
                  
                  <p className={`mt-2 ${
                    selectedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {project.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index} 
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          selectedTheme === 'dark' ? 'bg-gray-700 text-gray-200' : 
                          selectedTheme === 'minimal' ? 'bg-gray-100 text-gray-800' :
                          selectedTheme === 'classic' ? 'bg-blue-50 text-blue-700' :
                          'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                          selectedTheme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 
                          selectedTheme === 'minimal' ? 'bg-gray-900 text-white hover:bg-black' :
                          selectedTheme === 'classic' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                          'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Voir la démo
                      </a>
                    )}
                    
                    {project.codeUrl && (
                      <a 
                        href={project.codeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                          selectedTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 
                          selectedTheme === 'minimal' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' :
                          selectedTheme === 'classic' ? 'border-blue-300 text-blue-700 hover:bg-blue-50' :
                          'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                        }`}
                      >
                        Voir le code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pied de page */}
      <footer className={`py-8 ${
        selectedTheme === 'dark' ? 'bg-gray-800 text-gray-400' : 
        selectedTheme === 'minimal' ? 'bg-gray-50 text-gray-500 border-t border-gray-200' :
        selectedTheme === 'classic' ? 'bg-blue-700 text-white' :
        'bg-indigo-600 text-indigo-100'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            © {new Date().getFullYear()} {portfolioData?.name || 'Votre Nom'}. Tous droits réservés.
          </p>
          <p className="mt-1 text-sm">
            Créé avec Next.js et Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
