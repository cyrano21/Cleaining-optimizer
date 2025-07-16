"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LearningPathProgression({ currentModule, completedModules }) {
  const [progress, setProgress] = useState(0);
  
  // Calculer le pourcentage de progression
  useEffect(() => {
    if (completedModules && completedModules.length > 0) {
      // Supposons qu'il y a 20 modules au total
      const totalModules = 20;
      const progressPercentage = (completedModules.length / totalModules) * 100;
      setProgress(progressPercentage);
    }
  }, [completedModules]);
  
  // Données simulées pour les niveaux
  const levels = [
    { id: 1, name: "Débutant", modules: 5, color: "bg-green-500" },
    { id: 2, name: "Intermédiaire", modules: 5, color: "bg-blue-500" },
    { id: 3, name: "Avancé", modules: 5, color: "bg-purple-500" },
    { id: 4, name: "Expert", modules: 5, color: "bg-red-500" }
  ];
  
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-10"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Votre parcours d'apprentissage</h2>
        <p className="text-gray-600">
          Suivez votre progression à travers les différents niveaux d'apprentissage de Next.js.
        </p>
      </motion.div>
      
      {/* Barre de progression globale */}
      <motion.div 
        variants={itemVariants}
        className="mb-8"
      >
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
      </motion.div>
      
      {/* Niveaux */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {levels.map((level) => {
          // Déterminer si le niveau est actif, complété ou verrouillé
          const isCompleted = (level.id - 1) * level.modules < completedModules?.length;
          const isActive = !isCompleted && currentModule && 
                          currentModule.level === level.id;
          const isLocked = !isCompleted && !isActive;
          
          return (
            <motion.div
              key={level.id}
              className={`rounded-lg p-4 border ${
                isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : isActive 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : isLocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    level.id
                  )}
                </div>
                <h3 className="ml-2 font-semibold text-gray-900">{level.name}</h3>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Modules complétés</span>
                  <span>
                    {Math.min(
                      completedModules?.length - ((level.id - 1) * level.modules), 
                      level.modules
                    ).toFixed(0)} / {level.modules}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${level.color}`}
                    style={{ 
                      width: `${Math.min(
                        ((completedModules?.length - ((level.id - 1) * level.modules)) / level.modules) * 100, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                {isCompleted 
                  ? 'Niveau complété !' 
                  : isActive 
                    ? 'Niveau en cours...' 
                    : 'Niveau verrouillé'}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
