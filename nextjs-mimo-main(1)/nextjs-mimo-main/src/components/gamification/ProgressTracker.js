"use client";

import { useGamification } from './GamificationContext';
import { useState } from 'react';

export default function ProgressTracker() {
  const { streakDays, xp, level, badges } = useGamification();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Données fictives pour le graphique (dans une application réelle, ces données viendraient d'une API)
  const weeklyActivity = [
    { day: 'Lun', minutes: 45 },
    { day: 'Mar', minutes: 30 },
    { day: 'Mer', minutes: 60 },
    { day: 'Jeu', minutes: 15 },
    { day: 'Ven', minutes: 0 },
    { day: 'Sam', minutes: 90 },
    { day: 'Dim', minutes: 45 }
  ];
  
  // Données fictives pour les modules complétés
  const moduleProgress = [
    { id: 1, name: 'Introduction à Next.js', completed: 3, total: 3, percentage: 100 },
    { id: 2, name: 'Fondamentaux de Next.js', completed: 2, total: 4, percentage: 50 },
    { id: 3, name: 'Fonctionnalités Avancées', completed: 0, total: 4, percentage: 0 },
    { id: 4, name: 'Déploiement et Performance', completed: 0, total: 4, percentage: 0 }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 px-4 text-center ${activeTab === 'stats' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button 
          className={`flex-1 py-3 px-4 text-center ${activeTab === 'modules' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('modules')}
        >
          Modules
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === 'stats' ? (
          <div className="space-y-6">
            {/* Résumé des statistiques */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{xp}</div>
                <div className="text-sm text-gray-600">Points XP</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{level}</div>
                <div className="text-sm text-gray-600">Niveau</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{badges.length}</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
            </div>
            
            {/* Streak */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Série d'apprentissage</h4>
                <span className="text-indigo-600 font-bold">{streakDays} jours</span>
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 7 }).map((_, index) => {
                  const isActive = index < streakDays % 7;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                        {index + 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Activité hebdomadaire */}
            <div>
              <h4 className="font-medium mb-3">Activité hebdomadaire</h4>
              <div className="flex items-end h-32 space-x-2">
                {weeklyActivity.map((day, index) => {
                  const height = day.minutes > 0 ? (day.minutes / 90) * 100 : 5;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-indigo-100 rounded-t" style={{ height: `${height}%` }}>
                        <div className="w-full bg-indigo-600 h-full rounded-t"></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{day.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {moduleProgress.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{module.name}</h4>
                  <span className="text-sm text-gray-600">{module.completed}/{module.total} leçons</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${module.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {module.percentage}% complété
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
