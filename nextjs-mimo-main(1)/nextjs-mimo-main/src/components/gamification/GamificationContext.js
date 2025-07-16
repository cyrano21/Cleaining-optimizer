"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Définition du contexte
const GamificationContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useGamification = () => useContext(GamificationContext);

// Fournisseur du contexte
export function GamificationProvider({ children }) {
  // État pour les points, niveau, badges, etc.
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [lastActivity, setLastActivity] = useState(null);
  
  // Niveaux et seuils d'XP
  const levels = [
    { level: 1, name: "Novice", minXp: 0, maxXp: 500 },
    { level: 2, name: "Apprenti", minXp: 501, maxXp: 1500 },
    { level: 3, name: "Développeur", minXp: 1501, maxXp: 3000 },
    { level: 4, name: "Artisan", minXp: 3001, maxXp: 5000 },
    { level: 5, name: "Maître", minXp: 5001, maxXp: Infinity }
  ];
  
  // Définition des badges disponibles
  const availableBadges = [
    { id: "first_step", name: "Premier Pas", description: "Compléter votre première leçon", icon: "🚶" },
    { id: "explorer", name: "Explorateur", description: "Visiter toutes les sections de l'application", icon: "🧭" },
    { id: "diligent", name: "Assidu", description: "7 jours consécutifs d'apprentissage", icon: "📆" },
    { id: "marathoner", name: "Marathonien", description: "30 jours consécutifs d'apprentissage", icon: "🏃" },
    { id: "perfectionist", name: "Perfectionniste", description: "100% de réussite sur un module entier", icon: "💯" },
    { id: "router", name: "Routeur", description: "Maîtrise du système de routage", icon: "🧭" },
    { id: "data_architect", name: "Architecte de Données", description: "Expertise en data fetching", icon: "📊" },
    { id: "api_maestro", name: "API Maestro", description: "Création d'API Routes avancées", icon: "🔌" },
    { id: "optimizer", name: "Optimiseur", description: "Excellence en performance", icon: "⚡" },
    { id: "polyglot", name: "Polyglotte", description: "Implémentation de l'internationalisation", icon: "🌐" }
  ];
  
  // Fonction pour ajouter des points XP
  const addXp = (points) => {
    const newXp = xp + points;
    setXp(newXp);
    
    // Vérifier si l'utilisateur monte de niveau
    const currentLevel = levels.find(l => newXp >= l.minXp && newXp <= l.maxXp);
    if (currentLevel && currentLevel.level !== level) {
      setLevel(currentLevel.level);
      // Notification de montée de niveau (à implémenter)
    }
    
    return { newXp, levelUp: currentLevel && currentLevel.level !== level };
  };
  
  // Fonction pour débloquer un badge
  const unlockBadge = (badgeId) => {
    const badge = availableBadges.find(b => b.id === badgeId);
    if (badge && !badges.some(b => b.id === badgeId)) {
      const newBadges = [...badges, badge];
      setBadges(newBadges);
      return badge;
    }
    return null;
  };
  
  // Fonction pour mettre à jour le streak
  const updateStreak = () => {
    const today = new Date().toDateString();
    
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        // L'utilisateur était actif hier, on incrémente le streak
        setStreakDays(streakDays + 1);
      } else if (lastDate.toDateString() !== today) {
        // L'utilisateur n'était pas actif hier et n'est pas encore actif aujourd'hui
        // On réinitialise le streak
        setStreakDays(1);
      }
    } else {
      // Premier jour d'activité
      setStreakDays(1);
    }
    
    setLastActivity(today);
    
    // Vérifier les badges de streak
    if (streakDays === 7) {
      unlockBadge("diligent");
    } else if (streakDays === 30) {
      unlockBadge("marathoner");
    }
  };
  
  // Fonction pour compléter une leçon
  const completeLesson = (lessonData) => {
    // Ajouter des points XP de base pour la leçon
    const baseXp = 100;
    
    // Points bonus selon la précision
    const accuracyBonus = lessonData.accuracy ? Math.round(lessonData.accuracy * 50) : 0;
    
    // Points bonus selon la rapidité
    const speedBonus = lessonData.fastCompletion ? 30 : 0;
    
    // Total des points
    const totalPoints = baseXp + accuracyBonus + speedBonus;
    
    // Ajouter les points
    const result = addXp(totalPoints);
    
    // Mettre à jour le streak
    updateStreak();
    
    // Vérifier le badge "Premier Pas" si c'est la première leçon
    if (xp === 0) {
      unlockBadge("first_step");
    }
    
    // Vérifier d'autres badges spécifiques aux leçons
    if (lessonData.moduleId && lessonData.lessonId) {
      // Badges spécifiques aux modules
      if (lessonData.moduleId === "2" && lessonData.lessonId === "2") {
        unlockBadge("router");
      } else if (lessonData.moduleId === "2" && lessonData.lessonId === "4") {
        unlockBadge("data_architect");
      } else if (lessonData.moduleId === "3" && lessonData.lessonId === "1") {
        unlockBadge("api_maestro");
      } else if (lessonData.moduleId === "4" && lessonData.lessonId === "3") {
        unlockBadge("optimizer");
      } else if (lessonData.moduleId === "3" && lessonData.lessonId === "4") {
        unlockBadge("polyglot");
      }
    }
    
    return {
      pointsEarned: totalPoints,
      newXp: result.newXp,
      levelUp: result.levelUp,
      currentLevel: level,
      streakDays
    };
  };
  
  // Calculer le pourcentage de progression dans le niveau actuel
  const calculateLevelProgress = () => {
    const currentLevelData = levels.find(l => l.level === level);
    if (!currentLevelData) return 0;
    
    const levelMinXp = currentLevelData.minXp;
    const levelMaxXp = currentLevelData.maxXp;
    const xpInLevel = xp - levelMinXp;
    const levelRange = levelMaxXp - levelMinXp;
    
    return Math.min(Math.round((xpInLevel / levelRange) * 100), 100);
  };
  
  // Valeur exposée par le contexte
  const value = {
    xp,
    level,
    badges,
    streakDays,
    levels,
    availableBadges,
    currentLevelName: levels.find(l => l.level === level)?.name || "Novice",
    levelProgress: calculateLevelProgress(),
    addXp,
    unlockBadge,
    completeLesson,
    updateStreak
  };
  
  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}
