"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Settings,
  Shield,
  Database,
  Activity,
  TrendingUp,
  UserCheck,
  Store,
  ShoppingCart,
  DollarSign,
  Package,
  Star,
  AlertCircle,
} from "lucide-react";
import AdminGuard from "@/components/admin/admin-guard";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Types pour les données admin
interface AdminStats {
  totalStores: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeStores: number;
  pendingStores: number;
  monthlyGrowth: number;
  avgRating: number;
}

interface RecentActivity {
  id: string;
  type: 'store_created' | 'user_registered' | 'order_placed';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

// Hook pour charger les données admin via API
const useAdminDashboardData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalStores: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeStores: 0,
    pendingStores: 0,
    monthlyGrowth: 0,
    avgRating: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activities?limit=5"),
        ]);

        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }
        
        if (activitiesData.success) {
          // Adapter le mapping pour correspondre à l'interface RecentActivity
          const mappedActivities = (activitiesData.data || []).map((activity: any) => ({
            id: activity.id,
            type: activity.action || activity.type,
            message: activity.description,
            time: activity.timestamp ? new Date(activity.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '',
            status:
              activity.type === 'user' || activity.action === 'user_registered' ? 'info' :
              activity.type === 'store' || activity.action === 'store_created' ? (activity.details?.status === 'pending' ? 'warning' : 'success') :
              activity.type === 'order' || activity.action === 'order_placed' ? 'success' :
              'info',
          }));
          setRecentActivities(mappedActivities);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return { stats, recentActivities, loading, error };
};

const AdminPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { stats, recentActivities, loading, error } = useAdminDashboardData();

  const isSuperAdmin = session?.user?.role === 'super_admin';  const adminSections = [
    {
      title: "Analytics",
      description: "Consultez les statistiques détaillées",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/admin/analytics",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Gérez les utilisateurs et permissions",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/user-management",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Gestion des boutiques",
      description: "Gérez les boutiques et leurs données",
      icon: <Store className="h-6 w-6" />,
      href: "/admin/stores-management",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Gestion des templates",
      description: "Gérez les templates et abonnements",
      icon: <Package className="h-6 w-6" />,
      href: "/admin/template-management",
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Gestion des vendeurs",
      description: "Gérez les vendeurs et leurs boutiques",
      icon: <UserCheck className="h-6 w-6" />,
      href: "/admin/vendors",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Centre de contrôle",
      description: "Contrôlez tous les aspects du système",
      icon: <Shield className="h-6 w-6" />,
      href: "/admin/control-center",
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Paramètres système",
      description: "Configurez les paramètres globaux",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/system-settings",
      color: "from-teal-500 to-cyan-600",
    },
  ];

  // Sections supplémentaires pour Super Admin
  const superAdminSections = [
    {
      title: "⚡ Super Dashboard",
      description: "Tableau de bord avancé super-admin",
      icon: <Shield className="h-6 w-6" />,
      href: "/super-admin",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "System Control",
      description: "Contrôle total du système",
      icon: <Database className="h-6 w-6" />,
      href: "/admin/system",
      color: "from-violet-500 to-purple-600",
    },
  ];
  return (
    <AdminGuard>
      <div className="px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Tableau de bord Administrateur
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Vue d'ensemble de votre plateforme e-commerce multi-boutiques
            </p>
          </motion.div>

          {/* États de chargement et d'erreur */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600">{typeof error === 'string' ? error : 'Erreur de chargement des données'}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Statistiques principales */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatCard
                  title="Boutiques Actives"
                  value={stats.activeStores}
                  trend={{
                    value: stats.pendingStores,
                    isPositive: true,
                    label: "en attente",
                  }}
                  icon={<Store />}
                  color="blue"
                />
                <StatCard
                  title="Utilisateurs Total"
                  value={stats.totalUsers}
                  trend={{
                    value: stats.monthlyGrowth,
                    isPositive: true,
                    label: "% ce mois",
                  }}
                  icon={<Users />}
                  color="green"
                />
                <StatCard
                  title="Commandes Total"
                  value={stats.totalOrders}
                  trend={{
                    value: 15.3,
                    isPositive: true,
                    label: "% ce mois",
                  }}
                  icon={<ShoppingCart />}
                  color="purple"
                />
                <StatCard
                  title="Chiffre d'Affaires"
                  value={stats.totalRevenue}
                  subtitle="€"
                  trend={{
                    value: stats.monthlyGrowth,
                    isPositive: true,
                    label: "% ce mois",
                  }}
                  icon={<DollarSign />}
                  color="orange"
                />
              </motion.div>

              {/* KPIs secondaires */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >                <GlassmorphismCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Boutiques</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        <AnimatedNumber value={stats.totalStores} />
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </GlassmorphismCard>

                <GlassmorphismCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Note Moyenne</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <AnimatedNumber value={stats.avgRating} decimals={1} />
                        <Star className="h-5 w-5 text-yellow-500 ml-1" />
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </GlassmorphismCard>

                <GlassmorphismCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Croissance</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        +<AnimatedNumber value={stats.monthlyGrowth} />%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </GlassmorphismCard>
              </motion.div>

              {/* Activités récentes et Actions rapides */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >                  <GlassmorphismCard className="p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Activity className="h-6 w-6 text-blue-500" />
                      Activités Récentes
                    </h3>
                    <div className="space-y-4">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              activity.status === 'success' ? 'bg-green-500' : 
                              activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucune activité récente</p>
                      )}
                    </div>
                  </GlassmorphismCard></motion.div>

                {/* Section Super Admin - Visible uniquement pour super_admin */}
                {isSuperAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassmorphismCard className="p-6 border-purple-200/50 dark:border-purple-700/50">
                      <h3 className="text-xl font-bold mb-6 text-purple-600 dark:text-purple-400">
                        ⚡ Super Admin Tools
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {superAdminSections.map((section) => (
                          <Button
                            key={section.title}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600"
                            onClick={() => router.push(section.href)}
                          >
                            <div className="text-purple-500 dark:text-purple-400">
                              {section.icon}
                            </div>
                            <span className="text-xs text-center text-purple-700 dark:text-purple-300">
                              {section.title}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </GlassmorphismCard>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >                  <GlassmorphismCard className="p-6" gradient="blue">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <UserCheck className="h-6 w-6 text-indigo-500" />
                      Actions Rapides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminSections.map((section, index) => (
                        <motion.div
                          key={section.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="group cursor-pointer"
                          onClick={() => router.push(section.href)}
                        >
                          <GlassmorphismCard 
                            className={`p-6 transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br ${section.color} backdrop-blur-sm relative overflow-hidden`}
                            hoverEffect={true}
                            shadow="lg"
                          >
                            <div className="relative z-10 flex flex-col items-center space-y-4 text-white">
                              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                                <div className="text-white group-hover:scale-110 transition-transform duration-300">
                                  {section.icon}
                                </div>
                              </div>
                              <div className="text-center">
                                <h4 className="font-semibold text-lg mb-1 text-white">
                                  {section.title}
                                </h4>
                                <p className="text-sm text-white/80 leading-relaxed max-w-[200px]">
                                  {section.description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Effet de brillance au hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                          </GlassmorphismCard>
                        </motion.div>
                      ))}
                    </div>
                  </GlassmorphismCard>
                </motion.div>
              </div>
            </>
          )}
        </div>
    </AdminGuard>
  );
};

export default AdminPage;