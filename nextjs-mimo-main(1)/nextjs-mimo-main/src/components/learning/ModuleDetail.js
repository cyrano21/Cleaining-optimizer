"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import LessonCard from './LessonCard';

export default function ModuleDetail({ module, onLessonSelect }) {
  const [expanded, setExpanded] = useState(true);
  
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
  
  // Données simulées pour un module
  const moduleData = module || {
    id: 1,
    title: "Introduction à Next.js",
    description: "Découvrez les bases de Next.js et comment créer votre première application.",
    level: "Débutant",
    xpReward: 150,
    duration: "2 heures",
    lessons: [
      {
        id: 1,
        title: "Qu'est-ce que Next.js ?",
        type: "theory",
        duration: "10 min",
        xpReward: 20,
        completed: true
      },
      {
        id: 2,
        title: "Installation et configuration",
        type: "exercise",
        duration: "15 min",
        xpReward: 30,
        completed: true
      },
      {
        id: 3,
        title: "Création de pages",
        type: "exercise",
        duration: "20 min",
        xpReward: 40,
        completed: false,
        contributeToPortfolio: true
      },
      {
        id: 4,
        title: "Routing avec Next.js",
        type: "theory",
        duration: "15 min",
        xpReward: 25,
        completed: false
      },
      {
        id: 5,
        title: "Projet : Page d'accueil",
        type: "project",
        duration: "30 min",
        xpReward: 60,
        completed: false,
        contributeToPortfolio: true
      }
    ]
  };
  
  // Calculer la progression du module
  const completedLessons = moduleData.lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / moduleData.lessons.length) * 100;
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
    >
      {/* En-tête du module */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              {moduleData.id}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">{moduleData.title}</h3>
              <div className="flex items-center text-indigo-100 text-sm">
                <span className="mr-3">{moduleData.level}</span>
                <span className="mr-3">•</span>
                <span className="mr-3">{moduleData.duration}</span>
                <span className="mr-3">•</span>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {moduleData.xpReward} XP
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-white text-sm mr-3">
              {completedLessons}/{moduleData.lessons.length} leçons
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-white transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Contenu du module */}
      {expanded && (
        <div className="p-6">
          <motion.div variants={itemVariants} className="mb-4">
            <p className="text-gray-600">{moduleData.description}</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Leçons</h4>
            <div className="space-y-3">
              {moduleData.lessons.map((lesson) => (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson} 
                  onClick={() => onLessonSelect && onLessonSelect(lesson)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
