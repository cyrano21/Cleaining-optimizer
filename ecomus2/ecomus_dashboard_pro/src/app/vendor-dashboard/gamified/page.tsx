"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Trophy,
  Target,
  Zap,
  Crown,
  Gift
} from "lucide-react";
import { useSession } from "next-auth/react";
import { GamifiedDashboard } from "@/components/gamification/gamified-dashboard";
import { AnimatedCounter, GameCard, AnimatedButton } from "@/components/gamification/animated-ui";
import { useGamification } from "@/hooks/useGamification";
import { useGameFeedback } from "@/components/gamification/game-feedback";
import { useVendorAnalytics } from "@/hooks/useVendorData";

function StatCard({
  title, 
  value, 
  icon, 
  change, 
  color = "blue",
  prefix = "",
  suffix = "" 
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: number;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  prefix?: string;
  suffix?: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    orange: "from-orange-500 to-red-600",
    red: "from-red-500 to-rose-600"
  };

  return (
    <GameCard hoverEffect="lift" glowColor={color}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {prefix}<AnimatedCounter value={value} />{suffix}
              </p>              {change && (
                <Badge className={`text-xs ${change > 0 ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                  {change > 0 ? "+" : ""}{change}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </GameCard>
  );
}

export default function VendorGamifiedDashboard() {
  const { data: session, status } = useSession();
  const { gamificationData, loading: gamificationLoading, completeTask, unlockAchievement } = useGamification('vendor', session, status);
  const { analytics, loading: analyticsLoading } = useVendorAnalytics();
  const { triggerPointsEarned, triggerAchievement } = useGameFeedback();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoTasksEnabled, setAutoTasksEnabled] = useState(true);

  // Données dynamiques depuis les APIs
  const vendorStats = {
    totalSales: analytics?.revenue || 0,
    totalProducts: analytics?.totalProducts || 0,
    totalOrders: analytics?.totalOrders || 0,
    totalCustomers: analytics?.recentOrders?.length || 0,
    avgRating: 4.5, // Valeur par défaut temporaire
    monthlyGrowth: analytics?.conversionRate || 0,
    pendingOrders: Math.floor((analytics?.totalOrders || 0) * 0.3), // Approximation
    lowStockProducts: 0, // À calculer depuis l'API
  };

  // Utilisation de useEffect pour des actions automatiques
  useEffect(() => {
    if (gamificationData && autoTasksEnabled) {
      // Vérifier les tâches automatiques toutes les 30 secondes
      const interval = setInterval(() => {
        // Compléter automatiquement certaines tâches
        if (vendorStats.totalOrders > 0) {
          completeTask('daily_check');
        }
        
        // Débloquer des achievements basés sur les stats
        if (vendorStats.totalSales > 1000) {
          unlockAchievement('sales_milestone');
          triggerAchievement('Milestone des Ventes!', 'Vous avez dépassé 1000€ de ventes!', 100);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [gamificationData, completeTask, unlockAchievement, triggerAchievement, autoTasksEnabled, vendorStats.totalOrders, vendorStats.totalSales]);

  const recentOrders = analytics?.recentOrders?.slice(0, 3).map(order => ({
    id: order.orderNumber || order.id,
    customerName: order.user?.name || 'Client anonyme',
    products: 1, // Approximation - pas d'items dans le type actuel
    total: order.total,
    status: order.status,
    date: new Date(order.createdAt).toISOString().split('T')[0],
  })) || [];

  const topProducts = analytics?.topProducts?.slice(0, 3).map(product => ({
    id: product.id,
    name: product.name,
    sales: product.sales,
    revenue: product.revenue,
    stock: 0, // À calculer depuis l'API
  })) || [];

  // Simuler des actions qui donnent de l'XP
  const handleQuickAction = (action: string, xp: number) => {
    // Utiliser triggerPointsEarned pour les actions XP
    triggerPointsEarned(xp, `Action terminée: ${action}`);
  };

  // Loading state
  if (gamificationLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bienvenue animé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenue, {session?.user?.name || "Vendeur"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Gérez votre boutique et atteignez de nouveaux objectifs
          </p>
        </div>
        
        <div className="flex items-center gap-3">          <Badge className="flex items-center gap-1 border border-gray-300 bg-gray-50 text-gray-700">
            <Crown className="h-4 w-4 text-yellow-500" />
            Vendeur Elite
          </Badge>          <AnimatedButton
            onClick={() => handleQuickAction("consultation rapide du dashboard", 5)}
            className="border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
            successMessage="XP gagné!"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Boost XP
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard Business
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Gamification
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Actions Rapides
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Business */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Chiffre d'Affaires"
              value={vendorStats.totalSales}
              icon={<DollarSign className="h-5 w-5" />}
              change={vendorStats.monthlyGrowth}
              color="green"
              suffix="€"
            />
            <StatCard
              title="Commandes"
              value={vendorStats.totalOrders}
              icon={<ShoppingBag className="h-5 w-5" />}
              change={8.2}
              color="blue"
            />
            <StatCard
              title="Produits"
              value={vendorStats.totalProducts}
              icon={<Package className="h-5 w-5" />}
              color="purple"
            />
            <StatCard
              title="Note Moyenne"
              value={vendorStats.avgRating}
              icon={<Star className="h-5 w-5" />}
              color="orange"
              suffix="/5"
            />
          </div>

          {/* Tableaux de données */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commandes récentes */}
            <GameCard hoverEffect="lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {order.products} produits
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total}€</p>                        <Badge 
                          className={`text-xs ${
                            order.status === "completed" ? "bg-green-100 text-green-800 border-green-200" : 
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : 
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </GameCard>

            {/* Top produits */}
            <GameCard hoverEffect="lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Meilleurs Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} ventes • Stock: {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.revenue}€</p>                        <Badge 
                          className={`text-xs ${product.stock < 10 ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                        >
                          {product.stock < 10 ? "Stock faible" : "OK"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </GameCard>
          </div>
        </TabsContent>

        {/* Onglet Gamification */}
        <TabsContent value="gamification" className="space-y-6">
          {/* Panneau de contrôle de gamification utilisant Card et Button */}
          <Card className="border-2 border-dashed border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Contrôle de Gamification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Tâches automatiques activées</span>                <Button
                  className={`px-3 py-1 text-sm ${autoTasksEnabled ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setAutoTasksEnabled(!autoTasksEnabled)}
                >
                  {autoTasksEnabled ? "Activé" : "Désactivé"}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                <Button
                  className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    completeTask('manual_task');
                    triggerPointsEarned(25, 'Tâche manuelle complétée!');
                  }}
                >
                  <Target className="h-6 w-6" />
                  <span>Compléter Tâche</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">+25 XP</Badge>
                </Button>
                  <Button
                  className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    unlockAchievement('special_achievement');
                    triggerAchievement('Achievement Spécial!', 'Vous avez débloqué un achievement rare!', 50);
                  }}
                >
                  <Crown className="h-6 w-6" />
                  <span>Débloquer Achievement</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Rare</Badge>
                </Button>
                  <Button
                  className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    if (gamificationData) {
                      triggerAchievement('Données Consultées!', `Niveau actuel: ${gamificationData.userStats.level || 1}`, 10);
                    }
                  }}
                >
                  <Zap className="h-6 w-6" />
                  <span>Voir Données</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Info</Badge>
                </Button>
              </div>
              
              {gamificationData && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Données de Gamification:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Niveau:</span>
                      <p className="font-medium">{gamificationData.userStats.level || 1}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">XP:</span>
                      <p className="font-medium">{gamificationData.userStats.xp || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points:</span>
                      <p className="font-medium">{gamificationData.userStats.totalSales || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Achievements:</span>
                      <p className="font-medium">{gamificationData.achievements?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <GamifiedDashboard userRole="vendor" />
        </TabsContent>

        {/* Actions Rapides */}
        <TabsContent value="quick-actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard hoverEffect="bounce" glowColor="blue">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Ajouter un Produit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez un nouveau produit à votre catalogue
                </p>
                <AnimatedButton
                  onClick={() => handleQuickAction("ajout de produit", 15)}
                  className="w-full"
                  successMessage="Produit ajouté! +15 XP"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Ajouter (+15 XP)
                </AnimatedButton>
              </CardContent>
            </GameCard>

            <GameCard hoverEffect="bounce" glowColor="green">
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Traiter Commandes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Traitez vos commandes en attente
                </p>
                <AnimatedButton
                  onClick={() => handleQuickAction("traitement de commande", 10)}
                  className="w-full"
                  successMessage="Commande traitée! +10 XP"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Traiter (+10 XP)
                </AnimatedButton>
              </CardContent>
            </GameCard>

            <GameCard hoverEffect="bounce" glowColor="purple">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Répondre aux Messages</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Répondez aux questions de vos clients
                </p>
                <AnimatedButton
                  onClick={() => handleQuickAction("réponse client", 8)}
                  className="w-full"
                  successMessage="Message envoyé! +8 XP"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Répondre (+8 XP)
                </AnimatedButton>
              </CardContent>
            </GameCard>
          </div>

          {/* Défis spéciaux */}
          <GameCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Défis Spéciaux du Jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Défi Ventes Flash</h4>
                      <p className="text-sm text-muted-foreground">
                        Réalisez 10 ventes aujourd&apos;hui
                      </p>
                    </div>
                  </div>                  <div className="flex items-center justify-between">
                    <Badge className="border border-gray-300 bg-gray-50 text-gray-700">+100 XP</Badge>
                    <AnimatedButton
                      className="px-3 py-1 text-sm"
                      onClick={() => handleQuickAction("défi ventes flash", 100)}
                      successMessage="Défi relevé! +100 XP"
                    >
                      Relever le Défi
                    </AnimatedButton>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Satisfaction Client</h4>
                      <p className="text-sm text-muted-foreground">
                        Obtenez 5 avis 5 étoiles
                      </p>
                    </div>
                  </div>                  <div className="flex items-center justify-between">
                    <Badge className="border border-gray-300 bg-gray-50 text-gray-700">+75 XP</Badge>
                    <AnimatedButton
                      className="px-3 py-1 text-sm"
                      onClick={() => handleQuickAction("défi satisfaction", 75)}
                      successMessage="Défi relevé! +75 XP"
                    >
                      Relever le Défi
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </GameCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
