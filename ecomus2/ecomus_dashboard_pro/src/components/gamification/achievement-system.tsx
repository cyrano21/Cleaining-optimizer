"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Zap, Target, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "bronze" | "silver" | "gold" | "platinum";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalSales: number;
  ordersCompleted: number;
  customerSatisfaction: number;
  streak: number;
}

const achievementTypeColors = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-gray-400 to-gray-600", 
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600"
};

const achievementTypeIcons = {
  bronze: "🥉",
  silver: "🥈", 
  gold: "🥇",
  platinum: "💎"
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden ${achievement.unlocked ? 'ring-2 ring-green-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${achievementTypeColors[achievement.type]} flex items-center justify-center`}>
              <span className="text-2xl">{achievementTypeIcons[achievement.type]}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{achievement.title}</h3>
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Badge variant="success" className="text-xs">Débloqué!</Badge>
                  </motion.div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progression</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              {achievement.reward && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  🎁 Récompense: {achievement.reward}
                </div>
              )}
            </div>
          </div>
          
          {achievement.unlocked && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LevelProgress({ stats }: { stats: UserStats }) {
  const progressPercentage = (stats.xp / stats.xpToNextLevel) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span className="font-bold">Niveau {stats.level}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4" />
          <span className="text-sm">{stats.xp} XP</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Progression vers niveau {stats.level + 1}</span>
          <span>{stats.xp}/{stats.xpToNextLevel} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-white h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
      
      {stats.streak > 0 && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span>Série de {stats.streak} jours actifs!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function QuickStats({ stats }: { stats: UserStats }) {
  const statItems = [
    {
      icon: <Target className="h-5 w-5" />,
      label: "Commandes",
      value: stats.ordersCompleted,
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Ventes",
      value: `${stats.totalSales}€`,
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "Satisfaction",
      value: `${stats.customerSatisfaction}%`,
      color: "from-yellow-500 to-orange-600"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${item.color} text-white mb-2`}>
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function CelebrationAnimation({ type = "success" }: { type?: "success" | "level-up" | "achievement" }) {
  const animations = {
    success: "🎉",
    "level-up": "⭐",
    achievement: "🏆"
  };
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-6xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.2, 1], rotate: 0 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        {animations[type]}
      </motion.div>
      
      {/* Particules */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0 
          }}
          animate={{ 
            x: Math.cos(i * 45) * 100,
            y: Math.sin(i * 45) * 100,
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 1,
            delay: 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
}
