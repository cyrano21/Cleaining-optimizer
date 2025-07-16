"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { motion } from 'framer-motion';

// Indiquer à Next.js de ne pas prévisualiser cette page pendant le build
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  // Utiliser le composant ProtectedRoute pour protéger cette page
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    activeUsers: 0,
    completionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Simuler le chargement des statistiques
  useEffect(() => {
    const loadStats = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      setStats({
        totalUsers: 245,
        totalCourses: 12,
        totalLessons: 156,
        activeUsers: 87,
        completionRate: 68
      });
      
      setIsLoading(false);
    };
    
    loadStats();
  }, []);
  
  // Données simulées pour les cours
  const courses = [
    {
      id: 1,
      title: "Introduction à Next.js",
      category: "Développement Web",
      level: "Débutant",
      students: 124,
      completionRate: 78,
      lastUpdated: "2025-04-10T14:30:00Z"
    },
    {
      id: 2,
      title: "Composants React Avancés",
      category: "Développement Web",
      level: "Intermédiaire",
      students: 86,
      completionRate: 62,
      lastUpdated: "2025-04-05T09:15:00Z"
    },
    {
      id: 3,
      title: "API Routes avec Next.js",
      category: "Développement Web",
      level: "Avancé",
      students: 53,
      completionRate: 45,
      lastUpdated: "2025-04-12T11:20:00Z"
    },
    {
      id: 4,
      title: "Développement Personnel: Mindfulness",
      category: "Développement Personnel",
      level: "Débutant",
      students: 98,
      completionRate: 72,
      lastUpdated: "2025-04-08T16:45:00Z"
    },
    {
      id: 5,
      title: "Coaching Holistique: Fondamentaux",
      category: "Développement Personnel",
      level: "Intermédiaire",
      students: 42,
      completionRate: 58,
      lastUpdated: "2025-04-15T10:30:00Z"
    }
  ];
  
  // Données simulées pour les utilisateurs récents
  const recentUsers = [
    {
      id: 1,
      name: "Sophie Martin",
      email: "sophie.martin@example.com",
      joinDate: "2025-04-15T08:30:00Z",
      coursesEnrolled: 3,
      lastActive: "2025-04-16T14:20:00Z"
    },
    {
      id: 2,
      name: "Thomas Dubois",
      email: "thomas.dubois@example.com",
      joinDate: "2025-04-14T11:45:00Z",
      coursesEnrolled: 2,
      lastActive: "2025-04-16T09:10:00Z"
    },
    {
      id: 3,
      name: "Emma Leroy",
      email: "emma.leroy@example.com",
      joinDate: "2025-04-13T15:20:00Z",
      coursesEnrolled: 4,
      lastActive: "2025-04-15T16:30:00Z"
    },
    {
      id: 4,
      name: "Lucas Bernard",
      email: "lucas.bernard@example.com",
      joinDate: "2025-04-12T09:15:00Z",
      coursesEnrolled: 1,
      lastActive: "2025-04-16T11:45:00Z"
    },
    {
      id: 5,
      name: "Chloé Petit",
      email: "chloe.petit@example.com",
      joinDate: "2025-04-11T14:50:00Z",
      coursesEnrolled: 2,
      lastActive: "2025-04-14T10:20:00Z"
    }
  ];
  
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
    
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* En-tête */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <p className="mt-1 text-sm text-gray-500">
              Bienvenue, {currentUser?.name || 'Administrateur'}. Gérez vos cours et suivez les statistiques de la plateforme.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Créer un cours
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Paramètres
            </button>
          </div>
        </motion.div>
        
        {/* Onglets */}
        <motion.div variants={itemVariants} className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cours
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Utilisateurs
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytiques
            </button>
          </nav>
        </motion.div>
        
        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Statistiques */}
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques de la plateforme</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="text-sm font-medium text-gray-500">Utilisateurs totaux</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>+12% ce mois</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="text-sm font-medium text-gray-500">Cours totaux</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>+3 ce mois</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="text-sm font-medium text-gray-500">Leçons totales</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalLessons}</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>+24 ce mois</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="text-sm font-medium text-gray-500">Utilisateurs actifs</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>+8% ce mois</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="text-sm font-medium text-gray-500">Taux de complétion</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>+5% ce mois</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
            
            {/* Cours récents */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Cours récents</h2>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Voir tous les cours
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {courses.slice(0, 3).map((course) => (
                    <motion.li 
                      key={course.id}
                      variants={itemVariants}
                    >
                      <a href="#" className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                course.category === "Développement Web" 
                                  ? "bg-indigo-100 text-indigo-600" 
                                  : "bg-green-100 text-green-600"
                              }`}>
                                {course.category === "Développement Web" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-indigo-600">{course.title}</div>
                                <div className="text-sm text-gray-500">
                                  {course.category} • {course.level}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-sm text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                {course.students} étudiants
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                Mis à jour {formatRelativeDate(course.lastUpdated)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Taux de complétion</span>
                              <span>{course.completionRate}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  course.completionRate >= 70 
                                    ? "bg-green-500" 
                                    : course.completionRate >= 40 
                                      ? "bg-yellow-500" 
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${course.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            {/* Utilisateurs récents */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Utilisateurs récents</h2>
                <button 
                  onClick={() => setActiveTab('users')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Voir tous les utilisateurs
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {recentUsers.slice(0, 3).map((user) => (
                    <motion.li 
                      key={user.id}
                      variants={itemVariants}
                    >
                      <a href="#" className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-sm text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                {user.coursesEnrolled} cours
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                Actif {formatRelativeDate(user.lastActive)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Inscrit {formatRelativeDate(user.joinDate)}
                          </div>
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'courses' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Tous les cours</h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un cours..."
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Toutes catégories</option>
                  <option value="web">Développement Web</option>
                  <option value="personal">Développement Personnel</option>
                </select>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <motion.li 
                    key={course.id}
                    variants={itemVariants}
                  >
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            course.category === "Développement Web" 
                              ? "bg-indigo-100 text-indigo-600" 
                              : "bg-green-100 text-green-600"
                          }`}>
                            {course.category === "Développement Web" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-600">{course.title}</div>
                            <div className="text-sm text-gray-500">
                              {course.category} • {course.level}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Modifier
                          </button>
                          <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Voir
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {course.students} étudiants
                          </div>
                          <div>
                            Mis à jour {formatRelativeDate(course.lastUpdated)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  course.completionRate >= 70 
                                    ? "bg-green-500" 
                                    : course.completionRate >= 40 
                                      ? "bg-yellow-500" 
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${course.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{course.completionRate}% complété</span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'users' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Tous les utilisateurs</h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Tous les utilisateurs</option>
                  <option value="active">Utilisateurs actifs</option>
                  <option value="inactive">Utilisateurs inactifs</option>
                </select>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <motion.li 
                    key={user.id}
                    variants={itemVariants}
                  >
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Modifier
                          </button>
                          <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Voir
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            {user.coursesEnrolled} cours
                          </div>
                          <div>
                            Inscrit {formatRelativeDate(user.joinDate)}
                          </div>
                        </div>
                        <div>
                          Actif {formatRelativeDate(user.lastActive)}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'analytics' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analytiques</h2>
              
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center py-10">
                  Les graphiques et analytiques détaillées seront disponibles dans une prochaine mise à jour.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
