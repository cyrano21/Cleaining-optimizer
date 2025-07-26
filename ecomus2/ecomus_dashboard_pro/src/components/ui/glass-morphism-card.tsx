// TypeScript React component for glass morphism card effect
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassMorphismCardProps {
  children: ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: number;
  border?: boolean;
  shadow?: "sm" | "md" | "lg" | "xl" | "2xl";
  hoverEffect?: boolean;
  gradient?: "blue" | "purple" | "pink" | "green" | "orange" | "cyan";
}

const blurClasses = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md", 
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl"
};

const shadowClasses = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl"
};

const gradientClasses = {
  blue: "bg-gradient-to-br from-blue-50/90 via-white/80 to-cyan-50/90 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-cyan-950/40",
  purple: "bg-gradient-to-br from-purple-50/90 via-white/80 to-pink-50/90 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-pink-950/40",
  pink: "bg-gradient-to-br from-pink-50/90 via-white/80 to-rose-50/90 dark:from-pink-950/40 dark:via-slate-900/60 dark:to-rose-950/40",
  green: "bg-gradient-to-br from-green-50/90 via-white/80 to-emerald-50/90 dark:from-green-950/40 dark:via-slate-900/60 dark:to-emerald-950/40",
  orange: "bg-gradient-to-br from-orange-50/90 via-white/80 to-yellow-50/90 dark:from-orange-950/40 dark:via-slate-900/60 dark:to-yellow-950/40",
  cyan: "bg-gradient-to-br from-cyan-50/90 via-white/80 to-blue-50/90 dark:from-cyan-950/40 dark:via-slate-900/60 dark:to-blue-950/40"
};

export function GlassMorphismCard({
  children,
  className = "",
  blur = "md",
  opacity = 0.8,
  border = true,
  shadow = "lg",
  hoverEffect = true,
  gradient = "blue"
}: GlassMorphismCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl p-6",
        blurClasses[blur],
        shadowClasses[shadow],
        gradientClasses[gradient],
        border && "border border-white/20 dark:border-white/10 border-gray-200/60",
        hoverEffect && "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-white/30",
        "backdrop-saturate-150",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: opacity, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={hoverEffect ? { y: -4 } : undefined}
    >
      {/* Noise texture overlay for more realistic glass effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-20 mix-blend-overlay pointer-events-none noise-texture"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none" />
    </motion.div>
  );
}

export default GlassMorphismCard;
export { GlassMorphismCard as GlassmorphismCard };
