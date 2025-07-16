"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from './GamificationContext';

export default function BadgeShowcase({ theme = 'light', onBadgeUnlock = () => {} }) {
  const { badges, availableBadges, unlockBadge } = useGamification();
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [showCelebration, setShowCelebration] = useState(null);
  
  // Détecter les nouveaux badges débloqués
  useEffect(() => {
    const newBadges = badges.filter(badge => 
      !unlockedBadges.some(unlocked => unlocked.id === badge.id)
    );
    
    if (newBadges.length > 0) {
      setUnlockedBadges(badges);
      // Afficher la célébration pour le dernier badge débloqué
      const latestBadge = newBadges[newBadges.length - 1];
      setShowCelebration(latestBadge);
      onBadgeUnlock(latestBadge);
      
      // Masquer la célébration après 3 secondes
      setTimeout(() => {
        setShowCelebration(null);
      }, 3000);
    }
  }, [badges, unlockedBadges, onBadgeUnlock]);
  
  // Animation de célébration pour déblocage de badge
  const celebrationVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    visible: { 
      scale: [0, 1.3, 1],
      rotate: [0, 360, 720],
      opacity: [0, 1, 1],
      transition: {
        duration: 1.5,
        times: [0, 0.6, 1],
        ease: "easeOut"
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const badgeVariants = {
    hidden: { scale: 0, rotate: 180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  const shimmerVariants = {
    hidden: { x: '-100%' },
    visible: {
      x: '100%',
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  };
  
  // Catégoriser les badges
  const badgeCategories = {
    beginner: availableBadges.filter(badge => 
      ['first_step', 'explorer', 'diligent'].includes(badge.id)
    ),
    intermediate: availableBadges.filter(badge => 
      ['router', 'data_architect', 'marathoner'].includes(badge.id)
    ),
    advanced: availableBadges.filter(badge => 
      ['api_maestro', 'optimizer', 'polyglot', 'perfectionist'].includes(badge.id)
    )
  };
  
  const categories = [
    { key: 'beginner', name: 'Débutant', color: 'green', icon: '🌱' },
    { key: 'intermediate', name: 'Intermédiaire', color: 'blue', icon: '🚀' },
    { key: 'advanced', name: 'Avancé', color: 'purple', icon: '⭐' }
  ];
  
  const isBadgeUnlocked = (badgeId) => {
    return badges.some(badge => badge.id === badgeId);
  };
  
  const getBadgeRarity = (badgeId) => {
    if (['perfectionist', 'polyglot', 'marathoner'].includes(badgeId)) {
      return 'legendary';
    }
    if (['api_maestro', 'optimizer', 'data_architect'].includes(badgeId)) {
      return 'epic';
    }
    if (['router', 'diligent'].includes(badgeId)) {
      return 'rare';
    }
    return 'common';
  };
  
  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 via-pink-500 to-red-500';
      case 'rare':
        return 'from-blue-400 via-purple-500 to-blue-600';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Célébration de déblocage de badge */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={celebrationVariants}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className={`relative p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl border-4 border-yellow-400`}>
              {/* Particules de célébration */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 200}%`,
                      y: `${50 + (Math.random() - 0.5) * 200}%`,
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute w-4 h-4 text-yellow-400"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
              
              <div className="relative text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-8xl mb-4"
                >
                  {showCelebration.icon}
                </motion.div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Badge débloqué !
                </h3>
                
                <p className={`text-xl font-semibold mb-2 text-yellow-600`}>
                  {showCelebration.name}
                </p>
                
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {showCelebration.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Vitrine des badges */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Collection de badges
          </h2>
          
          <div className={`px-4 py-2 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {badges.length} / {availableBadges.length} badges
            </span>
          </div>
        </div>
        
        {/* Barre de progression de collection */}
        <div className="mb-8">
          <div className={`w-full h-3 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          } overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(badges.length / availableBadges.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
            >
              <motion.div
                variants={shimmerVariants}
                initial="hidden"
                animate="visible"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Progression de collection
            </span>
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {Math.round((badges.length / availableBadges.length) * 100)}%
            </span>
          </div>
        </div>
        
        {/* Badges par catégorie */}
        {categories.map(category => (
          <div key={category.key} className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-2xl">{category.icon}</span>
              <span>{category.name}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                category.color === 'green' ? 'bg-green-100 text-green-700' :
                category.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {badgeCategories[category.key].filter(badge => isBadgeUnlocked(badge.id)).length} / {badgeCategories[category.key].length}
              </span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badgeCategories[category.key].map((badge, index) => {
                const isUnlocked = isBadgeUnlocked(badge.id);
                const rarity = getBadgeRarity(badge.id);
                const rarityColors = getRarityColors(rarity);
                
                return (
                  <motion.div
                    key={badge.id}
                    variants={badgeVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={isUnlocked ? "hover" : {}}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className={`relative p-4 rounded-xl text-center transition-all cursor-pointer ${
                      isUnlocked
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-gray-700 to-gray-600 shadow-lg'
                          : 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200'
                        : theme === 'dark'
                          ? 'bg-gray-700/50 opacity-50'
                          : 'bg-gray-100 opacity-50'
                    }`}>
                      {/* Bordure de rareté pour les badges débloqués */}
                      {isUnlocked && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${rarityColors} p-0.5`}>
                          <div className={`w-full h-full rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                          }`} />
                        </div>
                      )}
                      
                      <div className="relative z-10">
                        <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                          {isUnlocked ? badge.icon : '🔒'}
                        </div>
                        
                        <h4 className={`font-semibold text-sm mb-1 ${
                          theme === 'dark' 
                            ? isUnlocked ? 'text-white' : 'text-gray-500'
                            : isUnlocked ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {badge.name}
                        </h4>
                        
                        <p className={`text-xs ${
                          theme === 'dark' 
                            ? isUnlocked ? 'text-gray-300' : 'text-gray-600'
                            : isUnlocked ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {badge.description}
                        </p>
                        
                        {/* Indicateur de rareté */}
                        {isUnlocked && (
                          <div className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${
                            rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                            rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                            rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rarity === 'legendary' ? 'Légendaire' :
                             rarity === 'epic' ? 'Épique' :
                             rarity === 'rare' ? 'Rare' : 'Commun'}
                          </div>
                        )}
                      </div>
                      
                      {/* Effet de brillance pour badges débloqués */}
                      {isUnlocked && (
                        <motion.div
                          animate={{
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute top-1 right-1 text-yellow-400 text-lg"
                        >
                          ✨
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Tooltip au survol */}
                    {isUnlocked && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'
                        } shadow-lg`}>
                          {badge.description}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                            theme === 'dark' ? 'border-t-gray-900' : 'border-t-gray-800'
                          }`} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Statistiques de collection */}
        <div className={`mt-8 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h4 className={`font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Statistiques de collection
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                {badges.length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Badges obtenus
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {Math.round((badges.length / availableBadges.length) * 100)}%
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Complété
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {badges.filter(badge => getBadgeRarity(badge.id) === 'legendary').length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Légendaires
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {availableBadges.length - badges.length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Restants
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}