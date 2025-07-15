'use client'

import { useState, useEffect } from 'react'
import { ProfileProvider } from '../modules/profil/utils/profile-context'
import ProfileInfoForm from '../modules/profil/components/ProfileInfoForm'
import SocialLinksForm from '../modules/profil/components/SocialLinksForm'
import ProjectsForm from '../modules/profil/components/ProjectsForm'
import CVLetterIntegrationForm from '../modules/profil/components/CVLetterIntegrationForm'
import ProfilePreview from '../modules/profil/components/ProfilePreview'

import { CVsProvider } from '../modules/cv/utils/cvs-context'
import { CoverLettersProvider } from '../modules/lettre/utils/cover-letters-context'

export default function ProfileGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [activeSection, setActiveSection] = useState<string>('info')
  const [animateIn, setAnimateIn] = useState(false)
  
  // Animation effect when component mounts
  useEffect(() => {
    setAnimateIn(true)
  }, [])
  
  return (
    <CVsProvider>
      <CoverLettersProvider>
        <ProfileProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 right-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
              <div className="absolute bottom-40 right-40 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
            </div>
            
            <div className="container mx-auto py-12 px-4 relative z-10">
              <div className={`transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Générateur de profil professionnel</h1>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-1.5 inline-block mb-8">
                  <div className="flex">
                    <button
                      className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                        activeTab === 'edit' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('edit')}
                    >
                      Éditer
                    </button>
                    <button
                      className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                        activeTab === 'preview' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('preview')}
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
        
                {activeTab === 'edit' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Sections</h3>
                        <nav className="space-y-2">
                          <button
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                              activeSection === 'info' 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveSection('info')}
                          >
                            Informations du profil
                          </button>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                              activeSection === 'social' 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveSection('social')}
                          >
                            Liens sociaux
                          </button>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                              activeSection === 'projects' 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveSection('projects')}
                          >
                            Projets
                          </button>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                              activeSection === 'integration' 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveSection('integration')}
                          >
                            Intégration CV/Lettres
                          </button>
                        </nav>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Conseils</h3>
                        <ul className="text-gray-600 space-y-3">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path>
                            </svg>
                            <span>Utilisez une URL personnalisée mémorable</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path>
                            </svg>
                            <span>Ajoutez tous vos liens professionnels</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path>
                            </svg>
                            <span>Mettez en avant vos meilleurs projets</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path>
                            </svg>
                            <span>Intégrez votre CV le plus pertinent</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path>
                            </svg>
                            <span>Rédigez une bio concise et percutante</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
                      {activeSection === 'info' && <ProfileInfoForm />}
                      {activeSection === 'social' && <SocialLinksForm />}
                      {activeSection === 'projects' && <ProjectsForm />}
                      {activeSection === 'integration' && <CVLetterIntegrationForm />}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
                      <ProfilePreview />
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Publier votre profil</h3>
                        
                        <div className="flex space-x-4">
                          <button
                            className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                            onClick={() => alert('Profil publié avec succès !')}
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Publier le profil
                          </button>
                          
                          <button
                            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                            onClick={() => alert('Profil sauvegardé avec succès !')}
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                            </svg>
                            Sauvegarder comme brouillon
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ProfileProvider>
      </CoverLettersProvider>
    </CVsProvider>
  )
}
