"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse" | "skeleton"
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
}

export function Loader({ size = "md", variant = "spinner", className }: LoaderProps) {
  if (variant === "spinner") {
    return (
      <motion.div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full bg-current",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn(
          "rounded-full bg-current",
          sizeClasses[size],
          className
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  }

  // Skeleton variant
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", sizeClasses[size], className)} />
  )
}

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-4 bg-gray-200 rounded animate-pulse",
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  const baseClasses = {
    text: "h-4 w-full",
    circular: "rounded-full aspect-square",
    rectangular: "w-full h-12"
  }

  return (
    <motion.div
      className={cn(
        "bg-gray-200 animate-pulse",
        baseClasses[variant],
        className
      )}
      style={{ width, height }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

// Composant ModernLoader pour un design moderne
interface ModernLoaderProps {
  size?: "sm" | "md" | "lg" | "small" | "medium" | "large"
  variant?: "pulse" | "spin"
  type?: "pulse" | "spin"  // Pour la rétrocompatibilité
  className?: string
}

export function ModernLoader({ size = "md", variant, type, className }: ModernLoaderProps) {
  // Normaliser la taille
  let normalizedSize = size;
  if (size === "small") normalizedSize = "sm";
  if (size === "medium") normalizedSize = "md";
  if (size === "large") normalizedSize = "lg";
  
  // Utiliser variant ou type (pour la rétrocompatibilité)
  const animationType = variant || type || "spin";
  
  const sizeConfig = {
    sm: { outer: "w-6 h-6", inner: "w-3 h-3" },
    md: { outer: "w-8 h-8", inner: "w-4 h-4" },
    lg: { outer: "w-12 h-12", inner: "w-6 h-6" }
  }

  if (animationType === "pulse") {
    return (
      <div className={cn("relative flex items-center justify-center", sizeConfig[normalizedSize as "sm" | "md" | "lg"].outer, className)}>
        <motion.div
          className={cn(
            "bg-blue-500 rounded-full",
            sizeConfig[normalizedSize as "sm" | "md" | "lg"].outer
          )}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    )
  }

  return (
    <div className={cn("relative flex items-center justify-center", sizeConfig[normalizedSize as "sm" | "md" | "lg"].outer, className)}>
      <motion.div
        className={cn(
          "border-2 border-blue-200 border-t-blue-600 rounded-full",
          sizeConfig[normalizedSize as "sm" | "md" | "lg"].outer
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={cn(
          "absolute border-2 border-purple-200 border-t-purple-600 rounded-full",
          sizeConfig[normalizedSize as "sm" | "md" | "lg"].inner
        )}
        animate={{ rotate: -360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}
