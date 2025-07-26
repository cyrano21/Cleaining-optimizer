"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  Star,
  ShoppingCart,
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  Plus,
  Bell,
  Gift,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Store } from "@/types";
import { AnimatedCounter, GameCard, AnimatedButton } from "@/components/gamification/animated-ui";
import { useDashboardTheme } from "@/hooks/useDashboardTheme";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { useVendorProducts, useVendorAnalytics } from "@/hooks/useVendorData";
import { StatCard } from "@/components/ui/stat-card";
import { ModernChart } from "@/components/ui/modern-chart";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { NotificationSystem, useNotification } from "@/components/ui/notification-system";
import Link from "next/link";

// Types pour les données du dashboard vendeur
interface VendorOrder {
  id: string;
  customerName: string;
  products: number;
  total: number;
  status: string;
  date: string;
}

interface VendorProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

const useVendorDashboardData = () => {
  const { data: session, status } = useSession();
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const loadOrdersData = async () => {
      // Vérifier si l'utilisateur est connecté avant de faire les appels API
      if (status === 'loading') return;
      if (status === 'unauthenticated' || !session?.user) {
        setIsLoadingOrders(false);
        return;
      }

      try {
        setIsLoadingOrders(true);

        // Charger les commandes récentes
        const ordersResponse = await fetch("/api/vendor/orders?limit=5&sort=createdAt&order=desc");
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success && ordersData.data.orders) {
            setRecentOrders(ordersData.data.orders.map((order: any) => ({
              id: order.orderNumber || order._id,
              customerName: order.shippingAddress?.firstName + " " + order.shippingAddress?.lastName || "Client anonyme",
              products: order.items?.length || 0,
              total: order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0,
              status: order.status || "pending",
              date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
            })));
          }
        } else {
          console.warn('Orders API call failed:', ordersResponse.status);
        }
      } catch (error) {
        console.error('Error loading vendor orders data:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrdersData();
  }, [session?.user?.id, status]); // Dependencies stables

  return { recentOrders, isLoadingOrders };
};

const quickActions = [
  {
    title: "Ajouter Produit",
    description: "Nouveau produit",
    icon: Plus,
    href: "/vendor-dashboard/products/add",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Voir Commandes",
    description: "Gérer les commandes",
    icon: ShoppingBag,
    href: "/vendor-dashboard/orders",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Analytics",
    description: "Voir les statistiques",
    icon: BarChart3,
    href: "/vendor-dashboard/analytics",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Notifications",
    description: "Messages et alertes",
    icon: Bell,
    href: "/vendor-dashboard/notifications",
    color: "from-orange-500 to-orange-600",
  },
];

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Système de thème autonome pour les vendeurs
  const { theme, getThemeClasses, getCSSVariables } = useDashboardTheme('vendor');
  const { recentOrders, isLoadingOrders } = useVendorDashboardData();
  
  // Nouveaux hooks e-commerce intégrés
  const { notifications, addNotification, removeNotification } = useNotification();
  const { products, loading: productsLoading } = useVendorProducts();
  const { analytics, loading: analyticsLoading } = useVendorAnalytics();  // Données du store pour l'affichage (données simulées en attendant l'API stores)
  const storeData = {
    name: session?.user?.name || session?.user?.email?.split('@')[0] || "Vendeur",
    description: "Boutique en ligne",
    logoUrl: session?.user?.image || "/images/placeholder.svg",
  };
  // Chargement initial et notifications - avec dependencies stables
  useEffect(() => {
    if (status === 'loading') return; // Attendre que le status soit défini
    
    if (session?.user) {
      setIsLoading(false);
      
      // Notification de bienvenue - seulement une fois
      const hasShownWelcome = sessionStorage.getItem('welcomeShown');
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          addNotification({
            title: 'Dashboard mis à jour !',
            message: `Bienvenue ${session?.user?.name || 'Vendeur'} ! Votre dashboard a été enrichi avec de nouvelles fonctionnalités e-commerce.`,
            type: 'success',
            duration: 5000
          });
        }, 1000);
        sessionStorage.setItem('welcomeShown', 'true');
        return () => clearTimeout(timer);
      }
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session?.user?.id, status, addNotification]); // Dependencies stables

  // Notification quand les analytics sont chargées - avec condition pour éviter les boucles
  useEffect(() => {
    if (!analyticsLoading && analytics && analytics.totalSales > 0) {
      const hasShownAnalytics = sessionStorage.getItem('analyticsShown');
      if (!hasShownAnalytics) {
        const timer = setTimeout(() => {
          addNotification({
            title: 'Analytics chargées',
            message: `Vos données e-commerce sont maintenant disponibles !`,
            type: 'info',
            duration: 3000
          });
        }, 2000);
        sessionStorage.setItem('analyticsShown', 'true');
        return () => clearTimeout(timer);
      }
    }  }, [analyticsLoading, analytics?.totalSales, addNotification]); // Dependencies plus spécifiques

  // Appliquer les variables CSS au niveau du document pour éviter les styles inline
  const themeClasses = getThemeClasses();
  const cssVariables = getCSSVariables();
  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }, [cssVariables]);

  if (isLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className={themeClasses.background}>
      <ThemeCustomizer dashboardType="vendor" />      <NotificationSystem 
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
      {/* Header héro avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${themeClasses.card} border-b border-white/20 p-6 mb-8`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >              <img
                src={storeData.logoUrl}
                alt={storeData.name}
                className="h-16 w-16 rounded-xl border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 border-2 border-white flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </motion.div>
            <div>
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity 
                }}
              >
                {storeData.name}
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Niveau Premium • {storeData.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/vendor-dashboard/gamified">
              <AnimatedButton className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-4 w-4 mr-2" />
                Gamified Dashboard
              </AnimatedButton>
            </Link>
            <AnimatedButton variant="outline" className="border-green-200 hover:bg-green-50">
              <Eye className="h-4 w-4 mr-2" />
              Voir la boutique
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      <div className="px-6 pb-6">
        {/* Stats principales avec animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >          <GameCard className="bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <DollarSign className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Ventes Totales</span>
                <DollarSign className="h-5 w-5 text-green-200" />
              </div>
              <div className="text-3xl font-bold">
                {analyticsLoading ? (
                  <div className="animate-pulse bg-green-200/30 rounded h-8 w-20"></div>
                ) : (                  <AnimatedCounter 
                    value={analytics.revenue || 0} 
                    suffix=" €"
                  />
                )}
              </div>              <div className="flex items-center mt-2 text-green-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-green-200">+12.5%</span> ce mois
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <ShoppingBag className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">Commandes</span>
                <ShoppingBag className="h-5 w-5 text-blue-200" />
              </div>              <div className="text-3xl font-bold">
                {analyticsLoading ? (
                  <div className="animate-pulse bg-blue-200/30 rounded h-8 w-16"></div>
                ) : (
                  <AnimatedCounter value={analytics.totalOrders || 0} />
                )}
              </div>              <div className="flex items-center mt-2 text-blue-100 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                0 en attente
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <Package className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Produits</span>
                <Package className="h-5 w-5 text-purple-200" />
              </div>              <div className="text-3xl font-bold">
                {productsLoading ? (
                  <div className="animate-pulse bg-purple-200/30 rounded h-8 w-16"></div>
                ) : (
                  <AnimatedCounter value={products.length || 0} />
                )}
              </div>              <div className="flex items-center mt-2 text-purple-100 text-sm">
                <Target className="h-4 w-4 mr-1" />
                0 stock faible
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <Star className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-100 text-sm font-medium">Note Moyenne</span>
                <Star className="h-5 w-5 text-yellow-200" />
              </div>              <div className="text-3xl font-bold">
                {analyticsLoading ? (
                  <div className="animate-pulse bg-yellow-200/30 rounded h-8 w-16"></div>
                ) : (
                  `${analytics.avgOrderValue ? (analytics.avgOrderValue * 5 / 100).toFixed(1) : '0'}/5`
                )}
              </div>
              <div className="flex items-center mt-2 text-yellow-100 text-sm">
                <Users className="h-4 w-4 mr-1" />
                0 avis
              </div>
            </div>
          </GameCard>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={action.href}>
                  <GameCard className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className={`w-full h-full bg-gradient-to-br ${action.color} p-6 text-white rounded-lg`}>
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className="h-8 w-8" />
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </GameCard>
                </Link>
              </motion.div>
            ))}
          </div>        </motion.div>

        {/* Section Analytics E-commerce Moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Analytics E-commerce
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Stats Cards Modernes */}
            <div className="grid grid-cols-2 gap-4">              <StatCard
                title="Ventes"
                value={analyticsLoading ? "..." : analytics.totalSales.toLocaleString()}
                icon={<DollarSign className="h-4 w-4" />}
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Commandes"
                value={analyticsLoading ? "..." : analytics.totalOrders}
                icon={<ShoppingCart className="h-4 w-4" />}
                trend={{ value: 8.2, isPositive: true }}
              />
              <StatCard
                title="Produits"
                value={analyticsLoading ? "..." : analytics.totalProducts}
                icon={<Package className="h-4 w-4" />}
              />
              <StatCard
                title="Revenus"
                value={analyticsLoading ? "..." : `${analytics.revenue.toLocaleString()}€`}
                icon={<TrendingUp className="h-4 w-4" />}
                trend={{ value: 15.3, isPositive: true }}
              />
            </div>

            {/* Graphique des Ventes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {analyticsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : (
                <ModernChart
                  data={analytics.chartData}
                  title="Évolution des Ventes"
                  color="#3b82f6"
                  type="line"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commandes récentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                  Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{order.id}</span>
                          <Badge 
                            className={`${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.customerName} • {order.products} produits
                        </p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{order.total} €</p>
                        <Link href={`/vendor-dashboard/orders/${order.id}`}>                          <Button className="mt-1 bg-transparent hover:bg-gray-100 text-sm px-3 py-1">
                            Voir détails
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/vendor-dashboard/orders">
                  <AnimatedButton className="w-full mt-4" variant="outline">
                    Voir toutes les commandes
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </AnimatedButton>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Produits les plus vendus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Produits
                </CardTitle>
              </CardHeader>              <CardContent>
                <div className="space-y-4">
                  {analyticsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                            <div>
                              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                              <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : analytics.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((product: any, index: number) => (
                      <motion.div
                        key={product._id || product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.title || product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {product.totalSales || product.sales || 0} ventes
                            </p>
                          </div>
                        </div>                        <div className="text-right">
                          <p className="font-semibold">{product.price || 0} €</p>
                          <p className="text-xs text-gray-500">Stock: {product.quantity || 0}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun produit populaire pour le moment</p>
                    </div>
                  )}
                </div>
                <Link href="/vendor-dashboard/products">
                  <AnimatedButton className="w-full mt-4" variant="outline">
                    Voir tous les produits
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </AnimatedButton>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
