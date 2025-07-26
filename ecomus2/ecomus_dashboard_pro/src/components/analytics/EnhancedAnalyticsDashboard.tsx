'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Target,
  Zap,
  Clock,
  Star,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalVendors: number;
    totalProducts: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    monthlyGrowth: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
    vendors: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    orders: number;
    growth: number;
    vendors: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    name: string;
    revenue: number;
    orders: number;
    rating: number;
    growth: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
    topCustomerSegments: Array<{
      segment: string;
      count: number;
      value: number;
    }>;
  };
  geographicData: Array<{
    region: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
  performanceMetrics: {
    pageLoadTime: number;
    serverUptime: number;
    errorRate: number;
    apiResponseTime: number;
    mobileBounceRate: number;
    desktopBounceRate: number;
  };
  inventoryMetrics: {
    lowStockProducts: number;
    outOfStockProducts: number;
    totalSkus: number;
    averageStockLevel: number;
    stockTurnoverRate: number;
  };
}

interface EnhancedAnalyticsDashboardProps {
  storeId?: string;
  vendorId?: string;
  className?: string;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

export function EnhancedAnalyticsDashboard({ 
  storeId, 
  vendorId, 
  className 
}: EnhancedAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, vendorId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API endpoint
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 1247890.75,
          totalOrders: 8234,
          totalVendors: 156,
          totalProducts: 4567,
          totalCustomers: 12890,
          averageOrderValue: 151.50,
          conversionRate: 3.8,
          monthlyGrowth: 12.5
        },
        revenueByMonth: [
          { month: "Jan", revenue: 89750, orders: 567, vendors: 45 },
          { month: "Feb", revenue: 95230, orders: 612, vendors: 48 },
          { month: "Mar", revenue: 108450, orders: 689, vendors: 52 },
          { month: "Apr", revenue: 125670, orders: 798, vendors: 58 },
          { month: "May", revenue: 134890, orders: 845, vendors: 61 },
          { month: "Jun", revenue: 147320, orders: 923, vendors: 67 }
        ],
        categoryPerformance: [
          { category: "Electronics", revenue: 456789.25, orders: 2890, growth: 15.2, vendors: 34 },
          { category: "Fashion", revenue: 298765.50, orders: 1567, growth: 8.7, vendors: 28 },
          { category: "Home & Garden", revenue: 234567.80, orders: 1289, growth: 12.3, vendors: 19 },
          { category: "Sports & Fitness", revenue: 187654.20, orders: 945, growth: 18.9, vendors: 15 }
        ],
        topVendors: [
          { vendorId: "vendor_001", name: "TechGear Pro", revenue: 284750.50, orders: 1823, rating: 4.8, growth: 22.1 },
          { vendorId: "vendor_003", name: "Home Comfort Solutions", revenue: 234567.80, orders: 1289, rating: 4.7, growth: 18.5 },
          { vendorId: "vendor_002", name: "Fashion Forward", revenue: 198432.25, orders: 1156, rating: 4.6, growth: 15.3 },
          { vendorId: "vendor_004", name: "Fitness Elite", revenue: 156789.50, orders: 743, rating: 4.9, growth: 28.7 }
        ],
        orderStatusDistribution: [
          { status: "delivered", count: 4567, percentage: 55.4 },
          { status: "shipped", count: 1234, percentage: 15.0 },
          { status: "processing", count: 987, percentage: 12.0 },
          { status: "pending", count: 789, percentage: 9.6 },
          { status: "cancelled", count: 456, percentage: 5.5 },
          { status: "returned", count: 201, percentage: 2.5 }
        ],
        customerMetrics: {
          newCustomers: 1234,
          returningCustomers: 2890,
          customerRetentionRate: 68.5,
          averageLifetimeValue: 285.75,
          topCustomerSegments: [
            { segment: "Premium", count: 567, value: 125670 },
            { segment: "Regular", count: 3456, value: 234890 },
            { segment: "New", count: 1890, value: 98760 }
          ]
        },
        geographicData: [
          { region: "North America", revenue: 567890, orders: 3456, percentage: 45.5 },
          { region: "Europe", revenue: 345678, orders: 2234, percentage: 27.7 },
          { region: "Asia Pacific", revenue: 234567, orders: 1567, percentage: 18.8 },
          { region: "Others", revenue: 99755, orders: 977, percentage: 8.0 }
        ],
        performanceMetrics: {
          pageLoadTime: 2.3,
          serverUptime: 99.8,
          errorRate: 0.2,
          apiResponseTime: 150,
          mobileBounceRate: 23.5,
          desktopBounceRate: 18.7
        },
        inventoryMetrics: {
          lowStockProducts: 89,
          outOfStockProducts: 23,
          totalSkus: 4567,
          averageStockLevel: 127.5,
          stockTurnoverRate: 6.8
        }
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    trend = 'up',
    description
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(val);
        case 'percentage':
          return `${val.toFixed(1)}%`;
        default:
          return new Intl.NumberFormat('en-US').format(val);
      }
    };

    const getTrendColor = () => {
      switch (trend) {
        case 'up': return 'text-green-600 dark:text-green-400';
        case 'down': return 'text-red-600 dark:text-red-400';
        default: return 'text-gray-600 dark:text-gray-400';
      }
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Target;

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={`flex items-center ${getTrendColor()}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {change !== undefined ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(value)}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enhanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your e-commerce performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            variant={comparisonMode ? "default" : "outline"}
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare Periods
          </Button>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analytics.overview.totalRevenue}
          change={analytics.overview.monthlyGrowth}
          icon={DollarSign}
          format="currency"
          trend="up"
          description="Month over month"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.overview.totalOrders}
          change={8.2}
          icon={ShoppingCart}
          trend="up"
          description="All time orders"
        />
        <MetricCard
          title="Active Vendors"
          value={analytics.overview.totalVendors}
          change={5.1}
          icon={Users}
          trend="up"
          description="Registered vendors"
        />
        <MetricCard
          title="Total Products"
          value={analytics.overview.totalProducts}
          change={12.8}
          icon={Package}
          trend="up"
          description="Listed products"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Order Value"
          value={analytics.overview.averageOrderValue}
          change={3.2}
          icon={DollarSign}
          format="currency"
          trend="up"
          description="Per order average"
        />
        <MetricCard
          title="Conversion Rate"
          value={analytics.overview.conversionRate}
          change={-0.5}
          icon={Target}
          format="percentage"
          trend="down"
          description="Visitor to customer"
        />
        <MetricCard
          title="Customer Retention"
          value={analytics.customerMetrics.customerRetentionRate}
          change={2.1}
          icon={Users}
          format="percentage"
          trend="up"
          description="Returning customers"
        />
        <MetricCard
          title="Inventory Turnover"
          value={analytics.inventoryMetrics.stockTurnoverRate}
          change={1.8}
          icon={Package}
          format="number"
          trend="up"
          description="Times per year"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Revenue Trend Analysis
              <Badge variant="secondary">Last 6 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                <YAxis 
                  yAxisId="revenue"
                  className="text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => `$${(value / 1000)}k`}
                />
                <YAxis 
                  yAxisId="orders"
                  orientation="right"
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={3}
                  name="Revenue"
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill="#10B981"
                  opacity={0.6}
                  name="Orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance and Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  className="text-gray-600 dark:text-gray-400"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => `$${(value / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topVendors.map((vendor, index) => (
                <div key={vendor.vendorId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {vendor.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vendor.orders} orders • {vendor.rating}⭐
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${vendor.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="text-sm">+{vendor.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic and Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.geographicData.map((region, index) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {region.region}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${region.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {region.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.customerMetrics.topCustomerSegments.map((segment, index) => (
                <div key={segment.segment} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {segment.segment}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {segment.count} customers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${segment.value.toLocaleString()}
                    </span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(segment.value / Math.max(...analytics.customerMetrics.topCustomerSegments.map(s => s.value))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.serverUptime}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Page Load Time</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.pageLoadTime}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Response</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.apiResponseTime}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.errorRate}%
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {((analytics.performanceMetrics.serverUptime + (100 - analytics.performanceMetrics.errorRate)) / 2).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Overall Health Score
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Package className="h-6 w-6 mb-2" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span>Add Vendor</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Full Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedAnalyticsDashboard;
