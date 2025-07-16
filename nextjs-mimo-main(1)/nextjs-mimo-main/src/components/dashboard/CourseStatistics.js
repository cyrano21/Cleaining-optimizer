
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CourseStatistics() {
  const [stats, setStats] = useState({
    courseStats: null,
    userStats: null,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      setStats({
        courseStats: {
          totalCourses: 12,
          totalModules: 48,
          totalLessons: 240,
          averageCompletionRate: 68,
          mostPopularCourse: "Introduction à Next.js",
          mostPopularModule: "React Hooks",
          coursesByCategory: [
            { category: "Front-end", count: 5 },
            { category: "Back-end", count: 3 },
            { category: "Full-stack", count: 2 },
            { category: "DevOps", count: 1 },
            { category: "Autres", count: 1 }
          ]
        },
        userStats: {
          totalUsers: 1250,
          activeUsers: 876,
          newUsersLastMonth: 124,
          averageCompletionTime: "14 jours",
          usersByLevel: [
            { level: "Débutant", count: 450 },
            { level: "Intermédiaire", count: 580 },
            { level: "Avancé", count: 220 }
          ]
        },
        loading: false
      });
    };
    
    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Statistiques détaillées</h2>
        <p className="mt-2 text-gray-600">
          Vue d'ensemble des statistiques des cours et des utilisateurs
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques des cours */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-medium text-gray-900 border-b pb-3">Statistiques des cours</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">Total des cours</div>
                <div className="text-2xl font-bold">{stats.courseStats.totalCourses}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Total des modules</div>
                <div className="text-2xl font-bold">{stats.courseStats.totalModules}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total des leçons</div>
                <div className="text-2xl font-bold">{stats.courseStats.totalLessons}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Taux de complétion</div>
                <div className="text-2xl font-bold">{stats.courseStats.averageCompletionRate}%</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Cours le plus populaire</div>
                <div className="font-medium text-indigo-600">{stats.courseStats.mostPopularCourse}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Module le plus populaire</div>
                <div className="font-medium text-indigo-600">{stats.courseStats.mostPopularModule}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cours par catégorie</h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  {stats.courseStats.coursesByCategory.map((item, index) => (
                    <div key={item.category} className={`flex justify-between p-3 ${index !== stats.courseStats.coursesByCategory.length - 1 ? 'border-b' : ''}`}>
                      <span className="text-gray-600">{item.category}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Statistiques des utilisateurs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-medium text-gray-900 border-b pb-3">Statistiques des utilisateurs</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-600 font-medium">Total des utilisateurs</div>
                <div className="text-2xl font-bold">{stats.userStats.totalUsers}</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="text-sm text-teal-600 font-medium">Utilisateurs actifs</div>
                <div className="text-2xl font-bold">{stats.userStats.activeUsers}</div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-600 font-medium">Nouveaux utilisateurs</div>
                <div className="text-2xl font-bold">{stats.userStats.newUsersLastMonth}</div>
                <div className="text-xs text-gray-500">Dernier mois</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium">Temps moyen</div>
                <div className="text-2xl font-bold">{stats.userStats.averageCompletionTime}</div>
                <div className="text-xs text-gray-500">Pour terminer un cours</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Utilisateurs par niveau</h4>
              <div className="space-y-2">
                {stats.userStats.usersByLevel.map(level => (
                  <div key={level.level} className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700">{level.level}</span>
                      <span className="text-sm font-medium">{level.count} utilisateurs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          level.level === "Débutant" ? "bg-green-500" :
                          level.level === "Intermédiaire" ? "bg-blue-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${(level.count / stats.userStats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-sm text-indigo-600 font-medium mb-2">Répartition par activité</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold">70%</div>
                  <div className="text-xs text-gray-600">Actifs</div>
                </div>
                <div>
                  <div className="text-xl font-bold">20%</div>
                  <div className="text-xs text-gray-600">Occasionnels</div>
                </div>
                <div>
                  <div className="text-xl font-bold">10%</div>
                  <div className="text-xs text-gray-600">Inactifs</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
