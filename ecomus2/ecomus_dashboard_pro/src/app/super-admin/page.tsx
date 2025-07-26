"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Crown,
  Shield,
  Database,
  Settings,
  Users,
  BarChart3,
  Store,
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  Globe,
  Lock,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Interface pour les statistiques super admin
interface SuperAdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalVendors: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  systemHealth: number;
  activeConnections: number;
  serverUptime: string;
  memoryUsage: number;
  diskSpace: number;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

// Hook pour les données super admin
const useSuperAdminData = () => {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalVendors: 0,
    totalStores: 0,
    totalOrders: 0,
    totalRevenue: 0,
    systemHealth: 0,
    activeConnections: 0,
    serverUptime: "",
    memoryUsage: 0,
    diskSpace: 0,
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, alertsRes] = await Promise.all([
          fetch("/api/super-admin/stats"),
          fetch("/api/super-admin/alerts"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || {});
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching super admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdminData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSuperAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, alerts, loading };
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { stats, alerts, loading } = useSuperAdminData();

  // Vérification du rôle super admin
  if (session?.user?.role !== 'super_admin' && session?.user?.role !== 'SUPER_ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const adminSections = [
    {
      title: "🏛️ Administration",
      description: "Accéder au tableau de bord admin classique",
      icon: <Shield className="h-8 w-8" />,
      href: "/admin",
      color: "from-blue-500 to-indigo-600",
      priority: "high",
    },
    {
      title: "👥 Gestion Globale",
      description: "Contrôle total des utilisateurs et rôles",
      icon: <Users className="h-8 w-8" />,
      href: "/super-admin/users",
      color: "from-green-500 to-emerald-600",
      priority: "high",
    },
    {
      title: "🔧 Contrôle Système",
      description: "Monitoring et configuration serveur",
      icon: <Database className="h-8 w-8" />,
      href: "/super-admin/system",
      color: "from-red-500 to-pink-600",
      priority: "critical",
    },
    {
      title: "📊 Analytics Avancés",
      description: "Statistiques complètes de la plateforme",
      icon: <BarChart3 className="h-8 w-8" />,
      href: "/super-admin/analytics",
      color: "from-purple-500 to-violet-600",
      priority: "medium",
    },
    {
      title: "🏪 Super Store Control",
      description: "Gestion avancée de toutes les boutiques",
      icon: <Store className="h-8 w-8" />,
      href: "/super-admin/stores",
      color: "from-orange-500 to-red-600",
      priority: "medium",
    },
    {
      title: "⚙️ Configuration Maître",
      description: "Paramètres système et plateforme",
      icon: <Settings className="h-8 w-8" />,
      href: "/super-admin/settings",
      color: "from-teal-500 to-cyan-600",
      priority: "medium",
    },
  ];

  // Dashboards accessibles pour le super admin
  const dashboardSections = [
    {
      title: "🛒 Dashboard Vendeur",
      description: "Interface vendeur complète avec analytics",
      icon: <Store className="h-8 w-8" />,
      href: "/vendor-dashboard",
      color: "from-emerald-500 to-green-600",
      priority: "medium",
    },
    {
      title: "👤 Dashboard Client",
      description: "Interface client et gestion des commandes",
      icon: <Users className="h-8 w-8" />,
      href: "/customer-dashboard",
      color: "from-blue-500 to-cyan-600",
      priority: "medium",
    },
    {
      title: "🛡️ Dashboard Modérateur",
      description: "Modération de contenu et avis clients",
      icon: <Shield className="h-8 w-8" />,
      href: "/moderator-dashboard",
      color: "from-yellow-500 to-orange-600",
      priority: "medium",
    },
    {
      title: "📈 Analytics Global",
      description: "Tableau de bord analytique avancé",
      icon: <BarChart3 className="h-8 w-8" />,
      href: "/analytics",
      color: "from-indigo-500 to-purple-600",
      priority: "medium",
    },
    {
      title: "📊 Dashboard Principal",
      description: "Dashboard général de la plateforme",
      icon: <Activity className="h-8 w-8" />,
      href: "/dashboard",
      color: "from-pink-500 to-rose-600",
      priority: "medium",
    },
    {
      title: "🎮 Dashboard Gamifié",
      description: "Interface gamifiée avec récompenses",
      icon: <Zap className="h-8 w-8" />,
      href: "/dashboard/gamified",
      color: "from-violet-500 to-purple-600",
      priority: "low",
    },
  ];

  const systemMetrics = [
    {
      title: "Santé Système",
      value: stats.systemHealth,
      suffix: "%",
      icon: <Activity className="h-5 w-5" />,
      color: stats.systemHealth > 90 ? "green" : stats.systemHealth > 70 ? "orange" : "red",
    },
    {
      title: "Connexions Actives",
      value: stats.activeConnections,
      icon: <Wifi className="h-5 w-5" />,
      color: "blue",
    },
    {
      title: "Utilisation Mémoire",
      value: stats.memoryUsage,
      suffix: "%",
      icon: <Cpu className="h-5 w-5" />,
      color: stats.memoryUsage > 80 ? "red" : stats.memoryUsage > 60 ? "orange" : "green",
    },
    {
      title: "Espace Disque",
      value: 100 - stats.diskSpace,
      suffix: "% libre",
      icon: <HardDrive className="h-5 w-5" />,
      color: stats.diskSpace > 80 ? "red" : stats.diskSpace > 60 ? "orange" : "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Super Admin */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <Crown className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              Super Admin Elite
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto">
            Centre de contrôle maître • Accès total à la plateforme
          </p>
          <Badge variant="outline" className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0">
            ⚡ Privilèges Maximum
          </Badge>
        </motion.div>

        {/* Statistiques Principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Utilisateurs Total"
            value={stats.totalUsers}
            trend={{
              value: 12.5,
              isPositive: true,
              label: "% ce mois",
            }}
            icon={<Users />}
            color="blue"
          />
          <StatCard
            title="Administrateurs"
            value={stats.totalAdmins}
            trend={{
              value: 3,
              isPositive: true,
              label: "nouveaux",
            }}
            icon={<Shield />}
            color="purple"
          />
          <StatCard
            title="Boutiques Actives"
            value={stats.totalStores}
            trend={{
              value: 8.7,
              isPositive: true,
              label: "% croissance",
            }}
            icon={<Store />}
            color="green"
          />
          <StatCard
            title="Chiffre d'Affaires"
            value={stats.totalRevenue}
            subtitle="€"
            trend={{
              value: 15.3,
              isPositive: true,
              label: "% ce mois",
            }}
            icon={<TrendingUp />}
            color="orange"
          />
        </motion.div>

        {/* Métriques Système */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {systemMetrics.map((metric) => (
            <GlassmorphismCard key={metric.title} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    <AnimatedNumber value={metric.value} />
                    {metric.suffix}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                  <div className={`text-${metric.color}-500`}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          ))}
        </motion.div>

        {/* Actions Principales Super Admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <GlassmorphismCard className="p-6" gradient="purple">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Zap className="h-7 w-7 text-purple-500" />
              Contrôles Super Admin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    shadow="xl"
                  >
                    {/* Badge de priorité */}
                    {section.priority === "critical" && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500 text-white text-xs">
                          CRITIQUE
                        </Badge>
                      </div>
                    )}
                    {section.priority === "high" && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white text-xs">
                          PRIORITÉ
                        </Badge>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center space-y-4 text-white">
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                        <div className="text-white group-hover:scale-110 transition-transform duration-300">
                          {section.icon}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-xl mb-2 text-white">
                          {section.title}
                        </h4>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                  </GlassmorphismCard>
                </motion.div>
              ))}
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* Accès aux Dashboards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <GlassmorphismCard className="p-6" gradient="blue">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Globe className="h-7 w-7 text-blue-500" />
              Accès à Tous les Dashboards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardSections.map((dashboard, index) => (
                <motion.div
                  key={dashboard.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(dashboard.href)}
                >
                  <GlassmorphismCard 
                    className={`p-6 transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br ${dashboard.color} backdrop-blur-sm relative overflow-hidden`}
                    hoverEffect={true}
                    shadow="xl"
                  >
                    {/* Badge de priorité */}
                    {dashboard.priority === "low" && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gray-500 text-white text-xs">
                          OPTIONNEL
                        </Badge>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center space-y-4 text-white">
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                        <div className="text-white group-hover:scale-110 transition-transform duration-300">
                          {dashboard.icon}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-xl mb-2 text-white">
                          {dashboard.title}
                        </h4>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {dashboard.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                  </GlassmorphismCard>
                </motion.div>
              ))}
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* Alertes Système et Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alertes Système */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassmorphismCard className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                Alertes Système
              </h3>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'critical' 
                          ? 'bg-red-50 border-red-500 dark:bg-red-900/20' 
                          : alert.type === 'warning'
                          ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20'
                          : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {alert.timestamp}
                          </p>
                        </div>
                        <Badge
                          variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucune alerte système
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Tous les systèmes fonctionnent normalement
                    </p>
                  </div>
                )}
              </div>
            </GlassmorphismCard>
          </motion.div>

          {/* Informations Serveur */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassmorphismCard className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Globe className="h-6 w-6 text-blue-500" />
                État du Serveur
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Serveur Principal</span>
                  </div>
                  <Badge className="bg-green-500 text-white">EN LIGNE</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.serverUptime || "99.9%"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.activeConnections}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connexions</p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Monitoring Détaillé
                </Button>
              </div>
            </GlassmorphismCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
