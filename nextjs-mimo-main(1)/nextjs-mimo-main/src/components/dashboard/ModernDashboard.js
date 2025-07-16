"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '../gamification/GamificationContext';

export default function ModernDashboard({ theme = 'light' }) {
  const {
    xp,
    level,
    badges,
    streakDays,
    levels,
    currentLevelName,
    levelProgress
  } = useGamification();
  
  const [stats, setStats] = useState({
    totalLessonsCompleted: 12,
    totalTimeSpent: 540, // en minutes
    averageScore: 85,
    currentStreak: streakDays,
    weeklyProgress: [65, 75, 80, 90, 85, 95, 100],
    recentAchievements: [
      { type: 'badge', name: 'Premier Pas', date: '2024-01-10', icon: '🚶' },
      { type: 'level', name: 'Niveau 3 atteint', date: '2024-01-09', icon: '⭐' },
      { type: 'streak', name: '7 jours consécutifs', date: '2024-01-08', icon: '🔥' }
    ]
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
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
  
  // Calculs des statistiques
  const nextLevelXp = levels.find(l => l.level === level + 1)?.minXp || xp;
  const currentLevelMinXp = levels.find(l => l.level === level)?.minXp || 0;
  const xpToNextLevel = nextLevelXp - xp;
  const xpInCurrentLevel = xp - currentLevelMinXp;
  const totalXpForLevel = nextLevelXp - currentLevelMinXp;
  const progressPercent = Math.round((xpInCurrentLevel / totalXpForLevel) * 100);
  
  // Formatage du temps
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      } min-h-screen`}
    >
      {/* En-tête avec informations utilisateur */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                U
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {level}
              </div>
            </div>
            
            <div>
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Tableau de bord
              </h2>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {currentLevelName} • {xp} XP
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              🔥 {streakDays}
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Jours consécutifs
            </p>
          </div>
        </div>
        
        {/* Barre de progression vers le niveau suivant */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Progression vers le niveau {level + 1}
            </span>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {xpInCurrentLevel} / {totalXpForLevel} XP
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative overflow-hidden"
            >
              <motion.div
                animate={{
                  x: ['0%', '100%'],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-white/30 transform skew-x-12"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Leçons terminées
              </p>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalLessonsCompleted}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Temps d'étude
              </p>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(stats.totalTimeSpent)}
              </p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Score moyen
              </p>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.averageScore}%
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Badges obtenus
              </p>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {badges.length}
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </motion.div>
      </div>
      
      {/* Graphique de progression hebdomadaire */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg`}
      >
        <h3 className={`text-lg font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Progression cette semaine
        </h3>
        
        <div className="space-y-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
            <div key={day} className="flex items-center space-x-4">
              <div className={`w-12 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {day}
              </div>
              
              <div className={`flex-1 h-8 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              } relative overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.weeklyProgress[index]}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    stats.weeklyProgress[index] >= 90 ? 'bg-green-500' :
                    stats.weeklyProgress[index] >= 70 ? 'bg-yellow-500' :
                    stats.weeklyProgress[index] >= 50 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                />
              </div>
              
              <div className={`w-12 text-sm text-right ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stats.weeklyProgress[index]}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Badges et réalisations récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <h3 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Mes badges
          </h3>
          
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {badge.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="text-6xl mb-4">🏆</div>
              <p>Aucun badge pour le moment</p>
              <p className="text-sm">Continuez à apprendre pour débloquer des badges !</p>
            </div>
          )}
        </motion.div>
        
        {/* Réalisations récentes */}
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border shadow-lg`}
        >
          <h3 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Réalisations récentes
          </h3>
          
          <div className="space-y-4">
            {stats.recentAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {achievement.name}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {new Date(achievement.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Objectifs et recommandations */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg`}
      >
        <h3 className={`text-lg font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Recommandations personnalisées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
            theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Continue ton streak !
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
            }`}>
              Tu es à {streakDays} jours consécutifs. Essaye d'atteindre 30 jours !
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
            theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>
              Prochaine leçon suggérée
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-200' : 'text-green-700'
            }`}>
              "Hooks React avancés" basé sur tes progrès actuels.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${
            theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
            }`}>
              Défi du jour
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-purple-200' : 'text-purple-700'
            }`}>
              Complète un quiz avec 100% de réussite pour gagner +50 XP bonus.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}