"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  AlertTriangle,
  Target
} from 'lucide-react';
import { GlassmorphismCard } from './glass-morphism-card';
import { AnimatedNumber } from './animated-number';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'pink' | 'indigo';
  format?: 'number' | 'currency' | 'percentage';
  size?: 'small' | 'medium' | 'large';
}

const colorConfig = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    accent: 'text-blue-600'
  },
  green: {
    bg: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    icon: 'text-green-500',
    accent: 'text-green-600'
  },
  red: {
    bg: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    icon: 'text-red-500',
    accent: 'text-red-600'
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-500',
    accent: 'text-purple-600'
  },
  orange: {
    bg: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-500',
    accent: 'text-orange-600'
  },
  teal: {
    bg: 'from-teal-500/20 to-teal-600/10',
    border: 'border-teal-500/30',
    icon: 'text-teal-500',
    accent: 'text-teal-600'
  },
  pink: {
    bg: 'from-pink-500/20 to-pink-600/10',
    border: 'border-pink-500/30',
    icon: 'text-pink-500',
    accent: 'text-pink-600'
  },
  indigo: {
    bg: 'from-indigo-500/20 to-indigo-600/10',
    border: 'border-indigo-500/30',
    icon: 'text-indigo-500',
    accent: 'text-indigo-600'
  }
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  color, 
  format = 'number',
  size = 'medium'
}: MetricCardProps) {
  const config = colorConfig[color];
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `€${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <GlassmorphismCard 
        className={`${sizeClasses[size]} h-full bg-gradient-to-br ${config.bg} border ${config.border} hover:shadow-lg transition-all duration-300`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-white/10 ${config.icon}`}>
                {icon}
              </div>
              <h3 className="text-sm font-medium text-gray-600 truncate">
                {title}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${config.accent}`}>
                {typeof value === 'number' ? (
                  <AnimatedNumber 
                    value={value} 
                    duration={1000}
                  />
                ) : (
                  formatValue(value)
                )}
              </div>
              
              {subtitle && (
                <p className="text-xs text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">
                {trend.label}
              </span>
            </div>
          </div>
        )}
      </GlassmorphismCard>
    </motion.div>
  );
}

// Composant pour une grille de métriques
interface MetricGridProps {
  metrics: (Omit<MetricCardProps, 'icon'> & { iconType: string })[];
  columns?: number;
}

const iconMap = {
  users: Users,
  orders: ShoppingCart,
  revenue: DollarSign,
  products: Package,
  warning: AlertTriangle,
  target: Target,
  trending_up: TrendingUp,
  trending_down: TrendingDown
};

export function MetricGrid({ metrics, columns = 3 }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {metrics.map((metric, index) => {
        const IconComponent = iconMap[metric.iconType as keyof typeof iconMap] || Users;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard
              {...metric}
              icon={<IconComponent className="h-5 w-5" />}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// Composant pour afficher des métriques de comparaison
interface ComparisonMetricProps {
  title: string;
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percentage';
  color: MetricCardProps['color'];
  icon: React.ReactNode;
}

export function ComparisonMetric({
  title,
  current,
  previous,
  format = 'number',
  color,
  icon
}: ComparisonMetricProps) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <MetricCard
      title={title}
      value={current}
      format={format}
      color={color}
      icon={icon}
      trend={{
        value: Math.abs(Math.round(change * 100) / 100),
        isPositive,
        label: 'vs période précédente'
      }}
    />
  );
}
