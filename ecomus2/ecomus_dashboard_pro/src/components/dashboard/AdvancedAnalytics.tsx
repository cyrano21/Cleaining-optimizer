'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Package,
  Star,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    visitors: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    image: string;
  }>;
  topCategories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  customerData: Array<{
    date: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    conversions: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

interface AdvancedAnalyticsProps {
  storeId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics({ storeId }: AdvancedAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [storeId, dateRange, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        ...(storeId && { storeId })
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        // Données de démonstration si l'API n'est pas disponible
        setData(generateMockData());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setData(generateMockData());
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (): AnalyticsData => {
    const salesData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 500) + 100
      };
    });

    return {
      overview: {
        totalRevenue: 125430,
        totalOrders: 1247,
        totalCustomers: 892,
        totalProducts: 156,
        conversionRate: 3.2,
        averageOrderValue: 100.58,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3
      },
      salesData,
      topProducts: [
        { id: '1', name: 'iPhone 15 Pro', sales: 145, revenue: 145000, image: '/images/iphone.jpg' },
        { id: '2', name: 'MacBook Air M2', sales: 89, revenue: 89000, image: '/images/macbook.jpg' },
        { id: '3', name: 'AirPods Pro', sales: 234, revenue: 58500, image: '/images/airpods.jpg' },
        { id: '4', name: 'iPad Pro', sales: 67, revenue: 53600, image: '/images/ipad.jpg' },
        { id: '5', name: 'Apple Watch', sales: 123, revenue: 49200, image: '/images/watch.jpg' }
      ],
      topCategories: [
        { name: 'Électronique', value: 45, color: '#0088FE' },
        { name: 'Vêtements', value: 25, color: '#00C49F' },
        { name: 'Maison', value: 15, color: '#FFBB28' },
        { name: 'Sport', value: 10, color: '#FF8042' },
        { name: 'Autres', value: 5, color: '#8884D8' }
      ],
      customerData: salesData.map(item => ({
        date: item.date,
        newCustomers: Math.floor(Math.random() * 20) + 5,
        returningCustomers: Math.floor(Math.random() * 30) + 10
      })),
      trafficSources: [
        { source: 'Google', visitors: 2450, conversions: 78, revenue: 7800 },
        { source: 'Facebook', visitors: 1230, conversions: 45, revenue: 4500 },
        { source: 'Direct', visitors: 890, conversions: 67, revenue: 6700 },
        { source: 'Instagram', visitors: 567, conversions: 23, revenue: 2300 },
        { source: 'Email', visitors: 345, conversions: 34, revenue: 3400 }
      ],
      recentOrders: [
        { id: '#1001', customer: 'Jean Dupont', amount: 299.99, status: 'completed', date: '2025-01-09' },
        { id: '#1002', customer: 'Marie Martin', amount: 149.50, status: 'processing', date: '2025-01-09' },
        { id: '#1003', customer: 'Pierre Durand', amount: 89.99, status: 'shipped', date: '2025-01-08' },
        { id: '#1004', customer: 'Sophie Bernard', amount: 199.99, status: 'completed', date: '2025-01-08' },
        { id: '#1005', customer: 'Michel Petit', amount: 349.99, status: 'processing', date: '2025-01-08' }
      ]
    };
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        format,
        period: selectedPeriod,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        ...(storeId && { storeId })
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Rapport ${format.toUpperCase()} téléchargé`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export des données');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Avancés</h1>
          <p className="text-gray-600">Tableau de bord des performances de votre boutique</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPeriod === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}
          
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
          
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className={`text-sm flex items-center ${
                  data.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.overview.revenueGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {formatPercentage(data.overview.revenueGrowth)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</p>
                <p className={`text-sm flex items-center ${
                  data.overview.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.overview.ordersGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {formatPercentage(data.overview.ordersGrowth)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  Taux de conversion: {data.overview.conversionRate}%
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.averageOrderValue)}</p>
                <p className="text-sm text-gray-500">
                  {data.overview.totalProducts} produits
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des ventes */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des ventes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par catégories */}
            <Card>
              <CardHeader>
                <CardTitle>Ventes par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.topCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des ventes détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    name="Chiffre d'affaires"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
                    name="Commandes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} ventes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acquisition de clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newCustomers" stackId="a" fill="#8884d8" name="Nouveaux clients" />
                  <Bar dataKey="returningCustomers" stackId="a" fill="#82ca9d" name="Clients fidèles" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sources de trafic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-gray-600">
                        {source.visitors.toLocaleString()} visiteurs • {source.conversions} conversions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(source.revenue)}</p>
                      <p className="text-sm text-gray-600">
                        {((source.conversions / source.visitors) * 100).toFixed(1)}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

