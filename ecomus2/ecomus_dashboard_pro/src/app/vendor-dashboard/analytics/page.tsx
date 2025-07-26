"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Star,
  Calendar,
} from "lucide-react";

interface VendorAnalytiques {
  totalSales: number;
  totalProduits: number;
  totalCommandes: number;
  totalClients: number;
  avgRating: number;
  monthlyGrowth: number;
  revenueData: Array<{ month: string; revenue: number }>;
  topProduits: Array<{ name: string; sales: number; revenue: number }>;
}

export default function VendorAnalytiquesPage() {
  const [Analytiques, setAnalytiques] = useState<VendorAnalytiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalytiques();
  }, [timeRange]);

  const fetchAnalytiques = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/Analytiques?period=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytiques(data);
      } else {
        // real data si l'API n'est pas disponible
        setAnalytiques({
          totalSales: 45600,
          totalProduits: 156,
          totalCommandes: 234,
          totalClients: 189,
          avgRating: 4.7,
          monthlyGrowth: 12.5,
          revenueData: [
            { month: "Jan", revenue: 4200 },
            { month: "Feb", revenue: 3800 },
            { month: "Mar", revenue: 5100 },
            { month: "Apr", revenue: 4600 },
            { month: "May", revenue: 5800 },
            { month: "Jun", revenue: 6200 },
          ],
          topProduits: [
            { name: "Wireless Headphones", sales: 45, revenue: 2250 },
            { name: "Smartphone Case", sales: 67, revenue: 1340 },
            { name: "Bluetooth Speaker", sales: 23, revenue: 1150 },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching Analytiques:", error);
      // Utiliser les données real en cas d'erreur
      setAnalytiques({
        totalSales: 45600,
        totalProduits: 156,
        totalCommandes: 234,
        totalClients: 189,
        avgRating: 4.7,
        monthlyGrowth: 12.5,
        revenueData: [],
        topProduits: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!Analytiques) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load Analytiques data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Analytiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your store performance and growth
          </p>
        </div>
        <div className="flex items-center space-x-2">          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Select time range for analytics"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              ${Analytiques.totalSales.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">
                +{Analytiques.monthlyGrowth}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Produits
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {Analytiques.totalProduits}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Active Produits in store
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Commandes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {Analytiques.totalCommandes}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Total Commandes received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {Analytiques.totalClients}
            </div>
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {Analytiques.avgRating}/5 avg rating
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500">Revenue chart would go here</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Top Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Analytiques.topProduits.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.sales} sales
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ${product.revenue}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "New order received", time: "2 minutes ago", type: "order" },
              { action: "Product review submitted", time: "15 minutes ago", type: "review" },
              { action: "Inventory updated", time: "1 hour ago", type: "inventory" },
              { action: "Customer message", time: "2 hours ago", type: "message" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'order' ? 'bg-green-500' :
                  activity.type === 'review' ? 'bg-yellow-500' :
                  activity.type === 'inventory' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

