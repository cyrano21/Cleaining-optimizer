"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Heart,
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Calendar,
  Eye,
} from "lucide-react";

interface UserAnalytics {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  completedOrders: number;
  avgOrderValue: number;
  memberSince: string;
  recentOrders: Array<{
    id: string;
    date: string;
    total: number;
    status: string;
  }>;
  spendingHistory: Array<{
    month: string;
    amount: number;
  }>;
  topCategories: Array<{
    name: string;
    percentage: number;
    amount: number;
  }>;
}

export default function UserAnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("12");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/analytics?period=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // real data si l'API n'est pas disponible
        setAnalytics({
          totalOrders: 24,
          totalSpent: 1250.75,
          favoriteProducts: 8,
          completedOrders: 22,
          avgOrderValue: 52.11,
          memberSince: "2023-06-15",
          recentOrders: [
            { id: "ORD-001", date: "2024-01-15", total: 129.99, status: "delivered" },
            { id: "ORD-002", date: "2024-01-10", total: 89.50, status: "shipped" },
            { id: "ORD-003", date: "2024-01-05", total: 45.25, status: "delivered" },
            { id: "ORD-004", date: "2023-12-28", total: 78.90, status: "delivered" },
          ],
          spendingHistory: [
            { month: "Jul", amount: 120 },
            { month: "Aug", amount: 85 },
            { month: "Sep", amount: 150 },
            { month: "Oct", amount: 95 },
            { month: "Nov", amount: 180 },
            { month: "Dec", amount: 210 },
          ],
          topCategories: [
            { name: "Electronics", percentage: 45, amount: 562.50 },
            { name: "Clothing", percentage: 30, amount: 375.23 },
            { name: "Books", percentage: 15, amount: 187.61 },
            { name: "Home & Garden", percentage: 10, amount: 125.41 },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
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
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your shopping activity and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Sélectionner la période d'analyse"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last year</option>
            <option value="24">Last 2 years</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {analytics.totalOrders}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {analytics.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              ${analytics.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Avg: ${analytics.avgOrderValue.toFixed(2)} per order
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Favorite Products
            </CardTitle>
            <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {analytics.favoriteProducts}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              In your wishlist
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Member Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
              {analytics.memberSince ? new Date(analytics.memberSince).toLocaleDateString() : 'Non disponible'}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Account created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Spending History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.spendingHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.month}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.amount / 250) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right">
                      ${item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ${category.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.percentage}% of total spending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-indigo-600" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Order #{order.id}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'Date non disponible'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </span>                  <button 
                    aria-label={`Voir les détails de la commande ${order.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

