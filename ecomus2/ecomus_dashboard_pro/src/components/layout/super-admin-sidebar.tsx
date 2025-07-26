"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  Lock,
  Zap,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  X,
  Plug,
  Truck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SuperAdminSidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function SuperAdminSidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: SuperAdminSidebarProps) {
  const { data: session } = useSession();
  const currentPath = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const navigationItems = [
    {
      id: "dashboard",
      label: "Super Dashboard",
      href: "/super-admin",
      icon: Crown,
      badge: "ELITE",
      badgeColor: "bg-gradient-to-r from-purple-500 to-violet-500",
    },
    {
      id: "admin-access",
      label: "Administration",
      href: "/admin",
      icon: Shield,
      badge: "ACCÈS",
      badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      id: "system",
      label: "Contrôle Système",
      icon: Database,
      badge: "CRITIQUE",
      badgeColor: "bg-gradient-to-r from-red-500 to-pink-500",
      children: [
        { label: "Intégrations API", href: "/super-admin/integrations" },
        { label: "Monitoring", href: "/super-admin/system/monitoring" },
        { label: "Logs", href: "/super-admin/system/logs" },
        { label: "Performances", href: "/super-admin/system/performance" },
        { label: "Sécurité", href: "/super-admin/system/security" },
      ],
    },
    {
      id: "users",
      label: "Gestion Globale",
      icon: Users,
      children: [
        { label: "Tous les Utilisateurs", href: "/super-admin/users" },
        { label: "Administrateurs", href: "/super-admin/users/admins" },
        { label: "Vendeurs", href: "/super-admin/users/vendors" },
        { label: "Rôles & Permissions", href: "/super-admin/users/roles" },
      ],
    },
    {
      id: "analytics",
      label: "Analytics Avancés",
      icon: BarChart3,
      children: [
        { label: "Vue d'ensemble", href: "/super-admin/analytics" },
        { label: "Revenus", href: "/super-admin/analytics/revenue" },
        { label: "Utilisateurs", href: "/super-admin/analytics/users" },
        { label: "Performances", href: "/super-admin/analytics/performance" },
      ],
    },
    {
      id: "stores",
      label: "Super Store Control",
      icon: Store,
      children: [
        { label: "Toutes les Boutiques", href: "/super-admin/stores" },
        { label: "Validation", href: "/super-admin/stores/validation" },
        { label: "Catégories", href: "/super-admin/stores/categories" },
      ],
    },
    {
      id: "dropshipping",
      label: "Dropshipping Global",
      icon: Truck,
      badge: "NEW",
      badgeColor: "bg-gradient-to-r from-orange-500 to-red-500",
      children: [
        { label: "Fournisseurs", href: "/super-admin/dropshipping/suppliers" },
        { label: "Produits", href: "/super-admin/dropshipping/products" },
        { label: "Commandes", href: "/super-admin/dropshipping/orders" },
        { label: "Analytics", href: "/super-admin/dropshipping/analytics" },
        { label: "Configuration", href: "/super-admin/dropshipping/config" },
      ],
    },
    {
      id: "platform",
      label: "Plateforme",
      icon: Globe,
      children: [
        { label: "Configuration", href: "/super-admin/platform/config" },
        { label: "Maintenance", href: "/super-admin/platform/maintenance" },
        { label: "Mises à jour", href: "/super-admin/platform/updates" },
      ],
    },
    {
      id: "settings",
      label: "Configuration Maître",
      href: "/super-admin/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-gradient-to-b from-purple-900 via-violet-900 to-indigo-900 text-white shadow-2xl",
          collapsed ? "w-16 lg:w-16" : "w-72 lg:w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Super Admin</h2>
                <p className="text-xs text-purple-200">Elite Control</p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange(!collapsed)}
            className="text-purple-200 hover:text-white hover:bg-purple-800/50"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Profile Section */}
        <div
          className={`p-4 border-b border-purple-700/50 ${collapsed ? "px-2" : ""}`}
        >
          <div
            className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
          >
            <Avatar className="w-10 h-10 border-2 border-purple-400">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                {session?.user?.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="font-semibold text-sm truncate">
                  {session?.user?.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs">
                    SUPER ADMIN
                  </Badge>
                  <Zap className="h-3 w-3 text-yellow-400" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className={`space-y-2 ${collapsed ? "px-2" : "px-4"}`}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              const isExpanded = expandedMenus.includes(item.id);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.id}>
                  {/* Main Item */}
                  <div
                    className={`group relative flex items-center gap-3 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg"
                        : "text-purple-200 hover:bg-purple-800/50 hover:text-white"
                    }`}
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.id);
                      } else if (item.href) {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge
                            className={`${item.badgeColor} text-white text-xs px-2 py-1`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {hasChildren && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasChildren && !collapsed && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 mt-2 space-y-1"
                        >
                          {item.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-lg p-2 text-sm transition-colors ${
                                currentPath === child.href
                                  ? "bg-purple-700 text-white"
                                  : "text-purple-300 hover:bg-purple-800/30 hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div
          className={`p-4 border-t border-purple-700/50 ${collapsed ? "px-2" : ""}`}
        >
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className={`w-full text-purple-200 hover:text-white hover:bg-red-600/50 ${
              collapsed ? "px-0" : ""
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Déconnexion</span>}
          </Button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 z-60 h-screen w-72 bg-gradient-to-b from-purple-900 via-violet-900 to-indigo-900 text-white shadow-2xl lg:hidden"
          >
            {/* Header Mobile */}
            <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Super Admin</h2>
                  <p className="text-xs text-purple-200">Elite Control</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-purple-200 hover:text-white hover:bg-purple-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Mobile */}
            <div className="flex-1 overflow-y-auto">
              {/* Profile Mobile */}
              <div className="p-4 border-b border-purple-700/50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-purple-400">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                      {session?.user?.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {session?.user?.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs">
                        SUPER ADMIN
                      </Badge>
                      <Zap className="h-3 w-3 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Mobile */}
              <nav className="py-4">
                <div className="space-y-2 px-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.href;
                    const isExpanded = expandedMenus.includes(item.id);
                    const hasChildren =
                      item.children && item.children.length > 0;

                    return (
                      <div key={item.id}>
                        <div
                          className={`group relative flex items-center gap-3 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg"
                              : "text-purple-200 hover:bg-purple-800/50 hover:text-white"
                          }`}
                          onClick={() => {
                            if (hasChildren) {
                              toggleMenu(item.id);
                            } else if (item.href) {
                              window.location.href = item.href;
                              onOpenChange(false);
                            }
                          }}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1 font-medium">
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge
                              className={`${item.badgeColor} text-white text-xs px-2 py-1`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {hasChildren && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>

                        {hasChildren && (
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="ml-8 mt-2 space-y-1"
                              >
                                {item.children?.map((child) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => onOpenChange(false)}
                                    className={`block rounded-lg p-2 text-sm transition-colors ${
                                      currentPath === child.href
                                        ? "bg-purple-700 text-white"
                                        : "text-purple-300 hover:bg-purple-800/30 hover:text-white"
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Footer Mobile */}
            <div className="p-4 border-t border-purple-700/50">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-purple-200 hover:text-white hover:bg-red-600/50"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Déconnexion</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
