"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star, Zap, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export interface GameNotification {
  id: string;
  type: "achievement" | "level-up" | "milestone" | "reward" | "streak";
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const notificationIcons = {
  achievement: <Trophy className="h-5 w-5 text-yellow-500" />,
  "level-up": <Star className="h-5 w-5 text-purple-500" />,
  milestone: <TrendingUp className="h-5 w-5 text-blue-500" />,
  reward: <Gift className="h-5 w-5 text-green-500" />,
  streak: <Zap className="h-5 w-5 text-orange-500" />
};

const notificationColors = {
  achievement: "from-yellow-500 to-orange-500",
  "level-up": "from-purple-500 to-pink-500", 
  milestone: "from-blue-500 to-cyan-500",
  reward: "from-green-500 to-emerald-500",
  streak: "from-orange-500 to-red-500"
};

export function GameNotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: GameNotification;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="w-80"
    >
      <Card className="relative overflow-hidden shadow-lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${notificationColors[notification.type]}`} />
        
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex-shrink-0"
            >
              {notification.icon || notificationIcons[notification.type]}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
              
              {notification.action && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={notification.action.onClick}
                  className="text-xs"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
        
        {/* Animation de particules pour les achievements */}
        {notification.type === "achievement" && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0 
                }}
                animate={{ 
                  x: `${20 + Math.random() * 60}%`,
                  y: `${20 + Math.random() * 60}%`,
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function GameNotificationContainer({ 
  notifications,
  onDismiss
}: {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <GameNotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook pour gérer les notifications gamifiées
export function useGameNotifications() {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  const addNotification = (notification: Omit<GameNotification, "id">) => {
    const id = Date.now().toString();
    const fullNotification: GameNotification = {
      id,
      duration: 5000, // 5 secondes par défaut
      ...notification
    };
    
    setNotifications(prev => [...prev, fullNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Notifications pré-définies
  const showAchievement = (title: string, message: string, action?: GameNotification["action"]) => {
    addNotification({
      type: "achievement",
      title,
      message,
      action
    });
  };

  const showLevelUp = (newLevel: number) => {
    addNotification({
      type: "level-up",
      title: `Niveau ${newLevel} atteint!`,
      message: "Félicitations! Vous débloquez de nouvelles fonctionnalités.",
      duration: 8000
    });
  };

  const showMilestone = (milestone: string, count: number) => {
    addNotification({
      type: "milestone",
      title: "Objectif atteint!",
      message: `${count} ${milestone} - Continue comme ça!`,
      duration: 6000
    });
  };

  const showReward = (reward: string) => {
    addNotification({
      type: "reward",
      title: "Récompense débloquée!",
      message: `Vous avez gagné: ${reward}`,
      duration: 7000
    });
  };

  const showStreak = (days: number) => {
    addNotification({
      type: "streak",
      title: `Série de ${days} jours!`,
      message: "Incroyable régularité! Continuez sur cette lancée.",
      duration: 6000
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    showAchievement,
    showLevelUp,
    showMilestone,
    showReward,
    showStreak
  };
}
