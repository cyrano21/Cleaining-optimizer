/**
 * NOTE IMPORTANTE: Ce fichier contient des propriétés qui ressemblent à des propriétés CSS physiques
 * (width, height, strokeWidth) mais qui sont en réalité des props React spécifiques à la bibliothèque Recharts.
 * 
 * Ces propriétés ne doivent pas être converties en propriétés logiques CSS car elles font partie de l'API
 * de Recharts et ne sont pas des propriétés CSS standard. Les linters et extensions sont configurés
 * pour ignorer ces avertissements spécifiquement pour ce fichier.
 * 
 * Voir les fichiers de configuration:
 * - .eslintrc.json
 * - .vscode/settings.json
 * - .logical-properties
 * - .stylelintignore
 */

/* logical-properties-disable */
/* logical-properties-ignore-file */
/* stylelint-disable */
// Ce fichier utilise des props React spécifiques à la bibliothèque Recharts
// qui ressemblent à des propriétés CSS physiques mais ne le sont pas.
// Les propriétés comme width, height, strokeWidth sont des props React et non des propriétés CSS.
"use client"
import * as React from "react"
import { motion } from "framer-motion"
import "./charts.css"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { cn } from "@/lib/utils"

// Hook personnalisé pour les styles de tooltip
function useChartTooltipStyles() {
  const glassTooltip = {
    contentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)'
    }
  };

  const simpleTooltip = {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }
  };

  return { glassTooltip, simpleTooltip };
}

interface ChartProps {
  data: Record<string, unknown>[]
  className?: string
  height?: number
  loading?: boolean
}

// Fonction utilitaire pour obtenir la classe de hauteur appropriée
function getHeightClass(height?: number): string {
  if (!height) return '';
  const roundedHeight = Math.floor(height / 50) * 50;
  return `chart-height-${roundedHeight}`;
}

// Ces fonctions sont remplacées par le hook useChartTooltipStyles

interface LineChartProps extends ChartProps {
  xKey: string
  yKey: string
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
}

export function AnimatedLineChart({
  data,
  xKey,
  yKey,
  color = "#3b82f6",
  height = 300,
  showGrid = true,
  showTooltip = true,
  loading = false,
  className
}: LineChartProps) {
  // Utiliser notre hook personnalisé pour les styles de tooltip
  const { simpleTooltip } = useChartTooltipStyles();
  if (loading) {
    return (
      <div className={cn("chart-container chart-pulse", className, getHeightClass(height))}>
        <div className="chart-bg"></div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} className="custom-margin">
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey={xKey} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />          {showTooltip && (
            <Tooltip
              {...simpleTooltip}
            />
          )}          <Line
            type="monotone"            dataKey={yKey}
            stroke={color}            
            /* logical-properties-disable-next-line */
            strokeWidth={2}
            dot={{ 
              fill: color, 
              /* logical-properties-disable-next-line */
              strokeWidth: 2, 
              r: 4 
            }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

interface AreaChartProps extends ChartProps {
  xKey: string
  yKey: string
  color?: string
  fillOpacity?: number
}

export function AnimatedAreaChart({
  data,
  xKey,
  yKey,
  color = "#3b82f6",
  fillOpacity = 0.3,
  height = 300,
  loading = false,
  className
}: AreaChartProps) {
  // Utiliser notre hook personnalisé pour les styles de tooltip
  const { simpleTooltip } = useChartTooltipStyles();
  if (loading) {
    return (
      <div className={cn("chart-container chart-pulse", className, getHeightClass(height))}>
        <div className="chart-bg"></div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} className="custom-pie-margin">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />          <Tooltip
            {...simpleTooltip}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fillOpacity={fillOpacity}
            fill={color}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

interface BarChartProps extends ChartProps {
  xKey: string
  yKey: string
  color?: string
}

export function AnimatedBarChart({
  data,
  xKey,
  yKey,
  color = "#3b82f6",
  height = 300,
  loading = false,
  className
}: BarChartProps) {
  // Utiliser notre hook personnalisé pour les styles de tooltip
  const { simpleTooltip } = useChartTooltipStyles();

  if (loading) {
    return (
      <div className={cn("chart-container chart-pulse", className, getHeightClass(height))}>
        <div className="chart-bg"></div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} className="custom-bar-margin">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip
            {...simpleTooltip}
          />
          <Bar 
            dataKey={yKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

interface PieChartProps extends ChartProps {
  nameKey: string
  valueKey: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

export function AnimatedPieChart({
  data,
  /* nameKey, */ // Commenté car non utilisé
  valueKey,
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  className
}: PieChartProps) {
  // Utiliser notre hook personnalisé pour les styles de tooltip
  const { simpleTooltip } = useChartTooltipStyles();

  if (loading) {
    return (
      <div className={cn("chart-container chart-pulse", className, getHeightClass(height))}>
        <div className="chart-bg"></div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            {...simpleTooltip}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Composant unifié pour tous les types de graphiques
interface PieDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface ModernChartProps {
  type: "line" | "area" | "bar" | "pie";
  data: Record<string, unknown>[] | PieDataItem[];
  lines?: Array<{ dataKey: string; stroke: string; name: string }>;
  bars?: Array<{ dataKey: string; fill: string; name: string }>;
  height?: number;
  className?: string;
}

export function ModernChart({ 
  type, 
  data, 
  lines = [], 
  bars = [], 
  height = 300, 
  className 
}: ModernChartProps) {
  // Utiliser notre hook personnalisé pour les styles de tooltip
  const { glassTooltip } = useChartTooltipStyles();
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  if (type === "line") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("w-full", className)}
      >
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...glassTooltip}
            />
            {lines.map((line) => (
              <Line                key={line.dataKey}
                type="monotone"                dataKey={line.dataKey}
                stroke={line.stroke}                
                /* logical-properties-disable-next-line */
                strokeWidth={3}
                dot={{ 
                  fill: line.stroke, 
                  /* logical-properties-disable-next-line */
                  strokeWidth: 2, 
                  r: 6 
                }}
                activeDot={{ r: 8, stroke: line.stroke, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === "bar") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("w-full", className)}
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...glassTooltip}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === "pie") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("w-full", className)}
      >
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(entry.fill as string) || `hsl(${index * 45}, 70%, 60%)`} />
              ))}
            </Pie>
            <Tooltip
              {...glassTooltip}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return null;
}

// Exports des composants
export { AnimatedLineChart as LineChart }
export { AnimatedAreaChart as AreaChart }
export { AnimatedBarChart as BarChart }
export { AnimatedPieChart as PieChart }
