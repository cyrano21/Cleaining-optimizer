"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
// Les composants Card sont supprimés car non utilisés
import { Button } from "@/components/ui/button";
// Les composants de charts sont supprimés car non utilisés
import { RecentOrders } from "@/components/dashboard/recent-orders";
import {
  ShoppingCart,
  Truck,
  RotateCcw,
  Clock,
  Cloud,
  Wind,
  Droplets,
  MoreVertical,
  Users,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

// Import des nouveaux composants UI modernes
import { StatCard } from "@/components/ui/stat-card";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { ModernChart } from "@/components/ui/charts";
import {
  NotificationSystem,
  useNotification,
} from "@/components/ui/notification-system";
import { ModernLoader } from "@/components/ui/loader";
import { motion } from "framer-motion";

interface DashboardStats {
  orders: {
    total: number;
    inTransit: number;
    returned: number;
    pending: number;
  };
  revenue: {
    total: string;
    inTransit: string;
    returned: string;
    pending: string;
  };
  stores: {
    total: number;
    active: number;
  };
  products: {
    total: number;
  };
}

interface AdvancedMetrics {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    userGrowth: number;
    totalOrders: number;
    ordersThisMonth: number;
    orderGrowth: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueGrowth: number;
    avgOrderValue: number;
    totalProducts: number;
    lowStockProducts: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  performance: {
    conversionRate: number;
    customerRetention: number;
    averageOrderValue: number;
    totalTransactions: number;
  };
}

interface UserAnalytics {
  overview: {
    totalUsers: number;
    newUsersWeek: number;
    activeUsersWeek: number;
    growthRate: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    joinDate: string;
    lastLogin: string;
  }>;
  topUsers: Array<{
    _id: string;
    name: string;
    email: string;
    avatar: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }>;
  growthData: Array<{
    period: string;
    users: number;
    label: string;
  }>;
  roleData: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

interface PerformanceData {
  period: string;
  metric: string;
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
    }>;
  };
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    growthRate: number;
  };
}

interface TopProduct {
  rank: string;
  product: string;
  category: string;
  seller: string;
  sales: number;
  revenue: string;
}

interface WeatherData {
  temperature: number;
  location: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  lastUpdated: string;
}

interface RevenueChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
  period: string;
  lastUpdated: string;
}

interface CategorySalesData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
  lastUpdated: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { notifications, addNotification } = useNotification();
  const addNotificationRef = useRef(addNotification);
  
  // Maintenir la ref à jour
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(
    null
  );
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(
    null
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySalesData | null>(
    null
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Fonction pour récupérer les métriques avancées
  const fetchAdvancedMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/advanced-metrics");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des métriques avancées");
      }
      const data = await response.json();
      setAdvancedMetrics(data.data);
    } catch (err) {
      console.error("Erreur métriques avancées:", err);
    }
  }, []);

  // Fonction pour récupérer les analyses utilisateur
  const fetchUserAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/user-analytics");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des analyses utilisateur");
      }
      const data = await response.json();
      setUserAnalytics(data.data);
    } catch (err) {
      console.error("Erreur analyses utilisateur:", err);
    }
  }, []);

  // Fonction pour récupérer les données de performance
  const fetchPerformanceData = useCallback(async (period: string = "month", metric: string = "revenue") => {
    try {
      const response = await fetch(`/api/dashboard/performance?period=${period}&metric=${metric}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données de performance");
      }
      const data = await response.json();
      setPerformanceData(data);
    } catch (err) {
      console.error("Erreur données de performance:", err);
    }
  }, []);

  // Fonction pour récupérer les statistiques du dashboard
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des statistiques");
      }
      const data = await response.json();
      setDashboardStats(data.data);

      // Notification de succès via ref
      addNotificationRef.current({
        type: "success",
        title: "Données actualisées",
        message: "Les statistiques ont été actualisées",
        duration: 3000,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);

      // Notification d'erreur via ref
      addNotificationRef.current({
        type: "error",
        title: "Erreur de chargement",
        message: errorMessage,
        duration: 5000,
      });
    }
  }, []); // Pas de dépendances pour éviter la recréation

  // Fonction pour récupérer les top produits
  const fetchTopProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/top-products");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des top produits");
      }
      const data = await response.json();
      setTopProducts(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, []);

  // Fonction pour récupérer les données météo
  const fetchWeatherData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/weather");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données météo");
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Erreur météo:", err);
    }
  }, []);

  // Fonction pour récupérer les données de revenus
  const fetchRevenueData = useCallback(async (period: string = "month") => {
    try {
      const response = await fetch(
        `/api/dashboard/revenue-chart?period=${period}`
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données de revenus"
        );
      }
      const data = await response.json();
      setRevenueData(data);
    } catch (err) {
      console.error("Erreur revenus:", err);
    }
  }, []);

  // Fonction pour récupérer les données de ventes par catégorie
  const fetchCategoryData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/category-sales");
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données de catégories"
        );
      }
      const data = await response.json();
      setCategoryData(data);
    } catch (err) {
      console.error("Erreur catégories:", err);
    }
  }, []);

  // Fonction pour récupérer les commandes récentes
  const fetchRecentOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/recent-orders");
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des commandes récentes"
        );
      }
      const data = await response.json();
      setRecentOrders(data.orders || []);
    } catch (err) {
      console.error("Erreur commandes récentes:", err);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      if (session?.user?.role === "admin") {
        setLoading(true);
        try {
          await Promise.all([
            fetchDashboardStats(),
            fetchAdvancedMetrics(),
            fetchUserAnalytics(),
            fetchPerformanceData(selectedPeriod, selectedMetric),
            fetchTopProducts(),
            fetchWeatherData(),
            fetchRevenueData(selectedPeriod),
            fetchCategoryData(),
            fetchRecentOrders(),
          ]);
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role]); // Seule la session/role dans les dépendances

  // Recharger les données de revenus et performance quand la période ou métrique change
  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchRevenueData(selectedPeriod);
      fetchPerformanceData(selectedPeriod, selectedMetric);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedMetric]); // Seules les valeurs primitives dans les dépendances

  // Auto-refresh des données toutes les 30 secondes
  useEffect(() => {
    if (session?.user?.role === "admin") {
      const interval = setInterval(() => {
        // Utiliser les versions non-callback des fonctions pour éviter les dépendances
        fetchWeatherData();
        fetchRevenueData(selectedPeriod);
        fetchCategoryData();
        fetchRecentOrders();
      }, 30000); // 30 secondes

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role, selectedPeriod]); // Seulement les valeurs primitives

  // Générer les données des cartes de statistiques modernes
  const getStatsData = () => {
    if (!advancedMetrics && !dashboardStats) return [];

    const stats = [];

    // Utiliser les métriques avancées si disponibles, sinon fallback sur dashboardStats
    if (advancedMetrics) {
      stats.push(
        {
          title: "Revenus Totaux",
          value: `€${(advancedMetrics.overview.totalRevenue / 1000).toFixed(1)}k`,
          icon: <DollarSign className="h-6 w-6" />,
          trend: {
            value: Math.abs(advancedMetrics.overview.revenueGrowth),
            isPositive: advancedMetrics.overview.revenueGrowth >= 0,
            label: "vs. mois dernier"
          },
          subtitle: `+€${(advancedMetrics.overview.revenueThisMonth / 1000).toFixed(1)}k ce mois`,
        },
        {
          title: "Commandes",
          value: advancedMetrics.overview.totalOrders.toLocaleString(),
          icon: <ShoppingCart className="h-6 w-6" />,
          trend: {
            value: Math.abs(advancedMetrics.overview.orderGrowth),
            isPositive: advancedMetrics.overview.orderGrowth >= 0,
            label: "vs. mois dernier"
          },
          subtitle: `${advancedMetrics.overview.ordersThisMonth} ce mois`,
        },
        {
          title: "Utilisateurs",
          value: advancedMetrics.overview.totalUsers.toLocaleString(),
          icon: <Users className="h-6 w-6" />,
          trend: {
            value: Math.abs(advancedMetrics.overview.newUsersThisMonth / Math.max(advancedMetrics.overview.totalUsers - advancedMetrics.overview.newUsersThisMonth, 1) * 100),
            isPositive: advancedMetrics.overview.newUsersThisMonth > 0,
            label: "nouveaux"
          },
          subtitle: `${advancedMetrics.overview.activeUsers} actifs`,
        },
        {
          title: "Panier Moyen",
          value: `€${advancedMetrics.overview.avgOrderValue.toFixed(0)}`,
          icon: <DollarSign className="h-6 w-6" />,
          trend: {
            value: 12.5,
            isPositive: true,
            label: "vs. mois dernier"
          },
          subtitle: `${advancedMetrics.overview.totalProducts} produits`,
        },
        {
          title: "En Transit",
          value: advancedMetrics.orders.shipped.toLocaleString(),
          icon: <Truck className="h-6 w-6" />,
          trend: {
            value: Math.abs((advancedMetrics.orders.shipped / Math.max(advancedMetrics.orders.total, 1)) * 100),
            isPositive: true,
            label: "des commandes"
          },
          subtitle: "Livraisons en cours",
        },
        {
          title: "Retours",
          value: advancedMetrics.orders.returned.toLocaleString(),
          icon: <RotateCcw className="h-6 w-6" />,
          trend: {
            value: Math.abs((advancedMetrics.orders.returned / Math.max(advancedMetrics.orders.total, 1)) * 100),
            isPositive: false,
            label: "taux de retour"
          },
          subtitle: "Produits retournés",
        },
        {
          title: "En Attente",
          value: advancedMetrics.orders.pending.toLocaleString(),
          icon: <Clock className="h-6 w-6" />,
          trend: {
            value: Math.abs((advancedMetrics.orders.pending / Math.max(advancedMetrics.orders.total, 1)) * 100),
            isPositive: false,
            label: "à traiter"
          },
          subtitle: "Commandes en attente",
        }
      );
    } else if (dashboardStats) {
      // Fallback sur les anciennes données
      stats.push(
        {
          title: "Revenus",
          value: dashboardStats.revenue.total,
          icon: <DollarSign className="h-6 w-6" />,
          subtitle: "Total des revenus",
        },
        {
          title: "Commandes",
          value: dashboardStats.orders.total.toString(),
          icon: <ShoppingCart className="h-6 w-6" />,
          subtitle: "Total des commandes",
        },
        {
          title: "Magasins",
          value: dashboardStats.stores.total.toString(),
          icon: <Users className="h-6 w-6" />,
          subtitle: `${dashboardStats.stores.active} actifs`,
        },
        {
          title: "Produits",
          value: dashboardStats.products.total.toString(),
          icon: <ShoppingCart className="h-6 w-6" />,
          subtitle: "Catalogue total",
        }
      );
    }

    return stats;
  };

  // Afficher un loader moderne si les données sont en cours de chargement
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <ModernLoader type="pulse" size="large" />
          {/* logical-properties-disable-next-line */}
          <span className="ml-4 text-lg font-medium">
            Chargement des données...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur: {error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statsData = getStatsData();

  // Utiliser les données fetched ou utiliser des données de secours
  const revenueChartData = revenueData
    ? {
        data: revenueData.labels.map((label, index) => ({
          name: label,
          value: revenueData.datasets[0].data[index],
          value2:
            revenueData.datasets.length > 1
              ? revenueData.datasets[1].data[index]
              : 0,
        })),
        lines: [
          { dataKey: "value", stroke: "#8b5cf6", name: "Revenus" },
          { dataKey: "value2", stroke: "#06b6d4", name: "Commandes" },
        ],
      }
    : {
        data: [
          { name: "Jan", value: 4000, value2: 2400 },
          { name: "Fév", value: 3000, value2: 1398 },
          { name: "Mar", value: 2000, value2: 9800 },
          { name: "Avr", value: 2780, value2: 3908 },
          { name: "Mai", value: 1890, value2: 4800 },
          { name: "Jun", value: 2390, value2: 3800 },
        ],
        lines: [
          { dataKey: "value", stroke: "#8b5cf6", name: "Revenus" },
          { dataKey: "value2", stroke: "#06b6d4", name: "Commandes" },
        ],
      };

  const categoryChartData = categoryData
    ? {
        data: categoryData.labels.map((label, index) => ({
          name: label,
          value: categoryData.datasets[0].data[index],
          fill: categoryData.datasets[0].backgroundColor[index],
        })),
      }
    : {
        data: [
          { name: "Électronique", value: 35, fill: "#8b5cf6" },
          { name: "Vêtements", value: 25, fill: "#06b6d4" },
          { name: "Maison", value: 20, fill: "#10b981" },
          { name: "Sports", value: 15, fill: "#f59e0b" },
          { name: "Autres", value: 5, fill: "#ef4444" },
        ],
      };

  return (
    <>
      <NotificationSystem notifications={notifications} />
      <DashboardLayout>
        <motion.div
          className="space-y-8 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section Moderne */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-2">
                Vue d&apos;ensemble de votre plateforme e-commerce
              </p>
            </div>

            <GlassmorphismCard className="p-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <Cloud className="text-blue-500 h-6 w-6" />
                    <span className="text-2xl font-bold">
                      {weatherData ? `${weatherData.temperature}°` : "27°"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {weatherData ? weatherData.location : "Mumbai, India"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <Wind className="text-cyan-500 h-5 w-5 mx-auto" />
                    <p className="text-sm mt-1">
                      {weatherData
                        ? `${weatherData.windSpeed} km/h`
                        : "12 km/h"}
                    </p>
                  </div>
                  <div className="text-center">
                    <Droplets className="text-blue-500 h-5 w-5 mx-auto" />
                    <p className="text-sm mt-1">
                      {weatherData ? `${weatherData.humidity}%` : "48%"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          </motion.div>

          {/* Stats Cards Modernes */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {/* Graphiques Modernes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphismCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Revenus & Commandes</h3>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {selectedMetric === "revenue" ? "Revenus" : "Commandes"}
                          <MoreVertical className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSelectedMetric("revenue")}
                        >
                          Revenus
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedMetric("orders")}
                        >
                          Commandes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {selectedPeriod.charAt(0).toUpperCase() +
                            selectedPeriod.slice(1)}
                          <MoreVertical className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSelectedPeriod("week")}
                        >
                          Semaine
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedPeriod("month")}
                        >
                          Mois
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedPeriod("year")}
                        >
                          Année
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {performanceData?.chartData?.datasets?.[0]?.data ? (
                  <ModernChart 
                    type="line" 
                    data={performanceData.chartData.datasets[0].data.map((value, index) => ({
                      name: performanceData.chartData.labels[index],
                      value: value,
                    }))}
                    lines={[
                      { 
                        dataKey: "value", 
                        stroke: "#8b5cf6", 
                        name: selectedMetric === "revenue" ? "Revenus (€)" : "Commandes" 
                      }
                    ]}
                    height={300} 
                  />
                ) : (
                  <ModernChart type="line" {...revenueChartData} height={300} />
                )}
              </GlassmorphismCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Ventes par Catégorie
                </h3>
                <ModernChart type="pie" {...categoryChartData} height={300} />
              </GlassmorphismCard>
            </motion.div>
          </div>

          {/* KPIs de Performance Avancés */}
          {advancedMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Indicateurs de Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {advancedMetrics.performance.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Taux de Conversion</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commandes / Utilisateurs
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {advancedMetrics.performance.customerRetention.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Rétention Client</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Utilisateurs actifs
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      €{advancedMetrics.performance.averageOrderValue.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Panier Moyen</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Valeur moyenne par commande
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {advancedMetrics.performance.totalTransactions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Transactions</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Total des commandes
                    </div>
                  </div>
                </div>
              </GlassmorphismCard>
            </motion.div>
          )}

          {/* Analyses des Utilisateurs */}
          {userAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassmorphismCard className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Utilisateurs Récents</h3>
                  <div className="space-y-4">
                    {userAnalytics.recentUsers.slice(0, 5).map((user, index) => (
                      <motion.div
                        key={user.id}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium capitalize">{user.role}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassmorphismCard>

                <GlassmorphismCard className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Top Clients</h3>
                  <div className="space-y-4">
                    {userAnalytics.topUsers.slice(0, 5).map((user, index) => (
                      <motion.div
                        key={user._id}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            €{user.totalSpent.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.orderCount} commandes
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassmorphismCard>
              </div>
            </motion.div>
          )}

          {/* Analyse des Commandes par Statut */}
          {advancedMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <GlassmorphismCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Répartition des Commandes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { key: "pending", label: "En attente", colorClass: "bg-gradient-to-br from-yellow-500/10 to-yellow-600/10", textColorClass: "text-yellow-600", value: advancedMetrics.orders.pending },
                    { key: "processing", label: "En cours", colorClass: "bg-gradient-to-br from-blue-500/10 to-blue-600/10", textColorClass: "text-blue-600", value: advancedMetrics.orders.processing },
                    { key: "shipped", label: "Expédiées", colorClass: "bg-gradient-to-br from-purple-500/10 to-purple-600/10", textColorClass: "text-purple-600", value: advancedMetrics.orders.shipped },
                    { key: "delivered", label: "Livrées", colorClass: "bg-gradient-to-br from-green-500/10 to-green-600/10", textColorClass: "text-green-600", value: advancedMetrics.orders.delivered },
                    { key: "cancelled", label: "Annulées", colorClass: "bg-gradient-to-br from-red-500/10 to-red-600/10", textColorClass: "text-red-600", value: advancedMetrics.orders.cancelled },
                    { key: "returned", label: "Retournées", colorClass: "bg-gradient-to-br from-orange-500/10 to-orange-600/10", textColorClass: "text-orange-600", value: advancedMetrics.orders.returned },
                    { key: "total", label: "Total", colorClass: "bg-gradient-to-br from-gray-500/10 to-gray-600/10", textColorClass: "text-gray-600", value: advancedMetrics.orders.total },
                  ].map((status, index) => (
                    <motion.div
                      key={status.key}
                      className={`text-center p-4 ${status.colorClass} rounded-lg`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <div className={`text-2xl font-bold ${status.textColorClass}`}>
                        {status.value}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{status.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((status.value / Math.max(advancedMetrics.orders.total, 1)) * 100).toFixed(1)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassmorphismCard>
            </motion.div>
          )}

          {/* Top Products Table Moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassmorphismCard className="overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold">Top Produits</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                    <tr>
                      <th className="text-left p-4 font-medium">Rang</th>
                      <th className="text-left p-4 font-medium">Produit</th>
                      <th className="text-left p-4 font-medium">Vendeur</th>
                      <th className="text-left p-4 font-medium">Ventes</th>
                      <th className="text-left p-4 font-medium">Revenus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <motion.tr
                          key={index}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <td className="p-4">
                            <span className="font-bold text-purple-600">
                              #{product.rank}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <h6 className="font-medium">{product.product}</h6>
                              <p className="text-sm text-gray-500">
                                {product.category}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">{product.seller}</td>
                          <td className="p-4">
                            <span className="font-medium">
                              {product.sales.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-green-600">
                              {product.revenue}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <ModernLoader type="spin" size="medium" />
                          <p className="mt-4 text-gray-500">
                            Chargement des produits...
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassmorphismCard>
          </motion.div>

          {/* Recent Orders Moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassmorphismCard className="p-6">
              <h3 className="text-xl font-semibold mb-6">Commandes Récentes</h3>
              <RecentOrders orders={recentOrders} />
            </GlassmorphismCard>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </>
  );
}
