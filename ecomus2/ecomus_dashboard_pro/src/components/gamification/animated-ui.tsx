"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameSounds, useGameHaptics } from "@/hooks/useGameSounds";

// Animation pour les boutons interactifs
export function AnimatedButton({ 
  children, 
  onClick, 
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  successMessage,
  playSound = true,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  successMessage?: string;
  playSound?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const controls = useAnimation();
  const { playClickSound, playSuccessSound } = useGameSounds();
  const { lightVibration } = useGameHaptics();

  const handleClick = async () => {
    if (!onClick || disabled || isLoading) return;

    try {
      setIsLoading(true);
      
      // Effets sonores et haptiques
      if (playSound) {
        playClickSound();
        lightVibration();
      }
      
      // Animation de clic
      await controls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.15 }
      });

      await onClick();
      
      // Animation de succès
      if (successMessage) {
        setShowSuccess(true);
        if (playSound) {
          playSuccessSound();
        }
        await controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3, ease: "easeOut" }
        });
        
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      // Animation d'erreur
      await controls.start({
        x: [-5, 5, -5, 5, 0],
        transition: { duration: 0.4 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div animate={controls} className="relative">
      <Button
        variant={variant}
        size={size}
        className={`${className} ${isLoading ? 'opacity-70' : ''}`}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          />
        ) : null}
        {children}
      </Button>
      
      {/* Message de succès */}
      {showSuccess && successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
        >
          {successMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-green-500"></div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Carte avec effet de hover gamifié
export function GameCard({ 
  children, 
  className = "",
  hoverEffect = "lift",
  glowColor = "blue",
  onClick,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "bounce" | "rotate";
  glowColor?: "blue" | "green" | "purple" | "orange" | "red";
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const hoverAnimations = {
    lift: { y: -4, scale: 1.02 },
    glow: { scale: 1.02 },
    bounce: { y: [0, -8, 0], transition: { duration: 0.4 } },
    rotate: { rotate: 2, scale: 1.02 }
  };

  const glowColors = {
    blue: "shadow-blue-500/25",
    green: "shadow-green-500/25", 
    purple: "shadow-purple-500/25",
    orange: "shadow-orange-500/25",
    red: "shadow-red-500/25"
  };
  return (
    <motion.div
      whileHover={hoverAnimations[hoverEffect]}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <Card className={`
        ${className} 
        transition-all duration-200 
        hover:shadow-lg 
        ${hoverEffect === "glow" ? `hover:${glowColors[glowColor]}` : ''}
      `}>
        {children}
      </Card>
    </motion.div>
  );
}

// Compteur animé
export function AnimatedCounter({ 
  value, 
  duration = 1,
  prefix = "",
  suffix = "" 
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, color: "#10b981" }}
      animate={{ scale: 1, color: "inherit" }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Barre de progression animée
export function AnimatedProgressBar({ 
  value, 
  max = 100, 
  color = "blue",
  showPercentage = true,
  height = "h-2"
}: {
  value: number;
  max?: number;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  showPercentage?: boolean;
  height?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500", 
    orange: "bg-orange-500",
    red: "bg-red-500"
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between text-sm mb-1">
          <span>Progression</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <motion.div
          className={`${height} ${colors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Animation de confettis
export function ConfettiExplosion({ 
  trigger,
  colors = ["#f43f5e", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]
}: {
  trigger: boolean;
  colors?: string[];
}) {
  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: "50%",
            top: "50%"
          }}
          initial={{ 
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0
          }}
          animate={{ 
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Effet de pulsation pour attirer l'attention
export function PulseEffect({ 
  children, 
  active = true,
  color = "blue",
  intensity = "medium"
}: {
  children: React.ReactNode;
  active?: boolean;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  intensity?: "low" | "medium" | "high";
}) {
  const intensityMap = {
    low: { scale: [1, 1.02, 1] },
    medium: { scale: [1, 1.05, 1] },
    high: { scale: [1, 1.1, 1] }
  };

  const colorMap = {
    blue: "shadow-blue-500/50",
    green: "shadow-green-500/50",
    purple: "shadow-purple-500/50", 
    orange: "shadow-orange-500/50",
    red: "shadow-red-500/50"
  };

  return (
    <motion.div
      animate={active ? {
        ...intensityMap[intensity],
        boxShadow: active ? [
          "0 0 0 0 rgba(59, 130, 246, 0.7)",
          "0 0 0 10px rgba(59, 130, 246, 0)",
          "0 0 0 0 rgba(59, 130, 246, 0)"
        ] : undefined
      } : {}}
      transition={{
        duration: 2,
        repeat: active ? Infinity : 0,
        ease: "easeInOut"
      }}
      className={active ? colorMap[color] : ""}
    >
      {children}
    </motion.div>
  );
}
