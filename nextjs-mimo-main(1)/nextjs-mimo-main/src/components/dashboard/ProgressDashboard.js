"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProgressDashboard({ userData }) {
  const [activeTab, setActiveTab] = useState('progress');
  const [animateStats, setAnimateStats] = useState(false);
  
  // Simuler des données utilisateur si non fournies
  const user = userData || {
    name: "Utilisateur",
    level: 3,
    xp: 1250,
    xpToNextLevel: 2000,
    streak: 5,
    completedLessons: 24,
    totalLessons: 120,
    badges: [
      { id: 1, name: "Premier pas", icon: "🚀", description: "Terminer votre première leçon", earned: true },
      { id: 2, name: "Sur la bonne voie", icon: "🔥", description: "Maintenir un streak de 5 jours", earned: true },
      { id: 3, name: "Explorateur", icon: "🧭", description: "Découvrir tous les modules", earned: false },
      { id: 4, name: "Codeur en herbe", icon: "💻", description: "Compléter 10 exercices de code", earned: true },
      { id: 5, name: "Bâtisseur", icon: "🏗️", description: "Créer votre premier projet", earned: false },
      { id: 6, name: "Expert Next.js", icon: "⚛️", description: "Terminer tous les modules avancés", earned: false }
    ],
    recentActivity: [
      { id: 1, type: "lesson_completed", title: "Introduction à React", date: "2025-04-16T14:30:00Z", xpEarned: 50 },
      { id: 2, type: "badge_earned", title: "Codeur en herbe", date: "2025-04-15T10:15:00Z", xpEarned: 100 },
      { id: 3, type: "streak_milestone", title: "Streak de 5 jours", date: "2025-04-15T10:00:00Z", xpEarned: 25 },
      { id: 4, type: "project_completed", title: "Todo App", date: "2025-04-14T16:45:00Z", xpEarned: 200 }
    ],
    recommendations: [
      { id: 1, type: "module", title: "Composants React", description: "Continuez votre apprentissage avec les composants React", progress: 25 },
      { id: 2, type: "lesson", title: "Hooks useState", description: "Apprenez à gérer l'état dans vos composants React", isNew: true },
      { id: 3, type: "project", title: "Blog personnel", description: "Mettez en pratique vos connaissances en créant un blog", difficulty: "Intermédiaire" }
    ]
  };
  
  // Déclencher l'animation des statistiques après le chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculer le pourcentage de progression global
  const overallProgress = Math.round((user.completedLessons / user.totalLessons) * 100);
  
  // Formater une date relative
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Il y a moins d'une heure";
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString();
  };
  
  // Obtenir l'icône pour un type d'activité
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'badge_earned':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'streak_milestone':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'project_completed':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  // Obtenir l'icône pour un type de recommandation
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'module':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
        );
      case 'lesson':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        );
      case 'project':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Tableau de bord</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Niveau et XP */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-xl font-bold">{user.level}</span>
              </div>
              <div className="ml-3">
                <div className="text-sm opacity-75">Niveau</div>
                <div className="text-lg font-semibold">{user.level}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{user.xp} XP</span>
                <span>{user.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div 
                  className="bg-green-400 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: animateStats ? `${(user.xp / user.xpToNextLevel) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </div>
          
          {/* Streak */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm opacity-75">Streak</div>
                <div className="text-lg font-semibold">{user.streak} jours</div>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 mx-1 rounded-full flex items-center justify-center ${
                    i < user.streak % 7 ? 'bg-orange-400' : 'bg-white/20'
                  }`}
                >
                  {i < user.streak % 7 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Progression */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm opacity-75">Progression</div>
                <div className="text-lg font-semibold">{overallProgress}%</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{user.completedLessons} leçons</span>
                <span>{user.totalLessons} total</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div 
                  className="bg-green-400 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: animateStats ? `${overallProgress}%` : '0%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm opacity-75">Badges</div>
                <div className="text-lg font-semibold">
                  {user.badges.filter(b => b.earned).length}/{user.badges.length}
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              {user.badges.slice(0, 5).map((badge, i) => (
                <div 
                  key={badge.id} 
                  className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center text-lg ${
                    badge.earned ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
              {user.badges.length > 5 && (
                <div className="w-8 h-8 mx-1 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  +{user.badges.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progression
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activité récente
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'badges'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Badges
          </button>
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommandé pour vous</h3>
              
              <div className="space-y-4">
                {user.recommendations.map((recommendation) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * recommendation.id }}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {getRecommendationIcon(recommendation.type)}
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h4 className="text-base font-medium text-gray-900">{recommendation.title}</h4>
                        {recommendation.isNew && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-500">{recommendation.description}</p>
                      
                      <div className="mt-2 flex items-center">
                        {recommendation.progress !== undefined && (
                          <div className="flex items-center mr-4">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${recommendation.progress}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">{recommendation.progress}%</span>
                          </div>
                        )}
                        
                        {recommendation.difficulty && (
                          <span className="text-xs text-gray-500">
                            Difficulté: {recommendation.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {recommendation.progress ? 'Continuer' : 'Commencer'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
              
              <div className="space-y-4">
                {user.recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * activity.id }}
                    className="flex items-start p-4 border border-gray-200 rounded-lg"
                  >
                    {getActivityIcon(activity.type)}
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-gray-900">{activity.title}</h4>
                        <span className="text-sm text-gray-500">{formatRelativeDate(activity.date)}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-gray-500">
                          {activity.type === 'lesson_completed' && 'Leçon terminée'}
                          {activity.type === 'badge_earned' && 'Badge obtenu'}
                          {activity.type === 'streak_milestone' && 'Jalon de streak'}
                          {activity.type === 'project_completed' && 'Projet terminé'}
                        </span>
                        
                        {activity.xpEarned && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            +{activity.xpEarned} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mes badges</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * badge.id }}
                    className={`p-4 border rounded-lg ${
                      badge.earned 
                        ? 'border-purple-200 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        badge.earned ? 'bg-purple-200' : 'bg-gray-200'
                      }`}>
                        {badge.icon}
                      </div>
                      
                      <div className="ml-4">
                        <h4 className={`text-base font-medium ${
                          badge.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </h4>
                        
                        <p className="text-sm text-gray-500">{badge.description}</p>
                      </div>
                    </div>
                    
                    {!badge.earned && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Verrouillé
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
