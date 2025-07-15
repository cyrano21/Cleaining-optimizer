"use client";

import Link from "next/link";
import { useUserContext } from '../modules/user-context'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubscriptionStatusNav() {
  const { subscription, loading } = useUserContext();
  if (loading) return <span className="text-gray-400 text-xs animate-pulse">Chargement...</span>;
  if (!subscription) return null;
  
  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
    canceled: 'bg-red-50 text-red-700 border-red-200',
    default: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  
  const statusColor = statusColors[subscription.subscriptionStatus as keyof typeof statusColors] || statusColors.default;
  
  return (
    <div className={`text-xs ${statusColor} px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
        <span className="font-semibold">{subscription.plan?.toUpperCase()}</span>
        <span className="text-gray-500">({subscription.subscriptionStatus})</span>
      </div>
    </div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Effect for scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { 
      href: '/cv', 
      label: 'CV', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      description: 'Créer un CV professionnel'
    },
    { 
      href: '/lettre', 
      label: 'Lettres', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      description: 'Lettres de motivation IA'
    },
    { 
      href: '/jobs', 
      label: 'Emplois', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      description: 'Recherche intelligente'
    },
    { 
      href: '/coaching', 
      label: 'Coaching', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      description: 'Coaching IA personnalisé'
    },
    { 
      href: '/geolocation', 
      label: 'Géolocalisation', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      description: 'Carte des emplois'
    },
    { 
      href: '/pricing', 
      label: 'Tarifs', 
      icon: <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      description: 'Plans et abonnements'
    }
  ];
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm shadow-md'}`}>
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="group text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
            <span className="transition-all duration-300 group-hover:drop-shadow-lg">Job Finder</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            onClick={toggleMobileMenu}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link 
                  href={item.href} 
                  className="flex items-center text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r from-blue-100 to-indigo-100 hover:text-blue-800 hover:shadow-sm focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transform hover:scale-105"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <SubscriptionStatusNav />
            <Link 
              href="/profil" 
              className="text-gray-700 p-2 rounded-full transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:scale-110 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
              aria-label="Profil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transform hover:scale-105 flex items-center"
            >
              <span>Connexion</span>
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </nav>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-2 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg mb-4 border border-gray-100 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="flex items-center text-gray-700 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r from-blue-100 to-indigo-100 hover:text-blue-800 hover:shadow-sm focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transform hover:scale-105" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-200 my-3 pt-3">
                <div className="flex items-center justify-between px-4 py-2">
                  <SubscriptionStatusNav />
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/profil"
                      className="text-gray-700 p-2 rounded-full transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Link>
                    <Link
                      href="/login"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
