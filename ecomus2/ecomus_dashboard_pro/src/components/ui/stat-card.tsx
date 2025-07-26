"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  color?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  loading = false,
  className,
  onClick
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "p-6 bg-white rounded-xl border border-gray-200 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.01]",
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span className={cn(
                "inline-block w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent",
                trend.isPositive 
                  ? "border-b-[4px] border-b-green-600" 
                  : "border-t-[4px] border-t-red-600"
              )}></span>
              {Math.abs(trend.value)}%
              {trend.label && <span className="text-gray-500">{trend.label}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface MetricGridProps {
  children: React.ReactNode
  className?: string
}

export function MetricGrid({ children, className }: MetricGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {children}
    </div>
  )
}
