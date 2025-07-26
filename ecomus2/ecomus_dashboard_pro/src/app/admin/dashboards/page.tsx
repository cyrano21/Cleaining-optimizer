"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Shield, 
  Store, 
  Users, 
  Settings, 
  BarChart3, 
  Package,
  Eye,
  Edit,
  ExternalLink,
  Monitor,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  status: "active" | "maintenance" | "error";
  lastAccessed: string;
  userRole: "admin" | "vendor" | "customer" | "all";
  features: string[];
  metrics: {
    dailyUsers: number;
    responseTime: number;
    uptime: number;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lastUpdated: string;
}

const dashboards: DashboardInfo[] = [
  {
    id: "admin-main",
    name: "Dashboard Admin Principal",
    description: "Vue d'ensemble complète de la plateforme avec analytics avancés",
    url: "/e-commerce/admin-dashboard",
    status: "active",
    lastAccessed: "Il y a 2 minutes",
    userRole: "admin",
    features: ["Analytics", "Multi-store", "User Management", "Reports"],
    metrics: { dailyUsers: 45, responseTime: 120, uptime: 99.9 },
    icon: LayoutDashboard,
    color: "purple",
    lastUpdated: "2025-06-12"
  },
  {
    id: "vendor-dashboard",
    name: "Dashboard Vendeur",
    description: "Interface dédiée aux vendeurs pour gérer leurs boutiques",
    url: "/vendor-dashboard",
    status: "active",
    lastAccessed: "Il y a 15 minutes",
    userRole: "vendor",
    features: ["Store Management", "Products", "Orders", "Analytics"],
    metrics: { dailyUsers: 128, responseTime: 95, uptime: 99.7 },
    icon: Store,
    color: "blue",
    lastUpdated: "2025-06-12"
  },
  {
    id: "legacy-vendor",
    name: "Ancien Dashboard Vendeur",
    description: "Version précédente du dashboard vendeur (à migrer)",
    url: "/vendor-dashboard",
    status: "maintenance",
    lastAccessed: "Il y a 2 heures",
    userRole: "vendor",
    features: ["Basic Stats", "Order View", "Product List"],
    metrics: { dailyUsers: 23, responseTime: 240, uptime: 98.5 },
    icon: Package,
    color: "orange",
    lastUpdated: "2025-05-20"
  },
  {
    id: "adaptive-dashboard",
    name: "Dashboard Adaptatif",
    description: "Dashboard intelligent qui s'adapte au rôle utilisateur",
    url: "/dashboard",
    status: "active",
    lastAccessed: "Il y a 30 minutes",
    userRole: "all",
    features: ["Role Detection", "Dynamic Content", "Multi-view"],
    metrics: { dailyUsers: 256, responseTime: 110, uptime: 99.8 },
    icon: Activity,
    color: "green",
    lastUpdated: "2025-06-10"
  },
  {
    id: "stores-management",
    name: "Gestion des Boutiques",
    description: "Interface complète pour gérer toutes les boutiques",
    url: "/stores",
    status: "active",
    lastAccessed: "Il y a 1 heure",
    userRole: "admin",
    features: ["Store CRUD", "Multi-store", "Permissions", "Settings"],
    metrics: { dailyUsers: 34, responseTime: 85, uptime: 99.9 },
    icon: Shield,
    color: "teal",
    lastUpdated: "2025-06-11"
  },
  {
    id: "user-management",
    name: "Gestion des Utilisateurs",
    description: "Administration des utilisateurs et rôles",
    url: "/e-commerce/roles/all-roles",
    status: "active",
    lastAccessed: "Il y a 45 minutes",
    userRole: "admin",
    features: ["User CRUD", "Role Management", "Permissions", "Analytics"],
    metrics: { dailyUsers: 18, responseTime: 105, uptime: 99.6 },
    icon: Users,
    color: "indigo",
    lastUpdated: "2025-06-09"
  }
];

export default function AdminDashboardsManager() {
  const { data: session } = useSession();
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "error">("all");

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GlassMorphismCard className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès Restreint</h2>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
        </GlassMorphismCard>
      </div>
    );
  }

  const filteredDashboards = dashboards.filter(dashboard => 
    filterStatus === "all" || dashboard.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-100 dark:bg-green-900/20";
      case "maintenance": return "text-orange-500 bg-orange-100 dark:bg-orange-900/20";
      case "error": return "text-red-500 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return CheckCircle;
      case "maintenance": return Clock;
      case "error": return AlertCircle;
      default: return Monitor;
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Centre de Contrôle Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Accédez et gérez tous les dashboards de la plateforme
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setSelectedView(selectedView === "grid" ? "list" : "grid")}>
              {selectedView === "grid" ? <Monitor className="h-4 w-4 mr-2" /> : <LayoutDashboard className="h-4 w-4 mr-2" />}
              Vue {selectedView === "grid" ? "Liste" : "Grille"}
            </Button>
          </div>
        </motion.div>

        {/* Stats rapides */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Dashboards Actifs"
            value={dashboards.filter(d => d.status === "active").length}
            subtitle="En fonctionnement"
            trend={{
              value: 12.5,
              isPositive: true,
              label: "vs mois dernier"
            }}
            icon={<CheckCircle />}

          />
          <StatCard
            title="Utilisateurs Totaux"
            value={dashboards.reduce((acc, d) => acc + d.metrics.dailyUsers, 0)}
            subtitle="Aujourd'hui"
            trend={{
              value: 8.3,
              isPositive: true,
              label: "vs hier"
            }}
            icon={<Users />}

          />
          <StatCard
            title="Temps de Réponse Moyen"
            value={Math.round(dashboards.reduce((acc, d) => acc + d.metrics.responseTime, 0) / dashboards.length)}
            subtitle="millisecondes"
            trend={{
              value: -5.2,
              isPositive: false,
              label: "amélioration"
            }}
            icon={<TrendingUp />}

          />
          <StatCard
            title="Disponibilité Moyenne"
            value={Math.round(dashboards.reduce((acc, d) => acc + d.metrics.uptime, 0) / dashboards.length * 10) / 10}
            subtitle="Uptime"
            trend={{
              value: 0.2,
              isPositive: true,
              label: "vs semaine dernière"
            }}
            icon={<Activity />}

          />
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as "all" | "active" | "maintenance" | "error")}>
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="all">Tous ({dashboards.length})</TabsTrigger>
              <TabsTrigger value="active">Actifs ({dashboards.filter(d => d.status === "active").length})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({dashboards.filter(d => d.status === "maintenance").length})</TabsTrigger>
              <TabsTrigger value="error">Erreurs ({dashboards.filter(d => d.status === "error").length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Dashboards Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`grid gap-6 ${selectedView === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredDashboards.map((dashboard, index) => {
            const IconComponent = dashboard.icon;
            const StatusIcon = getStatusIcon(dashboard.status);
            
            return (
              <motion.div
                key={dashboard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <GlassMorphismCard className={`p-6 h-full ${selectedView === "list" ? "flex items-center gap-6" : ""}`}>
                  <div className={`${selectedView === "list" ? "flex-shrink-0" : "mb-4"}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                      dashboard.color === "purple" ? "from-purple-500 to-purple-600" :
                      dashboard.color === "blue" ? "from-blue-500 to-blue-600" :
                      dashboard.color === "green" ? "from-green-500 to-green-600" :
                      dashboard.color === "orange" ? "from-orange-500 to-orange-600" :
                      dashboard.color === "teal" ? "from-teal-500 to-teal-600" :
                      dashboard.color === "indigo" ? "from-indigo-500 to-indigo-600" :
                      "from-gray-500 to-gray-600"
                    } flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className={`${selectedView === "list" ? "flex-grow" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{dashboard.name}</h3>
                      <Badge className={`${getStatusColor(dashboard.status)} border-none`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {dashboard.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{dashboard.description}</p>

                    {selectedView === "grid" && (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{dashboard.metrics.dailyUsers}</div>
                            <div className="text-xs text-gray-500">Utilisateurs</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{dashboard.metrics.responseTime}ms</div>
                            <div className="text-xs text-gray-500">Réponse</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600">{dashboard.metrics.uptime}%</div>
                            <div className="text-xs text-gray-500">Uptime</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {dashboard.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {dashboard.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{dashboard.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Link href={dashboard.url}>
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={dashboard.url}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      Dernière visite: {dashboard.lastAccessed}
                    </div>
                  </div>
                </GlassMorphismCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassMorphismCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Actions Rapides Admin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/stores">
                <Button className="w-full h-20 flex-col space-y-2">
                  <Store className="h-6 w-6" />
                  <span>Gérer les Boutiques</span>
                </Button>
              </Link>
              <Link href="/e-commerce/roles/all-roles">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Gérer les Utilisateurs</span>
                </Button>
              </Link>
              <Link href="/e-commerce/admin-dashboard">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Analytics Globales</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Paramètres Système</span>
              </Button>
            </div>
          </GlassMorphismCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
