"use client";

import { useState, useEffect } from 'react';
import { GamificationProvider } from '../gamification/GamificationContext';
import PointsDisplay from '../gamification/PointsDisplay';
import BadgesDisplay from '../gamification/BadgesDisplay';

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState({
    completed: 0,
    total: 0,
    recentCourses: []
  });

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => {
      setCourseProgress({
        completed: 8,
        total: 12,
        recentCourses: [
          { id: 1, title: 'Introduction à Next.js', progress: 100 },
          { id: 2, title: 'Routage avec Next.js', progress: 75 },
          { id: 3, title: 'Bases de React', progress: 50 }
        ]
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <GamificationProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Progression */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Votre progression</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Modules complétés</span>
                <span className="text-sm font-medium text-gray-700">{courseProgress.completed}/{courseProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${(courseProgress.completed / courseProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-4">
              {courseProgress.recentCourses.map(course => (
                <div key={course.id} className="border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium">{course.title}</h4>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Progression</span>
                      <span className="text-xs text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                      Continuer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profil & Gamification */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                U
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Utilisateur</h3>
                <p className="text-sm text-gray-500">Développeur Next.js en formation</p>
              </div>
            </div>

            <PointsDisplay />

            <div className="mt-6">
              <BadgesDisplay />
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Temps d'apprentissage</span>
                <span className="font-medium">14h 30m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leçons terminées</span>
                <span className="font-medium">24/36</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz réussis</span>
                <span className="font-medium">18/20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GamificationProvider>
  );
}