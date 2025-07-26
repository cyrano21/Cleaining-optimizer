"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
  LineChart,
  Line,
} from "recharts";
import {
  Eye,
  Play,
  RotateCw,
  Box,
  TrendingUp,
  Download,
  Share2,
  Clock,
  Users,
  MousePointer,
  Zap,
} from "lucide-react";

interface MediaAnalytics {
  totalProducts: number;
  productsWithMedia: {
    images360: number;
    models3D: number;
    videos: number;
  };
  viewStats: {
    type: "images360" | "models3D" | "videos";
    views: number;
    interactions: number;
    avgTimeSpent: number;
  }[];
  topPerformingMedia: {
    productId: string;
    productName: string;
    mediaType: string;
    views: number;
    conversionRate: number;
  }[];
  usageOverTime: {
    date: string;
    views360: number;
    views3D: number;
    videoViews: number;
  }[];
}

export const MediaAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<MediaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/media?range=${timeRange}`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const mediaTypeData = analytics
    ? [
        {
          name: "Vues 360°",
          value: analytics.productsWithMedia.images360,
          color: "#3B82F6",
        },
        {
          name: "Modèles 3D",
          value: analytics.productsWithMedia.models3D,
          color: "#10B981",
        },
        {
          name: "Vidéos",
          value: analytics.productsWithMedia.videos,
          color: "#F59E0B",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics des Médias</h1>
          <p className="text-gray-600">
            Performance et utilisation des médias 360°, 3D et vidéos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            title="Sélectionner la période d'analyse"
            aria-label="Période d'analyse"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Produits avec Médias
                </p>
                <p className="text-2xl font-bold">
                  {analytics
                    ? analytics.productsWithMedia.images360 +
                      analytics.productsWithMedia.models3D +
                      analytics.productsWithMedia.videos
                    : 0}
                </p>
                <p className="text-xs text-gray-500">
                  sur {analytics?.totalProducts || 0} produits
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues 360°</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.productsWithMedia.images360 || 0}
                </p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% vs période précédente
                </p>
              </div>
              <RotateCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles 3D</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.productsWithMedia.models3D || 0}
                </p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8% vs période précédente
                </p>
              </div>
              <Box className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vidéos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics?.productsWithMedia.videos || 0}
                </p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +15% vs période précédente
                </p>
              </div>
              <Play className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Media Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Types de Médias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mediaTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                  }
                >
                  {mediaTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisation dans le Temps</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.usageOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views360"
                  stroke="#3B82F6"
                  name="Vues 360°"
                />
                <Line
                  type="monotone"
                  dataKey="views3D"
                  stroke="#10B981"
                  name="Vues 3D"
                />
                <Line
                  type="monotone"
                  dataKey="videoViews"
                  stroke="#F59E0B"
                  name="Vues Vidéo"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Produits par Performance Média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Produit</th>
                  <th className="text-left p-3">Type de Média</th>
                  <th className="text-left p-3">Vues</th>
                  <th className="text-left p-3">Taux de Conversion</th>
                  <th className="text-left p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.topPerformingMedia.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.productName}</td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {item.mediaType === "images360" && (
                          <RotateCw className="h-3 w-3 mr-1" />
                        )}
                        {item.mediaType === "models3D" && (
                          <Box className="h-3 w-3 mr-1" />
                        )}
                        {item.mediaType === "videos" && (
                          <Play className="h-3 w-3 mr-1" />
                        )}
                        {item.mediaType}
                      </Badge>
                    </td>
                    <td className="p-3">{item.views.toLocaleString()}</td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          item.conversionRate > 5
                            ? "text-green-600"
                            : item.conversionRate > 2
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                      >
                        {item.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.conversionRate > 5
                                ? "bg-green-500"
                                : item.conversionRate > 2
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(item.conversionRate * 10, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.conversionRate > 5
                            ? "Excellent"
                            : item.conversionRate > 2
                              ? "Bon"
                              : "À améliorer"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analytics?.viewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {stat.type === "images360" && "Vues 360°"}
                  {stat.type === "models3D" && "Modèles 3D"}
                  {stat.type === "videos" && "Vidéos"}
                </h3>
                {stat.type === "images360" && (
                  <RotateCw className="h-5 w-5 text-blue-600" />
                )}
                {stat.type === "models3D" && (
                  <Box className="h-5 w-5 text-green-600" />
                )}
                {stat.type === "videos" && (
                  <Play className="h-5 w-5 text-orange-600" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vues totales</span>
                  <span className="font-medium">
                    {stat.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interactions</span>
                  <span className="font-medium">
                    {stat.interactions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Temps moyen</span>
                  <span className="font-medium">{stat.avgTimeSpent}s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MediaAnalyticsDashboard;
