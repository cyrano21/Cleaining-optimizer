"use client";

import { useState, useEffect, useCallback } from "react";
import { Achievement, UserStats } from "@/components/gamification/achievement-system";
import { GameNotification, useGameNotifications } from "@/components/gamification/game-notifications";

export interface GamificationData {
  userStats: UserStats;
  achievements: Achievement[];
  dailyTasks: DailyTask[];
  weeklyGoals: WeeklyGoal[];
  leaderboard: LeaderboardEntry[];
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  category: "sales" | "customer" | "product" | "engagement";
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  type: "sales" | "orders" | "products" | "reviews";
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  position: number;
  change: "up" | "down" | "same";
}

// Données mockées pour la démonstration
const generateMockGamificationData = (userRole: string): GamificationData => {
  const baseStats: UserStats = {
    level: 8,
    xp: 2450,
    xpToNextLevel: 3000,
    totalSales: 15420,
    ordersCompleted: 127,
    customerSatisfaction: 94,
    streak: 7
  };

  const vendorAchievements: Achievement[] = [
    {
      id: "first-sale",
      title: "Première Vente",
      description: "Réalisez votre première vente",
      icon: "🎯",
      type: "bronze",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      reward: "+50 XP"
    },
    {
      id: "sales-master",
      title: "Maître des Ventes",
      description: "Atteignez 100 ventes",
      icon: "💰",
      type: "gold",
      progress: 127,
      maxProgress: 100,
      unlocked: true,
      reward: "Badge Vendeur Expert"
    },
    {
      id: "customer-favorite",
      title: "Favori des Clients",
      description: "Maintenez 95% de satisfaction client",
      icon: "⭐",
      type: "platinum",
      progress: 94,
      maxProgress: 95,
      unlocked: false,
      reward: "Statut VIP + 500 XP"
    },
    {
      id: "speed-demon",
      title: "Démon de la Vitesse",
      description: "Traitez 50 commandes en moins de 24h",
      icon: "⚡",
      type: "silver",
      progress: 23,
      maxProgress: 50,
      unlocked: false,
      reward: "Boost de rapidité"
    }
  ];

  const dailyTasks: DailyTask[] = [
    {
      id: "check-orders",
      title: "Vérifier les commandes",
      description: "Consultez vos nouvelles commandes",
      xpReward: 25,
      completed: true,
      category: "sales"
    },
    {
      id: "update-inventory",
      title: "Mettre à jour l'inventaire",
      description: "Vérifiez le stock de 5 produits",
      xpReward: 50,
      completed: false,
      category: "product"
    },
    {
      id: "respond-messages",
      title: "Répondre aux clients",
      description: "Répondez à tous les messages clients",
      xpReward: 40,
      completed: false,
      category: "customer"
    }
  ];

  const weeklyGoals: WeeklyGoal[] = [
    {
      id: "weekly-sales",
      title: "Objectif de Ventes",
      description: "Atteignez 5000€ de ventes cette semaine",
      progress: 3240,
      target: 5000,
      xpReward: 300,
      type: "sales"
    },
    {
      id: "new-products",
      title: "Nouveaux Produits",
      description: "Ajoutez 10 nouveaux produits",
      progress: 6,
      target: 10,
      xpReward: 200,
      type: "products"
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Sophie Martin",
      level: 12,
      xp: 4580,
      position: 1,
      change: "same"
    },
    {
      id: "2", 
      name: "Thomas Dubois",
      level: 10,
      xp: 3920,
      position: 2,
      change: "up"
    },
    {
      id: "3",
      name: "Marie Leclerc", 
      level: 9,
      xp: 3150,
      position: 3,
      change: "down"
    },
    {
      id: "4",
      name: "Vous",
      level: baseStats.level,
      xp: baseStats.xp,
      position: 4,
      change: "up"
    }
  ];

  return {
    userStats: baseStats,
    achievements: vendorAchievements,
    dailyTasks,
    weeklyGoals,
    leaderboard
  };
};

export function useGamification(userRole: string = "vendor", session?: any, status?: string) {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const notifications = useGameNotifications();  // Charger les données de gamification
  const loadGamificationData = useCallback(async () => {
    // Ne pas faire d'appel API si l'utilisateur n'est pas authentifié
    if (status === 'loading' || !session?.user) {
      // Utiliser des données mockées par défaut si pas d'authentification
      const data = generateMockGamificationData(userRole);
      setGamificationData(data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/gamification');
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setGamificationData(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
      
    } catch (error) {
      console.error("Erreur lors du chargement des données de gamification:", error);
      // Fallback avec des données mockées
      const data = generateMockGamificationData(userRole);
      setGamificationData(data);
    } finally {
      setLoading(false);
    }
  }, [userRole, session, status]);

  // Compléter une tâche quotidienne
  const completeTask = useCallback(async (taskId: string) => {
    if (!gamificationData) return;

    const task = gamificationData.dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    try {
      // Marquer la tâche comme complétée
      const updatedTasks = gamificationData.dailyTasks.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      );

      // Ajouter XP
      const newXP = gamificationData.userStats.xp + task.xpReward;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > gamificationData.userStats.level;

      const updatedStats = {
        ...gamificationData.userStats,
        xp: newXP,
        level: newLevel
      };

      setGamificationData({
        ...gamificationData,
        dailyTasks: updatedTasks,
        userStats: updatedStats
      });

      // Notifications
      notifications.addNotification({
        type: "milestone",
        title: "Tâche accomplie!",
        message: `+${task.xpReward} XP pour "${task.title}"`
      });

      if (leveledUp) {
        notifications.showLevelUp(newLevel);
      }

    } catch (error) {
      console.error("Erreur lors de la completion de la tâche:", error);
    }
  }, [gamificationData, notifications]);

  // Simuler une action qui donne de l'XP
  const earnXP = useCallback((amount: number, reason: string) => {
    if (!gamificationData) return;

    const newXP = gamificationData.userStats.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const leveledUp = newLevel > gamificationData.userStats.level;

    const updatedStats = {
      ...gamificationData.userStats,
      xp: newXP,
      level: newLevel
    };

    setGamificationData({
      ...gamificationData,
      userStats: updatedStats
    });

    notifications.addNotification({
      type: "reward",
      title: "XP gagné!",
      message: `+${amount} XP pour ${reason}`
    });

    if (leveledUp) {
      notifications.showLevelUp(newLevel);
    }
  }, [gamificationData, notifications]);

  // Déclencher une réalisation
  const unlockAchievement = useCallback((achievementId: string) => {
    if (!gamificationData) return;

    const achievement = gamificationData.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    const updatedAchievements = gamificationData.achievements.map(a =>
      a.id === achievementId ? { ...a, unlocked: true } : a
    );

    setGamificationData({
      ...gamificationData,
      achievements: updatedAchievements
    });

    notifications.showAchievement(
      achievement.title,
      `${achievement.description} - ${achievement.reward}`,
      {
        label: "Voir les réalisations",
        onClick: () => console.log("Ouvrir les réalisations")
      }
    );
  }, [gamificationData, notifications]);

  // Mettre à jour les stats après une action
  const updateStats = useCallback((updates: Partial<UserStats>) => {
    if (!gamificationData) return;

    const updatedStats = {
      ...gamificationData.userStats,
      ...updates
    };

    setGamificationData({
      ...gamificationData,
      userStats: updatedStats
    });
  }, [gamificationData]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  return {
    gamificationData,
    loading,
    completeTask,
    earnXP,
    unlockAchievement,
    updateStats,
    notifications,
    refetch: loadGamificationData
  };
}
