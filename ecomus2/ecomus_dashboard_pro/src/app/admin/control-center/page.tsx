"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Monitor,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Shield,
  Layers,
  Eye,
  Activity,
  Building,
  TrendingUp,
  Globe,
  Bell,
  ChevronRight,
  Crown,
  LogOut,
  Search,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminGuard } from "@/components/admin/admin-guard";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { NotificationSystem } from "@/components/ui/notification-system";

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DashboardLink {
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
  color: string;
  category: string;
  status: "active" | "development" | "planned";
  features: string[];
  requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
}

const dashboardLinks: DashboardLink[] = [
  {
    title: "Dashboard Admin Principal",
    description: "Vue complète de la plateforme avec analytics avancés",
    url: "/e-commerce/admin-dashboard",
    icon: Monitor,
    color: "purple",
    category: "Administration",
    status: "active",
    features: ["Analytics temps réel", "Graphiques modernes", "Notifications", "UI glassmorphism"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Gestion des Administrateurs",
    description: "Administration complète des comptes admin et rôles",
    url: "/admin/user-management",
    icon: Shield,
    color: "red",
    category: "Administration",
    status: "active",
    features: ["CRUD admins", "Gestion des rôles", "Permissions", "Logs d'activité"],
    requiredRole: "ADMIN"
  },
  {
    title: "Gestion des Utilisateurs",
    description: "Administration complète des comptes utilisateurs",
    url: "/e-commerce/roles/all-roles",
    icon: Users,
    color: "blue",
    category: "Administration",
    status: "active",
    features: ["CRUD utilisateurs", "Gestion des rôles", "Permissions", "Activation/Désactivation"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Gestion des Magasins",
    description: "Multi-store management avec analytics par magasin",
    url: "/stores",
    icon: Store,
    color: "green",
    category: "Commerce",
    status: "active",
    features: ["Multi-store", "Analytics par magasin", "Configuration", "Commissions"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Dashboard Vendeur",
    description: "Interface vendeur avec gestion des produits et commandes",
    url: "/vendor-dashboard",
    icon: Building,
    color: "orange",
    category: "Vendeurs",
    status: "active",
    features: ["Gestion produits", "Suivi commandes", "Analytics vendeur", "Revenus"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Gestion des Produits",
    description: "Catalogue complet avec import/export et variations",
    url: "/products",
    icon: Package,
    color: "teal",
    category: "Commerce",
    status: "active",
    features: ["Catalogue complet", "Variations", "Import/Export", "Images multiples"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Gestion des Commandes",
    description: "Suivi complet du cycle de vie des commandes",
    url: "/orders",
    icon: ShoppingCart,
    color: "red",
    category: "Commerce",
    status: "active",
    features: ["Workflow complet", "Statuts avancés", "Notifications", "Facturation"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Analytics Avancées",
    description: "Rapports détaillés et KPIs en temps réel",
    url: "/analytics",
    icon: BarChart3,
    color: "indigo",
    category: "Analytics",
    status: "development",
    features: ["KPIs temps réel", "Rapports personnalisés", "Export données", "Prédictions"],
    requiredRole: "MODERATOR"
  },
  {
    title: "Centre de Notifications",
    description: "Système de notifications push en temps réel",
    url: "/notifications",
    icon: Bell,
    color: "yellow",
    category: "Communication",
    status: "development",
    features: ["Push notifications", "Email marketing", "SMS", "Templates"],
    requiredRole: "ADMIN"
  },
  {
    title: "Paramètres Système",
    description: "Configuration globale de la plateforme",
    url: "/settings",
    icon: Settings,
    color: "gray",
    category: "Configuration",
    status: "active",
    features: ["Config globale", "Paramètres email", "Intégrations", "Sécurité"],
    requiredRole: "SUPER_ADMIN"
  }
];

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  MODERATOR: 1
};

export default function AdminControlCenter() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur admin connecté
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Date.now().toString();
    const notification = { 
      id, 
      title: title || (type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : 'Information'), 
      message, 
      type 
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    addNotification('Déconnexion réussie', 'success');
    setTimeout(() => {
      router.push('/admin/auth');
    }, 1000);
  };

  const canAccessDashboard = (dashboard: DashboardLink): boolean => {
    if (!adminUser || !dashboard.requiredRole) return true;
    
    const userLevel = ROLE_HIERARCHY[adminUser.role];
    const requiredLevel = ROLE_HIERARCHY[dashboard.requiredRole];
    
    return userLevel >= requiredLevel;
  };

  const filteredDashboards = dashboardLinks.filter((dashboard) => {
    const matchesCategory = activeCategory === "all" || dashboard.category === activeCategory;
    const matchesSearch =
      dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const hasAccess = canAccessDashboard(dashboard);
    
    return matchesCategory && matchesSearch && hasAccess;
  });

  const categories = ["all", ...Array.from(new Set(dashboardLinks.map((d) => d.category)))];

  const stats = {
    totalDashboards: dashboardLinks.filter(d => canAccessDashboard(d)).length,
    activeDashboards: dashboardLinks.filter(d => d.status === "active" && canAccessDashboard(d)).length,
    developmentDashboards: dashboardLinks.filter(d => d.status === "development" && canAccessDashboard(d)).length,
    plannedDashboards: dashboardLinks.filter(d => d.status === "planned" && canAccessDashboard(d)).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "development": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "planned": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "development": return "En développement";
      case "planned": return "Planifié";
      default: return "Inconnu";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "from-purple-500 to-pink-500";
      case "ADMIN": return "from-blue-500 to-indigo-500";
      case "MODERATOR": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN": return "Administrateur";
      case "MODERATOR": return "Modérateur";
      default: return role;
    }
  };

  return (
    <AdminGuard requiredRole="moderator">
      <div>
        {/* En-tête avec informations utilisateur */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 backdrop-blur-xl bg-white/90 dark:bg-black/20 border-b border-gray-200/50 dark:border-white/10"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Centre de Contrôle Admin</h1>
                {adminUser && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{adminUser.name}</span>
                    <Badge className={`bg-gradient-to-r ${getRoleColor(adminUser.role)} text-white text-xs`}>
                      {getRoleName(adminUser.role)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {adminUser?.role === 'SUPER_ADMIN' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/user-management')}
                  className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Gestion Admins
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-500/50 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <StatCard
              title="Dashboards Disponibles"
              value={stats.totalDashboards}
              subtitle="Selon vos permissions"
              trend={{ value: 0, isPositive: true }}
              icon={<Layers />}
            />
            <StatCard
              title="Actifs"
              value={stats.activeDashboards}
              subtitle="Prêts à utiliser"
              trend={{ value: 15.2, isPositive: true }}
              icon={<Activity />}
            />
            <StatCard
              title="En Développement"
              value={stats.developmentDashboards}
              subtitle="Bientôt disponibles"
              trend={{ value: 8.1, isPositive: true }}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Planifiés"
              value={stats.plannedDashboards}
              subtitle="Futures fonctionnalités"
              trend={{ value: 0, isPositive: true }}
              icon={<Globe />}
            />
          </motion.div>

          {/* Filtres et recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassMorphismCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Filtrer les dashboards</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const count = category === "all" 
                        ? filteredDashboards.length
                        : dashboardLinks.filter(d => d.category === category && canAccessDashboard(d)).length;
                      
                      return (
                        <Button
                          key={category}
                          variant={activeCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(category)}
                          className={activeCategory === category 
                            ? "bg-purple-600 text-white" 
                            : "border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                          }
                        >
                          {category === "all" ? "Tous" : category} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un dashboard..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </GlassMorphismCard>
          </motion.div>

          {/* Grille des dashboards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDashboards.map((dashboard, index) => {
              const IconComponent = dashboard.icon as React.ComponentType<{ className?: string }>;
              return (
                <motion.div
                  key={dashboard.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassMorphismCard className="h-full hover:shadow-xl transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg bg-${dashboard.color}-500/20`}>
                            <IconComponent className={`h-6 w-6 text-${dashboard.color}-400`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                              {dashboard.title}
                            </CardTitle>
                            <Badge 
                              className={`text-xs ${getStatusColor(dashboard.status)} mt-1`}
                              variant="secondary"
                            >
                              {getStatusText(dashboard.status)}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{dashboard.description}</p>
                      
                      <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Fonctionnalités clés:</p>
                            <div className="flex flex-wrap gap-1">
                              {dashboard.features.slice(0, 3).map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                                  {feature}
                                </Badge>
                              ))}
                              {dashboard.features.length > 3 && (
                                <Badge variant="outline" className="text-xs text-gray-300 dark:text-gray-600 border-gray-300 dark:border-gray-600">
                                  +{dashboard.features.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>

                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => router.push(dashboard.url)}
                          disabled={dashboard.status === "planned"}
                        >
                          {dashboard.status === "planned" ? (
                            <>Bientôt disponible</>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Accéder au Dashboard
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </GlassMorphismCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Message si aucun résultat */}
          {filteredDashboards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white dark:text-gray-900 mb-2">
                Aucun dashboard trouvé
              </h3>
              <p className="text-gray-400 dark:text-gray-600">
                Essayez de modifier vos critères de recherche ou de filtre
              </p>
            </motion.div>
          )}
        </div>

        <NotificationSystem
          notifications={notifications}
        />
      </div>
    </AdminGuard>
  );
}
