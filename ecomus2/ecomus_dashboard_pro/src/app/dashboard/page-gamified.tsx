"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Sparkles,
  Gift,
  Coins,
  ChevronRight,
} from "lucide-react";
import { AnimatedCounter, GameCard, AnimatedButton } from "@/components/gamification/animated-ui";
import Link from "next/link";

// Données mockées pour les statistiques client
const customerStats = {
  totalOrders: 15,
  totalSpent: 2450,
  favoriteItems: 23,
  loyaltyPoints: 1850,
  currentLevel: 3,
  badgesEarned: 8,
  currentStreak: 5,
  nextLevelPoints: 500,
};

const recentOrders = [
  {
    id: "ORD-001",
    store: "TechStore Pro",
    items: 2,
    total: 299.99,
    status: "delivered",
    date: "2024-01-15",
    rating: 5,
  },
  {
    id: "ORD-002", 
    store: "Fashion Hub",
    items: 1,
    total: 89.99,
    status: "shipped",
    date: "2024-01-14",
    rating: null,
  },
  {
    id: "ORD-003",
    store: "Home & Garden",
    items: 3,
    total: 156.50,
    status: "processing",
    date: "2024-01-13",
    rating: null,
  },
];

const favoriteStores = [
  {
    id: "store-1",
    name: "TechStore Pro",
    logo: "/images/placeholder.svg",
    rating: 4.8,
    orders: 5,
  },
  {
    id: "store-2",
    name: "Fashion Hub",
    logo: "/images/placeholder.svg", 
    rating: 4.6,
    orders: 3,
  },
  {
    id: "store-3",
    name: "Home & Garden",
    logo: "/images/placeholder.svg",
    rating: 4.9,
    orders: 7,
  },
];

const quickActions = [
  {
    title: "Parcourir Boutiques",
    description: "Découvrir de nouveaux produits",
    icon: ShoppingBag,
    href: "/stores",
    color: "from-blue-500 to-blue-600",
    points: "+10 points",
  },
  {
    title: "Ma Wishlist",
    description: "Articles sauvegardés",
    icon: Heart,
    href: "/dashboard/wishlist",
    color: "from-pink-500 to-pink-600",
    points: "+5 points",
  },
  {
    title: "Écrire un Avis",
    description: "Partager votre expérience",
    icon: Star,
    href: "/dashboard/reviews",
    color: "from-yellow-500 to-yellow-600",
    points: "+25 points",
  },
  {
    title: "Parrainer des Amis",
    description: "Inviter et gagner des récompenses",
    icon: Users,
    href: "/dashboard/referrals",
    color: "from-green-500 to-green-600",
    points: "+100 points",
  },
];

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header héro avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity 
              }}
            >
              Bienvenue, {session?.user?.name || "Client"} ! 🎉
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Niveau {customerStats.currentLevel} • {customerStats.loyaltyPoints} points de fidélité
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/gamified">
              <AnimatedButton className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-4 w-4 mr-2" />
                Gaming Dashboard
              </AnimatedButton>
            </Link>
            <AnimatedButton variant="outline" className="border-purple-200 hover:bg-purple-50">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
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
        >
          <GameCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <DollarSign className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Total Dépensé</span>
                <DollarSign className="h-5 w-5 text-purple-200" />
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter 
                  value={customerStats.totalSpent} 
                  suffix=" €"
                />
              </div>
              <div className="flex items-center mt-2 text-purple-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Économies intelligentes
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-pink-500 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <ShoppingBag className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pink-100 text-sm font-medium">Commandes</span>
                <ShoppingBag className="h-5 w-5 text-pink-200" />
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={customerStats.totalOrders} />
              </div>
              <div className="flex items-center mt-2 text-pink-100 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                Client actif
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <Coins className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-100 text-sm font-medium">Points Fidélité</span>
                <Coins className="h-5 w-5 text-indigo-200" />
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={customerStats.loyaltyPoints} />
              </div>
              <div className="flex items-center mt-2 text-indigo-100 text-sm">
                <Target className="h-4 w-4 mr-1" />
                {customerStats.nextLevelPoints} pour niveau suivant
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <Award className="h-20 w-20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Badges</span>
                <Award className="h-5 w-5 text-green-200" />
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={customerStats.badgesEarned} />
              </div>
              <div className="flex items-center mt-2 text-green-100 text-sm">
                <Zap className="h-4 w-4 mr-1" />
                Série actuelle : {customerStats.currentStreak}
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
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white text-xs">
                            {action.points}
                          </Badge>
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </GameCard>
                </Link>
              </motion.div>
            ))}
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
                  Mes Commandes Récentes
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
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </Badge>
                          {order.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(order.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.store} • {order.items} articles
                        </p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{order.total} €</p>
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="mt-1">
                            Voir détails
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/dashboard/orders">
                  <AnimatedButton className="w-full mt-4" variant="outline">
                    Voir toutes mes commandes
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </AnimatedButton>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Boutiques favorites */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Boutiques Favorites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favoriteStores.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                    >
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{store.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{store.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{store.orders} commandes</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
                <Link href="/stores">
                  <AnimatedButton className="w-full mt-4" variant="outline">
                    Découvrir plus de boutiques
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
