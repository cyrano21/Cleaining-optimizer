'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'

export interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    averageSessionDuration: number
    bounceRate: number
    conversionRate: number
    pageLoadTime: number
  }
  traffic: {
    date: string
    views: number
    visitors: number
    sessions: number
  }[]
  devices: {
    name: string
    value: number
    color: string
  }[]
  browsers: {
    name: string
    value: number
    percentage: number
  }[]
  locations: {
    country: string
    visitors: number
    percentage: number
  }[]
  pages: {
    path: string
    views: number
    uniqueViews: number
    averageTime: number
    bounceRate: number
  }[]
  performance: {
    metric: string
    value: number
    target: number
    status: 'good' | 'needs-improvement' | 'poor'
  }[]
  realtime: {
    activeUsers: number
    currentPages: {
      path: string
      users: number
    }[]
    traffic: {
      timestamp: string
      users: number
    }[]
  }
}

interface AnalyticsDashboardProps {
  projectId: string
  timeRange: '24h' | '7d' | '30d' | '90d'
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void
}

const DEVICE_COLORS = {
  Desktop: '#3b82f6',
  Mobile: '#10b981',
  Tablet: '#f59e0b'
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalViews: 12543,
    uniqueVisitors: 8921,
    averageSessionDuration: 245,
    bounceRate: 32.5,
    conversionRate: 4.2,
    pageLoadTime: 1.8
  },
  traffic: [
    { date: '2024-01-01', views: 1200, visitors: 800, sessions: 950 },
    { date: '2024-01-02', views: 1350, visitors: 920, sessions: 1100 },
    { date: '2024-01-03', views: 1100, visitors: 750, sessions: 850 },
    { date: '2024-01-04', views: 1450, visitors: 980, sessions: 1200 },
    { date: '2024-01-05', views: 1600, visitors: 1100, sessions: 1350 },
    { date: '2024-01-06', views: 1800, visitors: 1250, sessions: 1500 },
    { date: '2024-01-07', views: 2100, visitors: 1400, sessions: 1750 }
  ],
  devices: [
    { name: 'Desktop', value: 65, color: DEVICE_COLORS.Desktop },
    { name: 'Mobile', value: 28, color: DEVICE_COLORS.Mobile },
    { name: 'Tablet', value: 7, color: DEVICE_COLORS.Tablet }
  ],
  browsers: [
    { name: 'Chrome', value: 4521, percentage: 68.2 },
    { name: 'Safari', value: 1234, percentage: 18.6 },
    { name: 'Firefox', value: 567, percentage: 8.5 },
    { name: 'Edge', value: 234, percentage: 3.5 },
    { name: 'Other', value: 89, percentage: 1.2 }
  ],
  locations: [
    { country: 'United States', visitors: 3456, percentage: 38.7 },
    { country: 'United Kingdom', visitors: 1234, percentage: 13.8 },
    { country: 'Germany', visitors: 987, percentage: 11.1 },
    { country: 'France', visitors: 765, percentage: 8.6 },
    { country: 'Canada', visitors: 543, percentage: 6.1 }
  ],
  pages: [
    { path: '/', views: 4521, uniqueViews: 3456, averageTime: 180, bounceRate: 25.3 },
    { path: '/about', views: 2134, uniqueViews: 1876, averageTime: 145, bounceRate: 35.7 },
    { path: '/contact', views: 1567, uniqueViews: 1234, averageTime: 120, bounceRate: 42.1 },
    { path: '/blog', views: 1234, uniqueViews: 987, averageTime: 200, bounceRate: 28.9 },
    { path: '/products', views: 987, uniqueViews: 765, averageTime: 165, bounceRate: 31.2 }
  ],
  performance: [
    { metric: 'First Contentful Paint', value: 1.2, target: 1.8, status: 'good' },
    { metric: 'Largest Contentful Paint', value: 2.1, target: 2.5, status: 'good' },
    { metric: 'First Input Delay', value: 45, target: 100, status: 'good' },
    { metric: 'Cumulative Layout Shift', value: 0.08, target: 0.1, status: 'good' },
    { metric: 'Time to Interactive', value: 3.2, target: 3.8, status: 'good' }
  ],
  realtime: {
    activeUsers: 127,
    currentPages: [
      { path: '/', users: 45 },
      { path: '/about', users: 23 },
      { path: '/contact', users: 18 },
      { path: '/blog', users: 15 },
      { path: '/products', users: 12 }
    ],
    traffic: [
      { timestamp: '10:00', users: 89 },
      { timestamp: '10:05', users: 95 },
      { timestamp: '10:10', users: 102 },
      { timestamp: '10:15', users: 118 },
      { timestamp: '10:20', users: 127 }
    ]
  }
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projectId,
  timeRange,
  onTimeRangeChange
}) => {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string>('views')

  useEffect(() => {
    loadAnalyticsData()
  }, [projectId, timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from your analytics API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setData(mockAnalyticsData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getPerformanceColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPerformanceIcon = (status: 'good' | 'needs-improvement' | 'poor') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const renderOverviewCard = (title: string, value: string | number, icon: React.ReactNode, change?: number) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Track your project's performance and user engagement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.realtime.activeUsers}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Active users right now</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top Pages</h4>
                {data.realtime.currentPages.map(page => (
                  <div key={page.path} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{page.path}</span>
                    <span className="font-medium">{page.users} users</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.realtime.traffic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {renderOverviewCard(
          'Total Views',
          formatNumber(data.overview.totalViews),
          <Eye className="h-5 w-5 text-primary" />,
          12.5
        )}
        {renderOverviewCard(
          'Unique Visitors',
          formatNumber(data.overview.uniqueVisitors),
          <Users className="h-5 w-5 text-primary" />,
          8.3
        )}
        {renderOverviewCard(
          'Avg. Session',
          formatDuration(data.overview.averageSessionDuration),
          <Clock className="h-5 w-5 text-primary" />,
          -2.1
        )}
        {renderOverviewCard(
          'Bounce Rate',
          `${data.overview.bounceRate}%`,
          <Target className="h-5 w-5 text-primary" />,
          -5.2
        )}
        {renderOverviewCard(
          'Conversion Rate',
          `${data.overview.conversionRate}%`,
          <TrendingUp className="h-5 w-5 text-primary" />,
          15.7
        )}
        {renderOverviewCard(
          'Page Load Time',
          `${data.overview.pageLoadTime}s`,
          <Zap className="h-5 w-5 text-primary" />,
          -8.9
        )}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Traffic Overview</CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="visitors">Visitors</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.traffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.devices}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {data.devices.map(device => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: device.color }}
                        />
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <span className="text-sm font-medium">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.locations.map(location => (
                    <div key={location.country} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{location.country}</span>
                        <span className="font-medium">
                          {formatNumber(location.visitors)} ({location.percentage}%)
                        </span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Browser Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.browsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Page</th>
                      <th className="text-right p-2">Views</th>
                      <th className="text-right p-2">Unique Views</th>
                      <th className="text-right p-2">Avg. Time</th>
                      <th className="text-right p-2">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map(page => (
                      <tr key={page.path} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{page.path}</td>
                        <td className="p-2 text-right">{formatNumber(page.views)}</td>
                        <td className="p-2 text-right">{formatNumber(page.uniqueViews)}</td>
                        <td className="p-2 text-right">{formatDuration(page.averageTime)}</td>
                        <td className="p-2 text-right">{page.bounceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.map(metric => (
                  <div key={metric.metric} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPerformanceIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}{metric.metric.includes('Paint') || metric.metric.includes('Interactive') ? 's' : metric.metric.includes('Delay') ? 'ms' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(metric.status)}`}>
                        {metric.value}{metric.metric.includes('Paint') || metric.metric.includes('Interactive') ? 's' : metric.metric.includes('Delay') ? 'ms' : ''}
                      </div>
                      <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'needs-improvement' ? 'secondary' : 'destructive'}>
                        {metric.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}