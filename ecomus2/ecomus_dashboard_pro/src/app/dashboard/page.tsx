// TypeScript React Component - Not a CSS file
"use client";

import { useSession } from "next-auth/react";
import { useStore } from "@/hooks/use-store";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { ModernLoader } from "@/components/ui/loader";
import { AreaChart, PieChart } from "@/components/ui/charts";
import {
  NotificationSystem,
  useNotifications,
} from "@/components/ui/notification-system";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Import d'une image par défaut pour les cas où logoUrl est undefined
const defaultLogo = "/images/placeholder.svg";

import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  Star,
  ShoppingCart,
  AlertCircle,
  Plus,
  Heart,
  Settings,
  Activity,
  Zap,
  Target,
  Award,
  TrendingUp,
  Trophy,
} from "lucide-react";

// Mock data pour les statistiques globales (admin)
const mockGlobalStats = {
  totalStores: 12,
  totalSales: 125600,
  totalProducts: 1456,
  totalOrders: 834,
  totalCustomers: 2189,
  avgRating: 4.6,
  monthlyGrowth: 15.2,
  activeStores: 10,
  pendingStores: 2,
  conversionRate: 3.2,
  avgOrderValue: 150.6,
};

// Mock data pour les statistiques par boutique
const mockStoreStats = {
  totalSales: 45600,
  totalProducts: 156,
  totalOrders: 234,
  totalCustomers: 189,
  avgRating: 4.7,
  monthlyGrowth: 12.5,
  pendingOrders: 8,
  lowStockProducts: 5,
  conversionRate: 4.1,
  avgOrderValue: 195.2,
};

// Mock data pour les graphiques
const mockSalesData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Fév", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 130 },
  { month: "Avr", revenue: 61000, orders: 170 },
  { month: "Mai", revenue: 55000, orders: 155 },
  { month: "Juin", revenue: 67000, orders: 185 },
];

const mockCategoryData = [
  { name: "Mode", value: 35, color: "#8b5cf6" },
  { name: "Tech", value: 25, color: "#06b6d4" },
  { name: "Maison", value: 20, color: "#10b981" },
  { name: "Sport", value: 20, color: "#f59e0b" },
];

const mockRecentActivity = [
  {
    id: "ACT-001",
    type: "order",
    store: "Ecomus Fashion",
    description: "Nouvelle commande #ORD-345",
    amount: 159.99,
    time: "Il y a 5 min",
    status: "success",
  },
  {
    id: "ACT-002",
    type: "product",
    store: "TechStore Pro",
    description: "Nouveau produit ajouté",
    time: "Il y a 15 min",
    status: "info",
  },
  {
    id: "ACT-003",
    type: "customer",
    store: "Ecomus Fashion",
    description: "Nouveau client inscrit",
    time: "Il y a 30 min",
    status: "success",
  },
  {
    id: "ACT-004",
    type: "alert",
    store: "HomeDecor+",
    description: "Stock faible détecté",
    time: "Il y a 1h",
    status: "warning",
  },
];

export default function AdaptiveDashboard() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const { addNotification } = useNotifications();

  // Toujours appeler useStore (respecter les règles des hooks)
  const { currentStore, stores, isLoading } = useStore();

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setIsMounted(true);

    // Notification de bienvenue avec effet retardé
    const timer = setTimeout(() => {
      addNotification({
        title: "Bienvenue sur votre dashboard !",
        message: "Découvrez vos performances en temps réel",
        type: "success",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [addNotification]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <ModernLoader variant="pulse" size="lg" />
      </div>
    );
  }

  // Dashboard Admin - Vue globale multi-boutiques
  if (session?.user?.role === "admin") {
    return (
      <>
        <NotificationSystem notifications={[]} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* En-tête Admin Ultra-Moderne */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Dashboard Administrateur
                </h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Vue d&apos;ensemble de toutes les boutiques de la plateforme
                </p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle boutique
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-blue-200 hover:bg-blue-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rapports globaux
                </Button>
              </div>
            </motion.div>

            {/* Statistiques globales avec StatCards modernes */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <StatCard
                title="Boutiques Actives"
                value={mockGlobalStats.activeStores}
                trend={{
                  value: mockGlobalStats.pendingStores,
                  isPositive: true,
                  label: "en attente",
                }}
                icon={<ShoppingCart />}
                color="blue"
              />

              <StatCard
                title="Chiffre d'Affaires"
                value={mockGlobalStats.totalSales}
                subtitle={`€`}
                trend={{
                  value: mockGlobalStats.monthlyGrowth,
                  isPositive: true,
                  label: "%",
                }}
                icon={<DollarSign />}
                color="green"
              />

              <StatCard
                title="Commandes Totales"
                value={mockGlobalStats.totalOrders}
                trend={{
                  value: 0,
                  isPositive: true,
                  label: "Toutes boutiques",
                }}
                icon={<ShoppingCart />}
                color="purple"
              />

              <StatCard
                title="Clients Totaux"
                value={mockGlobalStats.totalCustomers}
                trend={{
                  value: mockGlobalStats.avgRating,
                  isPositive: true,
                  label: "/5",
                }}
                icon={<Users />}
                color="orange"
              />
            </motion.div>

            {/* KPIs Avancés */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <GlassMorphismCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Taux de Conversion
                    </h3>
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    <AnimatedNumber
                      value={mockGlobalStats.conversionRate}
                      suffix="%"
                    />
                  </div>
                  <p className="text-sm text-gray-600">+0.8% vs mois dernier</p>
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Panier Moyen
                    </h3>
                    <Award className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    <AnimatedNumber
                      value={mockGlobalStats.avgOrderValue}
                      prefix="€"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    +€12.3 vs mois dernier
                  </p>
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Performance
                    </h3>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    <AnimatedNumber value={92} suffix="%" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Score global plateforme
                  </p>
                </div>
              </GlassMorphismCard>
            </motion.div>

            {/* Graphiques et Analytics */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <GlassMorphismCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Évolution du Chiffre d&apos;Affaires
                  </h3>
                  <AreaChart
                    data={mockSalesData}
                    xKey="month"
                    yKey="revenue"
                    height={300}
                    color="#3b82f6"
                  />
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Répartition par Catégorie
                  </h3>
                  <PieChart
                    data={mockCategoryData}
                    height={300}
                    nameKey="name"
                    valueKey="value"
                  />
                </div>
              </GlassMorphismCard>
            </motion.div>

            {/* Boutiques populaires et activité récente */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <GlassMorphismCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Boutiques
                  </h3>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {stores.slice(0, 3).map((store, index) => (
                        <motion.div
                          key={store.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/70 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <Image
                              src={store.logoUrl || defaultLogo}
                              alt={store.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-xl object-cover shadow-md"
                            />
                            <div>
                              <div className="font-semibold text-gray-800">
                                {store.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {store.stats?.totalProducts || 0} produits
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              <AnimatedNumber
                                value={store.stats?.totalRevenue || 0}
                                prefix="€"
                              />
                            </div>
                            <Badge
                              variant={store.isActive ? "default" : "secondary"}
                              className="text-xs mt-1"
                            >
                              {store.isActive ? "🟢 Actif" : "🔴 Inactif"}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Activité Temps Réel
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {mockRecentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/60 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                activity.status === "success"
                                  ? "bg-green-500"
                                  : activity.status === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                              } animate-pulse`}
                            />
                            <div>
                              <div className="font-medium text-gray-800 text-sm">
                                {activity.description}
                              </div>
                              <div className="text-xs text-gray-600">
                                {activity.store} • {activity.time}
                              </div>
                            </div>
                          </div>
                          {activity.amount && (
                            <div className="font-semibold text-green-600 text-sm">
                              +{activity.amount}€
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassMorphismCard>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  // Dashboard Vendor - Vue spécifique à sa boutique
  if (session?.user?.role === "vendor") {
    if (!currentStore) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune boutique trouvée
            </h2>
            <p className="text-gray-600">
              Vous n&apos;avez pas encore de boutique associée à votre compte.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {/* En-tête Vendor avec informations de la boutique */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src={currentStore.logoUrl || defaultLogo}
              alt={currentStore.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentStore.name}
              </h1>
              <p className="text-gray-600">{currentStore.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={currentStore.isActive ? "default" : "secondary"}
                >
                  {currentStore.isActive ? "Actif" : "Inactif"}
                </Badge>
                <Badge variant="outline">
                  {currentStore.subscription?.plan === "premium" ||
                  currentStore.subscription?.plan === "enterprise"
                    ? "Professionnel"
                    : "Basique"}
                </Badge>
              </div>
            </div>
          </div>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Modifier ma boutique
          </Button>
        </div>

        {/* Statistiques de la boutique */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d&apos;affaires
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStoreStats.totalSales.toLocaleString()} €
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{mockStoreStats.monthlyGrowth}%
                </span>{" "}
                ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStoreStats.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockStoreStats.pendingOrders} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStoreStats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockStoreStats.lowStockProducts} stock faible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Note moyenne
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStoreStats.avgRating}/5
              </div>
              <p className="text-xs text-muted-foreground">
                {mockStoreStats.totalCustomers} clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides pour vendor */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Package className="h-6 w-6" />
                <span>Ajouter un produit</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Eye className="h-6 w-6" />
                <span>Voir ma boutique</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Rapports détaillés</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Promotions</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard par défaut pour les customers
  if (session?.user?.role === "customer") {
    return (
      <div className="space-y-6 p-6">
        {/* En-tête Customer */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mon Espace Client
            </h1>
            <p className="text-gray-600">
              Bienvenue {session.user.name}, gérez vos commandes et découvrez
              nos boutiques
            </p>
          </div>
          <div className="flex space-x-3">
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Parcourir les boutiques
            </Button>
          </div>
        </div>

        {/* Statistiques du client */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mes Commandes
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                3 en cours de livraison
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total dépensé
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247 €</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Boutiques suivies
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                2 nouvelles cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Points fidélité
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,580</div>
              <p className="text-xs text-muted-foreground">
                Utilisables dès maintenant
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Mes dernières commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "CMD-001",
                    store: "Boutique Mode",
                    total: 89.99,
                    status: "Livré",
                    date: "2024-01-12",
                  },
                  {
                    id: "CMD-002",
                    store: "TechStore",
                    total: 249.99,
                    status: "En cours",
                    date: "2024-01-10",
                  },
                  {
                    id: "CMD-003",
                    store: "HomeDecor",
                    total: 156.5,
                    status: "Expédié",
                    date: "2024-01-08",
                  },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-gray-600">{order.store}</div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.total} €</div>
                      <Badge
                        variant={
                          order.status === "Livré" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Voir toutes mes commandes
              </Button>
            </CardContent>
          </Card>

          {/* Boutiques recommandées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Boutiques recommandées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "ElectroShop",
                    category: "Électronique",
                    rating: 4.8,
                    products: 156,
                  },
                  {
                    name: "Fashion Plus",
                    category: "Mode",
                    rating: 4.6,
                    products: 89,
                  },
                  {
                    name: "Garden Center",
                    category: "Jardin",
                    rating: 4.9,
                    products: 234,
                  },
                ].map((store, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-gray-600">
                          {store.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {store.rating}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {store.products} produits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Découvrir plus de boutiques
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Nouvelle commande</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Heart className="h-6 w-6" />
                <span>Mes favoris</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Star className="h-6 w-6" />
                <span>Mes avis</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Paramètres</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard par défaut pour les autres rôles
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-gray-600">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à ce
          tableau de bord.
        </p>
      </div>
    </div>
  );
}
