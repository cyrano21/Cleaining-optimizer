'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  
  // Optimisation des performances avec le chargement différé des ressources
  useEffect(() => {
    setIsVisible(true)
    // Préchargement des modules principaux après le chargement de la page
    const timer = setTimeout(() => {
      import('../modules/cv/utils/types')
      import('../modules/lettre/utils/types')
      import('../modules/profil/utils/types')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white py-24 lg:py-32">
        {/* Professional Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1599580546666-c26f15e00933?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fGJsdWV8MTc1MjUwNzc4NXww&ixlib=rb-4.1.0&q=85"
            alt="Modern office building"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-blue-800/80"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-20">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Trouvez le job idéal avec <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200 px-2">l&apos;aide de l&apos;IA</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-blue-100 leading-relaxed">
              Créez des CV et lettres de motivation professionnels, trouvez des offres pertinentes et préparez-vous aux entretiens avec notre assistant IA de nouvelle génération.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/login" className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center">
                <span>Commencer gratuitement</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/pricing" className="group bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center">
                <span>Voir les tarifs</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200 mb-2">10K+</div>
                <div className="text-sm text-blue-100">CV créés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200 mb-2">95%</div>
                <div className="text-sm text-blue-100">Taux de satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200 mb-2">500+</div>
                <div className="text-sm text-blue-100">Emplois trouvés</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Floating elements */}
          <div className="hidden lg:block">
            <div className="absolute top-20 right-20 animate-float">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-10 left-20 animate-float animation-delay-1000">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="absolute top-1/2 left-10 animate-float animation-delay-2000">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tout ce dont vous avez besoin pour votre recherche d&apos;emploi
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Notre plateforme tout-en-un vous accompagne à chaque étape de votre parcours professionnel avec des outils alimentés par l&apos;intelligence artificielle
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Générateur de CV</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Créez des CV professionnels avec différents modèles modernes, aperçu en temps réel et export en PDF/Docx de qualité supérieure.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/cv" className="text-blue-600 font-medium flex items-center hover:text-blue-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  IA optimisé
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-purple-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Lettres de motivation</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Générez des lettres personnalisées avec l&apos;aide de l&apos;IA avancée, adaptées au poste et à l&apos;entreprise avec un taux de réussite de 95%.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/lettre" className="text-purple-600 font-medium flex items-center hover:text-purple-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Personnalisé
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-green-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Chasseur d&apos;emploi IA</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Trouvez les offres qui correspondent parfaitement à votre profil grâce à notre IA qui analyse et score plus de 10 000 annonces quotidiennement.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/jobs" className="text-green-600 font-medium flex items-center hover:text-green-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Automatisé
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-red-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Géolocalisation</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Visualisez les offres sur une carte interactive et calculez précisément votre temps de trajet domicile-travail avec tous les modes de transport.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/geolocation" className="text-red-600 font-medium flex items-center hover:text-red-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Temps réel
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Coaching IA</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Préparez-vous aux entretiens avec notre simulateur IA avancé et recevez des conseils personnalisés basés sur votre profil et secteur d&apos;activité.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/coaching" className="text-amber-600 font-medium flex items-center hover:text-amber-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Expert
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 transform hover:-translate-y-1 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Profil professionnel</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Créez une page publique personnalisée et professionnelle pour partager votre CV, lettres, projets et compétences avec une URL unique.
              </p>
              <div className="flex items-center justify-between">
                <Link href="/profil" className="text-indigo-600 font-medium flex items-center hover:text-indigo-700 transition-colors group">
                  <span>Essayer maintenant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Personnalisé
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Ils nous font confiance
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui ont déjà transformé leur recherche d&apos;emploi avec notre plateforme
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800">Marie Dubois</h4>
                  <p className="text-sm text-gray-600">Chef de projet</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "J&apos;ai trouvé mon emploi de rêve en 3 semaines grâce à Job Finder. Le CV généré était parfait et les conseils IA m&apos;ont aidée à décrocher l&apos;entretien."
              </p>
              <div className="flex text-yellow-400 mt-3">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800">Jean Martin</h4>
                  <p className="text-sm text-gray-600">Développeur</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "L&apos;interface est intuitive et les templates de CV sont magnifiques. J&apos;ai multiplié mes entretiens par 3 !"
              </p>
              <div className="flex text-yellow-400 mt-3">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800">Sophie Leroy</h4>
                  <p className="text-sm text-gray-600">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Le coaching IA m&apos;a préparée parfaitement pour mes entretiens. Une plateforme complète et efficace !"
              </p>
              <div className="flex text-yellow-400 mt-3">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Prêt à décrocher votre emploi de rêve ?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Rejoignez plus de 10 000 professionnels qui ont déjà transformé leur carrière avec notre plateforme IA
            </p>
            
            {/* Quick Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">7 jours</div>
                <div className="text-sm text-blue-100">Essai gratuit</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">0€</div>
                <div className="text-sm text-blue-100">Pour commencer</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">24h</div>
                <div className="text-sm text-blue-100">Support réactif</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/pricing" className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center">
                <span>Découvrir nos tarifs</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/login" className="group bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center">
                <span>Commencer gratuitement</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="flex items-center text-blue-100">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Paiement sécurisé</span>
              </div>
              <div className="flex items-center text-blue-100">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Garantie 14 jours</span>
              </div>
              <div className="flex items-center text-blue-100">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-8 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                  Job Finder
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Votre assistant intelligent pour une recherche d&apos;emploi optimisée par l&apos;IA. Créez, cherchez, réussissez.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-3 text-blue-200">Suivez-nous</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-200">Fonctionnalités</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/cv" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Générateur de CV</Link></li>
                <li><Link href="/lettre" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Lettres de motivation</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Recherche d&apos;emploi</Link></li>
                <li><Link href="/coaching" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Coaching IA</Link></li>
                <li><Link href="/geolocation" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Géolocalisation</Link></li>
                <li><Link href="/profil" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Profil professionnel</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-200">Ressources</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/pricing" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Tarifs</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Connexion</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Inscription</Link></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center group"><span className="mr-2 transition-transform group-hover:translate-x-1">→</span> FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-200">Contact & Support</h4>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-400">contact@jobfinder.com</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="font-medium">Téléphone</div>
                    <div className="text-sm text-gray-400">+33 1 23 45 67 89</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">Horaires</div>
                    <div className="text-sm text-gray-400">Lun-Ven 9h-18h</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Job Finder. Tous droits réservés.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Conditions d&apos;utilisation
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
