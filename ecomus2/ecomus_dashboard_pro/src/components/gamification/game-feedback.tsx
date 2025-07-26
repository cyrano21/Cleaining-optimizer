"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Trophy, Star, Coins, Zap, Gift, Heart, Target } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

// Toast de feedback gamifié
export function GameToast({ 
  type, 
  title, 
  message, 
  points, 
  isVisible, 
  onClose 
}: {
  type: "success" | "level-up" | "achievement" | "coin" | "streak";
  title: string;
  message: string;
  points?: number;
  isVisible: boolean;
  onClose: () => void;
}) {
  const { playSuccessSound, playLevelUpSound, playAchievementSound, playCoinSound } = useGameSounds();

  useEffect(() => {
    if (isVisible) {
      // Jouer le son approprié
      switch (type) {
        case "level-up":
          playLevelUpSound();
          break;
        case "achievement":
          playAchievementSound();
          break;
        case "coin":
          playCoinSound();
          break;
        default:
          playSuccessSound();
      }

      // Auto fermer après 4 secondes
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onClose, playSuccessSound, playLevelUpSound, playAchievementSound, playCoinSound]);

  const getConfig = () => {
    switch (type) {
      case "level-up":
        return {
          icon: Trophy,
          gradient: "from-yellow-400 to-orange-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          textColor: "text-yellow-800 dark:text-yellow-200"
        };
      case "achievement":
        return {
          icon: Star,
          gradient: "from-purple-400 to-pink-500",
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          textColor: "text-purple-800 dark:text-purple-200"
        };
      case "coin":
        return {
          icon: Coins,
          gradient: "from-green-400 to-emerald-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          textColor: "text-green-800 dark:text-green-200"
        };
      case "streak":
        return {
          icon: Zap,
          gradient: "from-orange-400 to-red-500",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          textColor: "text-orange-800 dark:text-orange-200"
        };
      default:
        return {
          icon: Sparkles,
          gradient: "from-blue-400 to-indigo-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          textColor: "text-blue-800 dark:text-blue-200"
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`${config.bgColor} border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${config.textColor}`}>{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
                {points && (
                  <div className="flex items-center gap-1 mt-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600">+{points} points</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Système de particules pour les célébrations
export function ParticleSystem({ 
  isActive, 
  type = "confetti" 
}: {
  isActive: boolean;
  type?: "confetti" | "coins" | "stars" | "hearts";
}) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: getRandomColor(type)
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, type]);

  const getRandomColor = (particleType: string) => {
    const colors = {
      confetti: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
      coins: ["#F1C40F", "#F39C12", "#E67E22"],
      stars: ["#FFD700", "#FFA500", "#FF69B4"],
      hearts: ["#FF69B4", "#FF1493", "#DC143C"]
    };
    const colorArray = colors[particleType as keyof typeof colors] || colors.confetti;
    return colorArray[Math.floor(Math.random() * colorArray.length)];
  };

  const getParticleIcon = () => {
    switch (type) {
      case "coins":
        return "●";
      case "stars":
        return "★";
      case "hearts":
        return "♥";
      default:
        return "▬";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              x: `${particle.x}vw`,
              y: "-10vh",
              rotate: particle.rotation,
              scale: particle.scale
            }}
            animate={{
              opacity: [1, 1, 0],
              x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
              y: "110vh",
              rotate: particle.rotation + 360,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: "easeOut"
            }}
            className="absolute text-2xl font-bold"
            style={{ color: particle.color }}
          >
            {getParticleIcon()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Indicateur de points flottant
export function FloatingPoints({ 
  points, 
  isVisible, 
  position = { x: 50, y: 50 },
  onComplete 
}: {
  points: number;
  isVisible: boolean;
  position?: { x: number; y: number };
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            x: position.x, 
            y: position.y 
          }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0.5, 1.2, 1, 0.8], 
            y: position.y - 50 
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut" 
          }}
          onAnimationComplete={onComplete}
          className="fixed z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
            +{points}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook pour gérer les feedbacks gamifiés
export function useGameFeedback() {
  const [activeToast, setActiveToast] = useState<{
    type: "success" | "level-up" | "achievement" | "coin" | "streak";
    title: string;
    message: string;
    points?: number;
  } | null>(null);
  
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState<"confetti" | "coins" | "stars" | "hearts">("confetti");
  
  const [floatingPoints, setFloatingPoints] = useState<{
    points: number;
    position: { x: number; y: number };
    isVisible: boolean;
  }>({ points: 0, position: { x: 0, y: 0 }, isVisible: false });

  const showToast = (toast: typeof activeToast) => {
    setActiveToast(toast);
  };

  const triggerParticles = (type: typeof particleType = "confetti") => {
    setParticleType(type);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 100);
  };

  const showFloatingPoints = (points: number, position?: { x: number; y: number }) => {
    setFloatingPoints({
      points,
      position: position || { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      isVisible: true
    });
  };

  const triggerLevelUp = (newLevel: number) => {
    showToast({
      type: "level-up",
      title: "🎉 Niveau Supérieur !",
      message: `Félicitations ! Vous avez atteint le niveau ${newLevel}`,
      points: newLevel * 100
    });
    triggerParticles("stars");
  };

  const triggerAchievement = (title: string, description: string, points: number) => {
    showToast({
      type: "achievement",
      title: `🏆 ${title}`,
      message: description,
      points
    });
    triggerParticles("confetti");
  };

  const triggerPointsEarned = (points: number, reason: string, position?: { x: number; y: number }) => {
    showToast({
      type: "coin",
      title: "💰 Points Gagnés !",
      message: reason,
      points
    });
    showFloatingPoints(points, position);
    triggerParticles("coins");
  };

  return {
    // Composants
    GameToast: () => activeToast && (
      <GameToast
        {...activeToast}
        isVisible={!!activeToast}
        onClose={() => setActiveToast(null)}
      />
    ),
    ParticleSystem: () => (
      <ParticleSystem isActive={showParticles} type={particleType} />
    ),
    FloatingPoints: () => (
      <FloatingPoints
        {...floatingPoints}
        onComplete={() => setFloatingPoints(prev => ({ ...prev, isVisible: false }))}
      />
    ),
    
    // Actions
    showToast,
    triggerParticles,
    showFloatingPoints,
    triggerLevelUp,
    triggerAchievement,
    triggerPointsEarned,
  };
}
