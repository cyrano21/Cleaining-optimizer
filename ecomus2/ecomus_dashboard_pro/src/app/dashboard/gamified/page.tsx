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
  Gift,
  Heart,
  Coins,
  Award,
  ChevronRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { GamifiedDashboard } from "@/components/gamification/gamified-dashboard";
import { AnimatedCounter, GameCard, AnimatedButton } from "@/components/gamification/animated-ui";
import { useGamification } from "@/hooks/useGamification";
import Link from "next/link";

const quickActions = [
  {
    title: "Browse Products",
    description: "Discover new items",
    icon: Package,
    href: "/products",
    color: "from-blue-500 to-blue-600",
    points: "+10 points",
  },
  {
    title: "My Wishlist",
    description: "Check saved items",
    icon: Heart,
    href: "/dashboard/wishlist",
    color: "from-pink-500 to-pink-600",
    points: "+5 points",
  },
  {
    title: "Write Review",
    description: "Share your experience",
    icon: Star,
    href: "/dashboard/reviews",
    color: "from-yellow-500 to-yellow-600",
    points: "+25 points",
  },
  {
    title: "Refer Friends",
    description: "Invite and earn rewards",
    icon: Users,
    href: "/dashboard/referrals",
    color: "from-green-500 to-green-600",
    points: "+100 points",
  },
];

export default function GamifiedCustomerDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const { gamificationData, loading, completeTask, earnXP, unlockAchievement, updateStats, notifications } = useGamification('customer', session, status);
    const userStats = gamificationData?.userStats;
  const achievements = gamificationData?.achievements || [];
  const dailyTasks = gamificationData?.dailyTasks || [];
  const weeklyGoals = gamificationData?.weeklyGoals || [];
  const leaderboard = gamificationData?.leaderboard || [];
  
  // Données d'exemple pour les commandes récentes (à remplacer par de vraies données)
  const recentOrders = [
    { id: 'ORD-001', status: 'delivered', total: 199.99, date: '2024-06-15' },
    { id: 'ORD-002', status: 'shipped', total: 89.99, date: '2024-06-14' },
    { id: 'ORD-003', status: 'pending', total: 149.99, date: '2024-06-13' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-6">
      {/* Header héro avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2"
            animate={{ 
              backgroundPosition: ["0%", "100%", "0%"] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity 
            }}
          >
            🎮 Your Gaming Dashboard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Shop, earn, and level up your customer experience!
          </p>
        </div>
      </motion.div>

      {/* Stats rapides avec animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >        <GameCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Spent</p>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={userStats?.totalSales || 0} 
                  prefix="$"
                />
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </GameCard>

        <GameCard className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Orders</p>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={userStats?.ordersCompleted || 0} 
                />
              </div>
            </div>
            <ShoppingBag className="h-8 w-8 text-pink-200" />
          </div>
        </GameCard>

        <GameCard className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Experience Points</p>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={userStats?.xp || 0} 
                />
              </div>
            </div>
            <Coins className="h-8 w-8 text-indigo-200" />
          </div>
        </GameCard>

        <GameCard className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Level</p>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={userStats?.level || 1} 
                />
              </div>
            </div>
            <Award className="h-8 w-8 text-green-200" />
          </div>
        </GameCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tableau de bord gamifié principal */}
        <div className="lg:col-span-2">
          <GamifiedDashboard />
        </div>

        {/* Colonne latérale avec actions rapides et commandes récentes */}
        <div className="space-y-6">
          {/* Actions rapides gamifiées */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={action.href}>
                      <AnimatedButton
                        variant="ghost"
                        className={`w-full justify-between hover:bg-gradient-to-r ${action.color} hover:text-white group transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{action.title}</p>
                            <p className="text-xs text-gray-500 group-hover:text-white/80">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            {action.points}
                          </Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </AnimatedButton>
                    </Link>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Commandes récentes avec style gamifié */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order: any, index: number) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{order.id}</span>
                          <Badge 
                            className={`text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.store} • {order.products} items • ${order.total}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.date}
                        </p>
                      </div>
                      {order.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(order.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <Link href="/dashboard/orders">
                  <AnimatedButton className="w-full mt-4" variant="outline">
                    View All Orders
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
