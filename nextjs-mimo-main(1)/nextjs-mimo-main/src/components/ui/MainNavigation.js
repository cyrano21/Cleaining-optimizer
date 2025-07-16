"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MainNavigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProgress, setUserProgress] = useState({
    level: 3,
    xp: 1250,
    nextLevelXp: 2000,
    streak: 7
  });
  
  // Détecter le défilement pour changer l'apparence de la barre de navigation
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Animation variants
  const navVariants = {
    top: { 
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)'
    },
    scrolled: { 
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }
  };
  
  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      x: '100%',
      pointerEvents: 'none'
    },
    open: { 
      opacity: 1,
      x: 0,
      pointerEvents: 'auto'
    }
  };
  
  // Calculer le pourcentage de progression vers le niveau suivant
  const progressPercentage = (userProgress.xp / userProgress.nextLevelXp) * 100;
  
  return (
    <>
      <motion.header
        variants={navVariants}
        animate={scrolled ? 'scrolled' : 'top'}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled ? 'py-2' : 'py-3 md:py-4'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo et navigation principale */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  NextMimo
                </span>
              </Link>
              
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-6 xl:space-x-8">
                <Link href="/learning-path" className="text-gray-700 hover:text-indigo-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Parcours d'apprentissage
                </Link>
                <Link href="/javascript-fundamentals" className="text-gray-700 hover:text-indigo-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  JavaScript
                </Link>
                <Link href="/react-fundamentals" className="text-gray-700 hover:text-indigo-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  React
                </Link>
                <Link href="/portfolio" className="text-gray-700 hover:text-indigo-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Portfolio
                </Link>
              </nav>
            </div>
            
            {/* Indicateurs de progression et menu utilisateur */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Indicateurs de progression (visibles sur desktop) */}
              <div className="hidden xl:flex items-center space-x-3">
                {/* Niveau */}
                <div className="flex items-center">
                  <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-bold text-xs lg:text-sm">{userProgress.level}</span>
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                      <span className="text-xs">Nv</span>
                    </div>
                  </div>
                </div>
                
                {/* XP et barre de progression */}
                <div className="hidden lg:flex flex-col">
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium">{userProgress.xp} / {userProgress.nextLevelXp} XP</span>
                  </div>
                  <div className="w-24 xl:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Streak */}
                <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                  <span className="text-orange-600 text-xs font-medium">🔥 {userProgress.streak}</span>
                </div>
              </div>
              
              {/* Version compacte pour tablettes */}
              <div className="hidden md:flex xl:hidden items-center space-x-2">
                <div className="flex items-center bg-indigo-100 px-2 py-1 rounded-full">
                  <span className="text-indigo-600 text-xs font-medium">Nv {userProgress.level}</span>
                </div>
                <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                  <span className="text-orange-600 text-xs font-medium">🔥 {userProgress.streak}</span>
                </div>
              </div>
              
              {/* Bouton de profil */}
              <div className="relative">
                <Link href="/profile" className="flex items-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                </Link>
              </div>
              
              {/* Bouton de menu mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  {mobileMenuOpen ? (
                    <svg className="h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Menu mobile amélioré */}
      <motion.div
        variants={mobileMenuVariants}
        initial="closed"
        animate={mobileMenuOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-40 lg:hidden"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Indicateurs de progression (mobile) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-bold text-sm">{userProgress.level}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Niveau {userProgress.level}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{userProgress.xp} XP</span>
                      <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                        <span className="text-orange-600 text-xs font-medium">🔥 {userProgress.streak} jours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                <span>{userProgress.xp} XP</span>
                <span>{userProgress.nextLevelXp} XP</span>
              </div>
            </div>
            
            {/* Navigation mobile */}
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/learning-path" 
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📚 Parcours d'apprentissage
              </Link>
              <Link 
                href="/javascript-fundamentals" 
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                ⚡ JavaScript
              </Link>
              <Link 
                href="/react-fundamentals" 
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                ⚛️ React
              </Link>
              <Link 
                href="/portfolio" 
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💼 Portfolio
              </Link>
              <Link 
                href="/profile" 
                className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Mon profil
              </Link>
            </nav>
            
            {/* Bouton d'action principale pour mobile */}
            <div className="mt-8">
              <Link
                href="/learning-path"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium text-center block hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                onClick={() => setMobileMenuOpen(false)}
              >
                Commencer à apprendre
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Espace pour éviter que le contenu ne soit caché sous la barre de navigation */}
      <div className={`${scrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'} transition-all duration-300`}></div>
    </>
  );
}